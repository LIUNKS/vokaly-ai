import { z } from "zod";

export const VapiMetadataSchema = z.object({
  sessionId: z.string().uuid().optional(),
  candidatoId: z.string().optional(),
  trackSlug: z.string().optional(),
});

export type VapiMetadata = z.infer<typeof VapiMetadataSchema>;

export const VapiWebhookPayloadSchema = z
  .object({
    type: z.string(),
    call: z
      .object({
        id: z.string().optional(),
        status: z.string().optional(),
        startedAt: z.string().optional(),
        endedAt: z.string().optional(),
        transcript: z.string().optional(),
      })
      .passthrough()
      .optional(),
    artifact: z
      .object({
        transcript: z.string().optional(),
        messages: z.array(z.any()).optional(),
      })
      .passthrough()
      .optional(),
    transcript: z.string().optional(),
    metadata: VapiMetadataSchema.optional(),
  })
  .passthrough();

export type VapiWebhookPayload = z.infer<typeof VapiWebhookPayloadSchema>;

/**
 * El firstMessage/systemPrompt del Assistant en Vapi Dashboard son solo
 * `{{first_message}}` / `{{blueprint_content}}` — el texto ya viene resuelto
 * desde acá (blueprint.ts genera el prompt final, sin placeholders propios),
 * así el Dashboard no mantiene una plantilla en paralelo a la nuestra.
 */
export const VapiVariableValuesSchema = z.object({
  first_message: z.string(),
  blueprint_content: z.string(),
});

export type VapiVariableValues = z.infer<typeof VapiVariableValuesSchema>;

export const VapiSessionConfigSchema = z.object({
  firstMessage: z.string(),
  systemPrompt: z.string(),
  variableValues: VapiVariableValuesSchema,
  metadata: VapiMetadataSchema,
});

export type VapiSessionConfig = z.infer<typeof VapiSessionConfigSchema>;
