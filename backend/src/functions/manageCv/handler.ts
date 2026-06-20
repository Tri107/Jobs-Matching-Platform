import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jsonResponse } from "../../utils/httpResponse.js";
import { CvService } from "../../services/cvService.js";

let cvService: CvService | null = null;

function getCvService() {
  if (!cvService) {
    cvService = new CvService();
  }
  return cvService;
}

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const userId = (event.requestContext as any).authorizer?.jwt?.claims?.sub;
    if (!userId) {
      return jsonResponse(401, { message: "Unauthorized" });
    }

    const service = getCvService();
    const routeKey = event.routeKey;

    if (routeKey === "POST /cv/upload") {
      if (!event.body) {
        return jsonResponse(400, { message: "Missing file content in request body" });
      }

      const fileBuffer = event.isBase64Encoded
        ? Buffer.from(event.body, "base64")
        : Buffer.from(event.body);

      const originalFilename = event.headers["x-original-filename"] || `cv_${Date.now()}.pdf`;

      const result = await service.uploadCv(userId, fileBuffer, originalFilename);
      return jsonResponse(201, {
        message: "CV uploaded successfully",
        data: result
      });
    }

    if (routeKey === "GET /cv") {
      const items = await service.listCvs(userId);
      return jsonResponse(200, {
        count: items.length,
        items
      });
    }

    if (routeKey === "DELETE /cv/{filename}") {
      const filename = event.pathParameters?.filename;
      if (!filename) {
        return jsonResponse(400, { message: "Missing filename parameter" });
      }

      const deletedKey = await service.deleteCv(userId, filename);
      return jsonResponse(200, {
        message: "CV deleted successfully",
        deletedKey
      });
    }

    return jsonResponse(404, { message: "Route not found" });
  } catch (error: any) {
    console.error("Error in manageCv handler:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    return jsonResponse(statusCode, { message });
  }
}
