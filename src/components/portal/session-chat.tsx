'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChannel } from '@portalsdk/react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface SessionChatProps {
  sessionId: string;
  role: 'candidate' | 'spectator';
  phase: 'configurando' | 'en_vivo' | 'concluida';
  userName?: string;
}

interface ChatMessage {
  text?: string;
  sender?: string;
  emoji?: string;
  senderId?: string;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  leftOffset: number; // Desplazamiento X aleatorio
}

const DEFAULT_EMOJIS = ['👏', '🔥', '💡', '👍', '🤔'];

function ChatRoom({
  sessionId,
  role,
  phase,
  userName,
}: {
  sessionId: string;
  role: 'candidate' | 'spectator';
  phase: 'configurando' | 'en_vivo' | 'concluida';
  userName?: string;
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [activeReactions, setActiveReactions] = useState<FloatingReaction[]>([]);
  const [quickEmojis, setQuickEmojis] = useState<string[]>(DEFAULT_EMOJIS);

  const { messages, send } = useChannel<ChatMessage>({ channelId: sessionId });

  const myClientId = useRef(Math.random().toString(36).substring(7));
  const processedMessageIds = useRef<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  const roleLabel = userName || (role === 'candidate' ? 'Candidato' : 'Espectador');

  useEffect(() => {
    const saved = localStorage.getItem('recent_emojis');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuickEmojis(parsed.slice(0, 5));
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  // Función para disparar la animación ascendente desde abajo
  const triggerAnimation = (emoji: string) => {
    const animId = Date.now() + Math.random();
    // Offset horizontal aleatorio (-20px a +20px) para variedad visual
    const leftOffset = Math.floor(Math.random() * 40) - 20;

    setActiveReactions((prev) => [...prev, { id: animId, emoji, leftOffset }]);

    // Desaparece del DOM tras finalizar la animación (2 segundos)
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== animId));
    }, 2000);
  };

  const pushToRecent = (emoji: string) => {
    setQuickEmojis((prev) => {
      const updated = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 5);
      localStorage.setItem('recent_emojis', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.id && !processedMessageIds.current.has(lastMessage.id)) {
      processedMessageIds.current.add(lastMessage.id);

      if (
        lastMessage.content?.emoji &&
        lastMessage.content?.senderId !== myClientId.current
      ) {
        triggerAnimation(lastMessage.content.emoji);
      }
    }
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowEmojiMenu(false);
        setShowFullPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    send({
      content: {
        text: inputMessage,
        sender: roleLabel,
      },
    });

    setInputMessage('');
  };

  const handleSendEmoji = (emoji: string) => {
    triggerAnimation(emoji);
    pushToRecent(emoji);

    send({
      content: {
        emoji,
        senderId: myClientId.current,
      },
    });

    setShowEmojiMenu(false);
    setShowFullPicker(false);
  };

  const handleFullEmojiClick = (emojiData: EmojiClickData) => {
    handleSendEmoji(emojiData.emoji);
  };

  const chatMessagesOnly = messages.filter((m) => m.content && m.content.text);

  return (
    <div className="relative flex h-[450px] flex-col rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm overflow-hidden">

      {/* 🚀 Emojis flotantes: Nacen desde abajo a la derecha y flotan hacia arriba */}
      <div className="pointer-events-none absolute bottom-16 right-6 z-20 flex flex-col items-center">
        {activeReactions.map((r) => (
          <span
            key={r.id}
            style={{
              transform: `translateX(${r.leftOffset}px)`,
            }}
            className="absolute text-3xl animate-float-up"
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Historial de Chat */}
      <div className="mb-4 flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="border-b border-border pb-2 text-xs text-muted-foreground">
          {phase === 'concluida'
            ? 'Historial de sugerencias y chat de la sesión'
            : `Chat en vivo (${roleLabel})`}
        </div>

        {chatMessagesOnly.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">
            No hay mensajes de chat aún.
          </p>
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

      {/* Barra de entrada de texto */}
      {phase !== 'concluida' && (
        <div className="relative z-10" ref={menuRef}>
          {showFullPicker && (
            <div className="absolute bottom-14 right-0 z-50 rounded-lg border border-border bg-popover shadow-lg">
              <EmojiPicker
                onEmojiClick={handleFullEmojiClick}
                theme={Theme.AUTO}
                lazyLoadEmojis={true}
                searchPlaceHolder="Buscar emoji..."
                width={300}
                height={350}
              />
            </div>
          )}

          {showEmojiMenu && !showFullPicker && (
            <div className="absolute bottom-14 right-12 z-50 flex items-center gap-1 rounded-full border border-border bg-card p-2 shadow-md animate-in fade-in zoom-in-95">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendEmoji(emoji)}
                  className="p-1 text-xl transition-transform hover:scale-125"
                  aria-label={`Enviar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <div className="mx-1 h-4 w-px bg-border" />
              <button
                type="button"
                onClick={() => setShowFullPicker(true)}
                className="rounded-full p-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Más emojis"
                aria-label="Más emojis"
              >
                ➕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <button
                type="button"
                onClick={() => {
                  setShowEmojiMenu((prev) => !prev);
                  setShowFullPicker(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                title="Reaccionar / Emojis"
                aria-label="Reaccionar"
              >
                😊
              </button>
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function SessionChat({ sessionId, role, phase, userName }: SessionChatProps) {
  if (phase === 'configurando') {
    return null;
  }

  if (role === 'candidate' && phase === 'en_vivo') {
    return null;
  }

  return (
    <ChatRoom
      sessionId={sessionId}
      role={role}
      phase={phase}
      userName={userName}
    />
  );
}