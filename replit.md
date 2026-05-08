# ResumeIQ — AI Resume Analyzer

AI-powered SaaS platform that analyzes resumes for ATS compatibility, scores them across multiple categories, identifies keyword gaps, and matches them against job descriptions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/resume-analyzer run dev` — run the frontend (port 18646, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- Required env: `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + wouter + Recharts
- Auth: Clerk (`@clerk/react`, `@clerk/express`, `@clerk/themes`)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Gemini 2.5 Flash via `@workspace/integrations-gemini-ai`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all endpoints)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — Generated Zod schemas for validation
- `lib/db/src/schema/resumes.ts` — Drizzle DB schema (resumes table)
- `artifacts/api-server/src/routes/` — Express route handlers (resumes.ts, dashboard.ts, health.ts)
- `artifacts/api-server/src/lib/resumeAnalyzer.ts` — Gemini AI analysis logic
- `artifacts/resume-analyzer/src/pages/` — Frontend pages (home, dashboard, analysis)
- `artifacts/resume-analyzer/src/components/` — Shared UI components

## Architecture decisions

- Contract-first API design: OpenAPI spec → codegen → Zod schemas + React Query hooks
- Gemini AI bundled into API server (removed `@google/*` from esbuild externals to allow bundling)
- File parsing on the server-side: base64 upload → pdf-parse / mammoth extraction
- Analysis stored as JSONB in PostgreSQL for flexible schema
- Clerk proxy middleware handles auth on the API server; frontend uses Clerk React SDK

## Product

- **Landing page**: Hero, features grid, testimonials — publicly accessible
- **Dashboard**: Upload zone, ATS score overview, score history chart, resume list with delete
- **Analysis page**: Tabbed view — Overview (scores, strengths, missing keywords, recommendations), Section Analysis, Job Match (paste JD, get match score + keyword gap)
- **Auth**: Sign in / Sign up via Clerk with branded dark theme

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `@google/genai` must NOT be in the esbuild externals list (`build.mjs`) — it needs to be bundled
- Codegen barrel: `lib/api-zod/src/index.ts` must export only from `./generated/api` (not types) to avoid TS2308 conflicts
- After running codegen, verify `lib/api-zod/src/index.ts` is correct before running typecheck
- Clerk `UserButton` no longer accepts `afterSignOutUrl` prop in v6 — use `signOutCallback` or configure in Clerk dashboard
- The design subagent installed `@clerk/themes` and `react-dropzone` as separate steps — these are runtime deps in `dependencies` not `devDependencies`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `lib/api-spec/openapi.yaml` for the full API contract
