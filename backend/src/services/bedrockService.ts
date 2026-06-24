import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { MatchScore } from "../types/matching.js";

// Amazon Nova Lite via APAC cross-region inference profile
// No daily token limits (pay-per-use), suitable for production workloads
// Pricing: ~$0.00006 / 1K input tokens, ~$0.00024 / 1K output tokens
// A typical CV evaluation (~1K tokens total) costs < $0.0001 per request
const MODEL_ID = "apac.amazon.nova-lite-v1:0";

// Keep output tokens small — we only need a JSON object, not an essay
const MAX_OUTPUT_TOKENS = 512;

export class BedrockService {
  private client: BedrockRuntimeClient;
  readonly modelId = MODEL_ID;

  constructor() {
    this.client = new BedrockRuntimeClient({});
  }

  /**
   * Evaluate how well a CV matches a job description.
   * Returns a structured MatchScore parsed from Nova Micro's JSON response.
   * Retries up to 3 times with exponential backoff on throttling errors.
   */
  async evaluateMatch(cvText: string, jobTitle: string, jobDescription: string): Promise<MatchScore> {
    const truncatedCv = cvText.slice(0, 2000);
    const truncatedJd = jobDescription.slice(0, 1500);
    const prompt = buildPrompt(truncatedCv, jobTitle, truncatedJd);

    const payload = {
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxNewTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.1,
        topP: 0.9,
      },
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    // Retry up to 3 times with exponential backoff on throttling
    const MAX_RETRIES = 3;
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.send(command);
        const responseBody = JSON.parse(Buffer.from(response.body).toString("utf-8"));
        const rawText: string = responseBody?.output?.message?.content?.[0]?.text ?? "";
        return parseMatchScore(rawText);
      } catch (err: any) {
        lastError = err;
        const isThrottle =
          err.name === "ThrottlingException" ||
          err.name === "TooManyRequestsException" ||
          (typeof err.message === "string" && err.message.toLowerCase().includes("too many"));

        if (isThrottle && attempt < MAX_RETRIES) {
          const waitMs = 2000 * attempt; // 2s, 4s
          console.warn(`Bedrock throttled (attempt ${attempt}/${MAX_RETRIES}), retrying in ${waitMs}ms...`);
          await sleep(waitMs);
          continue;
        }

        // Not a throttle error, or exhausted retries — rethrow with clean message
        if (isThrottle) {
          const error: any = new Error("AI service is temporarily busy. Please try again in a few minutes.");
          error.statusCode = 429;
          throw error;
        }
        throw err;
      }
    }

    throw lastError;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPrompt(cvText: string, jobTitle: string, jobDescription: string): string {
  return `You are a professional HR evaluator. Analyze how well the candidate's CV matches the job posting.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}

Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON.
Use this exact schema:
{
  "overallScore": <integer 0-100>,
  "skillsScore": <integer 0-100>,
  "experienceScore": <integer 0-100>,
  "educationScore": <integer 0-100>,
  "summary": "<2-3 sentence explanation in English>",
  "matchedSkills": ["<skill>", ...],
  "missingSkills": ["<skill>", ...]
}`;
}

function parseMatchScore(rawText: string): MatchScore {
  // Strip markdown code fences if the model wraps JSON in them
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  let parsed: Partial<MatchScore>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: extract the first JSON object via regex
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`Bedrock returned non-JSON response: ${rawText.slice(0, 200)}`);
    }
    parsed = JSON.parse(match[0]);
  }

  // Validate and normalise each field so callers get a reliable shape
  return {
    overallScore: clamp(Number(parsed.overallScore ?? 0)),
    skillsScore: clamp(Number(parsed.skillsScore ?? 0)),
    experienceScore: clamp(Number(parsed.experienceScore ?? 0)),
    educationScore: clamp(Number(parsed.educationScore ?? 0)),
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
  };
}

function clamp(value: number): number {
  if (isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
