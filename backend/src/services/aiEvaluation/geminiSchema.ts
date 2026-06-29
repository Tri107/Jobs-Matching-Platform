import { Type } from "@google/genai";
import { z } from "zod";

const scoreSchema = z.number().min(0).max(100);

export const aiEvaluationZodSchema = z.object({
  overallScore: scoreSchema,
  skillsScore: scoreSchema,
  experienceScore: scoreSchema,
  educationScore: scoreSchema,
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
});

const stringArraySchema = {
  type: Type.ARRAY,
  items: { type: Type.STRING },
};

export const geminiAiEvaluationResponseSchema = {
  type: Type.OBJECT,
  required: [
    "overallScore",
    "skillsScore",
    "experienceScore",
    "educationScore",
    "summary",
    "strengths",
    "weaknesses",
    "matchedSkills",
    "missingSkills",
    "suggestions",
  ],
  properties: {
    overallScore: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 100,
      description: "Weighted overall score from 0 to 100.",
    },
    skillsScore: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 100,
      description: "Evaluate required skills vs CV skills.",
    },
    experienceScore: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 100,
      description: "Evaluate years, role relevance, and project relevance.",
    },
    educationScore: {
      type: Type.NUMBER,
      minimum: 0,
      maximum: 100,
      description: "Evaluate education and certification relevance.",
    },
    summary: { type: Type.STRING },
    strengths: stringArraySchema,
    weaknesses: stringArraySchema,
    matchedSkills: stringArraySchema,
    missingSkills: stringArraySchema,
    suggestions: stringArraySchema,
  },
} as const;
