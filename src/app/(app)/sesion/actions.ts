"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export interface SessionDataResponse {
  id: string;
  state: "configurando" | "en_vivo" | "concluida";
  trackSlug: string;
  yearsOfExperience?: string | null;
  isCandidate?: boolean;
  createdAt?: string | null;
}

/**
 * Crea o recupera una sesión en la base de datos para el candidato o espectador actual.
 */
export async function createOrGetSessionAction(trackSlugOrId: string): Promise<SessionDataResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const currentUserId = user?.id || null;

    // 1. Si trackSlugOrId es un UUID de sesión (ej: unirse como espectador)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackSlugOrId);

    if (isUuid) {
      const existing = await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .leftJoin(users, eq(sessions.candidateId, users.id))
        .where(eq(sessions.id, trackSlugOrId))
        .limit(1);

      if (existing.length > 0) {
        const s = existing[0].session;
        const u = existing[0].user;
        return {
          id: s.id,
          state: s.state as "configurando" | "en_vivo" | "concluida",
          trackSlug: s.trackSlug,
          yearsOfExperience: u?.yearsOfExperience || null,
          isCandidate: currentUserId ? currentUserId === s.candidateId : false,
          createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        };
      }
    }

    // 2. Si es un track slug (ej: 'frontend', 'backend')
    let candidateId = currentUserId;

    if (candidateId) {
      await db
        .insert(users)
        .values({ id: candidateId })
        .onConflictDoNothing();
    } else {
      const firstUser = await db.select({ id: users.id }).from(users).limit(1);
      if (firstUser.length > 0) {
        candidateId = firstUser[0].id;
      }
    }

    if (!candidateId) {
      return { id: trackSlugOrId, state: "configurando", trackSlug: trackSlugOrId, isCandidate: true };
    }

    // Buscar si el candidato ya tiene una sesión activa ('configurando' o 'en_vivo') para este track
    const existingActive = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.candidateId, users.id))
      .where(
        and(
          eq(sessions.candidateId, candidateId),
          eq(sessions.trackSlug, trackSlugOrId),
          ne(sessions.state, "concluida")
        )
      )
      .limit(1);

    if (existingActive.length > 0) {
      const s = existingActive[0].session;
      const u = existingActive[0].user;
      return {
        id: s.id,
        state: s.state as "configurando" | "en_vivo" | "concluida",
        trackSlug: s.trackSlug,
        yearsOfExperience: u?.yearsOfExperience || null,
        isCandidate: true,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
      };
    }

    // Crear nueva sesión para el candidato
    const [newSession] = await db
      .insert(sessions)
      .values({
        candidateId,
        trackSlug: trackSlugOrId,
        state: "configurando",
      })
      .returning();

    // Consultar datos de usuario para seniority
    const userData = await db.select().from(users).where(eq(users.id, candidateId)).limit(1);

    return {
      id: newSession.id,
      state: newSession.state as "configurando" | "en_vivo" | "concluida",
      trackSlug: newSession.trackSlug,
      yearsOfExperience: userData[0]?.yearsOfExperience || null,
      isCandidate: true,
      createdAt: newSession.createdAt ? new Date(newSession.createdAt).toISOString() : null,
    };
  } catch (error) {
    console.error("[Session Actions] Error al crear/obtener sesión en DB:", error);
    return { id: trackSlugOrId, state: "configurando", trackSlug: trackSlugOrId, isCandidate: true };
  }
}

/**
 * Actualiza el estado de una sesión ('configurando' | 'en_vivo' | 'concluida') en la base de datos.
 */
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
