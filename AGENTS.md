<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vokaly Prep

Practice job interviews as a live, evaluated session with optional audience. Domain model: `docs/specs/domain.md`. Stack + rationale: `docs/specs/stack.md`.

Stack: Next.js + TS, shadcn/ui, Vapi (AI interviewer), Portal (realtime chat/reactions), Supabase (auth/db/storage) + Drizzle, Vercel AI Gateway (Blueprint/Scorecard generation), zod, Prettier.

## Rules

- **YAGNI.** Build what's asked. No speculative abstraction, no config for values that never change, no "for later" scaffolding.
- **DRY** — but only real duplication (same logic, same reason to change). Three similar lines that change for different reasons stay three lines.
- **Comments explain why, not what.** Only when the reason isn't obvious from the code itself (a constraint, a workaround, an invariant). No comment restating what the next line does.
- **No direct push to `main`.** Every change: new branch, PR. No exceptions.
- **All DB migrations via `drizzle-kit` (`npm run db:generate`).** Never hand-edit files in `drizzle/`, never `drizzle-kit push` against Supabase — no tracked history, breaks `migrate`.
