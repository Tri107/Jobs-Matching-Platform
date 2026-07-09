import { MatchRepository } from "../repositories/matchRepository.js";
import type { EvaluationQuota } from "../types/matching.js";

export const DAILY_EVALUATION_LIMIT = 3;
export const USER_EVALUATED_AT_INDEX = "UserEvaluatedAtIndex";

const VIETNAM_TIMEZONE_OFFSET_HOURS = 7;
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

interface VietnamDayRange {
  startUtcIso: string;
  endUtcIso: string;
  resetAt: string;
}

function assertUserId(userId: string): void {
  if (!userId.trim()) {
    throw new Error("userId is required to check evaluation quota");
  }
}

function formatVietnamResetAt(vietnamDate: Date): string {
  const year = vietnamDate.getUTCFullYear();
  const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(vietnamDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}T00:00:00+07:00`;
}

function getVietnamDayRange(now = new Date()): VietnamDayRange {
  const vietnamNow = new Date(
    now.getTime() + VIETNAM_TIMEZONE_OFFSET_HOURS * HOUR_IN_MS
  );
  const vietnamDayStartAsUtc = Date.UTC(
    vietnamNow.getUTCFullYear(),
    vietnamNow.getUTCMonth(),
    vietnamNow.getUTCDate(),
    0,
    0,
    0,
    0
  );
  const startUtcMs =
    vietnamDayStartAsUtc - VIETNAM_TIMEZONE_OFFSET_HOURS * HOUR_IN_MS;
  const nextDayStartUtcMs = startUtcMs + DAY_IN_MS;

  return {
    startUtcIso: new Date(startUtcMs).toISOString(),
    endUtcIso: new Date(nextDayStartUtcMs - 1).toISOString(),
    resetAt: formatVietnamResetAt(new Date(vietnamDayStartAsUtc + DAY_IN_MS)),
  };
}

export class EvaluationQuotaService {
  private matchRepository: MatchRepository;

  constructor(matchRepository = new MatchRepository()) {
    this.matchRepository = matchRepository;
  }

  async getDailyEvaluationUsage(userId: string): Promise<EvaluationQuota> {
    assertUserId(userId);

    const { startUtcIso, endUtcIso, resetAt } = getVietnamDayRange();
    const used = await this.matchRepository.countByUserEvaluatedAtRange(
      userId,
      startUtcIso,
      endUtcIso
    );
    const remaining = Math.max(0, DAILY_EVALUATION_LIMIT - used);

    return {
      limit: DAILY_EVALUATION_LIMIT,
      used,
      remaining,
      resetAt,
      isLimitReached: used >= DAILY_EVALUATION_LIMIT,
    };
  }

  async checkDailyEvaluationLimit(userId: string): Promise<EvaluationQuota> {
    return this.getDailyEvaluationUsage(userId);
  }
}

const evaluationQuotaService = new EvaluationQuotaService();

export function getDailyEvaluationUsage(
  userId: string
): Promise<EvaluationQuota> {
  return evaluationQuotaService.getDailyEvaluationUsage(userId);
}

export function checkDailyEvaluationLimit(
  userId: string
): Promise<EvaluationQuota> {
  return evaluationQuotaService.checkDailyEvaluationLimit(userId);
}
