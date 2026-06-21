import { S3Client, ListObjectsV2Command, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "crypto";
import type { CvUploadResult, CvListItem } from "../types/cv.js";

export class CvService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({});
    this.bucketName = process.env.CV_BUCKET_NAME || "";
    if (!this.bucketName) {
      throw new Error("CV_BUCKET_NAME is not configured");
    }
  }

  async uploadCv(userId: string, fileBuffer: Buffer, originalFilename: string): Promise<CvUploadResult> {
    // 1. Validate PDF signature (magic bytes)
    // PDF files must start with "%PDF" (hex: 25 50 44 46)
    const isPdf = fileBuffer.slice(0, 4).toString() === "%PDF";
    if (!isPdf) {
      const error: any = new Error("Only PDF files are allowed");
      error.statusCode = 400;
      throw error;
    }

    // 2. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (fileBuffer.length > MAX_SIZE) {
      const error: any = new Error("File size exceeds 5MB limit");
      error.statusCode = 400;
      throw error;
    }

    // 3. Hash the file content to check for duplicates
    const fileHash = createHash("sha256").update(fileBuffer).digest("hex");

    // 4. List user's existing CVs to check limit (max 3)
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `${userId}/`,
    });
    const listResponse = await this.s3Client.send(listCommand);
    const existingObjects = listResponse.Contents ?? [];

    if (existingObjects.length >= 3) {
      const error: any = new Error("Maximum 3 CVs allowed per user");
      error.statusCode = 400;
      throw error;
    }

    // 5. Retrieve metadata for existing objects to check duplicate content
    for (const obj of existingObjects) {
      if (!obj.Key) continue;
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: obj.Key,
      });
      const headResponse = await this.s3Client.send(headCommand);
      const existingHash = headResponse.Metadata?.["content-hash"];
      if (existingHash === fileHash) {
        const error: any = new Error("Duplicate CV content detected");
        error.statusCode = 400;
        throw error;
      }
    }

    // 6. Upload file to S3
    const timestamp = Date.now();
    const s3Key = `${userId}/cv_${timestamp}.pdf`;

    const putCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "application/pdf",
      Metadata: {
        "content-hash": fileHash,
        "original-filename": encodeURIComponent(originalFilename),
      },
    });

    await this.s3Client.send(putCommand);

    const region = process.env.AWS_REGION || "ap-southeast-1";
    const fileUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    return {
      key: s3Key,
      url: fileUrl,
      originalFilename,
      sizeBytes: fileBuffer.length,
      uploadedAt: new Date(timestamp).toISOString(),
    };
  }

  async listCvs(userId: string): Promise<CvListItem[]> {
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `${userId}/`,
    });
    const listResponse = await this.s3Client.send(listCommand);
    const objects = listResponse.Contents ?? [];

    const region = process.env.AWS_REGION || "ap-southeast-1";
    const cvs = await Promise.all(
      objects.map(async (obj): Promise<CvListItem | null> => {
        if (!obj.Key) return null;
        
        const headCommand = new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: obj.Key,
        });
        const headResponse = await this.s3Client.send(headCommand);
        
        const filename = headResponse.Metadata?.["original-filename"]
          ? decodeURIComponent(headResponse.Metadata["original-filename"])
          : obj.Key.split("/").pop() || "unknown.pdf";

        return {
          key: obj.Key,
          filename,
          sizeBytes: obj.Size,
          lastModified: obj.LastModified,
          url: `https://${this.bucketName}.s3.${region}.amazonaws.com/${obj.Key}`,
          contentHash: headResponse.Metadata?.["content-hash"],
        };
      })
    );

    return cvs.filter((cv): cv is CvListItem => cv !== null);
  }

  async deleteCv(userId: string, filename: string): Promise<string> {
    const s3Key = `${userId}/${filename}`;

    // Verify ownership and existence
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      }));
    } catch (err: any) {
      if (err.name === "NotFound") {
        const error: any = new Error("CV not found or access denied");
        error.statusCode = 404;
        throw error;
      }
      throw err;
    }

    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    }));

    return s3Key;
  }
}
