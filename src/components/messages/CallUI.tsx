import { useRef, useEffect } from "react";
import { Phone, PhoneOff, MicOff, Mic, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CallStatus, CallMode } from "@/hooks/use-call";

interface IncomingCallDialogProps {
  remoteName: string | null;
  mode: CallMode;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallDialog({ remoteName, mode, onAccept, onReject }: IncomingCallDialogProps) {
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
            {mode === "video" ? <Video className="w-3.5 h-3.5 text-white" /> : <Phone className="w-3.5 h-3.5 text-white" />}
          </span>
        </div>

        <div>
          <p className="text-lg font-semibold text-foreground">{remoteName || "Utilisateur"}</p>
          <p className="text-sm text-muted-foreground animate-pulse">
            {mode === "video" ? "Appel vidéo entrant..." : "Appel entrant..."}
          </p>
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
            {mode === "video" ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ActiveCallBarProps {
  status: CallStatus;
  remoteName: string | null;
  mode: CallMode;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export function ActiveCallBar({ status, remoteName, mode, isMuted, isVideoOff, duration, onToggleMute, onToggleVideo, onEndCall }: ActiveCallBarProps) {
  const statusText = status === "calling"
    ? (mode === "video" ? "Appel vidéo en cours..." : "Appel en cours...")
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
        {mode === "video" ? (
          <Video className={cn("w-4 h-4", status === "connected" ? "text-success" : "text-warning", status === "calling" && "animate-pulse")} />
        ) : (
          <Phone className={cn("w-4 h-4", status === "connected" ? "text-success" : "text-warning", status === "calling" && "animate-pulse")} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{remoteName || "Utilisateur"}</p>
        <p className={cn("text-xs", status === "connected" ? "text-success" : "text-muted-foreground")}>{statusText}</p>
      </div>

      {status === "connected" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMute}
            className={cn("shrink-0 rounded-full w-9 h-9", isMuted && "bg-destructive/10 text-destructive")}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          {mode === "video" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleVideo}
              className={cn("shrink-0 rounded-full w-9 h-9", isVideoOff && "bg-destructive/10 text-destructive")}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
          )}
        </>
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

interface VideoCallOverlayProps {
  status: CallStatus;
  remoteName: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onSetRefs: (local: HTMLVideoElement | null, remote: HTMLVideoElement | null) => void;
}

export function VideoCallOverlay({ status, remoteName, isMuted, isVideoOff, duration, onToggleMute, onToggleVideo, onEndCall, onSetRefs }: VideoCallOverlayProps) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    onSetRefs(localRef.current, remoteRef.current);
  }, [onSetRefs]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote video */}
      <div className="flex-1 relative">
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {status === "calling" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-white/10 text-white font-bold">
                  {remoteName?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <p className="text-lg font-semibold">{remoteName}</p>
              <p className="text-sm text-white/60 animate-pulse">Appel vidéo en cours...</p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-32 h-44 sm:w-40 sm:h-56 rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className={cn("w-full h-full object-cover", isVideoOff && "hidden")}
          />
          {isVideoOff && (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Duration */}
        {status === "connected" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {duration}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm px-6 py-5 flex items-center justify-center gap-5">
        <button
          onClick={onToggleMute}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isMuted ? "bg-white text-black" : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={onToggleVideo}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isVideoOff ? "bg-white text-black" : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
