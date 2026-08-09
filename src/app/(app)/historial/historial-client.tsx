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

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="size-6 text-primary" />
            Mi Historial de Entrevistas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Consulta todas tus sesiones evaluadas, filtra por estado y revisa tus scorecards completos.
          </p>
        </div>

        <Link href="/" className={buttonVariants({ variant: "default", size: "sm" })}>
          Nueva Entrevista Práctica <ArrowRight className="ml-1.5 size-4" />
        </Link>
      </div>

      {/* Barra de Filtros y Controles */}
      <Card className="p-4 border border-border bg-card shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro por Estado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Filter className="size-3.5 text-primary" />
              Filtrar por Estado
            </label>
            <Select value={filterState} onValueChange={(val) => setFilterState(val || "todos")}>
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
            <Select value={filterTrack} onValueChange={(val) => setFilterTrack(val || "todos")}>
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
              onValueChange={(val) => setSortOrder((val as "desc" | "asc") || "desc")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((s) => {
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
      )}
    </div>
  );
}
