import Link from "next/link";
import { Mic, ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { TRACKS } from "@/lib/tracks";

export default function Home() {
  return (
    <div className="space-y-8 py-4">
      {/* Banner de Bienvenida */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card to-muted p-6 md:p-8 border border-border shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Vokaly Prep - Evaluación de Voz con IA
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Entrena tus entrevistas de trabajo en vivo
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Participa en sesiones reales evaluadas por nuestro agente de voz conversacional Vapi AI. Selecciona tu especialidad e inicia tu práctica.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/sesion/frontend"
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              Iniciar Sesión Demo (Frontend)
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Tracks Oficiales de src/lib/tracks.ts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            Tracks de Práctica Disponibles
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {TRACKS.length} Especialidades configuradas
          </span>
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
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Senior+
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Rol de Especialidad
                  </p>
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
