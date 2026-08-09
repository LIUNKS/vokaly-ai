"use client";

import Link from "next/link";
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
  Radio,
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
      {/* Banner Hero Principal */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 md:p-10 shadow-xl backdrop-blur-md">
        {/* Glows ambientales de fondo */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Contenido Izquierdo */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Sparkles className="size-3.5 text-primary" />
              Evaluación de la entrevista con IA
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              Entrená tus entrevistas de trabajo en vivo
            </h1>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openModal(null)}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Mic className="size-4" />
                Nueva sesión
              </button>
              <Link
                href="/envivo"
                className="px-5 py-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-semibold text-sm flex items-center gap-2 border border-border transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Radio className="size-4 text-rose-500 animate-pulse" />
                Ver Entrevistas en Vivo
              </Link>
            </div>
          </div>

          {/* Tarjeta Visual Derecha / Feature Badge Grid */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-2xl bg-muted/40 border border-border/60 min-w-[250px] shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Mic className="size-4" />
              </div>
              Voz Bidireccional
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Sparkles className="size-4" />
              </div>
              Scorecard Automático
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Radio className="size-4" />
              </div>
              Chat & Reacciones Portal
            </div>
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
            className="resize-none"
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
