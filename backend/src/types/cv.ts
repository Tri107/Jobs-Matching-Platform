export interface CvUploadResult {
  key: string;
  url: string;
  originalFilename: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface CvListItem {
  key: string;
  filename: string;
  sizeBytes?: number | undefined;
  lastModified?: Date | undefined;
  url: string;
  contentHash?: string | undefined;
}
