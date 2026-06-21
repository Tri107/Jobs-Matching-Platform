import type { APIGatewayProxyEventV2 } from "aws-lambda";

import { jsonResponse } from "../../utils/httpResponse.js";
import { SavedJobService } from "../../services/savedJobService.js";

const tableName = process.env.SAVED_JOBS_TABLE;
const savedJobService = tableName ? new SavedJobService(tableName) : null;

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    if (!savedJobService || !tableName) {
      return jsonResponse(500, {
        message: "Missing SAVED_JOBS_TABLE environment variable",
      });
    }

    // Extract userId from Cognito JWT claims
    const userId = (
      event.requestContext as any
    )?.authorizer?.jwt?.claims?.sub as string | undefined;

    if (!userId) {
      return jsonResponse(401, {
        message: "Unauthorized: missing user identity",
      });
    }

    const method = event.requestContext.http.method;
    const jobId = event.pathParameters?.jobId;

    switch (method) {
      case "POST": {
        if (!jobId) {
          return jsonResponse(400, { message: "Missing jobId in path" });
        }

        const savedJob = await savedJobService.saveJob(userId, jobId);

        return jsonResponse(201, {
          message: "Job saved successfully",
          item: savedJob,
        });
      }

      case "DELETE": {
        if (!jobId) {
          return jsonResponse(400, { message: "Missing jobId in path" });
        }

        await savedJobService.unsaveJob(userId, jobId);

        return jsonResponse(200, {
          message: "Job removed from saved list",
        });
      }

      case "GET": {
        const savedJobs = await savedJobService.getSavedJobs(userId);

        return jsonResponse(200, {
          count: savedJobs.length,
          items: savedJobs,
        });
      }

      default:
        return jsonResponse(405, {
          message: `Method ${method} not allowed`,
        });
    }
  } catch (error) {
    console.error("SavedJobs handler error:", error);

    return jsonResponse(500, {
      message: "Internal server error",
    });
  }
}
