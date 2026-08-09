import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { VapiWebhookPayloadSchema } from "@/types/vapi";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { generateScorecard } from "@/lib/scorecard";
import { portalClient } from "@/lib/portal/client";

/**
 * Comprueba si el entorno debe operar en modo MOCK o si no hay base de datos disponible.
 */
function isMockMode(): boolean {
  if (process.env.MOCK_MODE === "true") {
    return true;
  }
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl || dbUrl.includes("tu-proyecto") || dbUrl.includes("tu_password")) {
    return true;
  }
  return false;
}

/**
 * Route handler para recibir webhooks de Vapi.
 * Sirve como Trust Boundary para validar eventos entrantes y actualizar la máquina de estados de la sesión.
 * 
 * Transiciones de estado de la sesión:
 * - call-started: 'configurando' ➔ 'en_vivo'
 * - end-of-call-report: 'en_vivo' ➔ 'concluida' (y dispara Scorecard gen)
 */
function extractTranscriptFromPayload(raw: any): string | null {
  if (!raw) return null;
  let text =
    raw.artifact?.transcript ||
    raw.transcript ||
    raw.call?.transcript ||
    raw.call?.artifact?.transcript;

  if (typeof text === "string" && text.trim().length > 0) {
    return text.trim();
  }

  // Fallback: Si no hay string directo pero hay arreglo de mensajes en artifact
  const messages = raw.artifact?.messages || raw.call?.artifact?.messages || raw.messages;
  if (Array.isArray(messages) && messages.length > 0) {
    const formatted = messages
      .filter((m: any) => m && (m.role || m.speaker) && (m.message || m.content || m.text))
      .map((m: any) => {
        const role = (m.role || m.speaker) === "user" ? "Candidato" : "Asistente";
        const content = m.message || m.content || m.text;
        return `${role}: ${content}`;
      })
      .join("\n");
    if (formatted.trim().length > 0) return formatted.trim();
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const payloadSource = rawBody?.message || rawBody;

    // 1. Validar el payload mediante Zod (Trust Boundary)
    const parseResult = VapiWebhookPayloadSchema.safeParse(payloadSource);
    const payload = parseResult.success ? parseResult.data : payloadSource;

    // Extracción de sessionId contemplando las variantes de Vapi
    const sessionId =
      payloadSource?.metadata?.sessionId ||
      payloadSource?.call?.metadata?.sessionId ||
      payloadSource?.assistantOverrides?.variableValues?.sessionId ||
      payloadSource?.call?.assistantOverrides?.variableValues?.sessionId ||
      payloadSource?.variableValues?.sessionId ||
      payload?.metadata?.sessionId ||
      null;

    const vapiCallId = payloadSource?.call?.id || payloadSource?.id || null;
    const eventType = payloadSource?.type || payload?.type;
    const mockMode = isMockMode();

    // 2. Procesar según el tipo de evento
    switch (eventType) {
      case "call-started": {
        if (mockMode) {
          return NextResponse.json({
            success: true,
            message: "Webhook 'call-started' procesado (Mock Mode)",
            mode: "mock",
            sessionId,
          });
        }

        if (sessionId) {
          try {
            const existing = await db
              .select({ state: sessions.state })
              .from(sessions)
              .where(eq(sessions.id, sessionId))
              .limit(1);

            if (existing.length === 0 || existing[0].state === "configurando") {
              const updatePayload: Record<string, any> = { state: "en_vivo" };
              if (vapiCallId) updatePayload.vapiCallId = vapiCallId;

              await db
                .update(sessions)
                .set(updatePayload)
                .where(eq(sessions.id, sessionId));
            }
          } catch (dbError) {
            console.error(`[Vapi Webhook] Error DB en 'call-started':`, dbError);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook 'call-started' procesado exitosamente",
          sessionId,
        });
      }

      case "transcript": {
        const liveTranscript = extractTranscriptFromPayload(payloadSource);

        if (sessionId && liveTranscript && !mockMode) {
          try {
            const updatePayload: Record<string, any> = { transcript: liveTranscript };
            if (vapiCallId) updatePayload.vapiCallId = vapiCallId;

            await db
              .update(sessions)
              .set(updatePayload)
              .where(eq(sessions.id, sessionId));
          } catch (dbErr) {
            console.error(`[Vapi Webhook] Error DB guardando transcripción en vivo:`, dbErr);
          }
        }

        // fan-out a Portal solo del turno cerrado (final) — evita saturar el
        // canal (y su ventana de historial) con updates parciales por palabra
        if (sessionId && payloadSource?.transcriptType === "final" && payloadSource?.transcript && !mockMode) {
          try {
            await portalClient.channel(sessionId).send({
              content: { role: payloadSource.role, transcript: payloadSource.transcript },
            });
          } catch (portalErr) {
            console.error(`[Vapi Webhook] Error publicando transcript en Portal:`, portalErr);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook 'transcript' procesado exitosamente",
          sessionId,
        });
      }

      case "end-of-call-report": {
        if (mockMode) {
          return NextResponse.json({
            success: true,
            message: "Webhook 'end-of-call-report' (Mock Mode)",
            sessionId,
          });
        }

        const fullTranscript = extractTranscriptFromPayload(payloadSource);

        if (sessionId) {
          try {
            const updatePayload: Record<string, any> = {
              state: "concluida",
              concludedAt: new Date(),
            };
            if (vapiCallId) updatePayload.vapiCallId = vapiCallId;
            if (fullTranscript) updatePayload.transcript = fullTranscript;

            await db
              .update(sessions)
              .set(updatePayload)
              .where(eq(sessions.id, sessionId));

            console.log(`[Vapi Webhook] Sesión ${sessionId} actualizada a 'concluida' en DB con transcripción vinculada.`);

            if (fullTranscript) {
              const [session] = await db
                .select({ trackSlug: sessions.trackSlug })
                .from(sessions)
                .where(eq(sessions.id, sessionId))
                .limit(1);

              if (session) {
                try {
                  const scorecard = await generateScorecard({
                    transcript: fullTranscript,
                    trackSlug: session.trackSlug,
                  });
                  await db
                    .update(sessions)
                    .set({ scorecard })
                    .where(eq(sessions.id, sessionId));
                  console.log(`[Vapi Webhook] Scorecard generado y guardado para sesión ${sessionId}.`);
                } catch (scorecardError) {
                  // no bloquea la respuesta del webhook — sesión queda 'concluida' sin scorecard, se puede reintentar
                  console.error(`[Vapi Webhook] Error generando Scorecard para sesión ${sessionId}:`, scorecardError);
                }
              }
            }
          } catch (dbError) {
            console.error(`[Vapi Webhook] Error DB en 'end-of-call-report':`, dbError);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook 'end-of-call-report' procesado exitosamente",
          sessionId,
        });
      }

      default:
        return NextResponse.json({
          success: true,
          message: `Webhook '${eventType}' recibido`,
          sessionId,
        });
    }
  } catch (error) {
    console.error("[Vapi Webhook] Error procesando webhook POST:", error);
    return NextResponse.json(
      { success: true, message: "Webhook error recuperado suavemente" },
      { status: 200 }
    );
  }
}
