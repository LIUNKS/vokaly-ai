"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Vapi from "@vapi-ai/web";
import { TRACKS } from "@/lib/tracks";
import { SessionHeader } from "./components/SessionHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { LiveTranscriptCard } from "./components/LiveTranscriptCard";
import { CallControls } from "./components/CallControls";
import { Clock, MessageSquare, AlertCircle, History, ArrowRight } from "lucide-react";
import {
  getSessionAction,
  updateSessionStateAction,
  updateSessionTranscriptAction,
} from "../actions";
import { PortalProvider } from "@portalsdk/react";
import { portalClient } from "@/lib/portal/client";
import { SessionChat } from "@/components/portal/session-chat";
import { ScorecardView } from "@/components/scorecard-view";
import { buttonVariants } from "@/components/ui/button";

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
  const [scorecardData, setScorecardData] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const activeTrack = TRACKS.find((t) => t.slug === realTrackSlug) || TRACKS[0];

  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSessionIdRef = useRef<string | null>(null);
  const liveTranscriptLinesRef = useRef<string[]>([]);

  // 1. Recuperar sesión en DB mediante getSessionAction
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
      if (res.userName) setUserName(res.userName);
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

      // Sincronizar la transcripción en la BD si la sesión ya existe
      loadAndSyncTranscript(res.id);

      setIsSessionLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Sincronización en tiempo real del estado de la sesión para espectadores
  useEffect(() => {
    const targetSessionId = dbSessionId || dbSessionIdRef.current;
    if (!targetSessionId) return;

    let interval: NodeJS.Timeout | null = null;

    if (estado === "en_vivo") {
      interval = setInterval(async () => {
        const res = await fetchSessionState(targetSessionId);
        if (res.state === "concluida") {
          console.log(`[Realtime Sync] Sesión ${targetSessionId} ha finalizado para todos los espectadores.`);
          setEstado("concluida");
          if (res.scorecard) setScorecardData(res.scorecard);
          stopTimer();
          loadAndSyncTranscript(targetSessionId);
        }
      }, 3000);
    } else if (estado === "concluida" && !scorecardData) {
      // Scorecard se genera async en el webhook tras recibir el transcript — reintenta hasta que aparezca
      interval = setInterval(async () => {
        const res = await fetchSessionState(targetSessionId);
        if (res.scorecard) setScorecardData(res.scorecard);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dbSessionId, estado, scorecardData]);

  // Route Handler en vez de Server Action — usada en polling, evitar el
  // re-render de Server Components que dispara una Server Action en cada tick
  const fetchSessionState = async (targetSessionId: string) => {
    const res = await fetch(`/api/sessions/${targetSessionId}/state`);
    return (await res.json()) as { state: "configurando" | "en_vivo" | "concluida" | null; scorecard: any | null };
  };

  // Función parametrizada para obtener y guardar la transcripción + vapiCallId en la BD
  const loadAndSyncTranscript = async (targetSessionId?: string, targetCallId?: string) => {
    try {
      const activeSessionId = targetSessionId || dbSessionIdRef.current || sessionId;
      let url = "/api/vapi/transcript";
      if (activeSessionId) {
        url += `?sessionId=${activeSessionId}`;
      } else if (targetCallId) {
        url += `?callId=${targetCallId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (data.transcript && typeof data.transcript === "string" && data.transcript.trim().length > 0) {
          setTranscript(data.transcript);
          if (activeSessionId) {
            await updateSessionTranscriptAction(activeSessionId, data.callId, data.transcript);
          }
        } else if (data.callId && activeSessionId) {
          await updateSessionTranscriptAction(activeSessionId, data.callId);
        }
      }
    } catch (err) {
      // Silencioso
    }
  };

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

      const saveCapturedLiveTranscript = async () => {
        if (liveTranscriptLinesRef.current.length > 0 && dbSessionIdRef.current) {
          const fullLiveText = liveTranscriptLinesRef.current.join("\n");
          setTranscript(fullLiveText);
          await updateSessionTranscriptAction(dbSessionIdRef.current, undefined, fullLiveText);
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

        saveCapturedLiveTranscript();

        setTimeout(() => {
          loadAndSyncTranscript();
        }, 1200);
      };

      const onMessage = (message: any) => {
        // Capturar transcripción en tiempo real emitida por el Web SDK de Vapi
        if (message?.type === "transcript" || message?.transcript) {
          const role = (message.role || message.speaker) === "user" ? "Candidato" : "Asistente";
          const text = message.transcript || message.text;
          const transcriptType = message.transcriptType || "final";

          if (text && typeof text === "string" && text.trim().length > 0) {
            if (transcriptType === "final") {
              const formattedLine = `${role}: ${text.trim()}`;
              liveTranscriptLinesRef.current.push(formattedLine);
              const combinedText = liveTranscriptLinesRef.current.join("\n");
              setTranscript(combinedText);

              if (dbSessionIdRef.current) {
                updateSessionTranscriptAction(dbSessionIdRef.current, undefined, combinedText);
              }
            }
          }
        }

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
            saveCapturedLiveTranscript();
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

    const vapi = vapiRef.current;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (vapi && assistantId) {
      try {
        startTimer();
        // Assistant en Vapi Dashboard solo tiene {{first_message}}/{{blueprint_content}} como placeholders.
        const firstMessage = `Hola ${candidateName}, te doy la bienvenida a tu sesión de práctica para la posición de ${activeTrack.name} en ${activeTrack.empresaRef}. Hoy te acompaño en la entrevista. Cuando quieras empezar, avísame y comenzamos con la primera pregunta.`;

        const call = await vapi.start(assistantId, {
          variableValues: {
            sessionId: targetSessionId || sessionId,
            first_message: firstMessage,
            blueprint_content: blueprintContent,
          },
          metadata: {
            sessionId: targetSessionId || sessionId,
            candidatoId: candidateId || undefined,
            trackSlug: realTrackSlug || sessionId,
          },
          // override reemplaza la lista completa, no la extiende — hay que
          // repetir los defaults de Vapi además de "transcript" o se pierden
          serverMessages: [
            "transcript",
            "end-of-call-report",
            "status-update",
            "tool-calls",
            "transfer-destination-request",
            "user-interrupted",
          ],
        } as any);

        if (targetSessionId) {
          updateSessionStateAction(targetSessionId, "en_vivo", call?.id);
        }
        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(`Error al conectar con Vapi WebRTC: ${err?.message || String(err)}`);
        setEstado("configurando");
        if (targetSessionId) updateSessionStateAction(targetSessionId, "configurando");
        stopTimer();
        setIsLoading(false);
      }
    } else {
      if (targetSessionId) updateSessionStateAction(targetSessionId, "en_vivo");
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
      const res = await fetchSessionState(targetSessionId);
      if (res.scorecard) setScorecardData(res.scorecard);
      loadAndSyncTranscript(targetSessionId);
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
            {isCandidate ? (
              <AudioVisualizer
                isSpeaking={isSpeaking}
                speakerRole={speakerRole}
                volumeLevel={volumeLevel}
                candidatoNombre="Tú (Candidato)"
              />
            ) : (
              <LiveTranscriptCard sessionId={currentSessionId} candidateName={candidateName} />
            )}

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
                userName={userName || candidateName}
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
                  href="/historial"
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
              transcript={transcript}
            />
          </div>
        )}
      </div>
    </PortalProvider>
  );
}
