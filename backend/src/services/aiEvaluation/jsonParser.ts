function stripMarkdownJsonFence(rawText: string): string {
  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fencedMatch?.[1]?.trim() ?? trimmed;
}

export function parseAiJsonResponse(rawText: string): unknown {
  const jsonText = stripMarkdownJsonFence(rawText);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON response from AI model: ${message}`);
  }
}
