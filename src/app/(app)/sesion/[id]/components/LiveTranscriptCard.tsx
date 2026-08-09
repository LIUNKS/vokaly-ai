"use client";

import { useChannel } from "@portalsdk/react";
import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LiveTranscriptCardProps {
  sessionId: string;
  candidateName: string;
}

interface TranscriptContent {
  role?: "user" | "assistant";
  transcript?: string;
  transcriptType?: "partial" | "final";
}

export function LiveTranscriptCard({ sessionId, candidateName }: LiveTranscriptCardProps) {
  // canal separado del chat — los parciales saturarían su ventana de
  // historial compartida (ver route.ts)
  const { messages } = useChannel<TranscriptContent>({ channelId: `${sessionId}:transcript` });
  const transcriptMsgs = messages.filter((m) => m.content?.transcript);
  const lastMsg = transcriptMsgs[transcriptMsgs.length - 1];
  // solo el chunk más reciente puede estar "en curso" — todo lo anterior ya
  // quedó cerrado por un final posterior, así que es historial fijo
  const liveLine = lastMsg?.content?.transcriptType === "partial" ? lastMsg : null;
  const lines = transcriptMsgs.filter((m) => m.content?.transcriptType === "final");
  const last = liveLine ?? lines[lines.length - 1];

  return (
    <Card className="w-full my-4 border border-border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-10 px-6 gap-4">
        <div className="size-32 rounded-full flex items-center justify-center bg-muted border-2 border-border text-muted-foreground">
          <Bot className="size-12" />
        </div>

        <div className="w-full max-h-40 overflow-y-auto space-y-2 text-sm">
          {lines.length === 0 && !liveLine ? (
            <p className="text-center text-muted-foreground">Esperando a que empiece la entrevista...</p>
          ) : (
            <>
              {lines.map((m) => (
                <p key={m.id}>
                  <span className="font-semibold text-primary">
                    {m.content.role === "assistant" ? "Entrevistador" : candidateName}:{" "}
                  </span>
                  <span className="text-foreground">{m.content.transcript}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                </p>
              ))}
              {liveLine && (
                <p className="italic opacity-70">
                  <span className="font-semibold text-primary">
                    {liveLine.content.role === "assistant" ? "Entrevistador" : candidateName}:{" "}
                  </span>
                  <span className="text-foreground">{liveLine.content.transcript}…</span>
                </p>
              )}
            </>
          )}
        </div>

        {last && (
          <p className="text-xs text-muted-foreground">
            Último turno: {last.content.role === "assistant" ? "Entrevistador" : candidateName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
