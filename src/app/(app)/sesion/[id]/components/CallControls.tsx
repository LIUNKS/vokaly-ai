"use client";

import React from "react";
import { Mic, MicOff, PhoneOff, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CallControlsProps {
  estado: "configurando" | "en_vivo" | "concluida";
  isMuted: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  isLoading?: boolean;
  isPreparing?: boolean;
}

export function CallControls({
  estado,
  isMuted,
  onStartCall,
  onEndCall,
  onToggleMute,
  isLoading = false,
  isPreparing = false,
}: CallControlsProps) {
  if (estado === "concluida") return null;

  const isDisabled = isLoading || isPreparing;

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center gap-4 py-4 px-6">
        {estado === "configurando" && (
          <Button
            onClick={onStartCall}
            disabled={isDisabled}
            size="lg"
            className="w-full py-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isDisabled ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
            {isPreparing
              ? "Preparando entrevista..."
              : isLoading
              ? "Conectando..."
              : "Iniciar Entrevista en Vivo"}
          </Button>
        )}

        {estado === "en_vivo" && (
          <>
            <Button
              onClick={onToggleMute}
              variant={isMuted ? "destructive" : "outline"}
              size="icon-lg"
              className="cursor-pointer"
              title={isMuted ? "Desactivar silencio" : "Silenciar micrófono"}
            >
              {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </Button>

            <Button
              onClick={onEndCall}
              variant="destructive"
              size="lg"
              className="flex-1 py-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneOff className="size-5" />
              Finalizar Entrevista
            </Button>
          </>
        )}

      </CardContent>
    </Card>
  );
}
