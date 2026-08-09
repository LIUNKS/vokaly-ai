"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SessionDataResponse {
  id: string;
  state: "configurando" | "en_vivo" | "concluida";
  trackSlug: string;
  yearsOfExperience?: string | null;
  isCandidate?: boolean;
  createdAt?: string | null;
  candidateId?: string | null;
  candidateName?: string | null;
  blueprintContent?: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Recupera una sesión ya creada (por el modal de /nueva-sesion, que corre el Blueprint gen).
 * Nunca crea una al vuelo: un id que no es UUID o que no existe en DB es simplemente "no encontrada" —
 * así /sesion/[id] no acepta un track slug como atajo para arrancar una sesión sin Blueprint.
 */
export async function getSessionAction(sessionId: string): Promise<SessionDataResponse | null> {
  if (!UUID_RE.test(sessionId)) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const existing = await db
      .select({ session: sessions, user: users })
      .from(sessions)
      .leftJoin(users, eq(sessions.candidateId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (existing.length === 0) return null;

    const s = existing[0].session;
    const u = existing[0].user;
    return {
      id: s.id,
      state: s.state as "configurando" | "en_vivo" | "concluida",
      trackSlug: s.trackSlug,
      yearsOfExperience: u?.yearsOfExperience || null,
      isCandidate: user ? user.id === s.candidateId : false,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
      candidateId: s.candidateId,
      candidateName: u?.fullName || u?.nickname || null,
      blueprintContent: s.blueprintContent,
    };
  } catch (error) {
    console.error("[Session Actions] Error al recuperar sesión en DB:", error);
    return null;
  }
}

export async function updateSessionStateAction(
  sessionId: string,
  state: "configurando" | "en_vivo" | "concluida"
) {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isUuid) {
      console.warn(`[Session Actions] ID de sesión '${sessionId}' no es UUID válido. Omitiendo update DB.`);
      return { success: false, reason: "not_uuid" };
    }

    const updates: Record<string, any> = { state };
    if (state === "concluida") {
      updates.concludedAt = new Date();
    }

    await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId));

    console.log(`[Session Actions] Sesión ${sessionId} actualizada con éxito en DB ➔ state: '${state}'`);
    return { success: true };
  } catch (error) {
    console.error(`[Session Actions] Error al actualizar estado de sesión ${sessionId}:`, error);
    return { success: false, error: String(error) };
  }
}
