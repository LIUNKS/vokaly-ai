import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRACKS } from "@/lib/tracks";
import { saveProfile } from "./actions";
import { History, Award, ArrowRight, Radio, CheckCircle2, Clock } from "lucide-react";
import { ScorecardModal } from "@/components/scorecard-modal";

const YEARS_OPTIONS = ["1", "1+", "2", "2+", "3", "3+"];
const TRACK_ITEMS = TRACKS.map((t) => ({ value: t.slug, label: t.name }));
const YEAR_ITEMS = YEARS_OPTIONS.map((y) => ({ value: y, label: `${y} años` }));

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Consultar perfil del usuario
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  // Consultar historial de sesiones del usuario
  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.candidateId, user.id))
    .orderBy(desc(sessions.createdAt));

  return (
    <div className="space-y-8 py-4">
      {/* Sección 1: Formulario de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Lo usamos para armar tu Blueprint de entrevista evaluada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  defaultValue={profile?.fullName ?? ""}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nickname">Apodo</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  required
                  defaultValue={profile?.nickname ?? ""}
                  placeholder="Usado en salas de chat"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="careerPath">Especialidad</Label>
                <Select
                  name="careerPath"
                  items={TRACK_ITEMS}
                  defaultValue={profile?.careerPath ?? null}
                  required
                >
                  <SelectTrigger id="careerPath" className="w-full">
                    <SelectValue placeholder="Elige una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACKS.map((track) => (
                      <SelectItem key={track.slug} value={track.slug}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="yearsOfExperience">Nivel de experiencia</Label>
                <Select
                  name="yearsOfExperience"
                  items={YEAR_ITEMS}
                  defaultValue={profile?.yearsOfExperience ?? null}
                  required
                >
                  <SelectTrigger id="yearsOfExperience" className="w-full">
                    <SelectValue placeholder="Elige tu nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y} años
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Sobre ti</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={profile?.description ?? ""}
                placeholder="Resumen breve: formación, experiencia laboral y qué estás buscando a futuro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+54 9 11 1234 5678"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="skills">Skills (opcional)</Label>
                <Input
                  id="skills"
                  name="skills"
                  defaultValue={profile?.skills ?? ""}
                  placeholder="React, TypeScript, PostgreSQL"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full md:w-auto self-end">
              Guardar Perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sección 2: Historial de Entrevistas y Scorecards */}
      <section id="historial" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <History className="size-5 text-primary" />
              Historial de Entrevistas Prácticas ({userSessions.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Revisa tus evaluaciones anteriores, puntuaciones y scorecards detallados.
            </p>
          </div>
        </div>

        {userSessions.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border bg-card/40">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-full bg-muted text-muted-foreground">
                <Award className="size-8" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Aún no has completado ninguna sesión de entrevista evaluada.
              </p>
              <Link href="/" className={buttonVariants({ variant: "default", size: "sm" })}>
                Iniciar tu Primera Práctica <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userSessions.map((s) => {
              const trackObj = TRACKS.find((t) => t.slug === s.trackSlug) || TRACKS[0];
              const isConcluded = s.state === "concluida";
              const isLive = s.state === "en_vivo";
              const dateStr = s.createdAt
                ? new Date(s.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Reciente";

              return (
                <Card key={s.id} className="relative overflow-hidden border border-border bg-card hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold">
                          {trackObj.name}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {dateStr}
                        </CardDescription>
                      </div>

                      {isConcluded ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1">
                          <CheckCircle2 className="size-3" /> Concluida
                        </Badge>
                      ) : isLive ? (
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-semibold gap-1">
                          <Radio className="size-3 animate-pulse" /> En Vivo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Configurando
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <div>
                        {isConcluded && s.scorecard ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Puntaje:</span>
                            <span className="text-sm font-black text-primary">
                              {(s.scorecard as any)?.globalScore || 86}/100
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isConcluded ? "Scorecard pendiente" : "Sesión activa"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isConcluded && (
                          <ScorecardModal
                            scorecard={s.scorecard as any}
                            trackName={trackObj.name}
                            seniority={profile?.yearsOfExperience ? `${profile.yearsOfExperience} años` : "Senior"}
                            concludedAt={s.concludedAt || s.createdAt}
                          />
                        )}

                        <Link
                          href={`/sesion/${s.id}`}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          Ir a Sesión <ArrowRight className="ml-1 size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
