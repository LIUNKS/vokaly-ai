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
| **LLM (Blueprint + Scorecard)** | [Groq](https://groq.com) (`@ai-sdk/groq`, `moonshotai/kimi-k2-instruct-0905`) | llamadas de structured output: track+JD → Blueprint, transcript → Scorecard |
| **Hosting** | Vercel | sirve Next.js |
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
- **Groq** — llamadas server-side propias para Blueprint y Scorecard (structured output).

Distintos proveedores de modelo (Groq no tiene Claude/GPT) — no hay overlap que mantener consistente, configuración y llamada ya eran separadas.

---

## Por qué no X

- **Supabase Realtime** en vez de Portal — descartado, Portal ya era requerimiento fijo y cubre el mismo trabajo (chat, reacciones, fan-out de transcript) sin agregar una segunda pieza redundante.
- **LiveKit / Pipecat** en vez de Vapi — más control de infra, pero más trabajo de build. Reconsiderar solo si audiencia necesita oír audio en vivo (no solo transcript) o al salir de fase demo/hackathon.
- **Vercel AI Gateway** para Blueprint/Scorecard — probado primero (pairing nativo con Vercel, un solo endpoint multi-modelo), pero exige tarjeta de crédito en la cuenta incluso para desbloquear el free tier (`customer_verification_required`) — bloqueante para el hackathon, sin tarjeta disponible. Reconsiderar si eso deja de ser un problema.
- **OpenRouter** en vez de Groq — mismo problema que buscábamos evitar: free tier rota modelos `:free` semana a semana (riesgo en demo). Groq tiene modelos nombrados estables (`kimi-k2-instruct-0905`) sin tarjeta.
- **Groq solo modelos open-weight, sin Claude/GPT** — cierto, pero Blueprint/Scorecard son tareas de juicio (rubric-following) no atadas a un proveedor específico; kimi-k2 (Moonshot, MoE grande) soporta structured outputs nativo y cubre el caso.

## Pendiente / fuera de alcance hackathon

- Monitoring / error tracking (Sentry, etc.)
- Rate-limiting en rutas públicas
- Modelado de costo en producción (más allá de free tiers de testing)
- Rama de Entrevistador Humano (existe en dominio, no se instancia en MVP — domain.md §6.6)
