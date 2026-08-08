# Vokaly Prep

Practice job interviews as a live, evaluated session — AI or human interviewer, optional audience.

- Domain model: [`docs/specs/domain.md`](docs/specs/domain.md)
- Stack + rationale: [`docs/specs/stack.md`](docs/specs/stack.md)
- Contributor rules (YAGNI, branch/PR workflow): [`AGENTS.md`](AGENTS.md)

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js + TypeScript, shadcn/ui, [Vapi](https://vapi.ai) (AI interviewer), [Portal](https://docs.useportal.co) (realtime chat/reactions), Supabase (auth/db/storage) + Drizzle, Vercel AI Gateway (Blueprint/Scorecard generation), zod, Prettier. Details and why-not-X in `docs/specs/stack.md`.

## Contributing

No direct push to `main` — branch + PR always.
