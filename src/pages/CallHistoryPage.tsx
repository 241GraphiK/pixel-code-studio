import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, PhoneIncoming, PhoneMissed, PhoneOff, PhoneOutgoing, Video } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CallLogFull {
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

type FilterType = "all" | "missed" | "video" | "audio";

export default function CallHistoryPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallLogFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchCalls = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("call_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const userIds = [...new Set(data.flatMap((c) => [c.caller_id, c.receiver_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enriched: CallLogFull[] = data.map((log) => ({
        ...log,
        caller: profileMap.get(log.caller_id) || { name: "Inconnu", avatar_url: null },
        receiver: profileMap.get(log.receiver_id) || { name: "Inconnu", avatar_url: null },
      }));
      setCalls(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const filtered = calls.filter((c) => {
    if (filter === "missed") return c.status === "missed" || c.status === "rejected";
    if (filter === "video") return c.mode === "video";
    if (filter === "audio") return c.mode === "audio";
    return true;
  });

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getIcon = (log: CallLogFull) => {
    if (log.status === "missed") return <PhoneMissed className="w-5 h-5 text-destructive" />;
    if (log.status === "rejected") return <PhoneOff className="w-5 h-5 text-destructive" />;
    if (log.mode === "video") return <Video className="w-5 h-5 text-primary" />;
    if (log.caller_id === user?.id) return <PhoneOutgoing className="w-5 h-5 text-green-500" />;
    return <PhoneIncoming className="w-5 h-5 text-green-500" />;
  };

  const getContactName = (log: CallLogFull) => {
    if (log.caller_id === user?.id) return log.receiver?.name || "Inconnu";
    return log.caller?.name || "Inconnu";
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getStatusLabel = (log: CallLogFull) => {
    const isOutgoing = log.caller_id === user?.id;
    if (log.status === "missed") return "Manqué";
    if (log.status === "rejected") return "Refusé";
    const type = log.mode === "video" ? "Vidéo" : "Vocal";
    return `${type} · ${isOutgoing ? "Sortant" : "Entrant"}`;
  };

  const missedCount = calls.filter((c) => c.status === "missed" || c.status === "rejected").length;
  const videoCount = calls.filter((c) => c.mode === "video").length;
  const audioCount = calls.filter((c) => c.mode === "audio").length;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique des appels</h1>
          <p className="text-sm text-muted-foreground mt-1">{calls.length} appel{calls.length !== 1 ? "s" : ""} au total</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="cursor-pointer hover:border-destructive/50 transition-colors" onClick={() => setFilter("missed")}>
            <CardContent className="p-4 text-center">
              <PhoneMissed className="w-5 h-5 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold text-foreground">{missedCount}</p>
              <p className="text-xs text-muted-foreground">Manqués</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter("video")}>
            <CardContent className="p-4 text-center">
              <Video className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{videoCount}</p>
              <p className="text-xs text-muted-foreground">Vidéo</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setFilter("audio")}>
            <CardContent className="p-4 text-center">
              <Phone className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">{audioCount}</p>
              <p className="text-xs text-muted-foreground">Audio</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
            <TabsTrigger value="missed" className="flex-1">Manqués</TabsTrigger>
            <TabsTrigger value="video" className="flex-1">Vidéo</TabsTrigger>
            <TabsTrigger value="audio" className="flex-1">Audio</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* List */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Aucun appel trouvé</div>
            ) : (
              filtered.map((log) => {
                const contactName = getContactName(log);
                const isMissed = log.status === "missed" || log.status === "rejected";
                return (
                  <div key={log.id} className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {getInitials(contactName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isMissed && "text-destructive")}>
                        {contactName}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getIcon(log)}
                        <span>{getStatusLabel(log)}</span>
                        {log.status === "completed" && log.duration > 0 && (
                          <span>· {formatDuration(log.duration)}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(log.created_at), "dd MMM HH:mm", { locale: fr })}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
