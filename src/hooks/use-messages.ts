import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Participant {
  user_id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  sender?: { name: string; avatar_url: string | null };
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    // Get conversations user participates in
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map(p => p.conversation_id);

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    if (!convs) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get all participants for these conversations
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    // Get profiles for all participants
    const userIds = [...new Set(allParticipants?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, role")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get last message for each conversation
    const enriched: Conversation[] = await Promise.all(
      convs.map(async (conv) => {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("read", false)
          .neq("sender_id", user.id);

        const parts = allParticipants
          ?.filter(p => p.conversation_id === conv.id)
          .map(p => {
            const profile = profileMap.get(p.user_id);
            return {
              user_id: p.user_id,
              name: profile?.name || "Inconnu",
              avatar_url: profile?.avatar_url || null,
              role: profile?.role || "student",
            };
          }) || [];

        return {
          ...conv,
          participants: parts,
          lastMessage: msgs?.[0] || undefined,
          unreadCount: count || 0,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      // Get sender profiles
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", senderIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enriched = data.map(m => ({
        ...m,
        sender: profileMap.get(m.sender_id) || { name: "Inconnu", avatar_url: null },
      }));
      setMessages(enriched);

      // Mark unread messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", conversationId)
          .eq("read", false)
          .neq("sender_id", user.id);
      }
    }
    setLoading(false);
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          setMessages(prev => [
            ...prev,
            { ...newMsg, sender: profile || { name: "Inconnu", avatar_url: null } },
          ]);

          // Mark as read if not from current user
          if (user && newMsg.sender_id !== user.id) {
            await supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}

export async function createConversation(currentUserId: string, otherUserId: string) {
  // Check if conversation already exists between these two users
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (myConvs?.length) {
    for (const mc of myConvs) {
      const { data: otherParticipant } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", mc.conversation_id)
        .eq("user_id", otherUserId)
        .single();

      if (otherParticipant) {
        return mc.conversation_id;
      }
    }
  }

  // Create new conversation (generate id client-side to avoid SELECT policy dependency right after INSERT)
  const conversationId = crypto.randomUUID();
  const { error: convError } = await supabase
    .from("conversations")
    .insert({ id: conversationId });

  if (convError) throw new Error("Failed to create conversation: " + convError.message);

  // Add current user first (RLS allows user_id = auth.uid())
  const { error: err1 } = await supabase.from("conversation_participants").insert(
    { conversation_id: conversationId, user_id: currentUserId }
  );
  if (err1) throw new Error("Failed to add current user: " + err1.message);

  // Then add other user (RLS allows because current user already participates)
  const { error: err2 } = await supabase.from("conversation_participants").insert(
    { conversation_id: conversationId, user_id: otherUserId }
  );
  if (err2) throw new Error("Failed to add other user: " + err2.message);

  return conversationId;
}
