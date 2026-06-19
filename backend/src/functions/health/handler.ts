/* Endpoint này dùng để test API Gateway nhanh, không cần đụng DynamoDB. */

import { jsonResponse } from "../../utils/httpResponse.js";

export async function handler() {
  return jsonResponse(200, {
    message: "API Gateway is working",
    service: "jobs-matching-backend",
    stage: process.env.STAGE ?? "dev",
    timestamp: new Date().toISOString(),
  });
}