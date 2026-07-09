import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import type { MatchResult } from "../types/matching.js";

const USER_EVALUATED_AT_INDEX = "UserEvaluatedAtIndex";

export class MatchRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    this.tableName = process.env.MATCH_RESULTS_TABLE ?? "";
    if (!this.tableName) {
      throw new Error("MATCH_RESULTS_TABLE environment variable is not configured");
    }
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async save(result: MatchResult): Promise<void> {
    // Set TTL to 90 days from now — keeps table lean and saves storage cost
    const ttlSeconds = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { ...result, ttl: ttlSeconds },
      })
    );
  }

  /** Get all match results for a user, newest first */
  async findByUser(userId: string): Promise<MatchResult[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        ScanIndexForward: false, // descending by sort key (evaluatedAt)
      })
    );
    return (response.Items ?? []) as MatchResult[];
  }

  /** Get a specific match result by userId + matchId */
  async findById(userId: string, matchId: string): Promise<MatchResult | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId, matchId },
      })
    );
    return (response.Item as MatchResult) ?? null;
  }

  async countByUserEvaluatedAtRange(
    userId: string,
    startEvaluatedAt: string,
    endEvaluatedAt: string
  ): Promise<number> {
    let used = 0;
    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const queryInput = {
        TableName: this.tableName,
        IndexName: USER_EVALUATED_AT_INDEX,
        KeyConditionExpression:
          "userId = :uid AND evaluatedAt BETWEEN :start AND :end",
        ExpressionAttributeValues: {
          ":uid": userId,
          ":start": startEvaluatedAt,
          ":end": endEvaluatedAt,
        },
        Select: "COUNT" as const,
        ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
      };

      const response = await this.docClient.send(
        new QueryCommand(queryInput)
      );

      used += response.Count ?? 0;
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return used;
  }

  async findExistingEvaluation(
    userId: string,
    jobId: string,
    cvKey: string
  ): Promise<MatchResult | null> {
    if (!userId.trim()) {
      throw new Error("userId is required to find existing evaluation");
    }
    if (!jobId.trim()) {
      throw new Error("jobId is required to find existing evaluation");
    }
    if (!cvKey.trim()) {
      throw new Error("cvKey is required to find existing evaluation");
    }

    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const queryInput = {
        TableName: this.tableName,
        IndexName: USER_EVALUATED_AT_INDEX,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
        ScanIndexForward: false,
        ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
      };

      const response = await this.docClient.send(
        new QueryCommand(queryInput)
      );
      const existingEvaluation = (response.Items ?? [])
        .map((item) => item as MatchResult)
        .find((item) => item.jobId === jobId && item.cvKey === cvKey);

      if (existingEvaluation) {
        return existingEvaluation;
      }

      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    return null;
  }
}
