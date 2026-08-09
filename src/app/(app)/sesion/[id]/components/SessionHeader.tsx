"use client";

import React from "react";
import Link from "next/link";
import { Radio, CheckCircle, Sparkles, ShieldCheck, ArrowLeft, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";

interface SessionHeaderProps {
  trackNombre: string;
  empresaRef: string;
  seniority: string;
  estado: "configurando" | "en_vivo" | "concluida";
  blueprintContent?: string;
}

export function SessionHeader({
  trackNombre,
  empresaRef,
  seniority,
  estado,
  blueprintContent,
}: SessionHeaderProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            title="Volver al Inicio"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
              {trackNombre}
              {blueprintContent && (
                <Popover>
                  <PopoverTrigger
                    title="Ver Blueprint"
                    className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FileText className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                    <PopoverHeader>
                      <PopoverTitle>Blueprint</PopoverTitle>
                      <PopoverDescription>
                        Guía que el entrevistador usa en esta sesión.
                      </PopoverDescription>
                    </PopoverHeader>
                    <p className="whitespace-pre-wrap text-xs text-foreground">
                      {blueprintContent}
                    </p>
                  </PopoverContent>
                </Popover>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Empresa de referencia: <span className="font-medium text-foreground">{empresaRef}</span>
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 rounded-full bg-secondary border border-border text-xs font-semibold text-secondary-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            Seniority: <span className="capitalize text-primary font-bold">{seniority}</span>
          </div>

          {estado === "configurando" && (
            <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-500 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="size-3.5" />
              A PUNTO DE EMPEZAR
            </div>
          )}

          {estado === "en_vivo" && (
            <div className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-500 flex items-center gap-1.5 shadow-xs">
              <span className="size-2 rounded-full bg-rose-500 animate-ping" />
              <Radio className="size-3.5" />
              EN VIVO
            </div>
          )}

          {estado === "concluida" && (
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle className="size-3.5" />
              CONCLUIDA
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
