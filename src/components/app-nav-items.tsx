"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Home, Radio, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/envivo", label: "Entrevistas en Vivo", icon: Radio },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/profile", label: "Perfil", icon: UserRound },
];

export function AppNavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
