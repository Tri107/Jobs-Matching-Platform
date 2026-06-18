import { JobService } from "../../services/jobService.js";

const jobService = new JobService();

export const handler = async (event: any): Promise<any> => {
  console.log("Event:", JSON.stringify(event));

  const queueUrl = process.env.QUEUE_URL;
  const serpApiKey = process.env.SERPAPI_KEY;

  if (!queueUrl || !serpApiKey) {
    throw new Error("Missing QUEUE_URL or SERPAPI_KEY environment variables");
  }

  const location = event.location || "Vietnam";

  // EventBridge gửi mảng queries, test thủ công gửi 1 query string
  const queries: string[] = event.queries
    ? event.queries
    : [event.query || "Backend Developer"];

  let totalFound = 0;
  let totalPushed = 0;
  const results: Array<{ query: string; found: number; pushed: number }> = [];

  for (const query of queries) {
    try {
      console.log(`--- Fetching: "${query}" in "${location}" ---`);
      const jobs = await jobService.fetchJobsFromSerpApi(query, location, serpApiKey);

      let pushedCount = 0;
      if (jobs.length > 0) {
        pushedCount = await jobService.pushJobsToSQS(jobs, queueUrl);
      }

      totalFound += jobs.length;
      totalPushed += pushedCount;
      results.push({ query, found: jobs.length, pushed: pushedCount });

      // Delay 2s giữa các request để tránh rate limit SerpAPI
      if (queries.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error fetching "${query}":`, error);
      results.push({ query, found: 0, pushed: 0 });
    }
  }

  console.log(`=== SUMMARY: ${totalFound} jobs found, ${totalPushed} pushed to SQS ===`);

  return {
    message: "Fetch jobs completed",
    source: event.source || "manual",
    location,
    totalQueries: queries.length,
    totalFound,
    totalPushed,
    results,
  };
};
