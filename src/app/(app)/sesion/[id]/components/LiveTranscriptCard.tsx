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
}

export function LiveTranscriptCard({ sessionId, candidateName }: LiveTranscriptCardProps) {
  // ponytail: reuses the same Portal channel SessionChat already subscribes
  // to (a second socket per spectator tab) instead of lifting the hook up —
  // cheap enough for this app's scale, revisit if that ever changes
  const { messages } = useChannel<TranscriptContent>({ channelId: sessionId });
  const lines = messages.filter((m) => m.content?.transcript);
  const last = lines[lines.length - 1];

  return (
    <Card className="w-full my-4 border border-border shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-10 px-6 gap-4">
        <div className="size-32 rounded-full flex items-center justify-center bg-muted border-2 border-border text-muted-foreground">
          <Bot className="size-12" />
        </div>

        <div className="w-full max-h-40 overflow-y-auto space-y-2 text-sm">
          {lines.length === 0 ? (
            <p className="text-center text-muted-foreground">Esperando a que empiece la entrevista...</p>
          ) : (
            lines.map((m) => (
              <p key={m.id}>
                <span className="font-semibold text-primary">
                  {m.content.role === "assistant" ? "Entrevistador" : candidateName}:{" "}
                </span>
                <span className="text-foreground">{m.content.transcript}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </span>
              </p>
            ))
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
