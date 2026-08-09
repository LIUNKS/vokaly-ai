import Link from "next/link";
import { Mic, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { TRACKS } from "@/lib/tracks";

export default function Home() {
  return (
    <div className="space-y-8 py-4">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card to-muted p-6 md:p-8 border border-border shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Entrena tus entrevistas de trabajo en vivo
          </h1>
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
            Tracks de Práctica Disponibles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((track) => (
            <div
              key={track.slug}
              className="flex flex-col justify-between p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs capitalize">
                    {track.slug.replace("_", " ")}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    Senior+
                  </span>
                </div>

                <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
                  {track.roleDescription}
                </p>
              </div>

              <div className="pt-5">
                <Link
                  href={`/sesion/${track.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  Iniciar Entrevista
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
