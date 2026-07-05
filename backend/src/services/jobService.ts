import { SQSClient, SendMessageBatchCommand, type SendMessageBatchRequestEntry } from "@aws-sdk/client-sqs";
import { randomUUID } from "crypto";

export class JobService {
  private sqsClient: SQSClient;
  
  constructor() {
    this.sqsClient = new SQSClient({});
  }

  async fetchJobsFromSerpApi(query: string, location: string, apiKey: string): Promise<any[]> {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: query,
      location: location,
      google_domain: "google.com.vn",
      hl: "vi",
      gl: "vn",
      api_key: apiKey
    });

    const url = `https://serpapi.com/search?${params.toString()}`;
    console.log(`Fetching jobs from SerpAPI for query: ${query} in ${location}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`SerpAPI error: ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as Record<string, any>;
    const jobs = data.jobs_results || [];
    console.log(`SerpAPI returned ${jobs.length} job results`);
    
    return jobs;
  }

  async pushJobsToSQS(jobs: any[], queueUrl: string): Promise<number> {
    if (jobs.length === 0) return 0;
    const batchSize = 10;
    let processedCount = 0;

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      const entries: SendMessageBatchRequestEntry[] = batch.map((job: any) => ({
        Id: randomUUID(),
        MessageBody: JSON.stringify(job),
      }));

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      });

      const batchResult = await this.sqsClient.send(command);
      console.log(`Batch sent. Successful: ${batchResult.Successful?.length || 0}, Failed: ${batchResult.Failed?.length || 0}`);
      processedCount += batchResult.Successful?.length || 0;
    }

    return processedCount;
  }
}