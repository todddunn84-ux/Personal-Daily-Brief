# DayBrief — Personal Daily Brief

An AI-powered personal dashboard: one place to see your day at a glance — tasks, weather, calendar, email, and an AI assistant that knows what's on your plate.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (auth + Postgres with RLS) · Anthropic Claude · Radix UI

## Status

| Area | State |
|---|---|
| Landing page, email/password auth (Supabase) | ✅ Working |
| Dashboard shell + widget grid | ✅ Working |
| Tasks (CRUD, priorities, due dates) | ✅ Working |
| Weather (OpenWeatherMap, geolocated) | ✅ Working |
| AI assistant (Claude, sees your dashboard data, multi-turn) | ✅ Working |
| Calendar / Email / Slack widgets | 🔲 UI previews — connectors are Phase 2 |
| OAuth integrations (Google Calendar, Outlook, Gmail, Slack) | 🔲 Phase 2 |
| Billing / Pro plan (Stripe) | 🔲 Phase 4 |

## Local setup

1. **Supabase**: create a project at [supabase.com](https://supabase.com), then run `supabase/migrations/001_initial.sql` and `002_rls_with_check.sql` in the SQL Editor (Dashboard → SQL Editor). This creates `profiles`, `tasks`, and `integrations` with row-level security, plus the signup trigger.
2. **Env**: `cp .env.example .env.local` and fill in at minimum the two `NEXT_PUBLIC_SUPABASE_*` values. `OPENWEATHER_API_KEY` enables the weather widget; `ANTHROPIC_API_KEY` enables AI chat. Both degrade gracefully when absent.
3. **Run**:

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint
```

## Architecture notes

- **All data access goes through the Supabase client with the anon key**, so Postgres RLS is the enforcement layer — API routes additionally check the session and scope queries by `user_id` (defense in depth).
- **API routes** (`src/app/api/*`) each verify the Supabase session themselves; the middleware matcher deliberately excludes `/api`.
- **AI chat** (`/api/chat`) uses the official `@anthropic-ai/sdk`, sends recent conversation history plus a snapshot of the user's dashboard data as system context, and has a per-user rate limit (20 messages / 5 min) and message-length caps as a spend backstop.
- The `integrations` table is ready to hold OAuth tokens for Phase 2 connectors. **Before storing real tokens, add encryption at rest** (e.g. AES-GCM with a server-side key) — plaintext tokens in the DB is not acceptable for production.

## Deploy

Two prewired options — pick one:

- **AWS Amplify Hosting**: connect the repo; `amplify.yml` is included. Set the env vars listed at the bottom of that file in the Amplify console.
- **Docker → ECS**: `Dockerfile` (multi-stage, standalone output) + `.github/workflows/deploy.yml` (lint/typecheck on every push; ECR push + ECS deploy are gated to a `main` branch and require the AWS secrets listed at the bottom of the workflow file).
