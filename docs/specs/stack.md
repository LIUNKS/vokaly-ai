# Vokaly Prep — Stack

**Propósito:** decisiones de stack técnico validadas para el MVP/hackathon. Ver `domain.md` para el modelo de dominio (independiente de stack).

---

## Componentes

| Capa | Elección | Rol |
|---|---|---|
| **App** | Next.js + TypeScript | host React para bindings de Portal, API routes (webhooks, server actions) |
| **UI** | shadcn/ui | componentes, forms, tablas — copy-in code sobre Radix+Tailwind, sin dependencia en runtime |
| **Entrevistador** | [Vapi](https://vapi.ai) | orquestación de voz IA (listen→think→speak), transcribe ambos roles (`user`/`assistant`), grabación de llamada |
| **Realtime (chat/reacciones/transcript en vivo)** | [Portal](https://docs.useportal.co) | canales pub/sub + inbox por usuario sobre un solo WebSocket, bindings React (`useChannel`) — capa social (§4.3 domain.md) |
| **DB / ORM** | Supabase (Postgres) + Drizzle | schema, migraciones, queries |
| **Auth** | Supabase Auth | login candidato / entrevistador |
| **Storage** | Supabase Storage | copia propia de grabaciones de Vapi (retención de Vapi no garantizada) |
| **LLM (Blueprint + Scorecard)** | Vercel AI Gateway | llamadas de structured output: track+JD → Blueprint, transcript → Scorecard |
| **Hosting** | Vercel | sirve Next.js, pairing nativo con AI Gateway |
| **Validación** | zod | payloads de webhook (Vapi), forms — trust boundary |
| **Formato** | Prettier | formateo de código, config por defecto (cero config) — ESLint (`eslint-config-next`, ya instalado) no cubre estilo desde v9 |

---

## Flujo Sesión en Vivo → Audiencia

```
Vapi (entrevistador) ──webhook (transcript/end-of-call)──▶ Next.js API route
                                                                  │
                                                    publish a canal Portal (scoped a sesión)
                                                                  │
                                     espectadores (React) ◀── useChannel (transcript en vivo, chat, reacciones)
```

Reglas de visibilidad de chat (domain.md §6.4–6.6: candidato nunca ve chat en vivo, entrevistador humano sí, depende de fase) se aplican vía JWT de Portal — token emitido por sesión+rol+fase, controla a qué canales se puede suscribir un cliente. No es opcional, es trust boundary.

---

## Dos LLMs, no confundir

- **Vapi** — modelo de la conversación en vivo, configurado en el dashboard de Vapi (Claude/GPT/etc).
- **Vercel AI Gateway** — llamadas server-side propias para Blueprint y Scorecard (structured output).

Mismo proveedor de modelo si se quiere consistencia, pero configuración y llamada separadas.

---

## Por qué no X

- **Supabase Realtime** en vez de Portal — descartado, Portal ya era requerimiento fijo y cubre el mismo trabajo (chat, reacciones, fan-out de transcript) sin agregar una segunda pieza redundante.
- **LiveKit / Pipecat** en vez de Vapi — más control de infra, pero más trabajo de build. Reconsiderar solo si audiencia necesita oír audio en vivo (no solo transcript) o al salir de fase demo/hackathon.
- **Groq** para Blueprint/Scorecard — solo modelos open-weight, sin Claude/GPT. Blueprint y Scorecard son tareas de juicio (rubric-following), no latency-bound — descartado.
- **OpenRouter** en vez de Vercel AI Gateway — mismo concepto, pero free tier rota modelos `:free` semana a semana (riesgo en demo) y no tiene pairing nativo con Vercel hosting.

## Pendiente / fuera de alcance hackathon

- Monitoring / error tracking (Sentry, etc.)
- Rate-limiting en rutas públicas
- Modelado de costo en producción (más allá de free tiers de testing)
- Rama de Entrevistador Humano (existe en dominio, no se instancia en MVP — domain.md §6.6)
