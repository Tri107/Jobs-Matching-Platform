import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import type { MatchResult } from "../types/matching.js";

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
}
