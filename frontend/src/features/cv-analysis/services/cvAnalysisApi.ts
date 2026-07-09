import { getIdToken } from '@/features/auth/services/cognitoAuthService';
import { API_BASE_URL } from '@/lib/constants';
import type { CvMatchResult, EvaluateCvMatchRequest, CvMatchResultsResponse } from '@/types/cvAnalysis';

export interface ApiErrorBody {
  message?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  resetAt?: string;
}

export class CvAnalysisApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = 'CvAnalysisApiError';
    this.status = status;
    this.body = body;
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  return API_BASE_URL;
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object') {
      return body as ApiErrorBody;
    }
  } catch {
    // Ignore invalid error bodies and use the fallback message below.
  }

  return undefined;
}

async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  const body = await parseErrorBody(response);
  const message = typeof body?.message === 'string' && body.message.trim()
    ? body.message
    : `${fallbackMessage}: ${response.status}`;

  throw new CvAnalysisApiError(response.status, message, body);
}

export async function evaluateCvMatch(
  payload: EvaluateCvMatchRequest,
): Promise<CvMatchResult> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(`${baseUrl}/cv/evaluate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to evaluate CV match');
  }

  return response.json();
}

export async function getMatchResultById(matchId: string): Promise<CvMatchResult> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(`${baseUrl}/cv/match-results/${encodeURIComponent(matchId)}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to fetch CV match result');
  }

  return response.json();
}

export async function getMatchResults(): Promise<CvMatchResultsResponse> {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(`${baseUrl}/cv/match-results`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    await throwApiError(response, 'Failed to fetch CV match results');
  }

  return response.json();
}
