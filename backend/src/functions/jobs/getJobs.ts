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

    // Fetch all items from the table recursively
    let allItems: any[] = [];
    let lastEvaluatedKey: any = undefined;
    do {
      const scanResult: any = await dynamoDb.send(
        new ScanCommand({
          TableName: jobsTable,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      if (scanResult.Items) {
        allItems = allItems.concat(scanResult.Items.map((item: any) => unmarshall(item)));
      }
      lastEvaluatedKey = scanResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Sort in memory by postedAt or createdAt descending to show latest jobs first
    const getJobTime = (job: any): number => {
      const dateStr = job.postedAt || job.originalPostedAt || job.createdAt;
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    allItems.sort((a, b) => getJobTime(b) - getJobTime(a));

    let jobs = allItems;

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

    // Apply the limit after sorting and filtering
    const limitedJobs = jobs.slice(0, limit);

    return jsonResponse(200, {
      count: limitedJobs.length,
      items: limitedJobs,
    });
  } catch (error) {
    console.error("Failed to get jobs", error);

    return jsonResponse(500, {
      message: "Failed to get jobs",
    });
  }
}