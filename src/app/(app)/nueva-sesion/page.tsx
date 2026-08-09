import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { crearSesion } from "./actions";

const TRACK_ITEMS = TRACKS.map((t) => ({ value: t.slug, label: t.name }));

export default async function NuevaSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; track?: string }>;
}) {
  const { error, track } = await searchParams;
  const defaultTrack = TRACKS.some((t) => t.slug === track) ? track! : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva sesión</CardTitle>
        <CardDescription>
          Elige una especialidad. Si tienes una oferta laboral de referencia, pégala para ajustar el Blueprint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={crearSesion} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="trackSlug">Especialidad</Label>
            <Select
              name="trackSlug"
              items={TRACK_ITEMS}
              defaultValue={defaultTrack}
              required
            >
              <SelectTrigger id="trackSlug" className="w-full">
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
            <Label htmlFor="jobDescription">Oferta laboral (opcional)</Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              placeholder="Pega la descripción del puesto para ajustar las preguntas a esa oferta"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Comenzar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
