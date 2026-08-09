"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

export interface ConcludedSessionItem {
  id: string;
  trackName: string;
  candidato: string;
  seniority: string;
  scoreGeneral: string;
  fecha: string;
}

interface ConcludedSessionsListProps {
  sessions: ConcludedSessionItem[];
  itemsPerPage?: number;
}

export function ConcludedSessionsList({
  sessions,
  itemsPerPage = 6,
}: ConcludedSessionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (sessions.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed border-border bg-card/20">
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

  return (
    <div className="space-y-4">
      {/* Lista de Tarjetas Pagina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSessions.map((session) => (
          <Card key={session.id} className="flex items-center justify-between p-5 border-border hover:border-primary/40 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                  Score: {session.scoreGeneral}
                </span>
                <span className="text-xs text-muted-foreground">{session.fecha}</span>
              </div>
              <h3 className="font-bold text-sm text-foreground">{session.trackName}</h3>
              <p className="text-xs text-muted-foreground">
                Candidato: {session.candidato} ({session.seniority})
              </p>
            </div>

            <Link
              href={`/sesion/${session.id}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 shrink-0" })}
            >
              Ver Scorecard
              <ArrowRight className="size-3.5" />
            </Link>
          </Card>
        ))}
      </div>

      {/* Barra de Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
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
              className="h-8 px-2.5 text-xs gap-1"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            {/* Números de página */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === safeCurrentPage ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="size-8 p-0 text-xs font-semibold"
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={safeCurrentPage === totalPages}
              className="h-8 px-2.5 text-xs gap-1"
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
