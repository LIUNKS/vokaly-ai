"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppNavItems } from "@/components/app-nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export function AppMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
      <Link href="/" className="font-serif text-lg font-semibold">
        Vokaly Prep
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Abrir menú" />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Vokaly Prep</SheetTitle>
            </SheetHeader>
            <div className="px-3">
              <AppNavItems onNavigate={() => setOpen(false)} />
            </div>
            <SheetFooter>
              <LogoutButton />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
