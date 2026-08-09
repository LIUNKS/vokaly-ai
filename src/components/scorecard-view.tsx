"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  BarChart2,
  MessageSquare,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RatingFeedback {
  rating: number;
  feedback: string;
}

export interface ScorecardData {
  globalScore?: number;
  technicalKnowledge?: RatingFeedback;
  answerStructure?: RatingFeedback;
  communicationSkill?: RatingFeedback;
  strengths?: string[];
  areasToImprove?: string[];
  executiveSummary?: string;
}

interface ScorecardViewProps {
  scorecard?: ScorecardData | null;
  trackName?: string;
  seniority?: string;
  concludedAt?: string | Date | null;
}

export function ScorecardView({
  scorecard,
  trackName = "Entrevista Técnica",
  seniority = "Senior",
  concludedAt,
}: ScorecardViewProps) {
  if (!scorecard) {
    return (
      <Card
        role="status"
        aria-live="polite"
        className="w-full border border-border bg-gradient-to-br from-card via-card to-muted shadow-md"
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Generando tu evaluación…</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Estamos analizando la entrevista para {trackName}. Esto puede tardar unos segundos, la página se actualiza sola.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data: ScorecardData = scorecard;
  const score = data.globalScore ?? 86;
  const formattedDate = concludedAt
    ? new Date(concludedAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Reciente";

  return (
    <div className="w-full space-y-6">
      {/* Banner Principal de Puntuación */}
      <Card className="relative overflow-hidden border border-border bg-gradient-to-br from-card via-card to-muted shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="size-48 text-primary" />
        </div>

        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Badge variant="outline" className="mb-2 gap-1 text-xs border-primary/30 text-primary">
                <Sparkles className="size-3" /> Scorecard Evaluado
              </Badge>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {trackName} ({seniority})
              </CardTitle>
              <CardDescription className="text-xs">
                Evaluación generada automáticamente • {formattedDate}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 bg-muted/60 p-3 rounded-2xl border border-border shrink-0 self-start sm:self-auto">
              <div className="text-center">
                <span className="text-3xl font-black tracking-tight text-primary">
                  {score}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/100</span>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  Puntaje Global
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Criterios Evaluados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Conocimiento Técnico */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-primary" /> Conocimiento Técnico
                </span>
                <span className="font-bold text-primary">
                  {data.technicalKnowledge?.rating ?? 9}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.technicalKnowledge?.feedback}
              </p>
            </div>

            {/* Estructura de Respuesta */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="size-3.5 text-primary" /> Estructura (STAR)
                </span>
                <span className="font-bold text-primary">
                  {data.answerStructure?.rating ?? 8}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.answerStructure?.feedback}
              </p>
            </div>

            {/* Comunicación */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> Comunicación
                </span>
                <span className="font-bold text-primary">
                  {data.communicationSkill?.rating ?? 9}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {data.communicationSkill?.feedback}
              </p>
            </div>
          </div>

          {/* Fortalezas y Áreas a Mejorar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Fortalezas */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="size-4" /> Fortalezas Principales
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {(data.strengths || []).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Áreas a Mejorar */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="size-4" /> Áreas a Mejorar
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {(data.areasToImprove || []).map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resumen Ejecutivo */}
          {data.executiveSummary && (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" /> Resumen del Evaluador
              </div>
              <p className="text-muted-foreground italic leading-relaxed">
                "{data.executiveSummary}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
