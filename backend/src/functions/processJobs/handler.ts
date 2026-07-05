import type { SQSEvent } from "aws-lambda";
import { ProcessJobsService } from "../../services/processJobsService.js";

const processJobsService = new ProcessJobsService();
const NORMALIZE_MATCH_FUNCTION_NAME = process.env.NORMALIZE_MATCH_FUNCTION_NAME;

export const handler = async (event: SQSEvent): Promise<void> => {
  if (!NORMALIZE_MATCH_FUNCTION_NAME) {
    throw new Error("Missing NORMALIZE_MATCH_FUNCTION_NAME environment variable");
  }

  await processJobsService.processSQSEvent(event, NORMALIZE_MATCH_FUNCTION_NAME);
};
