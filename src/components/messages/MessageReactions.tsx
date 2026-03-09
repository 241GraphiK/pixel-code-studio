import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { SmilePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface Reaction {
  emoji: string;
  users: string[]; // user_ids
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  isMe: boolean;
  onToggle: (messageId: string, emoji: string) => void;
}

export function MessageReactions({ messageId, reactions, isMe, onToggle }: MessageReactionsProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onToggle(messageId, emoji);
    setOpen(false);
  };

  if (reactions.length === 0 && !isMe && !user) return null;

  return (
    <div className={cn("flex items-center gap-1 mt-1 flex-wrap", isMe ? "justify-end" : "justify-start")}>
      {reactions.map(r => {
        const iReacted = user ? r.users.includes(user.id) : false;
        return (
          <button
            key={r.emoji}
            onClick={() => onToggle(messageId, r.emoji)}
            className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors border",
              iReacted
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-background/80 text-muted-foreground hover:bg-accent"
            )}
          >
            <span>{r.emoji}</span>
            <span className="text-[10px]">{r.users.length}</span>
          </button>
        );
      })}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent"
            title="Réagir"
          >
            <SmilePlus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1.5" side="top" align={isMe ? "end" : "start"}>
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-accent"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Hook to manage reactions
export function useReactions(conversationId: string | null) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());

  const fetchReactions = async (messageIds: string[]) => {
    if (!messageIds.length) return;

    const { data } = await supabase
      .from("message_reactions")
      .select("message_id, user_id, emoji")
      .in("message_id", messageIds);

    if (data) {
      const map = new Map<string, Reaction[]>();
      for (const r of data) {
        const existing = map.get(r.message_id) || [];
        const found = existing.find(e => e.emoji === r.emoji);
        if (found) {
          found.users.push(r.user_id);
        } else {
          existing.push({ emoji: r.emoji, users: [r.user_id] });
        }
        map.set(r.message_id, existing);
      }
      setReactions(map);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    const msgReactions = reactions.get(messageId) || [];
    const existing = msgReactions.find(r => r.emoji === emoji);
    const iReacted = existing?.users.includes(user.id);

    if (iReacted) {
      // Remove reaction
      await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);

      setReactions(prev => {
        const next = new Map(prev);
        const rs = (next.get(messageId) || [])
          .map(r => r.emoji === emoji ? { ...r, users: r.users.filter(u => u !== user.id) } : r)
          .filter(r => r.users.length > 0);
        next.set(messageId, rs);
        return next;
      });
    } else {
      // Add reaction
      await supabase
        .from("message_reactions")
        .insert({ message_id: messageId, user_id: user.id, emoji });

      setReactions(prev => {
        const next = new Map(prev);
        const rs = [...(next.get(messageId) || [])];
        const found = rs.find(r => r.emoji === emoji);
        if (found) {
          found.users = [...found.users, user.id];
        } else {
          rs.push({ emoji, users: [user.id] });
        }
        next.set(messageId, rs);
        return next;
      });
    }
  };

  const getReactions = (messageId: string): Reaction[] => {
    return reactions.get(messageId) || [];
  };

  return { fetchReactions, toggleReaction, getReactions };
}
