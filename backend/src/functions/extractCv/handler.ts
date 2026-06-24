import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jsonResponse } from "../../utils/httpResponse.js";
import { CvService } from "../../services/cvService.js";
import { TextractService } from "../../services/textractService.js";

let cvService: CvService | null = null;
let textractService: TextractService | null = null;

function getCvService() {
  if (!cvService) cvService = new CvService();
  return cvService;
}

function getTextractService() {
  if (!textractService) textractService = new TextractService();
  return textractService;
}

/**
 * POST /cv/extract
 * Body (JSON): { "cvKey": "userId/cv_1234567890.pdf" }
 *
 * Fetches the CV from S3 and runs AWS Textract to extract its text content.
 * Only the owner (matching Cognito sub) may extract their own CV.
 */
export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const userId = (event.requestContext as any).authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return jsonResponse(401, { message: "Unauthorized" });
    }

    // Parse request body
    if (!event.body) {
      return jsonResponse(400, { message: "Missing request body" });
    }

    let body: { cvKey?: string };
    try {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      body = JSON.parse(raw);
    } catch {
      return jsonResponse(400, { message: "Invalid JSON body" });
    }

    const { cvKey } = body;
    if (!cvKey) {
      return jsonResponse(400, { message: "Missing required field: cvKey" });
    }

    // Security: ensure the requested key belongs to the authenticated user
    if (!cvKey.startsWith(`${userId}/`)) {
      return jsonResponse(403, { message: "Access denied: CV does not belong to you" });
    }

    const bucketName = process.env.CV_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("CV_BUCKET_NAME is not configured");
    }

    // Verify the CV exists in S3 (getCvService does HeadObject internally)
    const cvSvc = getCvService();
    const cvs = await cvSvc.listCvs(userId);
    const cvExists = cvs.some((cv) => cv.key === cvKey);
    if (!cvExists) {
      return jsonResponse(404, { message: "CV not found" });
    }

    // Extract text via Textract
    const textractSvc = getTextractService();
    const result = await textractSvc.extractTextFromS3(bucketName, cvKey);

    return jsonResponse(200, {
      cvKey,
      pageCount: result.pageCount,
      wordCount: result.wordCount,
      text: result.text,
    });
  } catch (error: any) {
    console.error("Error in extractCv handler:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    return jsonResponse(statusCode, { message });
  }
}
