import { getIdToken } from '@/features/auth/services/cognitoAuthService';
import { API_BASE_URL } from '@/lib/constants';
import type { CvMatchResult, EvaluateCvMatchRequest } from '@/types/cvAnalysis';

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

async function parseErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === 'string' && body.message.trim()) {
      return body.message;
    }
  } catch {
    // Ignore invalid error bodies and use the fallback below.
  }

  return `${fallbackMessage}: ${response.status}`;
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
    throw new Error(await parseErrorMessage(response, 'Failed to evaluate CV match'));
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
    throw new Error(await parseErrorMessage(response, 'Failed to fetch CV match result'));
  }

  return response.json();
}
