import { ai } from "@workspace/integrations-gemini-ai";

export interface AnalysisResult {
  overallScore: number;
  atsCompatibility: number;
  keywordMatch: number;
  formatting: number;
  skills: number;
  grammar: number;
  missingKeywords: string[];
  weakPhrases: string[];
  improvements: string[];
  sectionAnalysis: SectionScore[];
  strengths: string[];
  recommendations: string[];
}

export interface SectionScore {
  name: string;
  score: number;
  feedback: string;
  present: boolean;
}

export interface JobMatchResult {
  matchScore: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  skillsGap: string[];
  suggestions: string[];
  rewriteSuggestions: string[];
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string | null
): Promise<AnalysisResult> {
  const prompt = `You are an expert ATS (Applicant Tracking System) specialist and resume coach. Analyze the following resume and return a detailed JSON analysis.

RESUME TEXT:
${resumeText}

${jobDescription ? `JOB DESCRIPTION (for targeted analysis):\n${jobDescription}` : ""}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "overallScore": <0-100 integer>,
  "atsCompatibility": <0-100 integer>,
  "keywordMatch": <0-100 integer>,
  "formatting": <0-100 integer>,
  "skills": <0-100 integer>,
  "grammar": <0-100 integer>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "weakPhrases": ["phrase1", "phrase2", ...],
  "improvements": ["specific improvement 1", "specific improvement 2", ...],
  "sectionAnalysis": [
    {"name": "Contact Information", "score": <0-100>, "feedback": "...", "present": true/false},
    {"name": "Professional Summary", "score": <0-100>, "feedback": "...", "present": true/false},
    {"name": "Work Experience", "score": <0-100>, "feedback": "...", "present": true/false},
    {"name": "Education", "score": <0-100>, "feedback": "...", "present": true/false},
    {"name": "Skills", "score": <0-100>, "feedback": "...", "present": true/false},
    {"name": "Achievements", "score": <0-100>, "feedback": "...", "present": true/false}
  ],
  "strengths": ["strength 1", "strength 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Scoring criteria:
- overallScore: weighted average of all categories
- atsCompatibility: standard sections, no tables/graphics, clean formatting, proper headers
- keywordMatch: relevant industry keywords, action verbs, technical skills
- formatting: consistent structure, bullet points, appropriate length (1-2 pages), white space
- skills: technical and soft skills relevance and completeness
- grammar: spelling, punctuation, verb tense consistency, active voice usage
- weakPhrases: identify phrases like "responsible for", "helped with", "worked on" that should be replaced with strong action verbs
- improvements: specific, actionable suggestions
- strengths: what the resume does well`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const text = response.text ?? "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}

export async function matchJobDescription(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const prompt = `You are an expert ATS specialist. Compare this resume against the job description and return a detailed match analysis.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "matchScore": <0-100 integer>,
  "missingKeywords": ["keyword1", "keyword2", ...],
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "skillsGap": ["missing skill 1", "missing skill 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "rewriteSuggestions": ["rewrite suggestion 1", "rewrite suggestion 2", ...]
}

Instructions:
- matchScore: overall compatibility percentage
- missingKeywords: important keywords from JD not found in resume
- matchedKeywords: keywords from JD that are present in resume
- skillsGap: specific skills mentioned in JD that the resume lacks
- suggestions: actionable ways to improve resume for this specific job
- rewriteSuggestions: specific bullet points or phrases to add/rewrite to match JD better`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const text = response.text ?? "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as JobMatchResult;
}

export async function extractTextFromBase64(
  fileContent: string,
  fileType: string
): Promise<string> {
  const buffer = Buffer.from(fileContent, "base64");

  if (fileType === "application/pdf" || fileType.includes("pdf")) {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return data.text;
  } else if (
    fileType.includes("docx") ||
    fileType.includes("wordprocessingml") ||
    fileType.includes("msword")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (fileType.includes("text")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}
