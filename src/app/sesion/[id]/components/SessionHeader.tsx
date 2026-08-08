"use client";

import React from "react";
import { Radio, CheckCircle, Settings, ShieldCheck } from "lucide-react";

interface SessionHeaderProps {
  trackNombre: string;
  empresaRef: string;
  seniority: string;
  estado: "configurando" | "en_vivo" | "concluida";
}

export function SessionHeader({
  trackNombre,
  empresaRef,
  seniority,
  estado,
}: SessionHeaderProps) {
  return (
    <header className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          V
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {trackNombre}
          </h1>
          <p className="text-xs text-slate-400">
            Empresa de referencia: <span className="text-slate-200 font-medium">{empresaRef}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Seniority: <span className="capitalize text-cyan-300">{seniority}</span>
        </div>

        {estado === "configurando" && (
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400 flex items-center gap-1.5 animate-pulse">
            <Settings className="w-3.5 h-3.5" />
            CONFIGURANDO
          </div>
        )}

        {estado === "en_vivo" && (
          <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-semibold text-rose-400 flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            EN VIVO
          </div>
        )}

        {estado === "concluida" && (
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            CONCLUIDA
          </div>
        )}
      </div>
    </header>
  );
}
