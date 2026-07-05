import { getIdToken } from '@/features/auth/services/cognitoAuthService';
import type { CVListResponse, CVUploadResponse } from '@/types/cv';
import { API_BASE_URL } from '@/lib/constants';


async function getAuthHeaders(contentType?: string): Promise<HeadersInit> {
  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
}

export async function getCVs(): Promise<CVListResponse> {
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not configured');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/cv`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Failed to fetch CVs';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch { }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function uploadCV(file: File): Promise<CVUploadResponse> {
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not configured');
  }

  const token = await getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/pdf',
    'x-original-filename': encodeURIComponent(file.name),
  };

  const response = await fetch(`${API_BASE_URL}/cv/upload`, {
    method: 'POST',
    headers,
    body: file,
  });

  if (!response.ok) {
    let errorMsg = 'Failed to upload CV';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch { }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function deleteCV(filename: string): Promise<{ message: string; deletedKey: string }> {
  if (!API_BASE_URL) {
    throw new Error('API Base URL is not configured');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/cv/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Failed to delete CV';
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch { }
    throw new Error(errorMsg);
  }

  return response.json();
}
