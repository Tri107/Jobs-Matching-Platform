export const aiEvaluationResultSchema = {
  type: "object",
  additionalProperties: false,
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
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Weighted overall score from 0 to 100.",
    },
    skillsScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Evaluate required skills vs CV skills.",
    },
    experienceScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Evaluate years, role relevance, and project relevance.",
    },
    educationScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Evaluate education and certification relevance.",
    },
    summary: {
      type: "string",
      description: "Concise explanation of the candidate-job match.",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Candidate strengths relevant to the job.",
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
      description: "Candidate weaknesses or gaps relevant to the job.",
    },
    matchedSkills: {
      type: "array",
      items: { type: "string" },
      description: "Skills found in both the CV and job description.",
    },
    missingSkills: {
      type: "array",
      items: { type: "string" },
      description: "Required job skills not found in the CV.",
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
      description: "Actionable suggestions to improve candidate fit.",
    },
  },
} as const;
