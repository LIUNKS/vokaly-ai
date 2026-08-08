'use client';

import { useState, useEffect, useRef } from 'react';
import { useChannel } from '@portalsdk/react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EphemeralReactionsProps {
  sessionId: string;
}

interface ReactionPayload {
  emoji: string;
  senderId?: string;
}

const DEFAULT_EMOJIS = ['👏', '🔥', '💡', '👍', '🤔'];

export function EphemeralReactions({ sessionId }: EphemeralReactionsProps) {
  const [activeReactions, setActiveReactions] = useState<{ id: number; emoji: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  
  const { send, messages } = useChannel<ReactionPayload>({ channelId: sessionId });

  const myClientId = useRef<string>(Math.random().toString(36).substring(7));
  const processedMessageIds = useRef<Set<string>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);

  const triggerAnimation = (emoji: string) => {
    const animId = Date.now() + Math.random();
    setActiveReactions((prev) => [...prev, { id: animId, emoji }]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== animId));
    }, 2000);
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
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendReaction = (emoji: string) => {
    triggerAnimation(emoji);
    send({
      content: {
        emoji,
        senderId: myClientId.current,
      },
    });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    handleSendReaction(emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="absolute -top-12 flex gap-2 pointer-events-none">
        {activeReactions.map((r) => (
          <span key={r.id} className="animate-bounce text-2xl">
            {r.emoji}
          </span>
        ))}
      </div>

      {showPicker && (
        <div ref={pickerRef} className="absolute top-12 z-50 shadow-lg rounded-lg border border-border">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            lazyLoadEmojis={true}
            searchPlaceHolder="Buscar emoji..."
            width={320}
            height={400}
          />
        </div>
      )}

      <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-full shadow-sm">
        {DEFAULT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendReaction(emoji)}
            className="hover:scale-125 transition-transform text-xl p-1"
          >
            {emoji}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-border mx-1" />

        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="hover:bg-accent text-muted-foreground hover:text-foreground rounded-full p-1 text-sm transition-colors flex items-center justify-center w-8 h-8"
          title="Ver todos los emojis"
        >
          ➕
        </button>
      </div>
    </div>
  );
}