"use client";

import { useEffect, useRef } from "react";
import { useChannel } from "@portalsdk/react";
import { Bot, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LiveTranscriptCardProps {
  sessionId: string;
  candidateName: string;
}

interface TranscriptContent {
  role?: "user" | "assistant";
  transcript?: string;
}

export function LiveTranscriptCard({ sessionId, candidateName }: LiveTranscriptCardProps) {
  const { messages } = useChannel<TranscriptContent>({ channelId: sessionId });
  const lines = messages.filter((m) => m.content?.transcript);
  const last = lines[lines.length - 1];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llega una nueva línea
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length]);

  return (
    <Card className="w-full my-4 border border-border shadow-sm bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="size-4 text-primary" /> Transcripción en Vivo
        </CardTitle>
        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Radio className="size-3 animate-pulse" /> En directo
        </span>
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4 space-y-3">
        <div
          ref={scrollRef}
          className="w-full max-h-56 overflow-y-auto space-y-2 text-sm pr-2 scroll-smooth"
        >
          {lines.length === 0 ? (
            <p className="text-center text-xs italic text-muted-foreground py-6">
              Esperando el primer turno de habla en la entrevista...
            </p>
          ) : (
            lines.map((m) => (
              <div key={m.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/40 space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${m.content.role === "assistant" ? "text-primary" : "text-foreground"}`}>
                    {m.content.role === "assistant" ? "🤖 Entrevistador IA" : `👤 ${candidateName}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{m.content.transcript}</p>
              </div>
            ))
          )}
        </div>

        {last && (
          <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 text-right">
            Última respuesta de: <span className="font-semibold text-foreground">{last.content.role === "assistant" ? "Entrevistador" : candidateName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
