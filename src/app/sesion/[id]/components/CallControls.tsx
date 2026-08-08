"use client";

import React from "react";
import { Mic, MicOff, PhoneOff, Play } from "lucide-react";

interface CallControlsProps {
  estado: "configurando" | "en_vivo" | "concluida";
  isMuted: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  isLoading?: boolean;
}

export function CallControls({
  estado,
  isMuted,
  onStartCall,
  onEndCall,
  onToggleMute,
  isLoading = false,
}: CallControlsProps) {
  return (
    <div className="w-full max-w-md mx-auto flex items-center justify-center gap-4 py-4 px-6 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
      {estado === "configurando" && (
        <button
          onClick={onStartCall}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          {isLoading ? "Conectando..." : "Iniciar Entrevista en Vivo"}
        </button>
      )}

      {estado === "en_vivo" && (
        <>
          <button
            onClick={onToggleMute}
            className={`p-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            }`}
            title={isMuted ? "Desactivar silencio" : "Silenciar micrófono"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onEndCall}
            className="flex-1 py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            Finalizar Entrevista
          </button>
        </>
      )}

      {estado === "concluida" && (
        <div className="text-center py-2">
          <p className="text-xs text-slate-400">
            La sesión ha concluido. El Scorecard ha sido generado.
          </p>
        </div>
      )}
    </div>
  );
}
