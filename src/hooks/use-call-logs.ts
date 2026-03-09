import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CallLog {
  id: string;
  conversation_id: string;
  caller_id: string;
  receiver_id: string;
  mode: string;
  status: string;
  duration: number;
  created_at: string;
  caller?: { name: string; avatar_url: string | null };
  receiver?: { name: string; avatar_url: string | null };
}

export function useCallLogs(conversationId: string | null) {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCallLogs = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);

    const { data } = await supabase
      .from("call_logs" as any)
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set((data as any[]).flatMap((c: any) => [c.caller_id, c.receiver_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enriched = (data as any[]).map((log: any) => ({
        ...log,
        caller: profileMap.get(log.caller_id) || { name: "Inconnu", avatar_url: null },
        receiver: profileMap.get(log.receiver_id) || { name: "Inconnu", avatar_url: null },
      }));
      setCallLogs(enriched);
    }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchCallLogs();
  }, [fetchCallLogs]);

  return { callLogs, loading, refetch: fetchCallLogs };
}
