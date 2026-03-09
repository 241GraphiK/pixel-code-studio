import { Phone, PhoneIncoming, PhoneMissed, PhoneOff, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CallLog } from "@/hooks/use-call-logs";

interface CallLogEntryProps {
  log: CallLog;
  currentUserId: string;
}

export function CallLogEntry({ log, currentUserId }: CallLogEntryProps) {
  const isOutgoing = log.caller_id === currentUserId;
  const isVideo = log.mode === "video";
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getIcon = () => {
    if (log.status === "missed") return <PhoneMissed className="w-4 h-4 text-destructive" />;
    if (log.status === "rejected") return <PhoneOff className="w-4 h-4 text-destructive" />;
    if (isVideo) return <Video className="w-4 h-4 text-success" />;
    if (isOutgoing) return <Phone className="w-4 h-4 text-success" />;
    return <PhoneIncoming className="w-4 h-4 text-success" />;
  };

  const getLabel = () => {
    if (log.status === "missed") return isOutgoing ? "Appel manqué" : "Appel manqué";
    if (log.status === "rejected") return isOutgoing ? "Appel refusé" : "Appel refusé";
    const type = isVideo ? "Appel vidéo" : "Appel vocal";
    const direction = isOutgoing ? "sortant" : "entrant";
    return `${type} ${direction}`;
  };

  return (
    <div className="flex justify-center my-2">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-xs",
        "bg-muted/60 text-muted-foreground border border-border/50"
      )}>
        {getIcon()}
        <span className="font-medium">{getLabel()}</span>
        {log.status === "completed" && log.duration > 0 && (
          <span className="text-muted-foreground/70">({formatDuration(log.duration)})</span>
        )}
        <span className="text-muted-foreground/50">
          {format(new Date(log.created_at), "HH:mm", { locale: fr })}
        </span>
      </div>
    </div>
  );
}
