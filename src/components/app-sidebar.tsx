import Link from "next/link";
import { AppNavItems } from "@/components/app-nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function AppSidebar() {
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
      <div className="flex items-center justify-between gap-2 p-3">
        <LogoutButton />
        <ThemeToggle />
      </div>
    </aside>
  );
}
