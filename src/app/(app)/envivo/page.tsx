import Link from "next/link";
import { Radio, Eye, ArrowRight, ShieldCheck, CheckCircle2, VideoOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TRACKS } from "@/lib/tracks";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { ConcludedSessionsList } from "./concluded-sessions-list";

export const dynamic = "force-dynamic";

export default async function EntrevistasEnVivoPage() {
  let dbActiveSessions: any[] = [];
  let dbConcludedSessions: any[] = [];
  let currentUserId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserId = user?.id || null;

    // 1. Consultar sesiones en vivo reales en la base de datos
    dbActiveSessions = await db
      .select({
        id: sessions.id,
        trackSlug: sessions.trackSlug,
        state: sessions.state,
        createdAt: sessions.createdAt,
        candidateId: sessions.candidateId,
        yearsOfExperience: users.yearsOfExperience,
        careerPath: users.careerPath,
        fullName: users.fullName,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.candidateId, users.id))
      .where(eq(sessions.state, "en_vivo"))
      .orderBy(desc(sessions.createdAt));

    // 2. Consultar sesiones concluidas reales
    dbConcludedSessions = await db
      .select({
        id: sessions.id,
        trackSlug: sessions.trackSlug,
        state: sessions.state,
        concludedAt: sessions.concludedAt,
        scorecard: sessions.scorecard,
        candidateId: sessions.candidateId,
        yearsOfExperience: users.yearsOfExperience,
        fullName: users.fullName,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.candidateId, users.id))
      .where(eq(sessions.state, "concluida"))
      .orderBy(desc(sessions.concludedAt));
  } catch (error) {
    console.warn("[/envivo] No se pudo realizar la consulta a DB (Modo sin DB activa):", error);
  }

  // Mapear resultados a modelos de track
  const activeList = dbActiveSessions.map((s) => {
    const trackObj = TRACKS.find((t) => t.slug === s.trackSlug) || TRACKS[0];
    const isOwner = Boolean(currentUserId && s.candidateId === currentUserId);
    const candidatoLabel = isOwner
      ? "Tú (Candidato)"
      : s.fullName || "Candidato en Vivo";

    return {
      id: s.id,
      track: trackObj,
      candidato: candidatoLabel,
      seniority: s.yearsOfExperience ? `${s.yearsOfExperience} años` : "Senior",
      estado: s.state as "configurando" | "en_vivo",
      isOwner,
    };
  });

  const concludedFormattedList = dbConcludedSessions.map((s) => {
    const trackObj = TRACKS.find((t) => t.slug === s.trackSlug) || TRACKS[0];
    const isOwner = Boolean(currentUserId && s.candidateId === currentUserId);
    const candidatoLabel = isOwner
      ? "Tú (Candidato)"
      : s.fullName || "Candidato Evaluado";

    return {
      id: s.id,
      trackName: trackObj.name,
      candidato: candidatoLabel,
      seniority: s.yearsOfExperience ? `${s.yearsOfExperience} años` : "Senior",
      scoreGeneral: s.scorecard ? `${(s.scorecard as any)?.technical_knowledge?.rating || 8}/10` : "8.5/10",
      fecha: s.concludedAt ? new Date(s.concludedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Reciente",
    };
  });

  return (
    <div className="space-y-8 py-4">
      {/* Banner de la Capa Social */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card to-muted p-6 md:p-8 border border-border shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Entrevistas en Vivo Reales
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500 shrink-0 self-start sm:self-auto">
            <Radio className="size-3.5 animate-pulse" />
            Audiencia en Tiempo Real
          </div>
        </div>
      </section>

      {/* Sección 1: Sesiones EN VIVO AHORA (Base de Datos Real) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-500 animate-ping" />
            Transmisiones en Vivo ({activeList.length})
          </h2>
        </div>

        {activeList.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border bg-card/40">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-full bg-muted text-muted-foreground">
                <VideoOff className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No hay entrevistas en vivo activas en este momento
                </h3>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className={buttonVariants({ size: "sm", className: "gap-2" })}
                >
                  <Radio className="size-4" />
                  Iniciar mi Entrevista en Vivo
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeList.map((session) => (
              <Card key={session.id} className="flex flex-col justify-between overflow-hidden border-border hover:border-primary/50 transition-all duration-300">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                      <Radio className="size-3" />
                      EN VIVO
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground">
                    {session.track.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Candidato: <span className="font-semibold text-foreground">{session.candidato}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5 py-2 text-xs space-y-2 text-muted-foreground">
                  <div className="flex items-center justify-between border-t border-b border-border/50 py-2 my-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-primary" />
                      Experiencia: <strong className="text-foreground">{session.seniority}</strong>
                    </span>
                  </div>
                  <p className="line-clamp-2 italic text-muted-foreground/80">
                    &ldquo;{session.track.roleDescription}&rdquo;
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-3">
                  {session.isOwner ? (
                    <Link
                      href={`/sesion/${session.id}`}
                      className={buttonVariants({ size: "sm", className: "w-full gap-2 cursor-pointer" })}
                    >
                      <Radio className="size-4" />
                      Reanudar mi Entrevista
                    </Link>
                  ) : (
                    <Link
                      href={`/sesion/${session.id}?joinAs=spectator`}
                      className={buttonVariants({ size: "sm", className: "w-full gap-2 cursor-pointer" })}
                    >
                      <Eye className="size-4" />
                      Unirse como Espectador
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: Sesiones Recientes Concluidas (Paginada) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Evaluaciones Concluidas ({concludedFormattedList.length})
          </h2>
        </div>

        <ConcludedSessionsList sessions={concludedFormattedList} itemsPerPage={8} />
      </section>
    </div>
  );
}
