import { Router, type IRouter } from "express";
import { db, resumesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListResumesQueryParams,
  CreateResumeBody,
  GetResumeParams,
  DeleteResumeParams,
  AnalyzeResumeParams,
  AnalyzeResumeBody,
  MatchJobDescriptionParams,
  MatchJobDescriptionBody,
} from "@workspace/api-zod";
import {
  analyzeResume,
  matchJobDescription,
  extractTextFromBase64,
} from "../lib/resumeAnalyzer";

const router: IRouter = Router();

router.get("/resumes", async (req, res): Promise<void> => {
  const params = ListResumesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const resumes = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.userId, params.data.userId))
    .orderBy(desc(resumesTable.createdAt));

  res.json(resumes.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  })));
});

router.post("/resumes", async (req, res): Promise<void> => {
  const parsed = CreateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId, fileName, fileType, fileContent } = parsed.data;

  if (!fileContent || fileContent.length > 20 * 1024 * 1024) {
    res.status(400).json({ error: "File too large or missing" });
    return;
  }

  let extractedText: string | null = null;
  try {
    extractedText = await extractTextFromBase64(fileContent, fileType);
  } catch (err) {
    req.log.warn({ err }, "Failed to extract text from file");
  }

  const [resume] = await db
    .insert(resumesTable)
    .values({ userId, fileName, fileType, extractedText })
    .returning();

  res.status(201).json({
    ...resume,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  });
});

router.get("/resumes/:id", async (req, res): Promise<void> => {
  const params = GetResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, params.data.id));

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.json({
    ...resume,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  });
});

router.delete("/resumes/:id", async (req, res): Promise<void> => {
  const params = DeleteResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(resumesTable)
    .where(eq(resumesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/resumes/:id/analyze", async (req, res): Promise<void> => {
  const params = AnalyzeResumeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AnalyzeResumeBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, params.data.id));

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  if (!resume.extractedText) {
    res.status(422).json({ error: "Resume text could not be extracted" });
    return;
  }

  const analysisResult = await analyzeResume(
    resume.extractedText,
    body.data.jobDescription
  );

  await db
    .update(resumesTable)
    .set({
      analysisResult: analysisResult as unknown as Record<string, unknown>,
      overallScore: analysisResult.overallScore,
    })
    .where(eq(resumesTable.id, params.data.id));

  res.json(analysisResult);
});

router.post("/resumes/:id/match", async (req, res): Promise<void> => {
  const params = MatchJobDescriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = MatchJobDescriptionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [resume] = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.id, params.data.id));

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  if (!resume.extractedText) {
    res.status(422).json({ error: "Resume text could not be extracted" });
    return;
  }

  const matchResult = await matchJobDescription(
    resume.extractedText,
    body.data.jobDescription
  );

  res.json(matchResult);
});

export default router;
