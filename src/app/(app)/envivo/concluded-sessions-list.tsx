"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScorecardModal } from "@/components/scorecard-modal";

export interface ConcludedSessionItem {
  id: string;
  trackName: string;
  candidato: string;
  seniority: string;
  scorecard?: any;
  fecha: string;
}

interface ConcludedSessionsListProps {
  sessions: ConcludedSessionItem[];
  itemsPerPage?: number;
}

export function ConcludedSessionsList({
  sessions,
  itemsPerPage = 8,
}: ConcludedSessionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-border bg-card/20">
        <p className="text-xs text-muted-foreground">
          Aún no hay evaluaciones concluidas registradas en la base de datos. Las sesiones finalizadas aparecerán aquí automáticamente.
        </p>
      </Card>
    );
  }

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (safeCurrentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (safeCurrentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Generar números de página mostrando hasta 10 páginas por bloque con elipsis (...)
  const getPageNumbers = (): (number | string)[] => {
    const maxVisible = 10;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, safeCurrentPage - 4);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages: (number | string)[] = [];

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Lista de Tarjetas Estilo Historial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSessions.map((s) => {
          const globalScore = s.scorecard?.globalScore || 86;

          return (
            <Card
              key={s.id}
              className="relative overflow-hidden border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {s.trackName}
                    </CardTitle>
                    <CardDescription className="text-xs flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="size-3 text-primary" />
                        {s.candidato} ({s.seniority})
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        {s.fecha}
                      </span>
                    </CardDescription>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1 shrink-0"
                  >
                    <CheckCircle2 className="size-3" /> Concluida
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div>
                    {s.scorecard ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          Puntaje Global:
                        </span>
                        <span className="text-sm font-black text-primary">
                          {globalScore}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Scorecard listo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {s.scorecard && (
                      <ScorecardModal
                        scorecard={s.scorecard}
                        trackName={s.trackName}
                        seniority={s.seniority}
                        concludedAt={s.fecha}
                      />
                    )}

                    <Link
                      href={`/sesion/${s.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Ir a Sesión <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Barra de Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{startIndex + 1}</span> -{" "}
            <span className="font-medium text-foreground">
              {Math.min(startIndex + itemsPerPage, sessions.length)}
            </span>{" "}
            de <span className="font-medium text-foreground">{sessions.length}</span> evaluaciones
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={safeCurrentPage === 1}
              className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            {/* Números de página con elipsis */}
            <div className="flex items-center gap-1 px-1">
              {getPageNumbers().map((pageNum, idx) =>
                typeof pageNum === "number" ? (
                  <Button
                    key={pageNum}
                    variant={pageNum === safeCurrentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="size-8 p-0 text-xs font-semibold cursor-pointer"
                  >
                    {pageNum}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">
                    ...
                  </span>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={safeCurrentPage === totalPages}
              className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
