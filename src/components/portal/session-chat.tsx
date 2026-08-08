'use client';

import { useState } from 'react';
import { useChannel } from '@portalsdk/react';

interface SessionChatProps {
  sessionId: string;
  role: 'candidate' | 'spectator' | 'interviewer';
  phase: 'configurando' | 'en_vivo' | 'concluida';
}

interface ChatMessage {
  text?: string;
  sender?: string;
  emoji?: string;
}

function ChatRoom({ sessionId, role, phase }: { sessionId: string; role: string; phase: string }) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, send } = useChannel<ChatMessage>({ channelId: sessionId });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    send({ content: { text: inputMessage, sender: role } });
    setInputMessage('');
  };

  const chatMessagesOnly = messages.filter((m) => m.content && m.content.text);

  return (
    <div className="flex flex-col h-[400px] border border-border rounded-lg bg-card text-card-foreground p-4 shadow-sm">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        <div className="text-xs text-muted-foreground border-b border-border pb-2">
          {phase === 'concluida'
            ? '📜 Historial de sugerencias y chat de la sesión'
            : `💬 Chat en vivo (${role})`}
        </div>

        {chatMessagesOnly.length === 0 ? (
          <p className="text-muted-foreground text-xs italic">No hay mensajes de chat aún.</p>
        ) : (
          chatMessagesOnly.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-semibold text-primary">
                {m.content.sender || 'Anónimo'}:{' '}
              </span>
              <span className="text-foreground">{m.content.text}</span>
            </div>
          ))
        )}
      </div>

      {phase !== 'concluida' && (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background border border-input rounded-md p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="bg-primary hover:opacity-90 text-primary-foreground font-medium text-sm px-4 py-2 rounded-md transition-colors"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}

export function SessionChat({ sessionId, role, phase }: SessionChatProps) {
  if (phase === 'configurando') {
    return (
      <div className="p-4 rounded-lg bg-accent text-accent-foreground border border-border text-sm">
        ⚠️ La sesión aún está en configuración. El chat se habilitará cuando inicie en vivo.
      </div>
    );
  }

  if (role === 'candidate' && phase === 'en_vivo') {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        🚫 El candidato no tiene acceso al chat durante la sesión en vivo.
      </div>
    );
  }

  return <ChatRoom sessionId={sessionId} role={role} phase={phase} />;
}