import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRACKS } from "@/lib/tracks";
import { saveProfile } from "./actions";
import { History, ArrowRight, User, AtSign, Briefcase, Award, FileText, Phone, Sparkles, Save, UserRound } from "lucide-react";

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

  const currentTrackObj = TRACKS.find((t) => t.slug === profile?.careerPath);

  return (
    <div className="space-y-8 py-4">
      {/* Banner Hero Perfil */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 md:p-10 shadow-xl backdrop-blur-md">
        {/* Glows ambientales de fondo */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Contenido Izquierdo */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <UserRound className="size-3.5" />
              Perfil Profesional del Candidato
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              Mi Perfil
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Personalizá tu información laboral para generar Blueprints y Scorecards en tus entrevistas.
            </p>
          </div>

          {/* Tarjeta Visual Derecha / Feature Badge Grid */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-2xl bg-muted/40 border border-border/60 min-w-[250px] shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <User className="size-4" />
              </div>
              <span className="truncate">{profile?.fullName || "Nombre Completo"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Briefcase className="size-4" />
              </div>
              <span className="truncate">{currentTrackObj?.name || "Especialidad"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <Award className="size-4" />
              </div>
              <span>{profile?.yearsOfExperience ? `${profile.yearsOfExperience} años exp.` : "Experiencia"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 1: Formulario de Perfil */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="size-5 text-primary" /> Datos del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={saveProfile} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName" className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" /> Nombre completo
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  defaultValue={profile?.fullName ?? ""}
                  placeholder="Jane Doe"
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nickname" className="text-xs font-semibold flex items-center gap-1.5">
                  <AtSign className="size-3.5 text-primary" /> Nombre de usuario (nickname)
                </Label>
                <Input
                  id="nickname"
                  name="nickname"
                  required
                  defaultValue={profile?.nickname ?? ""}
                  placeholder="Usado en salas de chat"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="careerPath" className="text-xs font-semibold flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-primary" /> Especialidad / Track
                </Label>
                <Select
                  name="careerPath"
                  items={TRACK_ITEMS}
                  defaultValue={profile?.careerPath ?? null}
                  required
                >
                  <SelectTrigger id="careerPath" className="w-full h-10 text-sm">
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
                <Label htmlFor="yearsOfExperience" className="text-xs font-semibold flex items-center gap-1.5">
                  <Award className="size-3.5 text-primary" /> Nivel de experiencia
                </Label>
                <Select
                  name="yearsOfExperience"
                  items={YEAR_ITEMS}
                  defaultValue={profile?.yearsOfExperience ?? null}
                  required
                >
                  <SelectTrigger id="yearsOfExperience" className="w-full h-10 text-sm">
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
              <Label htmlFor="description" className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary resize-none" /> Sobre ti
              </Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={profile?.description ?? ""}
                placeholder="Resumen breve: formación, experiencia laboral y qué estás buscando a futuro"
                className="min-h-[100px] text-sm leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary" /> Teléfono (opcional)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+54 9 11 1234 5678"
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="skills" className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Skills principales (opcional)
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  defaultValue={profile?.skills ?? ""}
                  placeholder="React, TypeScript, PostgreSQL"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full md:w-auto self-end font-semibold gap-2 shadow-md shadow-primary/20 cursor-pointer">
              <Save className="size-4" /> Guardar Perfil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sección 2: Acceso Rápido al Historial */}
      <Card className="border border-border bg-gradient-to-r from-card to-muted p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <History className="size-5 text-primary" />
              Historial de Entrevistas y Scorecards
            </h3>
          </div>
          <Link
            href="/historial"
            className={buttonVariants({ variant: "default", size: "sm", className: "shrink-0 gap-2 font-semibold shadow-xs" })}
          >
            Ver Mi Historial Completo <ArrowRight className="size-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
