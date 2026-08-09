"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { TRACKS } from "@/lib/tracks";
import { SessionHeader } from "./components/SessionHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { CallControls } from "./components/CallControls";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";

export default function SesionEnVivoPage() {
  const params = useParams();
  const slugOrId = (params?.id as string) || "frontend";

  // Buscar track correspondiente en src/lib/tracks.ts
  const activeTrack = TRACKS.find((t) => t.slug === slugOrId) || TRACKS[0];
  const sessionId = slugOrId;

  // Estados de la sesión
  const [estado, setEstado] = useState<"configurando" | "en_vivo" | "concluida">("configurando");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerRole, setSpeakerRole] = useState<"assistant" | "user" | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Instancia Vapi ref
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar Vapi Web SDK y suscribir eventos
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    console.log("[Vapi Debug] Public Key cargada:", publicKey ? `${publicKey.substring(0, 8)}...` : "NO ENCONTRADA");

    if (!publicKey || publicKey === "mock-vapi-public-key" || publicKey.includes("your_vapi_public_key")) {
      console.warn("[Vapi SDK] No se encontró una NEXT_PUBLIC_VAPI_PUBLIC_KEY válida en .env. Se usará el modo mock.");
      return;
    }

    try {
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      const onCallStart = () => {
        console.log("[Vapi WebRTC] Evento 'call-start' recibido de Vapi.");
        setEstado("en_vivo");
        setIsLoading(false);
        setErrorMessage(null);
        startTimer();
      };

      const onCallEnd = () => {
        console.log("[Vapi WebRTC] Evento 'call-end' recibido.");
        setEstado("concluida");
        setIsSpeaking(false);
        setSpeakerRole(null);
        stopTimer();
      };

      const onMessage = (message: any) => {
        console.log("[Vapi Message Event]", message);
        if (message?.type === "call-ended" || message?.endedReason) {
          console.warn(`[Vapi Call Ended Reason]: ${message.endedReason || "No especificado"}`);
          if (message.endedReason && message.endedReason !== "customer-ended-call") {
            setErrorMessage(`La llamada finalizó por Vapi. Razón: ${message.endedReason}`);
          }
        }
      };

      const onSpeechStart = () => {
        setIsSpeaking(true);
        setSpeakerRole("assistant");
      };

      const onSpeechEnd = () => {
        setIsSpeaking(false);
      };

      const onVolumeLevel = (level: number) => {
        setVolumeLevel(level);
      };

      const onError = (e: any) => {
        console.error("[Vapi Error Event]", e);
        let msg = "Error al conectar con Vapi.";

        if (e?.type === "start-method-error" || e?.stage === "unknown" || JSON.stringify(e).includes("401")) {
          msg = "⚠️ Error Vapi 401 (No Autorizado): La 'NEXT_PUBLIC_VAPI_PUBLIC_KEY' o el 'NEXT_PUBLIC_VAPI_ASSISTANT_ID' no coinciden o no son válidos en Vapi Dashboard (vapi.ai). Revisa que la Public Key pertenezca a la misma cuenta del Asistente.";
        } else if (typeof e === "string") {
          msg = e;
        } else if (e?.message) {
          msg = e.message;
        }

        setErrorMessage(msg);
        setIsLoading(false);
      };

      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("volume-level", onVolumeLevel);
      vapi.on("error", onError);

      return () => {
        vapi.removeAllListeners();
        vapi.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } catch (err) {
      console.error("[Vapi SDK] Error al instanciar Vapi Client:", err);
    }
  }, []);

  // Timer helper
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Formato mm:ss
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handlers de botones
  const handleStartCall = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const vapi = vapiRef.current;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    console.log("[Vapi Debug] handleStartCall invocado. Instancia vapi:", !!vapi, "assistantId:", assistantId);

    if (vapi && assistantId) {
      try {
        console.log("[Vapi WebRTC] Conectando llamada WebRTC con Vapi Assistant:", assistantId);
        setEstado("en_vivo");
        startTimer();
        await vapi.start(assistantId);
        console.log("[Vapi WebRTC] Petición vapi.start() enviada con éxito.");
        setIsLoading(false);
      } catch (err: any) {
        console.error("[Vapi WebRTC] Error al ejecutar vapi.start():", err);
        const detail = err?.message || String(err);
        setErrorMessage(`Error al conectar con Vapi WebRTC: ${detail}`);
        setEstado("configurando");
        stopTimer();
        setIsLoading(false);
      }
    } else {
      console.warn("[Vapi SDK] No hay vapiRef o NEXT_PUBLIC_VAPI_ASSISTANT_ID configurado. Ejecutando llamada MOCK.");
      setTimeout(() => {
        startMockCall();
      }, 500);
    }
  };

  const startMockCall = () => {
    setEstado("en_vivo");
    setIsLoading(false);
    startTimer();

    // Simular alternancia de habla (Entrevistador ➔ Candidato)
    setIsSpeaking(true);
    setSpeakerRole("assistant");
    setVolumeLevel(0.4);

    setTimeout(() => {
      setSpeakerRole("user");
      setVolumeLevel(0.6);
    }, 3000);
  };

  const handleEndCall = () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (err) {
        console.warn("[Vapi] Error al detener la llamada o llamada no activa:", err);
      }
    }
    setEstado("concluida");
    setIsSpeaking(false);
    setSpeakerRole(null);
    stopTimer();
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    if (vapiRef.current) {
      try {
        vapiRef.current.setMuted(newMuted);
      } catch (err) {
        console.warn("[Vapi] Llamada WebRTC no activa aún. Alternando estado de silencio localmente:", err);
      }
    }
    setIsMuted(newMuted);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-6 py-2">
      {/* 1. Header de Sesión */}
      <SessionHeader
        trackNombre={activeTrack.name}
        empresaRef="Empresa de Producto SaaS"
        seniority="Senior"
        estado={estado}
      />

      {/* Alerta de Error si aplica */}
      {errorMessage && (
        <div className="w-full max-w-xl mx-auto p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Cuerpo Principal / Visualizador de Audio */}
      <div className="w-full flex flex-col items-center justify-center">
        <AudioVisualizer
          isSpeaking={isSpeaking}
          speakerRole={speakerRole}
          volumeLevel={volumeLevel}
          candidatoNombre="Candidato"
        />

        {/* Info extra y Timer */}
        {estado === "en_vivo" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono bg-card px-4 py-2 rounded-full border border-border my-2 shadow-xs">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <Clock className="size-3.5 text-primary" />
              {formatTime(durationSeconds)}
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="size-3.5 text-primary" />
              Sesión ID: {sessionId.substring(0, 8)}...
            </span>
          </div>
        )}

        {estado === "configurando" && (
          <div className="max-w-md text-center text-xs text-muted-foreground my-2 px-4 leading-relaxed">
            Presiona el botón a continuación para iniciar la entrevista. Asegúrate de tener tu micrófono activado y listo.
          </div>
        )}
      </div>

      {/* 3. Barra Inferior de Controles */}
      <div className="w-full">
        <CallControls
          estado={estado}
          isMuted={isMuted}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
