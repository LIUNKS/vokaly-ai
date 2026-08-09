import { NextResponse } from "next/server";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Route handler parametrizado para obtener la transcripción exacta de una sesión o llamada.
 * Estrictamente aislado por sessionId o callId.
 * 
 * GET /api/vapi/transcript?sessionId=UUID
 * GET /api/vapi/transcript?callId=VAPI_CALL_ID
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const callIdParam = searchParams.get("callId");
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY;

    let targetCallId = callIdParam;
    let storedTranscript: string | null = null;

    // 1. Consultar la sesión específica en la base de datos si se provee sessionId
    if (sessionId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (isUuid) {
        try {
          const sessionRow = await db
            .select({
              id: sessions.id,
              vapiCallId: sessions.vapiCallId,
              transcript: sessions.transcript,
            })
            .from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1);

          if (sessionRow.length > 0) {
            if (sessionRow[0].transcript) {
              storedTranscript = sessionRow[0].transcript;
            }
            if (sessionRow[0].vapiCallId) {
              targetCallId = sessionRow[0].vapiCallId;
            }
          }
        } catch (dbErr) {
          console.warn("[/api/vapi/transcript] Error de lectura DB:", dbErr);
        }
      }
    }

    // Si ya existe la transcripción guardada para esta sesión exacta en la base de datos, la devolvemos inmediatamente
    if (storedTranscript) {
      return NextResponse.json({
        success: true,
        sessionId,
        callId: targetCallId,
        source: "database",
        transcript: storedTranscript,
      });
    }

    if (!vapiPrivateKey) {
      return NextResponse.json({
        success: true,
        sessionId,
        callId: targetCallId,
        source: "empty",
        transcript: null,
      });
    }

    // Construir header de autorización flexible (admite formato directo o con prefijo Bearer)
    const authHeader = vapiPrivateKey.startsWith("Bearer ")
      ? vapiPrivateKey
      : `Bearer ${vapiPrivateKey}`;

    // 2. Si tenemos el vapiCallId específico guardado para esta sesión
    if (targetCallId) {
      const response = await fetch(`https://api.vapi.ai/call/${targetCallId}`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const callData = await response.json();
        const rawTranscript = callData.transcript || callData.artifact?.transcript || null;
        const transcript = rawTranscript && rawTranscript.trim().length > 0 ? rawTranscript : null;

        return NextResponse.json({
          success: true,
          sessionId,
          callId: callData.id,
          source: "vapi_api_call_id",
          status: callData.status,
          endedReason: callData.endedReason,
          transcript,
          messages: callData.artifact?.messages || callData.messages || [],
        });
      }
    }

    // 3. Si no hay vapiCallId guardado pero tenemos sessionId, buscar la llamada en Vapi que le pertenezca a esta sesión por metadatos
    if (sessionId) {
      const listResponse = await fetch("https://api.vapi.ai/call?limit=50", {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (listResponse.ok) {
        const calls = await listResponse.json();
        if (Array.isArray(calls) && calls.length > 0) {
          // Buscar llamada que tenga el sessionId correspondiente en sus variables o metadatos
          const matchingCall = calls.find((c: any) => {
            const varSessionId =
              c.assistantOverrides?.variableValues?.sessionId ||
              c.variableValues?.sessionId ||
              c.metadata?.sessionId;
            return varSessionId === sessionId;
          });

          if (matchingCall) {
            const rawTranscript = matchingCall.transcript || matchingCall.artifact?.transcript || null;
            const transcript = rawTranscript && rawTranscript.trim().length > 0 ? rawTranscript : null;

            return NextResponse.json({
              success: true,
              sessionId,
              callId: matchingCall.id,
              source: "vapi_api_matching_session",
              status: matchingCall.status,
              endedReason: matchingCall.endedReason,
              transcript,
              messages: matchingCall.artifact?.messages || [],
            });
          }
        }
      }
    }

    // Si la sesión no tiene llamada o texto asignado todavía, retornar transcript: null
    return NextResponse.json({
      success: true,
      sessionId,
      callId: null,
      source: "none",
      transcript: null,
    });
  } catch (error: any) {
    console.error("[Vapi Transcript API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error al obtener transcripción" },
      { status: 500 }
    );
  }
}
