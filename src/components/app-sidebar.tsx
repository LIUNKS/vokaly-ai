import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { AppNavItems } from "@/components/app-nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { Mic, Sparkles } from "lucide-react";

export async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { fullName: string | null; nickname: string | null } | undefined;

  if (user) {
    try {
      const [result] = await db
        .select({ fullName: users.fullName, nickname: users.nickname })
        .from(users)
        .where(eq(users.id, user.id));
      profile = result;
    } catch (err) {
      console.error("Error al obtener perfil en AppSidebar:", err);
    }
  }

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:bg-card/90 md:backdrop-blur-md">
      <div className="pt-6 px-4 pb-4 flex justify-center">
        <Link href="/" className="flex items-center justify-center gap-2.5 group transition-transform hover:scale-[1.02]">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
            <Mic className="size-4.5" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground flex items-center gap-1.5 leading-none">
            Vokaly <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">Prep</span>
          </span>
        </Link>
      </div>

      <div className="mx-4 my-1 border-b border-border/40" />

      {/* 2. Lista de Navegación Principal con Padding */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <AppNavItems />
      </div>

      {/* 3. Footer con Perfil de Usuario, Tema y Logout */}
      <div className="border-t border-border/50 p-3 bg-muted/20">
        <div className="flex items-center gap-2">
          {profile && (
            <Link
              href="/profile"
              className="flex min-w-0 flex-1 items-center gap-2.5 px-1 p-1.5 rounded-xl hover:bg-muted/80 transition-colors group cursor-pointer"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {profile.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {profile.fullName || "Usuario"}
                </p>
                {profile.nickname && (
                  <p className="truncate text-[11px] text-muted-foreground leading-tight mt-0.5 font-medium">
                    @{profile.nickname}
                  </p>
                )}
              </div>
            </Link>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
