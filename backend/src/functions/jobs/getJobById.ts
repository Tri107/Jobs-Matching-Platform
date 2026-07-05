import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { jsonResponse } from "../../utils/httpResponse.js";

const dynamoDb = new DynamoDBClient({});
const jobsTable = process.env.JOBS_TABLE;

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    if (!jobsTable) {
      return jsonResponse(500, {
        message: "Missing JOBS_TABLE environment variable",
      });
    }

    const jobId = event.pathParameters?.jobId;
    if (!jobId) {
      return jsonResponse(400, {
        message: "Missing jobId parameter",
      });
    }

    const result = await dynamoDb.send(
      new GetItemCommand({
        TableName: jobsTable,
        Key: {
          jobId: { S: jobId },
        },
      })
    );

    if (!result.Item) {
      return jsonResponse(404, {
        message: "Job not found",
      });
    }

    const job = unmarshall(result.Item);

    return jsonResponse(200, job);
  } catch (error) {
    console.error("Failed to get job by ID", error);

    return jsonResponse(500, {
      message: "Failed to get job by ID",
    });
  }
}
