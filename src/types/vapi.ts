import { z } from "zod";

/**
 * Metadata adjunta a cada llamada de Vapi para correlacionar con la sesión de Vokaly Prep.
 */
export const VapiMetadataSchema = z.object({
  sessionId: z.string().uuid().optional(),
  candidatoId: z.string().optional(),
  trackSlug: z.string().optional(),
});

export type VapiMetadata = z.infer<typeof VapiMetadataSchema>;

/**
 * Schema para validar payloads entrantes de Webhooks de Vapi (Trust Boundary).
 * Acepta tanto eventos directos como envueltos por Vapi Server.
 */
export const VapiWebhookPayloadSchema = z.object({
  type: z.string(),
  call: z
    .object({
      id: z.string().optional(),
      status: z.string().optional(),
      startedAt: z.string().optional(),
      endedAt: z.string().optional(),
      transcript: z.string().optional(),
    })
    .optional(),
  metadata: VapiMetadataSchema.optional(),
});

export type VapiWebhookPayload = z.infer<typeof VapiWebhookPayloadSchema>;

/**
 * Parámetros dinámicos para el prompt de Vapi.
 */
export const VapiVariableValuesSchema = z.object({
  candidato_nombre: z.string(),
  rol_nombre: z.string(),
  empresa_ref: z.string(),
  seniority_candidato: z.string(),
  track_nombre: z.string().optional(),
});

export type VapiVariableValues = z.infer<typeof VapiVariableValuesSchema>;

/**
 * Configuración completa necesaria para iniciar una sesión con Vapi.
 */
export const VapiSessionConfigSchema = z.object({
  firstMessage: z.string(),
  systemPrompt: z.string(),
  variableValues: VapiVariableValuesSchema,
  metadata: VapiMetadataSchema,
});

export type VapiSessionConfig = z.infer<typeof VapiSessionConfigSchema>;
