import { redirect } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRACKS } from "@/lib/tracks";
import { saveProfile } from "./actions";

const YEARS_OPTIONS = ["1", "1+", "2", "2+", "3", "3+"];
const TRACK_ITEMS = TRACKS.map((t) => ({ value: t.slug, label: t.label }));
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

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completa tu perfil</CardTitle>
        <CardDescription>
          Lo usamos para armar tu Blueprint de entrevista.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveProfile} className="flex flex-col gap-4">
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
                    {track.label}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
