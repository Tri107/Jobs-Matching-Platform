import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

export async function getGeminiApiKey(): Promise<string> {
  const localApiKey = process.env.GEMINI_API_KEY?.trim();
  if (localApiKey) {
    return localApiKey;
  }

  const parameterName = process.env.GEMINI_API_KEY_PARAMETER_NAME?.trim();
  if (!parameterName) {
    throw new Error(
      "Missing Gemini API key configuration: set GEMINI_API_KEY for local development or GEMINI_API_KEY_PARAMETER_NAME for SSM.",
    );
  }

  const ssm = new SSMClient({});

  try {
    const response = await ssm.send(
      new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true,
      }),
    );

    const apiKey = response.Parameter?.Value?.trim();
    if (!apiKey) {
      throw new Error("Gemini API key SSM parameter is empty.");
    }

    return apiKey;
  } catch (error) {
    if (isAccessDeniedError(error)) {
      throw new Error("SSM access denied while reading Gemini API key parameter.");
    }

    if (error instanceof Error && error.message === "Gemini API key SSM parameter is empty.") {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read Gemini API key from SSM: ${message}`);
  }
}

function isAccessDeniedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "AccessDeniedException" || error.name === "AccessDenied";
}
