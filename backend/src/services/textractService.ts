import {
  TextractClient,
  DetectDocumentTextCommand,
  type Block,
} from "@aws-sdk/client-textract";

export interface ExtractTextResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

export class TextractService {
  private client: TextractClient;

  constructor() {
    this.client = new TextractClient({});
  }

  /**
   * Extract plain text from a PDF stored in S3 using Textract.
   * Uses DetectDocumentText (synchronous) which supports up to 10 pages.
   */
  async extractTextFromS3(bucketName: string, s3Key: string): Promise<ExtractTextResult> {
    const command = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: bucketName,
          Name: s3Key,
        },
      },
    });

    const response = await this.client.send(command);
    const blocks: Block[] = response.Blocks ?? [];

    // Collect LINE blocks in document order to preserve reading order
    const lines = blocks
      .filter((b) => b.BlockType === "LINE" && b.Text)
      .map((b) => b.Text as string);

    const text = lines.join("\n");
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Count PAGE blocks to know number of pages processed
    const pageCount = blocks.filter((b) => b.BlockType === "PAGE").length || 1;

    return { text, pageCount, wordCount };
  }
}
