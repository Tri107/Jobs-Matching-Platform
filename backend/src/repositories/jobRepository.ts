import {
  DynamoDBClient,
  ScanCommand,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import type { Job } from "../types/job.js";

const dynamoDb = new DynamoDBClient({});

export interface ScanJobsParams {
  tableName: string;
  limit: number;
  exclusiveStartKey?: Record<string, unknown>;
}

export interface ScanJobsResult {
  items: Job[];
  lastEvaluatedKey?: Record<string, unknown>;
}

export async function scanJobs({
  tableName,
  limit,
  exclusiveStartKey,
}: ScanJobsParams): Promise<ScanJobsResult> {
  const result = await dynamoDb.send(
    new ScanCommand({
      TableName: tableName,
      Limit: limit,
      ...(exclusiveStartKey
        ? {
            ExclusiveStartKey: exclusiveStartKey as Record<
              string,
              AttributeValue
            >,
          }
        : {}),
    })
  );

  const items = (result.Items ?? []).map((item) => unmarshall(item) as Job);

  if (!result.LastEvaluatedKey) {
    return { items };
  }

  return {
    items,
    lastEvaluatedKey: result.LastEvaluatedKey as Record<string, unknown>,
  };
}
