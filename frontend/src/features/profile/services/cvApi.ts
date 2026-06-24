import { getIdToken } from "@/features/auth/services/cognitoAuthService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type UserCv = {
  key: string;
  filename: string;
  sizeBytes?: number;
  lastModified?: string;
  url: string;
};

type CvListResponse = {
  items?: UserCv[];
};

type CvUploadResponse = {
  data?: {
    key: string;
    originalFilename: string;
    sizeBytes: number;
    uploadedAt: string;
    url: string;
  };
};

async function getRequiredToken() {
  const token = await getIdToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để quản lý CV.");
  }
  return token;
}

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("API Base URL is not configured");
  }
  return API_BASE_URL;
}

export async function getUserCvs(): Promise<UserCv[]> {
  const token = await getRequiredToken();
  const response = await fetch(`${getApiBaseUrl()}/cv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Bạn cần đăng nhập để quản lý CV.");
  }

  if (!response.ok) {
    throw new Error("Không thể tải danh sách CV.");
  }

  const result = (await response.json()) as CvListResponse;
  return result.items ?? [];
}

export async function uploadUserCv(file: File): Promise<UserCv> {
  const token = await getRequiredToken();
  const response = await fetch(`${getApiBaseUrl()}/cv/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/pdf",
      "x-original-filename": file.name,
    },
    body: await file.arrayBuffer(),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Bạn cần đăng nhập để tải CV.");
  }

  const result = (await response.json().catch(() => ({}))) as CvUploadResponse & {
    message?: string;
  };

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Không thể tải CV lên.");
  }

  return {
    key: result.data.key,
    filename: result.data.originalFilename,
    sizeBytes: result.data.sizeBytes,
    lastModified: result.data.uploadedAt,
    url: result.data.url,
  };
}

export async function deleteUserCv(key: string): Promise<void> {
  const token = await getRequiredToken();
  const filename = key.split("/").pop();
  if (!filename) {
    throw new Error("CV không hợp lệ.");
  }

  const response = await fetch(`${getApiBaseUrl()}/cv/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Bạn cần đăng nhập để xóa CV.");
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(result.message || "Không thể xóa CV.");
  }
}
