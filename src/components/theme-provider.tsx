"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      scriptProps={{
        "data-theme-script": "true",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
