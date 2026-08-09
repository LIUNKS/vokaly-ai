"use client";

import React from "react";
import { Mic, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AudioVisualizerProps {
  isSpeaking: boolean;
  speakerRole: "assistant" | "user" | null;
  volumeLevel: number; // 0 to 1
  candidatoNombre: string;
}

export function AudioVisualizer({
  isSpeaking,
  speakerRole,
  volumeLevel,
  candidatoNombre,
}: AudioVisualizerProps) {
  const isAssistant = speakerRole === "assistant" && isSpeaking;
  const isUser = speakerRole === "user" && isSpeaking;

  return (
    <Card className="w-full relative overflow-hidden my-4 border border-border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-10 px-6 relative">
        {/* Background Ambient Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none blur-3xl ${
            isAssistant
              ? "bg-primary/20 opacity-100"
              : isUser
              ? "bg-emerald-500/20 opacity-100"
              : "bg-muted/20 opacity-30"
          }`}
        />

        {/* Main Avatar Orb */}
        <div className="relative flex items-center justify-center my-6">
          {/* Pulsing rings */}
          <div
            className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
              isAssistant
                ? "size-44 bg-primary/20 animate-ping"
                : isUser
                ? "size-44 bg-emerald-500/20 animate-ping"
                : "size-36 border border-border opacity-20"
            }`}
          />

          <div
            className={`size-32 rounded-full flex items-center justify-center transition-all duration-500 z-10 shadow-lg ${
              isAssistant
                ? "bg-primary text-primary-foreground shadow-primary/30 scale-110"
                : isUser
                ? "bg-emerald-600 text-white shadow-emerald-500/30 scale-110"
                : "bg-muted border-2 border-border text-muted-foreground"
            }`}
            style={{
              transform: isSpeaking ? `scale(${1 + volumeLevel * 0.25})` : "scale(1)",
            }}
          >
            {isUser ? (
              <Mic className="size-12 animate-pulse" />
            ) : (
              <Bot className="size-12" />
            )}
          </div>
        </div>

        {/* Speaker Status Indicator */}
        <div className="z-10 text-center mt-2">
          {isAssistant && (
            <p className="text-sm font-semibold text-primary tracking-wide flex items-center justify-center gap-2 animate-bounce">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              Entrevistador Vapi hablando...
            </p>
          )}

          {isUser && (
            <p className="text-sm font-semibold text-emerald-500 tracking-wide flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              Tu turno, {candidatoNombre}...
            </p>
          )}

          {!isSpeaking && (
            <p className="text-sm text-muted-foreground font-medium">
              Escuchando...
            </p>
          )}
        </div>

        {/* Audio Wave Volume Bars */}
        <div className="flex items-center justify-center gap-1.5 h-8 mt-6 z-10">
          {Array.from({ length: 9 }).map((_, index) => {
            const heightMultiplier = Math.sin((index + 1) * 0.4) * volumeLevel;
            const barHeight = isSpeaking ? Math.max(12, Math.min(32, heightMultiplier * 40)) : 6;

            return (
              <div
                key={index}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isAssistant
                    ? "bg-primary"
                    : isUser
                    ? "bg-emerald-500"
                    : "bg-muted-foreground/30"
                }`}
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
