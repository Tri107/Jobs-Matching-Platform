import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import type { SavedJob } from "../types/savedJob.js";

const dynamoDb = new DynamoDBClient({});

export class SavedJobRepository {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async save(userId: string, jobId: string): Promise<SavedJob> {
    const savedAt = new Date().toISOString();

    await dynamoDb.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: {
          userId: { S: userId },
          jobId: { S: jobId },
          savedAt: { S: savedAt },
        },
      })
    );

    return { userId, jobId, savedAt };
  }

  async remove(userId: string, jobId: string): Promise<void> {
    await dynamoDb.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: {
          userId: { S: userId },
          jobId: { S: jobId },
        },
      })
    );
  }

  async findByUserId(userId: string): Promise<SavedJob[]> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": { S: userId },
        },
        ScanIndexForward: false,
      })
    );

    return (result.Items ?? []).map((item) => unmarshall(item) as SavedJob);
  }
}
