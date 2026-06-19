import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { jsonResponse } from "../../utils/httpResponse.js";

const dynamoDb = new DynamoDBClient({});
const jobsTable = process.env.JOBS_TABLE;

function parseLimit(rawLimit?: string): number {
  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 50);
}

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    if (!jobsTable) {
      return jsonResponse(500, {
        message: "Missing JOBS_TABLE environment variable",
      });
    }

    const queryParams = event.queryStringParameters ?? {};
    const limit = parseLimit(queryParams.limit);
    const keyword = queryParams.keyword?.trim().toLowerCase();

    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: jobsTable,
        Limit: limit,
      })
    );

    let jobs = (result.Items ?? []).map((item) => unmarshall(item));

    if (keyword) {
      jobs = jobs.filter((job) => {
        const searchableText = [
          job.title,
          job.companyName,
          job.company_name,
          job.location,
          job.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword);
      });
    }

    return jsonResponse(200, {
      count: jobs.length,
      items: jobs,
    });
  } catch (error) {
    console.error("Failed to get jobs", error);

    return jsonResponse(500, {
      message: "Failed to get jobs",
    });
  }
}