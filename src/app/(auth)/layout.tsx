import { ThemeToggle } from "@/components/theme-toggle";
import { Mic } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 overflow-hidden">
      {/* Luces/Glow de fondo sutiles */}
      <div className="absolute -top-32 -left-32 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Theme Toggle en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 z-10 flex flex-col items-center">
        {/* Logo e Identidad de Marca */}
        <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
            <Mic className="size-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground flex items-center gap-1">
            Vokaly <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">Prep</span>
          </span>
        </Link>

        {/* Tarjeta Centrada Glassmórfica */}
        <div className="w-full rounded-2xl border border-border bg-card/90 backdrop-blur-md p-2 shadow-xl shadow-black/5 transition-all">
          {children}
        </div>
      </div>
    </div>
  );
}
