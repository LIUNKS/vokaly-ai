import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/sessions/[id]/state — polling endpoint para sincronizar estado/scorecard.
 * Route Handler en vez de Server Action: llamarla en un setInterval como Server
 * Action fuerza a Next.js a re-renderizar el árbol de Server Components en cada
 * tick (indicador "Rendering..." del dev overlay); un Route Handler solo devuelve JSON.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  if (!UUID_RE.test(sessionId)) {
    return NextResponse.json({ state: null, scorecard: null });
  }

  const [session] = await db
    .select({ state: sessions.state, scorecard: sessions.scorecard })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) {
    return NextResponse.json({ state: null, scorecard: null });
  }

  return NextResponse.json({ state: session.state, scorecard: session.scorecard });
}
