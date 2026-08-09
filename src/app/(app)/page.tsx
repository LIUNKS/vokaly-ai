"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  ArrowRight,
  Sparkles,
  Loader2,
  Server,
  Monitor,
  Database,
  BrainCircuit,
  Cloud,
  Workflow,
  Network,
  Layers,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TRACKS } from "@/lib/tracks";
import { crearSesionModal } from "./nueva-sesion/actions";

const TRACK_ITEMS = TRACKS.map((t) => ({ value: t.slug, label: t.name }));

const TRACK_ICONS: Record<string, LucideIcon> = {
  backend: Server,
  frontend: Monitor,
  data_engineering: Database,
  data_science: BrainCircuit,
  cloud_engineer: Cloud,
  devops: Workflow,
  software_architect: Network,
  full_stack: Layers,
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState<string | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const openModal = (trackSlug: string | null) => {
    setPreselectedTrack(trackSlug);
    setDialogKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card to-muted p-6 md:p-8 border border-border shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Entrena tus entrevistas de trabajo en vivo
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Participa en sesiones reales evaluadas por nuestro agente de voz conversacional Vapi AI. Selecciona tu especialidad e inicia tu práctica.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => openModal(null)}
                className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                Nueva sesión
              </button>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shrink-0 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            Evaluación de Voz con IA
          </div>
        </div>
      </section>

      {/* Grid de Tracks Oficiales de src/lib/tracks.ts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Prácticas Disponibles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((track) => {
            const Icon = TRACK_ICONS[track.slug] ?? Layers;
            return (
              <div
                key={track.slug}
                className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {track.name}
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
                    {track.roleDescription}
                  </p>
                </div>

                <div className="pt-5">
                  <button
                    onClick={() => openModal(track.slug)}
                    className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    Nueva sesión
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <NuevaSesionForm key={dialogKey} initialTrack={preselectedTrack} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NuevaSesionForm({ initialTrack }: { initialTrack: string | null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Blueprint preview vive ahora en /sesion/[id] (popover) — acá solo se genera y se entra directo.
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const result = await crearSesionModal(new FormData(e.currentTarget));
    if (result.status === "error") {
      setError(result.message);
      setIsPending(false);
      return;
    }
    router.push(`/sesion/${result.sessionId}`);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nueva sesión</DialogTitle>
        <DialogDescription>
          Elige una especialidad. Si tienes una oferta laboral de referencia, pégala para ajustar el Blueprint.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-4 overflow-y-auto"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="trackSlug">Especialidad</Label>
          <Select
            name="trackSlug"
            items={TRACK_ITEMS}
            defaultValue={initialTrack}
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
        <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Comenzar"
          )}
        </Button>
      </form>
    </>
  );
}
