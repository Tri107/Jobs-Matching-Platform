import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jsonResponse } from "../../utils/httpResponse.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { TextractService } from "../../services/textractService.js";
import { MatchRepository } from "../../repositories/matchRepository.js";
import { getExistingEvaluation } from "../../services/evaluationIdempotencyService.js";
import { checkDailyEvaluationLimit } from "../../services/evaluationQuotaService.js";
import {
  evaluateCvMatchWithGemini,
  getGeminiEvaluationModelId,
} from "../../services/aiEvaluation/geminiEvaluationService.js";
import type { Job } from "../../types/job.js";
import type { EvaluateMatchRequest, MatchResult } from "../../types/matching.js";
import { randomUUID } from "crypto";

// Singletons — reused across warm Lambda invocations
let textractService: TextractService | null = null;
let matchRepository: MatchRepository | null = null;
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
  return docClient;
}
function getTextract() {
  if (!textractService) textractService = new TextractService();
  return textractService;
}
function getMatchRepo() {
  if (!matchRepository) matchRepository = new MatchRepository();
  return matchRepository;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function getJob(jobId: string, jobsTable: string): Promise<Job | null> {
  const jobResponse = await getDocClient().send(
    new GetCommand({ TableName: jobsTable, Key: { jobId } })
  );

  return (jobResponse.Item as Job) ?? null;
}

async function getExistingResultJobTitle(jobId: string): Promise<string> {
  const jobsTable = process.env.JOBS_TABLE;
  if (!jobsTable) {
    return "Job";
  }

  try {
    const job = await getJob(jobId, jobsTable);
    return job?.title || "Job";
  } catch (error) {
    console.warn("Could not fetch job title for existing CV evaluation result", {
      jobId,
      error,
    });
    return "Job";
  }
}

function buildEvaluateResponse(
  matchResult: MatchResult,
  jobTitle: string,
  pageCount?: number
) {
  return {
    matchId: matchResult.matchId,
    jobId: matchResult.jobId,
    jobTitle,
    cvKey: matchResult.cvKey,
    ...(typeof pageCount === "number" ? { pageCount } : {}),
    score: matchResult.score,
    evaluatedAt: matchResult.evaluatedAt,
  };
}

/**
 * POST /cv/evaluate
 * Body (JSON): { "jobId": "...", "cvKey": "userId/cv_xxx.pdf" }
 *
 * Full pipeline:
 *   1. Fetch job from DynamoDB
 *   2. Extract CV text from S3 via Textract
 *   3. Send to Gemini for scoring
 *   4. Persist result in MatchResultsTable
 *   5. Return score to caller
 */
export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const userId = (event.requestContext as any).authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return jsonResponse(401, { message: "Unauthorized" });
    }

    // --- Parse & validate body ---
    if (!event.body) {
      return jsonResponse(400, { message: "Missing request body" });
    }

    let body: EvaluateMatchRequest;
    try {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      body = JSON.parse(raw);
    } catch {
      return jsonResponse(400, { message: "Invalid JSON body" });
    }

    const { jobId, cvKey } = body;
    if (!isNonEmptyString(jobId)) {
      return jsonResponse(400, { message: "Missing required field: jobId" });
    }
    if (!isNonEmptyString(cvKey)) {
      return jsonResponse(400, { message: "Missing required field: cvKey" });
    }

    // Ownership check — CV key must belong to the authenticated user
    if (!cvKey.startsWith(`${userId}/`)) {
      return jsonResponse(403, { message: "Access denied: CV does not belong to you" });
    }

    const existingResult = await getExistingEvaluation(userId, jobId, cvKey);
    if (existingResult) {
      console.log("Existing CV evaluation result found");
      const jobTitle = await getExistingResultJobTitle(jobId);
      return jsonResponse(200, buildEvaluateResponse(existingResult, jobTitle));
    }

    const quota = await checkDailyEvaluationLimit(userId);
    console.log("Daily evaluation quota checked");
    if (quota.isLimitReached) {
      console.log("Daily evaluation quota exceeded");
      return jsonResponse(429, {
        message: "Daily AI evaluation limit reached",
        limit: quota.limit,
        used: quota.used,
        remaining: quota.remaining,
        resetAt: quota.resetAt,
      });
    }

    const bucketName = process.env.CV_BUCKET_NAME;
    const jobsTable = process.env.JOBS_TABLE;
    if (!bucketName) throw new Error("CV_BUCKET_NAME is not configured");
    if (!jobsTable) throw new Error("JOBS_TABLE is not configured");

    // --- Step 1: Fetch job from DynamoDB ---
    const job = await getJob(jobId, jobsTable);
    if (!job) {
      return jsonResponse(404, { message: `Job not found: ${jobId}` });
    }

    if (!job.description) {
      return jsonResponse(422, { message: "Job has no description to evaluate against" });
    }

    // --- Step 2: Extract CV text via Textract ---
    const { text: cvText, pageCount } = await getTextract().extractTextFromS3(bucketName, cvKey);

    if (!cvText.trim()) {
      return jsonResponse(422, { message: "Could not extract text from CV — the PDF may be image-only or corrupted" });
    }

    // --- Step 3: AI evaluation via Gemini ---
    const score = await evaluateCvMatchWithGemini({
      cvText,
      jobTitle: job.title,
      companyName: job.companyName,
      jobDescription: job.description,
    });

    // --- Step 4: Persist result ---
    const matchResult: MatchResult = {
      matchId: randomUUID(),
      userId,
      jobId,
      cvKey,
      score,
      evaluatedAt: new Date().toISOString(),
      modelId: getGeminiEvaluationModelId(),
    };

    await getMatchRepo().save(matchResult);

    // --- Step 5: Return to caller ---
    console.log("CV evaluation completed");

    return jsonResponse(200, buildEvaluateResponse(matchResult, job.title, pageCount));
  } catch (error: any) {
    console.error("Error in evaluateMatch handler:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    return jsonResponse(statusCode, { message });
  }
}
