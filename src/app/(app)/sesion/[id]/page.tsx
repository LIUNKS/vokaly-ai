"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Vapi from "@vapi-ai/web";
import { TRACKS } from "@/lib/tracks";
import { SessionHeader } from "./components/SessionHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { CallControls } from "./components/CallControls";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";
import { getSessionAction, updateSessionStateAction } from "../actions";

export default function SesionEnVivoPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [realTrackSlug, setRealTrackSlug] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string>("Senior");
  const [isCandidate, setIsCandidate] = useState<boolean>(true);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string>("Candidato");
  const [blueprintContent, setBlueprintContent] = useState<string>("");
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  const [estado, setEstado] = useState<"configurando" | "en_vivo" | "concluida">("configurando");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerRole, setSpeakerRole] = useState<"assistant" | "user" | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeTrack = TRACKS.find((t) => t.slug === realTrackSlug) || TRACKS[0];

  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSessionIdRef = useRef<string | null>(null);

  // Nunca crea la sesión acá, solo la busca — ver getSessionAction.
  useEffect(() => {
    let isMounted = true;
    getSessionAction(sessionId).then((res) => {
      if (!isMounted) return;
      if (!res) {
        setSessionNotFound(true);
        setIsSessionLoading(false);
        return;
      }

      setDbSessionId(res.id);
      dbSessionIdRef.current = res.id;
      setEstado(res.state);
      setRealTrackSlug(res.trackSlug);
      if (res.yearsOfExperience) {
        setSeniority(`${res.yearsOfExperience} años`);
      }
      if (typeof res.isCandidate === "boolean") {
        setIsCandidate(res.isCandidate);
      }
      if (res.candidateId) setCandidateId(res.candidateId);
      if (res.candidateName) setCandidateName(res.candidateName);
      if (res.blueprintContent) setBlueprintContent(res.blueprintContent);

      // Sincronizar el reloj del espectador con la hora real de inicio en DB (createdAt)
      if (res.state === "en_vivo") {
        let elapsedSec = 0;
        if (res.createdAt) {
          elapsedSec = Math.max(
            0,
            Math.floor((Date.now() - new Date(res.createdAt).getTime()) / 1000)
          );
        }
        setDurationSeconds(elapsedSec);
        startTimer(elapsedSec);
      }
      setIsSessionLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

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
        startTimer(0);
        if (dbSessionIdRef.current) {
          updateSessionStateAction(dbSessionIdRef.current, "en_vivo");
        }
      };

      const onCallEnd = () => {
        console.log("[Vapi WebRTC] Evento 'call-end' recibido.");
        setEstado("concluida");
        setIsSpeaking(false);
        setSpeakerRole(null);
        stopTimer();
        if (dbSessionIdRef.current) {
          updateSessionStateAction(dbSessionIdRef.current, "concluida");
        }
      };

      const onMessage = (message: any) => {
        console.log("[Vapi Message Event]", message);
        if (message?.type === "call-ended" || message?.endedReason) {
          const reason = message.endedReason;
          console.warn(`[Vapi Call Ended Reason]: ${reason || "No especificado"}`);

          if (reason === "silence-timed-out") {
            setErrorMessage("ℹ️ La entrevista finalizó por inactividad/silencio prolongado (silence-timed-out).");
            setEstado("concluida");
            setIsSpeaking(false);
            setSpeakerRole(null);
            stopTimer();
            if (dbSessionIdRef.current) {
              updateSessionStateAction(dbSessionIdRef.current, "concluida");
            }
          } else if (reason && reason !== "customer-ended-call") {
            setErrorMessage(`La llamada finalizó por Vapi. Razón: ${reason}`);
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
        const errorStr = JSON.stringify(e || {});

        // Ignorar cierres limpios de sesión o ejections por inactividad
        if (errorStr.includes("ejection") || errorStr.includes("Meeting has ended") || e?.message?.includes("ejection")) {
          console.log("[Vapi WebRTC] Desconexión de reunión habitual o finalización de Vapi (ejection).");
          return;
        }

        if (errorStr.includes("NotAllowedError") || errorStr.includes("Permission denied") || e?.name === "NotAllowedError") {
          msg = "🎙️ Permiso de micrófono denegado en el navegador. Haz clic en el ícono del candado/micrófono en la barra de direcciones de tu navegador, permite el acceso al micrófono y vuelve a presionar 'Iniciar Entrevista'.";
        } else if (e?.type === "start-method-error" || e?.stage === "unknown" || errorStr.includes("401")) {
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

  const startTimer = (initialSecs: number = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDurationSeconds(initialSecs);
    timerRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartCall = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const targetSessionId = dbSessionId || dbSessionIdRef.current;

    // Pedir permiso de mic explícito antes de vapi.start() — sin esto el WebRTC a veces se cierra solo apenas conecta.
    if (typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
      try {
        console.log("[MediaDevices] Solicitando permiso explícito de micrófono...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Vapi abre su propio stream — este solo era para forzar el prompt de permiso.
        stream.getTracks().forEach((track) => track.stop());
        console.log("[MediaDevices] Permiso de micrófono concedido exitosamente.");
      } catch (micErr: any) {
        console.warn("[MediaDevices] Error o permiso denegado:", micErr);
        setErrorMessage(
          "🎙️ Acceso al micrófono denegado. Haz clic en el icono de candado o micrófono en la barra de direcciones de tu navegador (arriba a la izquierda), otorga el permiso de Micrófono e intentalo de nuevo."
        );
        setIsLoading(false);
        setEstado("configurando");
        if (targetSessionId) {
          updateSessionStateAction(targetSessionId, "configurando");
        }
        return;
      }
    }

    setEstado("en_vivo");
    if (targetSessionId) {
      updateSessionStateAction(targetSessionId, "en_vivo");
    }

    const vapi = vapiRef.current;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    console.log("[Vapi Debug] handleStartCall invocado. Instancia vapi:", !!vapi, "assistantId:", assistantId);

    if (vapi && assistantId) {
      try {
        console.log("[Vapi WebRTC] Conectando llamada WebRTC con Vapi Assistant:", assistantId);
        startTimer();
        // Ambos ya resueltos acá (no placeholders) — el Assistant en Vapi Dashboard solo tiene
        // {{first_message}}/{{blueprint_content}}, nada que templatizar de su lado.
        const firstMessage = `Hola ${candidateName}, bienvenido/a a tu sesión de práctica para la posición de ${activeTrack.name} en ${activeTrack.empresaRef}. Soy tu entrevistador/a hoy. Cuando estés listo/a, dime y comenzamos con la primera pregunta.`;

        await vapi.start(assistantId, {
          variableValues: {
            first_message: firstMessage,
            blueprint_content: blueprintContent,
          },
          metadata: {
            sessionId: targetSessionId || sessionId,
            candidatoId: candidateId || undefined,
            trackSlug: realTrackSlug || sessionId,
          },
        });
        console.log("[Vapi WebRTC] Petición enviada con éxito.");
        setIsLoading(false);
      } catch (err: any) {
        console.error("[Vapi WebRTC] Error al ejecutar vapi.start():", err);
        const detail = err?.message || String(err);
        if (detail.includes("NotAllowedError") || detail.includes("Permission denied")) {
          setErrorMessage(
            "🎙️ Acceso al micrófono denegado. Otorga los permisos de micrófono en tu navegador y presiona nuevamente 'Iniciar Entrevista'."
          );
        } else {
          setErrorMessage(`Error al conectar con Vapi WebRTC: ${detail}`);
        }
        setEstado("configurando");
        if (targetSessionId) {
          updateSessionStateAction(targetSessionId, "configurando");
        }
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

    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (targetSessionId) {
      updateSessionStateAction(targetSessionId, "en_vivo");
    }

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

    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (targetSessionId) {
      updateSessionStateAction(targetSessionId, "concluida");
    }
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

  if (sessionNotFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Esta sesión no existe. Iniciá una nueva desde el inicio.
        </p>
        <Link href="/" className="text-sm text-primary underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-6 py-2">
      {isSessionLoading ? (
        <div className="w-full p-6 rounded-2xl bg-card border border-border animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-muted rounded-md" />
            <div className="h-3 w-64 bg-muted/60 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-full" />
        </div>
      ) : (
        <SessionHeader
          trackNombre={activeTrack.name}
          empresaRef={activeTrack.empresaRef}
          seniority={seniority}
          estado={estado}
          blueprintContent={blueprintContent}
        />
      )}

      {errorMessage && (
        <div className="w-full max-w-xl mx-auto p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isCandidate && (
        <div className="w-full max-w-xl mx-auto p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs text-center font-medium flex items-center justify-center gap-2">
          <span>👀 Estás en <strong>Modo Espectador</strong> presenciando la transmisión en vivo de esta entrevista.</span>
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center">
        <AudioVisualizer
          isSpeaking={isSpeaking}
          speakerRole={speakerRole}
          volumeLevel={volumeLevel}
          candidatoNombre={isCandidate ? "Tú (Candidato)" : "Candidato en Vivo"}
        />

        {estado === "en_vivo" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono bg-card px-4 py-2 rounded-full border border-border my-2 shadow-xs">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <Clock className="size-3.5 text-primary" />
              {formatTime(durationSeconds)}
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="size-3.5 text-primary" />
              Sesión ID: {(dbSessionId || sessionId).substring(0, 8)}...
            </span>
          </div>
        )}

        {estado === "configurando" && isCandidate && (
          <div className="max-w-md text-center text-xs text-muted-foreground my-2 px-4 leading-relaxed">
            Presiona el botón a continuación para iniciar la entrevista. Asegúrate de tener tu micrófono activado y listo.
          </div>
        )}
      </div>

      {isCandidate && (
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
      )}
    </div>
  );
}
