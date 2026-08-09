# Vokaly Prep

**Tu próxima entrevista, ensayada en vivo — con audiencia, no solo un chatbot.**

Practicar a solas frente a un muro de texto no prepara para la presión de sentirse observado. Vokaly Prep convierte la preparación de entrevistas en un *evento* en vivo y evaluado: un entrevistador de IA conduce una conversación de voz real calibrada al track y seniority elegidos, los espectadores pueden sumarse y reaccionar o chatear en tiempo real a través de Portal, y apenas termina la llamada, un scorecard estructurado ya está listo — sin esperar días por feedback, sin adivinar cómo salió.

1. **Elige un track** — Backend, Frontend, Data Engineering y más, cada uno con su propia rúbrica y rol de referencia.
2. **Entra en vivo** — Vapi conduce la entrevista de voz contra un blueprint generado por Groq, una pregunta a la vez, sin ida y vuelta robótico ni guionado.
3. **Suma audiencia** — los espectadores se unen a la sesión, siguen la transcripción en vivo, envían reacciones y chatean — todo impulsado por Portal en tiempo real.
4. **Recibe tu evaluación** — apenas termina la llamada se genera un scorecard a partir de la transcripción: dominio técnico, estructura, comunicación, fortalezas y qué mejorar.

- Modelo de dominio: [`docs/specs/domain.md`](docs/specs/domain.md)
- Stack y justificación: [`docs/specs/stack.md`](docs/specs/stack.md)
- Reglas para contribuir (YAGNI, flujo de branch/PR): [`AGENTS.md`](AGENTS.md)

## Portal

Las sesiones públicas usan [Portal](https://docs.useportal.co) como capa de tiempo real que conecta al candidato en vivo, al entrevistador de IA y a espectadores humanos independientes:

- **Canal de transcripción en vivo** — cada turno cerrado de la entrevista se transmite a los espectadores a medida que ocurre.
- **Canal de chat** — los espectadores (y, una vez concluida la sesión, el candidato) intercambian mensajes. La visibilidad sigue la regla del dominio: el candidato nunca ve el chat en vivo mientras está siendo evaluado.
- **Canal de reacciones** — reacciones con emoji de cualquier persona presente, transmitidas y animadas en tiempo real, separadas del chat para que ráfagas de reacciones no saturen el historial de mensajes.

## Cómo empezar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Stack

Next.js + TypeScript, shadcn/ui, [Vapi](https://vapi.ai) (entrevistador de IA), [Portal](https://docs.useportal.co) (chat/reacciones en tiempo real), Supabase (auth/db/storage) + Drizzle, Vercel AI Gateway (generación de Blueprint/Scorecard), zod, Prettier. Detalle y por-qué-no-X en `docs/specs/stack.md`.

## Equipo

- [Anderson Melgarejo](https://github.com/AndersonMelgarejo)
- [Johann Camiloaga](https://github.com/jgcamiloaga)
- [Freider Achic](https://github.com/FRD898)

## Contribuir

Sin push directo a `main` — siempre branch + PR.
