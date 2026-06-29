import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "../secretsService.js";
import { buildCvMatchingPrompt } from "./prompt.js";
import {
  aiEvaluationZodSchema,
  geminiAiEvaluationResponseSchema,
} from "./geminiSchema.js";
import { parseAiJsonResponse } from "./jsonParser.js";
import type { AiEvaluationInput, AiEvaluationResult } from "./types.js";

const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export async function evaluateCvMatchWithGemini(
  input: AiEvaluationInput,
): Promise<AiEvaluationResult> {
  const apiKey = await getGeminiApiKey();
  const model = getGeminiModel();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildCvMatchingPrompt(input);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiAiEvaluationResponseSchema,
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new Error("Empty response from Gemini.");
    }

    const parsed = parseAiJsonResponse(rawText);
    const validationResult = aiEvaluationZodSchema.safeParse(parsed);

    if (!validationResult.success) {
      throw new Error(`Zod validation failed for Gemini response: ${validationResult.error.message}`);
    }

    return validationResult.data;
  } catch (error) {
    throw mapGeminiError(error);
  }
}

function getGeminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!model) {
    throw new Error("Missing Gemini model configuration: set GEMINI_MODEL.");
  }

  return model;
}

function mapGeminiError(error: unknown): Error {
  if (!(error instanceof Error)) {
    return new Error(`Gemini evaluation failed: ${String(error)}`);
  }

  if (
    error.message.startsWith("Empty response from Gemini.") ||
    error.message.startsWith("Invalid JSON response from AI model:") ||
    error.message.startsWith("Zod validation failed for Gemini response:") ||
    error.message.startsWith("Missing Gemini model configuration:")
  ) {
    return error;
  }

  const status = getErrorStatus(error);
  const message = error.message;
  const normalizedMessage = message.toLowerCase();

  if (status === 404 || normalizedMessage.includes("not found")) {
    return new Error(`Gemini model not found or unavailable: ${message}`);
  }

  if (
    status === 429 ||
    normalizedMessage.includes("quota") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("resource exhausted")
  ) {
    return new Error(`Gemini quota or rate limit exceeded: ${message}`);
  }

  return new Error(`Gemini evaluation failed: ${message}`);
}

function getErrorStatus(error: Error): number | undefined {
  const maybeStatus = (error as { status?: unknown; code?: unknown }).status;
  if (typeof maybeStatus === "number") {
    return maybeStatus;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === "number") {
    return maybeCode;
  }

  return undefined;
}
