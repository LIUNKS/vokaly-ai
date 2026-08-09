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

