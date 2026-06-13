import { JobService } from "../../services/jobService.js";

const jobService = new JobService();

export const handler = async (event: any): Promise<any> => {
  console.log("Event:", JSON.stringify(event));

  const queueUrl = process.env.QUEUE_URL;
  const serpApiKey = process.env.SERPAPI_KEY;

  if (!queueUrl || !serpApiKey) {
    throw new Error("Missing QUEUE_URL or SERPAPI_KEY environment variables");
  }

  const query = event.query || "Backend Developer";
  const location = event.location || "Ho Chi Minh City, Ho Chi Minh City, Vietnam";

  const jobs = await jobService.fetchJobsFromSerpApi(query, location, serpApiKey);

  console.log(`Found ${jobs.length} jobs.`);

  let pushedCount = 0;
  if (jobs.length > 0) {
    pushedCount = await jobService.pushJobsToSQS(jobs, queueUrl);
  }

  return {
    message: "Successfully fetched and pushed jobs to SQS",
    query,
    location,
    totalFound: jobs.length,
    pushedToSQS: pushedCount,
  };
};