import type { APIGatewayProxyEventV2 } from "aws-lambda";

import {
  searchJobs,
  JobSearchValidationError,
} from "../../services/jobSearchService.js";
import { jsonResponse } from "../../utils/httpResponse.js";

export async function handler(event: APIGatewayProxyEventV2) {
  const tableName = process.env.JOBS_TABLE;

  if (!tableName) {
    return jsonResponse(500, {
      message: "Missing JOBS_TABLE environment variable",
    });
  }

  try {
    const queryStringParameters = event.queryStringParameters ?? undefined;
    const result = await searchJobs({
      tableName,
      ...(queryStringParameters ? { queryStringParameters } : {}),
    });

    return jsonResponse(200, result);
  } catch (error) {
    if (error instanceof JobSearchValidationError) {
      return jsonResponse(400, {
        message: error.message,
      });
    }

    console.error("Failed to search jobs", error);

    return jsonResponse(500, {
      message: "Failed to search jobs",
    });
  }
}
