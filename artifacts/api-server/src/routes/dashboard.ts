import { Router, type IRouter } from "express";
import { db, resumesTable } from "@workspace/db";
import { eq, desc, avg, max } from "drizzle-orm";
import { GetDashboardStatsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const params = GetDashboardStatsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { userId } = params.data;

  const resumes = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.userId, userId))
    .orderBy(desc(resumesTable.createdAt));

  const totalResumes = resumes.length;

  const scored = resumes.filter((r) => r.overallScore !== null);
  const averageScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) /
            scored.length
        )
      : null;

  const bestScore =
    scored.length > 0
      ? Math.max(...scored.map((r) => r.overallScore ?? 0))
      : null;

  const latestScore = resumes[0]?.overallScore ?? null;

  const scoreHistory = scored
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      date: r.createdAt.toISOString().split("T")[0],
      score: r.overallScore ?? 0,
      fileName: r.fileName,
    }));

  res.json({
    totalResumes,
    averageScore,
    bestScore,
    latestScore,
    scoreHistory,
  });
});

export default router;
