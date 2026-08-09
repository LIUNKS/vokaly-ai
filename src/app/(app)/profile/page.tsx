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
import { History, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-8 py-4">
      {/* Sección 1: Formulario de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
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
            className={buttonVariants({ variant: "default", size: "sm", className: "shrink-0 gap-2" })}
          >
            Ver Mi Historial Completo <ArrowRight className="size-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
