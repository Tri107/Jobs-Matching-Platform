import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jsonResponse } from "../../utils/httpResponse.js";
import { MatchRepository } from "../../repositories/matchRepository.js";

let matchRepository: MatchRepository | null = null;
function getMatchRepo() {
  if (!matchRepository) matchRepository = new MatchRepository();
  return matchRepository;
}

/**
 * GET /cv/match-results          — list all results for the authenticated user
 * GET /cv/match-results/{matchId} — get a specific result
 */
export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const userId = (event.requestContext as any).authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return jsonResponse(401, { message: "Unauthorized" });
    }

    const repo = getMatchRepo();
    const matchId = event.pathParameters?.matchId;

    if (matchId) {
      const result = await repo.findById(userId, matchId);
      if (!result) {
        return jsonResponse(404, { message: "Match result not found" });
      }
      return jsonResponse(200, result);
    }

    const results = await repo.findByUser(userId);
    return jsonResponse(200, { count: results.length, items: results });
  } catch (error: any) {
    console.error("Error in getMatchResults handler:", error);
    return jsonResponse(error.statusCode || 500, {
      message: error.message || "Internal server error",
    });
  }
}
