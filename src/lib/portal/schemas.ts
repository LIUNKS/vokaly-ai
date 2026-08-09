import { z } from 'zod';

// Contrato para el minteo de token de Portal 
export const PortalAuthPayload = z.object({
  session_id: z.string().uuid(),
  role: z.enum(['candidate', 'interviewer', 'spectator']),
  phase: z.enum(['configurando', 'en_vivo', 'concluida']),
});

export type PortalAuthPayloadType = z.infer<typeof PortalAuthPayload>;