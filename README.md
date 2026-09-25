# SA Learner Logbook

A digital replacement for the South Australian paper driving companion — logs supervised driving sessions, splits them into day and night hours, and tracks progress against the 75-hour licensing requirement.

Built as an offline-first PWA: learners log drives from the car, often with no signal, and sessions sync when the connection returns.

## Why it exists

SA learner drivers must record 75 hours of supervised driving (15 of them at night) in a paper logbook before applying for a provisional licence. Paper gets lost, arithmetic gets done wrong, and there's no way to see how far along you are without adding up columns by hand.

## Features

- **Session logging** with every field the official paper logbook captures — date, times, start and destination, weather, road and traffic conditions, supervising driver, and dual learner/supervisor confirmation.
- **Automatic day/night split.** Sessions are broken down minute by minute, so a drive crossing the night boundary is apportioned correctly rather than counted wholly as one or the other.
- **Progress tracking** against both the 75-hour total and the 15-hour night minimum.
- **Supervisor register** — qualified supervising drivers with licence number, state, and relationship.
- **SA suburb autocomplete** for start and destination fields.
- **JSON export** of the full logbook (profile, supervisors, all sessions) for backup or migration.
- **Offline-first PWA** — installable, works with no connection, syncs when back online.
- **Account deletion** that cascades across all user data.

## A note on correctness

Every licensing figure lives in one place: [`src/lib/rules/sa-rules.ts`](src/lib/rules/sa-rules.ts). Nothing elsewhere in the app hard-codes a required-hours number or a night definition.

Each rule carries a `verified` flag and a link to the official mylicence.sa.gov.au page it came from. Rules that could not be confirmed against an official source are marked `verified: false` and the app does not present them as legal requirements.

The most significant of these: SA defines night as **sunset to sunrise**, which varies by date and location. The app currently approximates it with a fixed 7pm–6am window, and labels hours computed that way as an approximation. Replacing this with a real solar calculation is the main outstanding piece of work before the logbook could be relied on for an official submission.

## Tech stack

Next.js (App Router) · TypeScript · Supabase (Postgres + Auth, with row-level security) · Tailwind CSS · shadcn/ui · Zod · Serwist (service worker) · Vitest

## Architecture

```
src/
  app/(app)/        dashboard, drives, history, progress, supervisors, export, settings
  features/         server actions and data access, grouped by domain
  lib/rules/        SA licensing rules — single source of truth
  lib/calculations/ day/night segmentation, progress math
  lib/validation/   Zod schemas
  lib/supabase/     browser, server, and proxy clients
supabase/migrations/
```

Domain logic is deliberately kept out of components. Day/night segmentation is implemented once, in `calculateDrivingSegments()`, and the dashboard, progress page, and drive form all call it rather than reimplementing the math.

## Running locally

Requires a Supabase project.

```bash
npm install
cp .env.local.example .env.local   # add your Supabase URL and anon key
npm run dev
```

Apply the schema by running the files in `supabase/migrations/` against your project.

```bash
npm test          # 32 tests across rules, calculations, and validation
npm run build
```

## Status

Working MVP. Sunset/sunrise calculation and supervisor licence-duration validation are the known gaps — both are flagged in the rules module.
