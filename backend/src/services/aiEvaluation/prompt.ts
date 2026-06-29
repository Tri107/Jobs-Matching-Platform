import { aiEvaluationResultSchema } from "./schema.js";
import type { AiEvaluationInput } from "./types.js";

export function buildCvMatchingPrompt(input: AiEvaluationInput): string {
  const jobContext = [
    input.jobTitle ? `Job title: ${input.jobTitle}` : undefined,
    input.companyName ? `Company name: ${input.companyName}` : undefined,
  ].filter(Boolean);

  return [
    "You are an AI evaluator for CV-to-job matching.",
    "Evaluate the CV against the job description and return only a valid JSON object that matches the schema exactly.",
    "Return all natural-language content in Vietnamese. This includes summary, strengths, weaknesses, matchedSkills, missingSkills, and suggestions.",
    "Keep the JSON keys exactly as specified in English.",
    "Do not return markdown, code fences, explanations, comments, or any text outside the JSON object.",
    "",
    "Rubric:",
    "- skillsScore: evaluate required skills vs CV skills.",
    "- experienceScore: evaluate years, role relevance, and project relevance.",
    "- educationScore: evaluate education/certification relevance.",
    "- overallScore: weighted overall score from 0 to 100.",
    "",
    "Output schema:",
    JSON.stringify(aiEvaluationResultSchema, null, 2),
    "",
    "Job context:",
    jobContext.length > 0 ? jobContext.join("\n") : "No additional job context provided.",
    "",
    "Job description:",
    input.jobDescription,
    "",
    "CV text:",
    input.cvText,
  ].join("\n");
}
