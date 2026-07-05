export function encodePaginationToken(
  lastEvaluatedKey?: Record<string, unknown>
): string | undefined {
  if (!lastEvaluatedKey) {
    return undefined;
  }

  return Buffer.from(JSON.stringify(lastEvaluatedKey), "utf8").toString(
    "base64"
  );
}

export function decodePaginationToken(
  nextToken?: string
): Record<string, unknown> | undefined {
  if (!nextToken) {
    return undefined;
  }

  try {
    const decodedToken = Buffer.from(nextToken, "base64").toString("utf8");
    const parsedToken = JSON.parse(decodedToken) as unknown;

    if (
      !parsedToken ||
      typeof parsedToken !== "object" ||
      Array.isArray(parsedToken)
    ) {
      throw new Error("Token payload must be an object");
    }

    return parsedToken as Record<string, unknown>;
  } catch (error) {
    throw new Error("Invalid pagination token format", { cause: error });
  }
}
