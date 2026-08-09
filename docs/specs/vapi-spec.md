# Vokaly Prep — Especificación de Integración Vapi (Track B)

**Documento:** Vapi Integration Spec
**Propósito:** Definir los parámetros de entrada, prompt del sistema, metadatos y ciclo de vida de webhooks para la interacción de voz con Vapi en la Sesión en Vivo.

---

## 1. Casuística de Dominio: Entrevistador IA

A diferencia de un asistente de voz convencional (atención al cliente, ventas o agendamiento), el agente de Vapi en Vokaly Prep actúa como un **Entrevistador Técnico Evaluador**:

- **Evaluación progresiva:** Conduce la entrevista formulando una sola pregunta a la vez basándose en la rúbrica del `Blueprint`.
- **Escucha activa y profundización:** Analiza las respuestas del candidato (buscando estructura STAR en preguntas de comportamiento/experiencia) y profundiza si la respuesta es incompleta.
- **Brevedad por voz:** Entrega respuestas cortas y directas (máximo 2 a 3 frases por turno) para garantizar una fluidez natural por voz.
- **Imparcialidad:** No revela notas ni feedback durante la llamada (eso pertenece al `Scorecard` post-sesión).

---

## 2. Parámetros de Entrada de Vapi (`VapiSessionConfig`)

Al iniciar o configurar la llamada mediante el SDK de Vapi (`@vapi-ai/web`) o la API server-side, la sesión se parametriza con cuatro componentes principales:

> **Nota de implementación:** `firstMessage` y `systemPrompt` NO se arman con
> mustache multi-variable en el Assistant del Vapi Dashboard. `blueprint.ts`
> (Track A) ya le pide al LLM el prompt final resuelto — sin placeholders
> propios — así que mantener una plantilla paralela en el Dashboard es
> trabajo duplicado y frágil (dos lugares para sincronizar cada vez que
> cambia el texto). En cambio, la app arma ambos strings completos y los
> manda como dos `variableValues` opacos (§2.3); el Dashboard solo tiene
> `{{first_message}}` / `{{blueprint_content}}` como firstMessage/systemPrompt.
> El modelo/voz de la conversación se sigue configurando en el Dashboard
> (`stack.md`) — esto no lo toca.

### 2.1 `firstMessage` (Mensaje de Bienvenida)

Primer turno de habla del agente al conectar la llamada. Armado en la app
(`sesion/[id]/page.tsx`) con los datos ya resueltos de la sesión:

```text
Hola {candidato_nombre}, bienvenido/a a tu sesión de práctica para la posición de {rol_nombre} en {empresa_ref}. Soy tu entrevistador/a hoy. Cuando estés listo/a, dime y comenzamos con la primera pregunta.
```

### 2.2 `systemPrompt` (`blueprint_content`)

Prompt de sistema generado por Groq vía Vercel AI SDK (`src/lib/blueprint.ts`,
Track A) al crear la sesión — identidad, estilo de voz, dinámica de entrevista,
rúbrica y restricciones de seguridad ya resueltos en un único texto final, sin
placeholders. Se persiste en `sessions.blueprintContent` y viaja tal cual.

### 2.3 `variableValues`

Solo dos valores opacos, ya resueltos — nada que el Dashboard deba templatizar más:

```json
{
  "first_message": "Hola Johan, bienvenido/a a tu sesión de práctica para la posición de Frontend en Empresa de Producto SaaS. Soy tu entrevistador/a hoy. Cuando estés listo/a, dime y comenzamos con la primera pregunta.",
  "blueprint_content": "# Identidad y Rol\n..."
}
```

### 2.4 `metadata` (Correlación de Sesión — Trust Boundary)

Metadatos adjuntos a la llamada que Vapi devuelve en cada webhook:

```json
{
  "metadata": {
    "sessionId": "b4e2d3c4-1234-5678-9abc-def123456789",
    "candidatoId": "usr-123",
    "trackSlug": "frontend"
  }
}
```

---

## 3. Ciclo de Vida de Webhooks (`/api/vapi/webhook`)

El backend de Next.js escucha los eventos enviados por Vapi para orquestar la máquina de estados de la `Sesión` (`domain.md §5`):

```
Vapi Call Event ──▶ POST /api/vapi/webhook ──▶ Actualiza DB (`sessions`) ──▶ Notifica Portal/AI Gateway
```

| Evento Vapi | Acción en Vokaly Prep | Estado de Sesión (`sessions.state`) |
|---|---|---|
| `call-started` | Marca inicio de llamada, guarda `vapi_call_id`. | Transición: `configurando` ➔ `en_vivo` |
| `transcript` *(opcional)* | Fan-out del transcript en tiempo real hacia Portal para audiencia/espectadores. | Permanece `en_vivo` |
| `end-of-call-report` | Recibe transcript final completo, duraciones y causa de fin. Guarda `transcript` en `sessions`. | Transición: `en_vivo` ➔ `concluida` |

> **Trigger post-sesión:** Al recibir `end-of-call-report` y pasar la sesión a `concluida`, el webhook dispara la generación del `Scorecard` en Vercel AI Gateway (Track A).

---

## 4. Contrato TypeScript de Integración (`src/types/vapi.ts`)

```typescript
import { z } from "zod";

export const VapiMetadataSchema = z.object({
  sessionId: z.string().uuid(),
  candidatoId: z.string(),
  trackSlug: z.string()
});
export type VapiMetadata = z.infer<typeof VapiMetadataSchema>;

export const VapiPayloadSchema = z.object({
  type: z.enum(["call-started", "transcript", "end-of-call-report"]),
  call: z.object({
    id: z.string(),
    status: z.string(),
    startedAt: z.string().optional(),
    endedAt: z.string().optional(),
    transcript: z.string().optional()
  }),
  metadata: VapiMetadataSchema
});
export type VapiPayload = z.infer<typeof VapiPayloadSchema>;
```

---

## 5. Mock de Desarrollo para Track B (`src/lib/mocks/vapiMock.ts`)

Objeto de prueba listo para usar en el desarrollo de la pantalla de Sesión en Vivo:

```typescript
export const VAPI_SESSION_MOCK = {
  sessionId: "b4e2d3c4-1234-5678-9abc-def123456789",
  candidatoNombre: "Johan",
  trackSlug: "frontend",
  trackNombre: "Frontend React Developer",
  empresaRef: "Tech Corp",
  seniorityCandidato: "senior",
  
  config: {
    firstMessage: "Hola Johan, bienvenido/a a tu sesión de práctica para la posición de Frontend React Developer en Tech Corp. Soy tu entrevistador/a hoy. ¿Listo para comenzar?",
    systemPrompt: `Eres un Entrevistador Técnico Senior especialista en Frontend React.
Tu objetivo es evaluar a Johan para la posición de Senior Frontend Developer.
Haz 1 pregunta a la vez sobre React Server Components, State Management y Rendimiento.
Mantén respuestas breves (máximo 3 frases) y tono profesional.`,
    variableValues: {
      first_message: "Hola Johan, bienvenido/a a tu sesión de práctica para la posición de Frontend React Developer en Tech Corp. Soy tu entrevistador/a hoy. ¿Listo para comenzar?",
      blueprint_content: "Eres un Entrevistador Técnico Senior especialista en Frontend React..."
    },
    metadata: {
      sessionId: "b4e2d3c4-1234-5678-9abc-def123456789",
      candidatoId: "usr-123",
      trackSlug: "frontend"
    }
  }
};
```
