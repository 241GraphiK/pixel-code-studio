import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useTypingIndicator(conversationId: string | null, userId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<Map<string, { name: string; timeout: NodeJS.Timeout }>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.user_id === userId) return;

        setTypingUsers((prev) => {
          const next = new Map(prev);
          const existing = next.get(payload.user_id);
          if (existing) clearTimeout(existing.timeout);

          const timeout = setTimeout(() => {
            setTypingUsers((p) => {
              const n = new Map(p);
              n.delete(payload.user_id);
              return n;
            });
          }, 3000);

          next.set(payload.user_id, { name: payload.name, timeout });
          return next;
        });
      })
      .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
        if (payload.user_id === userId) return;
        setTypingUsers((prev) => {
          const next = new Map(prev);
          const existing = next.get(payload.user_id);
          if (existing) clearTimeout(existing.timeout);
          next.delete(payload.user_id);
          return next;
        });
      })
      .subscribe();

    return () => {
      typingUsers.forEach((v) => clearTimeout(v.timeout));
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, userId]);

  const sendTyping = useCallback(
    (name: string) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: userId, name },
      });
    },
    [userId]
  );

  const sendStopTyping = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { user_id: userId },
    });
  }, [userId]);

  const typingNames = Array.from(typingUsers.values()).map((v) => v.name);

  return { typingNames, sendTyping, sendStopTyping };
}
