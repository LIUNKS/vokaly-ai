import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { VapiWebhookPayloadSchema } from "@/types/vapi";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { generateScorecard } from "@/lib/scorecard";

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
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // Vapi desenvuelve el evento dentro de rawBody.message o rawBody directamente
    const payloadSource = rawBody?.message || rawBody;

    // 1. Validar el payload mediante Zod (Trust Boundary)
    const parseResult = VapiWebhookPayloadSchema.safeParse(payloadSource);

    if (!parseResult.success) {
      console.error("[Vapi Webhook] Payload no coincide con schema, retornando OK para no colgar llamada:", parseResult.error.format());
      return NextResponse.json(
        { success: true, message: "Webhook recibido pero payload ignorado suavemente" },
        { status: 200 }
      );
    }

    const payload = parseResult.data;
    const sessionId = payload.metadata?.sessionId;
    const mockMode = isMockMode();

    console.log(`[Vapi Webhook] Recibido evento '${payload.type}' ${sessionId ? `para sesión: ${sessionId}` : ""}`);

    // 2. Procesar según el tipo de evento
    switch (payload.type) {
      case "call-started": {
        if (mockMode) {
          console.log(`[Vapi Webhook] [MOCK MODE] Simulando actualización de sesión ${sessionId} ➔ state: 'en_vivo'`);
          return NextResponse.json({
            success: true,
            message: "Webhook 'call-started' procesado exitosamente (Mock Mode)",
            mode: "mock",
            sessionId: sessionId || null,
          });
        }

        if (sessionId) {
          try {
            // Guardia: Ignorar si la sesión ya está en 'en_vivo' o 'concluida'
            const existing = await db
              .select({ state: sessions.state })
              .from(sessions)
              .where(eq(sessions.id, sessionId))
              .limit(1);

            if (existing.length > 0 && (existing[0].state === "en_vivo" || existing[0].state === "concluida")) {
              console.log(`[Vapi Webhook] Sesión ${sessionId} ya está en estado '${existing[0].state}'. Ignorando idempotentemente.`);
            } else {
            const vapiCallId = payload.call?.id;
            const updatePayload: Record<string, any> = { state: "en_vivo" };
            if (vapiCallId) updatePayload.vapiCallId = vapiCallId;

            await db
              .update(sessions)
              .set(updatePayload)
              .where(eq(sessions.id, sessionId));
            console.log(`[Vapi Webhook] Sesión ${sessionId} actualizada a 'en_vivo' en DB${vapiCallId ? ` (vapiCallId: ${vapiCallId})` : ''}.`);
            }
          } catch (dbError) {
            console.error(`[Vapi Webhook] Error operando en DB, fallback a MOCK:`, dbError);
            return NextResponse.json({
              success: true,
              message: "Webhook 'call-started' procesado (DB Error Fallback)",
              mode: "mock",
              sessionId: sessionId || null,
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook 'call-started' procesado exitosamente",
          mode: "db",
          sessionId: sessionId || null,
        });
      }

      case "transcript": {
        console.log(`[Vapi Webhook] Transcripción parcial recibida para llamada ${payload.call?.id}`);
        return NextResponse.json({
          success: true,
          message: "Webhook 'transcript' procesado exitosamente",
          mode: mockMode ? "mock" : "db",
          sessionId: sessionId || null,
        });
      }

      case "end-of-call-report": {
        if (mockMode) {
          console.log(`[Vapi Webhook] [MOCK MODE] Simulando actualización de sesión ${sessionId} ➔ state: 'concluida', concludedAt: now()`);
          return NextResponse.json({
            success: true,
            message: "Webhook 'end-of-call-report' procesado exitosamente (Mock Mode)",
            mode: "mock",
            sessionId: sessionId || null,
          });
        }

        if (sessionId) {
          try {
            const vapiCallId = payload.call?.id;
            const fullTranscript = (payload as any).artifact?.transcript || (payload as any).transcript;

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
            console.error(`[Vapi Webhook] Error operando en DB, fallback a MOCK:`, dbError);
            return NextResponse.json({
              success: true,
              message: "Webhook 'end-of-call-report' procesado (DB Error Fallback)",
              mode: "mock",
              sessionId: sessionId || null,
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: "Webhook 'end-of-call-report' procesado exitosamente",
          mode: "db",
          sessionId: sessionId || null,
        });
      }

      default:
        console.log(`[Vapi Webhook] Evento secundario '${payload.type}' procesado suavemente.`);
        return NextResponse.json({
          success: true,
          message: `Webhook '${payload.type}' procesado`,
          mode: mockMode ? "mock" : "db",
          sessionId: sessionId || null,
        });
    }
  } catch (error) {
    console.error("[Vapi Webhook] Error interno procesando webhook:", error);
    // Retornamos 200 para evitar que Vapi Server cuelgue la llamada por errores no contemplados
    return NextResponse.json(
      { success: true, message: "Webhook procesado con fallback de seguridad" },
      { status: 200 }
    );
  }
}
