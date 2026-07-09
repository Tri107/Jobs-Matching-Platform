import { MatchRepository } from "../repositories/matchRepository.js";
import type { MatchResult } from "../types/matching.js";

export class EvaluationIdempotencyService {
  private matchRepository: MatchRepository;

  constructor(matchRepository = new MatchRepository()) {
    this.matchRepository = matchRepository;
  }

  async getExistingEvaluation(
    userId: string,
    jobId: string,
    cvKey: string
  ): Promise<MatchResult | null> {
    return this.matchRepository.findExistingEvaluation(userId, jobId, cvKey);
  }
}

const evaluationIdempotencyService = new EvaluationIdempotencyService();

export function getExistingEvaluation(
  userId: string,
  jobId: string,
  cvKey: string
): Promise<MatchResult | null> {
  return evaluationIdempotencyService.getExistingEvaluation(userId, jobId, cvKey);
}
