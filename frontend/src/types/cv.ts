/**
 * CV type definitions shared across features
 */

export interface CVItem {
    key: string;
    filename: string;
    sizeBytes: number;
    lastModified: string;
    url: string;
    contentHash: string;
}

export interface CVListResponse {
    count: number;
    items: CVItem[];
}

export interface CVUploadResponse {
    message: string;
    data: {
        key: string;
        url: string;
        originalFilename: string;
        sizeBytes: number;
        uploadedAt: string;
    };
}