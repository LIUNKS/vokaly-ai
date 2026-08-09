"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRACKS } from "@/lib/tracks";

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
  userName?: string | null;
  vapiCallId?: string | null;
  transcript?: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Recupera una sesión ya creada por su ID.
 */
export async function getSessionAction(sessionId: string): Promise<SessionDataResponse | null> {
  if (!UUID_RE.test(sessionId)) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const currentUserId = user?.id || null;

    let currentUserName: string | null = null;
    if (currentUserId) {
      const [uProfile] = await db
        .select({ fullName: users.fullName, nickname: users.nickname })
        .from(users)
        .where(eq(users.id, currentUserId))
        .limit(1);
      if (uProfile) {
        currentUserName = uProfile.nickname || uProfile.fullName || null;
      }
    }

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
      userName: currentUserName,
      vapiCallId: s.vapiCallId || null,
      transcript: s.transcript || null,
    };
  } catch (error) {
    console.error("[Session Actions] Error al recuperar sesión en DB:", error);
    return null;
  }
}

export interface UserSessionHistoryItem {
  id: string;
  trackSlug: string;
  trackName: string;
  state: "configurando" | "en_vivo" | "concluida";
  createdAt: string;
  concludedAt?: string | null;
  scorecard?: any | null;
}

/**
 * Recupera el historial completo de sesiones prácticas para el usuario actual.
 */
export async function getUserSessionsAction(): Promise<UserSessionHistoryItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.candidateId, user.id))
      .orderBy(desc(sessions.createdAt));

    return userSessions.map((s) => {
      const trackObj = TRACKS.find((t) => t.slug === s.trackSlug);
      return {
        id: s.id,
        trackSlug: s.trackSlug,
        trackName: trackObj?.name || s.trackSlug,
        state: s.state as "configurando" | "en_vivo" | "concluida",
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        concludedAt: s.concludedAt ? new Date(s.concludedAt).toISOString() : null,
        scorecard: s.scorecard,
      };
    });
  } catch (error) {
    console.error("[Session Actions] Error al obtener historial de sesiones:", error);
    return [];
  }
}

/**
 * Actualiza el estado de una sesión en la base de datos.
 */
export async function updateSessionStateAction(
  sessionId: string,
  state: "configurando" | "en_vivo" | "concluida",
  vapiCallId?: string
) {
  try {
    const isUuid = UUID_RE.test(sessionId);
    if (!isUuid) {
      console.warn(`[Session Actions] ID de sesión '${sessionId}' no es UUID válido. Omitiendo update DB.`);
      return { success: false, reason: "not_uuid" };
    }

    const updates: Record<string, any> = { state };
    if (state === "concluida") {
      updates.concludedAt = new Date();
      // scorecard NO se genera acá — lo escribe el webhook de Vapi (end-of-call-report)
      // una vez tiene el transcript completo. Queda null hasta entonces (estado pending en UI).
    }
    if (vapiCallId) {
      updates.vapiCallId = vapiCallId;
    }

    await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId));

    console.log(`[Session Actions] Sesión ${sessionId} actualizada con éxito en DB ➔ state: '${state}'${vapiCallId ? `, vapiCallId: ${vapiCallId}` : ''}`);
    return { success: true };
  } catch (error) {
    console.error(`[Session Actions] Error al actualizar estado de sesión ${sessionId}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Vincula el vapiCallId y la transcripción a la sesión de la base de datos.
 */
export async function updateSessionTranscriptAction(
  sessionId: string,
  vapiCallId?: string,
  transcript?: string
) {
  try {
    const isUuid = UUID_RE.test(sessionId);
    if (!isUuid) return { success: false, reason: "not_uuid" };

    const updates: Record<string, any> = {};
    if (vapiCallId) updates.vapiCallId = vapiCallId;
    if (transcript) updates.transcript = transcript;

    if (Object.keys(updates).length > 0) {
      await db.update(sessions).set(updates).where(eq(sessions.id, sessionId));
      console.log(`[Session Actions] Sesión ${sessionId} vinculada con transcripción en DB.`);
    }

    return { success: true };
  } catch (error) {
    console.error(`[Session Actions] Error vinculando transcripción a sesión ${sessionId}:`, error);
    return { success: false, error: String(error) };
  }
}
