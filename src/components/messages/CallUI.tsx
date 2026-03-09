import { Phone, PhoneOff, MicOff, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CallStatus } from "@/hooks/use-call";

interface IncomingCallDialogProps {
  remoteName: string | null;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({ remoteName, onAccept, onReject }: IncomingCallDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
              {remoteName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center animate-pulse">
            <Phone className="w-3.5 h-3.5 text-white" />
          </span>
        </div>

        <div>
          <p className="text-lg font-semibold text-foreground">{remoteName || "Utilisateur"}</p>
          <p className="text-sm text-muted-foreground animate-pulse">Appel entrant...</p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onReject}
            className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors shadow-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={onAccept}
            className="w-14 h-14 rounded-full bg-success flex items-center justify-center text-white hover:bg-success/90 transition-colors shadow-lg animate-pulse"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ActiveCallBarProps {
  status: CallStatus;
  remoteName: string | null;
  isMuted: boolean;
  duration: string;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export function ActiveCallBar({ status, remoteName, isMuted, duration, onToggleMute, onEndCall }: ActiveCallBarProps) {
  const statusText = status === "calling"
    ? "Appel en cours..."
    : status === "connected"
      ? duration
      : status === "ended"
        ? "Appel terminé"
        : "";

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 border-b border-border transition-colors",
      status === "connected" ? "bg-success/10" : status === "calling" ? "bg-warning/10" : "bg-muted"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        status === "connected" ? "bg-success/20" : "bg-warning/20"
      )}>
        <Phone className={cn(
          "w-4 h-4",
          status === "connected" ? "text-success" : "text-warning",
          status === "calling" && "animate-pulse"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {remoteName || "Utilisateur"}
        </p>
        <p className={cn(
          "text-xs",
          status === "connected" ? "text-success" : "text-muted-foreground"
        )}>
          {statusText}
        </p>
      </div>

      {status === "connected" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className={cn(
            "shrink-0 rounded-full w-9 h-9",
            isMuted && "bg-destructive/10 text-destructive"
          )}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      )}

      <button
        onClick={onEndCall}
        className="shrink-0 w-9 h-9 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors"
      >
        <PhoneOff className="w-4 h-4" />
      </button>
    </div>
  );
}
