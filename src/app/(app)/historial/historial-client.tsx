"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Award,
  ArrowRight,
  Radio,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Mic,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScorecardModal } from "@/components/scorecard-modal";
import { UserSessionHistoryItem } from "@/app/(app)/sesion/actions";
import { TRACKS } from "@/lib/tracks";

interface HistorialClientProps {
  initialSessions: UserSessionHistoryItem[];
  userSeniority?: string;
}

export function HistorialClient({
  initialSessions,
  userSeniority = "Senior",
}: HistorialClientProps) {
  const [filterState, setFilterState] = useState<string>("todos");
  const [filterTrack, setFilterTrack] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 8;

  // Aplicar filtros y ordenamiento
  const filteredSessions = useMemo(() => {
    return initialSessions
      .filter((s) => {
        // 1. Filtro por Estado
        if (filterState !== "todos" && s.state !== filterState) {
          return false;
        }

        // 2. Filtro por Track
        if (filterTrack !== "todos" && s.trackSlug !== filterTrack) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [initialSessions, filterState, filterTrack, sortOrder]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  const handleStateChange = (val: string | null) => {
    setFilterState(val || "todos");
    setCurrentPage(1);
  };

  const handleTrackChange = (val: string | null) => {
    setFilterTrack(val || "todos");
    setCurrentPage(1);
  };

  const handleSortChange = (val: string | null) => {
    setSortOrder((val as "desc" | "asc") || "desc");
    setCurrentPage(1);
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
    <div className="space-y-6">
      {/* Banner Hero Historial */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 md:p-10 shadow-xl backdrop-blur-md">
        {/* Glows ambientales de fondo */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Contenido Izquierdo */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <History className="size-3.5" />
              Registro Completo de Evaluaciones
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              Mi Historial de Entrevistas
            </h1>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Mic className="size-4" />
                Nueva Entrevista Práctica
              </Link>
            </div>
          </div>

          {/* Tarjeta Visual Derecha / Feature Badge Grid */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-2xl bg-muted/40 border border-border/60 min-w-[250px] shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <Award className="size-4" />
              </div>
              Scorecards Detallados
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Sparkles className="size-4" />
              </div>
              Feedback con IA
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              Nivel: {userSeniority}
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Filtros y Controles */}
      <Card className="p-4 border border-border bg-card shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro por Estado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Filter className="size-3.5 text-primary" />
              Filtrar por Estado
            </label>
            <Select value={filterState} onValueChange={handleStateChange}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Seleccionar Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Estados</SelectItem>
                <SelectItem value="concluida">Concluidas (Evaluadas)</SelectItem>
                <SelectItem value="configurando">Configurando</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Track */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" />
              Filtrar por Especialidad / Track
            </label>
            <Select value={filterTrack} onValueChange={handleTrackChange}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Seleccionar Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Tracks</SelectItem>
                {TRACKS.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orden por Fecha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-primary" />
              Ordenar por Fecha
            </label>
            <Select
              value={sortOrder}
              onValueChange={(val) => handleSortChange((val as "desc" | "asc") || "desc")}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Ordenar por Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes primero</SelectItem>
                <SelectItem value="asc">Más antiguas primero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Resultados de la Lista */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border bg-card/40">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-full bg-muted text-muted-foreground">
              <Award className="size-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              No se encontraron entrevistas
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {initialSessions.length === 0
                ? "Aún no has iniciado ninguna sesión de práctica. ¡Inicia una entrevista para obtener tu primer Scorecard!"
                : "No hay sesiones que coincidan con los filtros seleccionados. Intenta cambiar los criterios de búsqueda."}
            </p>
            {initialSessions.length === 0 && (
              <Link href="/" className={buttonVariants({ variant: "default", size: "sm" })}>
                Comenzar Práctica Ahora
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSessions.map((s) => {
              const isConcluded = s.state === "concluida";
              const isLive = s.state === "en_vivo";
              const dateStr = s.createdAt
                ? new Date(s.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "Reciente";

              const globalScore = s.scorecard?.globalScore || 86;

              return (
                <Card
                  key={s.id}
                  className="relative overflow-hidden border border-border bg-card hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold">
                          {s.trackName}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {dateStr}
                        </CardDescription>
                      </div>

                      {isConcluded ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold gap-1 shrink-0"
                        >
                          <CheckCircle2 className="size-3" /> Concluida
                        </Badge>
                      ) : isLive ? (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-semibold gap-1 shrink-0"
                        >
                          <Radio className="size-3 animate-pulse" /> En Vivo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Configurando
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      <div>
                        {isConcluded && s.scorecard ? (
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
                            {isConcluded ? "Scorecard listo" : "Sesión activa"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isConcluded && (
                          <ScorecardModal
                            scorecard={s.scorecard}
                            trackName={s.trackName}
                            seniority={userSeniority}
                            concludedAt={s.concludedAt || s.createdAt}
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
                  {Math.min(startIndex + itemsPerPage, filteredSessions.length)}
                </span>{" "}
                de <span className="font-medium text-foreground">{filteredSessions.length}</span> entrevistas
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
      )}
    </div>
  );
}
