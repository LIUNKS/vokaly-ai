"use client";

import React from "react";
import { Mic, Bot } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-10 px-6 my-6 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none blur-3xl ${
          isAssistant
            ? "bg-cyan-500/20 opacity-100"
            : isUser
            ? "bg-emerald-500/20 opacity-100"
            : "bg-indigo-500/10 opacity-40"
        }`}
      />

      {/* Main Avatar Orb */}
      <div className="relative flex items-center justify-center my-6">
        {/* Pulsing rings */}
        <div
          className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
            isAssistant
              ? "w-44 h-44 bg-cyan-500/20 animate-ping"
              : isUser
              ? "w-44 h-44 bg-emerald-500/20 animate-ping"
              : "w-36 h-36 border border-slate-700/50 opacity-20"
          }`}
        />

        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 z-10 shadow-2xl ${
            isAssistant
              ? "bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-cyan-500/40 scale-110"
              : isUser
              ? "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/40 scale-110"
              : "bg-slate-800 border-2 border-slate-700 text-slate-400"
          }`}
          style={{
            transform: isSpeaking ? `scale(${1 + volumeLevel * 0.25})` : "scale(1)",
          }}
        >
          {isUser ? (
            <Mic className="w-12 h-12 animate-pulse" />
          ) : (
            <Bot className="w-12 h-12" />
          )}
        </div>
      </div>

      {/* Speaker Status Indicator */}
      <div className="z-10 text-center mt-2">
        {isAssistant && (
          <p className="text-sm font-semibold text-cyan-400 tracking-wide flex items-center justify-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Entrevistador Vapi hablando...
          </p>
        )}

        {isUser && (
          <p className="text-sm font-semibold text-emerald-400 tracking-wide flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Tu turno, {candidatoNombre}...
          </p>
        )}

        {!isSpeaking && (
          <p className="text-sm text-slate-400 font-medium">
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
                  ? "bg-cyan-400"
                  : isUser
                  ? "bg-emerald-400"
                  : "bg-slate-700 opacity-40"
              }`}
              style={{ height: `${barHeight}px` }}
            />
          );
        })}
      </div>
    </div>
  );
}
