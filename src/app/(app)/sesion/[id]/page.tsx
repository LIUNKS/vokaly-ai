"use client";

import React, { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { useParams } from "next/navigation";
import Link from "next/link";
=======
import { useParams, useSearchParams } from "next/navigation";
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
import Vapi from "@vapi-ai/web";
import { TRACKS } from "@/lib/tracks";
import { SessionHeader } from "./components/SessionHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { CallControls } from "./components/CallControls";
<<<<<<< HEAD
import { Clock, MessageSquare, AlertCircle, History, ArrowRight } from "lucide-react";
import { getSessionAction, updateSessionStateAction, getSessionStateAction } from "../actions";
=======
import Link from "next/link";
import { Clock, MessageSquare, AlertCircle, History, ArrowRight } from "lucide-react";
import { createOrGetSessionAction, updateSessionStateAction, getSessionStateAction } from "../actions";
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
import { PortalProvider } from "@portalsdk/react";
import { portalClient } from "@/lib/portal/client";
import { SessionChat } from "@/components/portal/session-chat";
import { ScorecardView } from "@/components/scorecard-view";
import { buttonVariants } from "@/components/ui/button";

export default function SesionEnVivoPage() {
  const params = useParams();
<<<<<<< HEAD
  const sessionId = params?.id as string;
=======
  const searchParams = useSearchParams();
  const slugOrId = (params?.id as string) || "frontend";
  const forceSpectator = searchParams.get("joinAs") === "spectator";
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)

  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [realTrackSlug, setRealTrackSlug] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string>("Senior");
<<<<<<< HEAD
  const [isCandidate, setIsCandidate] = useState<boolean>(true);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string>("Candidato");
  const [blueprintContent, setBlueprintContent] = useState<string>("");
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [sessionNotFound, setSessionNotFound] = useState(false);
=======
  const [isCandidate, setIsCandidate] = useState<boolean>(!forceSpectator);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(isUuid);
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
  const [estado, setEstado] = useState<"configurando" | "en_vivo" | "concluida">("configurando");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerRole, setSpeakerRole] = useState<"assistant" | "user" | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<any | null>(null);

  const activeTrack = TRACKS.find((t) => t.slug === realTrackSlug) || TRACKS[0];

  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSessionIdRef = useRef<string | null>(null);

  // 1. Recuperar sesión en DB mediante getSessionAction
  useEffect(() => {
    let isMounted = true;
<<<<<<< HEAD
    getSessionAction(sessionId).then((res) => {
      if (!isMounted) return;
      if (!res) {
        setSessionNotFound(true);
=======
    createOrGetSessionAction(slugOrId).then((res) => {
      if (isMounted) {
        if (res.id) {
          setDbSessionId(res.id);
          dbSessionIdRef.current = res.id;
          setEstado(res.state);
          setRealTrackSlug(res.trackSlug);
          if (res.yearsOfExperience) {
            setSeniority(`${res.yearsOfExperience} años`);
          }
          if (forceSpectator) {
            setIsCandidate(false);
          } else if (typeof res.isCandidate === "boolean") {
            setIsCandidate(res.isCandidate);
          }

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
        }
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
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
<<<<<<< HEAD
  }, [sessionId]);

  // Sincronización en tiempo real del estado de la sesión para espectadores
=======
  }, [slugOrId, forceSpectator]);

  // Sincronización en tiempo real del estado de la sesión para todos los participantes y espectadores
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
  useEffect(() => {
    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (!targetSessionId) return;

    let interval: NodeJS.Timeout | null = null;

    if (estado === "en_vivo") {
      interval = setInterval(async () => {
        const res = await getSessionStateAction(targetSessionId);
        if (res.state === "concluida") {
          console.log(`[Realtime Sync] Sesión ${targetSessionId} ha finalizado para todos los espectadores.`);
          setEstado("concluida");
          if (res.scorecard) setScorecardData(res.scorecard);
          stopTimer();
        }
      }, 3000);
    } else if (estado === "concluida" && !scorecardData) {
      getSessionStateAction(targetSessionId).then((res) => {
        if (res.scorecard) setScorecardData(res.scorecard);
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dbSessionId, estado, scorecardData]);

  // Inicializar Vapi Web SDK y suscribir eventos
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey || publicKey === "mock-vapi-public-key" || publicKey.includes("your_vapi_public_key")) {
      return;
    }

    try {
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      const onCallStart = () => {
        setEstado("en_vivo");
        setIsLoading(false);
        setErrorMessage(null);
        startTimer(0);
        if (dbSessionIdRef.current) {
          updateSessionStateAction(dbSessionIdRef.current, "en_vivo");
        }
      };

      const onCallEnd = () => {
        setEstado("concluida");
        setIsSpeaking(false);
        setSpeakerRole(null);
        stopTimer();
        if (dbSessionIdRef.current) {
          updateSessionStateAction(dbSessionIdRef.current, "concluida");
        }
      };

      const onMessage = (message: any) => {
        if (message?.type === "call-ended" || message?.endedReason) {
          const reason = message.endedReason;
          if (reason === "silence-timed-out") {
            setErrorMessage("ℹ️ La entrevista finalizó por inactividad/silencio prolongado.");
            setEstado("concluida");
            setIsSpeaking(false);
            setSpeakerRole(null);
            stopTimer();
            if (dbSessionIdRef.current) {
              updateSessionStateAction(dbSessionIdRef.current, "concluida");
            }
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
        let msg = "Error al conectar con Vapi.";
        const errorStr = JSON.stringify(e || {});
        if (errorStr.includes("ejection") || errorStr.includes("Meeting has ended")) return;
        if (errorStr.includes("NotAllowedError") || errorStr.includes("Permission denied")) {
          msg = "🎙️ Permiso de micrófono denegado en el navegador.";
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
      console.error("[Vapi SDK] Error:", err);
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

    if (typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        setErrorMessage("🎙️ Acceso al micrófono denegado. Otorga el permiso de micrófono e intentalo de nuevo.");
        setIsLoading(false);
        setEstado("configurando");
        if (targetSessionId) updateSessionStateAction(targetSessionId, "configurando");
        return;
      }
    }

    setEstado("en_vivo");
    if (targetSessionId) updateSessionStateAction(targetSessionId, "en_vivo");

    const vapi = vapiRef.current;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (vapi && assistantId) {
      try {
        startTimer();
        await vapi.start(assistantId, {
          variableValues: { sessionId: targetSessionId || sessionId },
        } as any);
        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(`Error al conectar con Vapi WebRTC: ${err?.message || String(err)}`);
        setEstado("configurando");
        if (targetSessionId) updateSessionStateAction(targetSessionId, "configurando");
        stopTimer();
        setIsLoading(false);
      }
    } else {
      setTimeout(() => startMockCall(), 500);
    }
  };

  const startMockCall = () => {
    setEstado("en_vivo");
    setIsLoading(false);
    startTimer();
    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (targetSessionId) updateSessionStateAction(targetSessionId, "en_vivo");
    setIsSpeaking(true);
    setSpeakerRole("assistant");
    setVolumeLevel(0.4);
    setTimeout(() => {
      setSpeakerRole("user");
      setVolumeLevel(0.6);
    }, 3000);
  };

  const handleEndCall = async () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (err) {
        console.warn("[Vapi] Error al detener llamada:", err);
      }
    }
    setEstado("concluida");
    setIsSpeaking(false);
    setSpeakerRole(null);
    stopTimer();

    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (targetSessionId) {
      await updateSessionStateAction(targetSessionId, "concluida");
      const res = await getSessionStateAction(targetSessionId);
      if (res.scorecard) setScorecardData(res.scorecard);
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    if (vapiRef.current) {
      try {
        vapiRef.current.setMuted(newMuted);
      } catch (err) {
        console.warn("[Vapi] Error al cambiar silencio:", err);
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

  const role = isCandidate ? "candidate" : "spectator";
  const hideChat = role === "candidate" && estado === "en_vivo";
  const centeredStage = estado === "configurando" || hideChat;
  const currentSessionId = dbSessionId || sessionId;

  return (
    <PortalProvider client={portalClient}>
      <div className="flex flex-col gap-6 py-2">
        {/* 1. Header de Sesión / Skeleton durante carga inicial por UUID */}
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

        {/* Alerta de Error si aplica */}
        {errorMessage && (
          <div className="w-full max-w-xl mx-auto p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Indicador Modo Espectador si no es el candidato */}
        {!isCandidate && (
          <div className="w-full max-w-xl mx-auto p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs text-center font-medium flex items-center justify-center gap-2">
            <span>👀 Estás en <strong>Modo Espectador</strong> presenciando la transmisión en vivo de esta entrevista.</span>
          </div>
        )}

        {/* 2. Cuerpo Principal / Visualizador de Audio y Chat Side-by-Side */}
        <div
          className={
            centeredStage
              ? "w-full flex flex-col items-center justify-center"
              : "grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
          }
        >
          <div className="w-full flex flex-col items-center justify-center">
            <AudioVisualizer
              isSpeaking={isSpeaking}
              speakerRole={speakerRole}
              volumeLevel={volumeLevel}
              candidatoNombre={isCandidate ? "Tú (Candidato)" : candidateName}
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
                  Sesión ID: {currentSessionId.substring(0, 8)}...
                </span>
              </div>
            )}

            {estado === "configurando" && isCandidate && (
              <div className="max-w-md text-center text-xs text-muted-foreground my-2 px-4 leading-relaxed">
                Presiona el botón a continuación para iniciar la entrevista. Asegúrate de tener tu micrófono activado y listo.
              </div>
            )}

            {/* 3. Barra Inferior de Controles (Solo visible para el Candidato) */}
            {isCandidate && (
              <div className="w-full mt-4">
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

          {!centeredStage && (
            <div className="w-full">
              <SessionChat
                sessionId={currentSessionId}
                role={role}
                phase={estado}
                userName={candidateName}
              />
            </div>
          )}
        </div>

        {/* 4. Scorecard de Evaluación al concluir la sesión */}
        {estado === "concluida" && (
          <div className="w-full max-w-4xl mx-auto space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <History className="size-5 text-primary" />
                Resultado de Evaluación de Sesión
              </h3>
              {isCandidate && (
                <Link
<<<<<<< HEAD
                  href="/historial"
=======
                  href="/profile#historial"
>>>>>>> 5817f72 (feat(session): add realtime session termination sync, candidate interview history and scorecard evaluation modal)
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Ver Todo mi Historial <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              )}
            </div>

            <ScorecardView
              scorecard={scorecardData}
              trackName={activeTrack.name}
              seniority={seniority}
            />
          </div>
        )}
      </div>
    </PortalProvider>
  );
}
