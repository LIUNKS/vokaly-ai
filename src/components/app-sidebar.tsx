import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { AppNavItems } from "@/components/app-nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

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
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:border-r md:bg-background">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-serif text-lg font-semibold">
          Vokaly Prep
        </Link>
      </div>
      <div className="flex-1 px-3">
        <AppNavItems />
      </div>
      <div className="flex items-center gap-2 border-t p-3">
        {profile && (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {profile.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">
                {profile.fullName || "Usuario"}
              </p>
              <p className="truncate text-xs text-muted-foreground leading-tight">
                {profile.nickname || ""}
              </p>
            </div>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
