import type { SQSEvent } from "aws-lambda";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export class ProcessJobsService {
  private lambdaClient: LambdaClient;

  constructor() {
    this.lambdaClient = new LambdaClient({});
  }

  async processSQSEvent(event: SQSEvent, normalizeMatchFunctionName: string): Promise<void> {
    console.log("Processing SQS records:", event.Records.length);

    for (const record of event.Records) {
      try {
        console.log(`Processing message: ${record.messageId}`);
        
        // The body is a JSON string of the raw job
        const rawJob = JSON.parse(record.body);

        // Invoke Python Lambda function
        const invokeCommand = new InvokeCommand({
          FunctionName: normalizeMatchFunctionName,
          Payload: Buffer.from(JSON.stringify(rawJob)),
        });

        const response = await this.lambdaClient.send(invokeCommand);
        
        if (response.FunctionError) {
          const payloadStr = response.Payload ? Buffer.from(response.Payload).toString() : "";
          console.error(`Python lambda execution failed for message ${record.messageId}: ${response.FunctionError}. Payload: ${payloadStr}`);
          throw new Error(`Process failed: ${response.FunctionError}`);
        }

        const responsePayload = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null;
        console.log(`Processed message ${record.messageId}. Result:`, JSON.stringify(responsePayload));
      } catch (error) {
        console.error(`Failed to process message ${record.messageId}:`, error);
        throw error; // Re-throw to make SQS retry or send to DLQ
      }
    }
  }
}
