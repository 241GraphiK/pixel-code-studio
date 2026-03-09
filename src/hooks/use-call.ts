import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";
export type CallMode = "audio" | "video";

interface CallState {
  status: CallStatus;
  conversationId: string | null;
  remoteUserId: string | null;
  remoteName: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  mode: CallMode;
  duration: number;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useCall(userId: string | undefined, userName: string | undefined) {
  const [state, setState] = useState<CallState>({
    status: "idle",
    conversationId: null,
    remoteUserId: null,
    remoteName: null,
    isMuted: false,
    isVideoOff: false,
    mode: "audio",
    duration: 0,
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteAudio = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const incomingModeRef = useRef<CallMode>("audio");

  // Setup remote audio element
  useEffect(() => {
    if (!remoteAudio.current) {
      remoteAudio.current = new Audio();
      remoteAudio.current.autoplay = true;
    }
    return () => {
      cleanup();
    };
  }, []);

  // Listen for incoming calls on all conversations the user participates in
  useEffect(() => {
    if (!userId) return;

    const globalChannel = supabase
      .channel(`calls-user-${userId}`)
      .on("broadcast", { event: "call-offer" }, async ({ payload }) => {
        if (payload.targetUserId !== userId) return;
        if (state.status !== "idle") {
          // Already in a call, reject
          supabase.channel(`calls-user-${payload.callerId}`).send({
            type: "broadcast",
            event: "call-rejected",
            payload: { targetUserId: payload.callerId, reason: "busy" },
          });
          return;
        }

        incomingOfferRef.current = payload.offer;
        incomingModeRef.current = payload.mode || "audio";
        setState((prev) => ({
          ...prev,
          status: "ringing",
          conversationId: payload.conversationId,
          remoteUserId: payload.callerId,
          remoteName: payload.callerName,
          mode: payload.mode || "audio",
        }));
      })
      .on("broadcast", { event: "call-rejected" }, ({ payload }) => {
        if (payload.targetUserId !== userId) return;
        cleanup();
        setState({
          status: "ended",
          conversationId: null,
          remoteUserId: null,
          remoteName: null,
          isMuted: false,
          isVideoOff: false,
          mode: "audio",
          duration: 0,
        });
        setTimeout(() => setState((p) => (p.status === "ended" ? { ...p, status: "idle" } : p)), 2000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [userId, state.status]);

  const getSignalingChannel = useCallback(
    (conversationId: string) => {
      if (channelRef.current) return channelRef.current;
      const channel = supabase.channel(`call-signaling-${conversationId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "call-answer" }, async ({ payload }) => {
          if (!peerConnection.current) return;
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(payload.answer)
          );
          setState((prev) => ({ ...prev, status: "connected" }));
          startDurationTimer();
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
          if (!peerConnection.current || payload.senderId === userId) return;
          try {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(payload.candidate)
            );
          } catch (e) {
            console.error("Error adding ICE candidate:", e);
          }
        })
        .on("broadcast", { event: "call-end" }, ({ payload }) => {
          if (payload.senderId === userId) return;
          cleanup();
          setState({
            status: "ended",
            conversationId: null,
            remoteUserId: null,
            remoteName: null,
            isMuted: false,
            duration: 0,
          });
          setTimeout(
            () => setState((p) => (p.status === "ended" ? { ...p, status: "idle" } : p)),
            2000
          );
        })
        .subscribe();

      return channel;
    },
    [userId]
  );

  const startDurationTimer = () => {
    if (durationInterval.current) clearInterval(durationInterval.current);
    durationInterval.current = setInterval(() => {
      setState((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  };

  const cleanup = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (remoteAudio.current) {
      remoteAudio.current.srcObject = null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (conversationId: string) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const channel = getSignalingChannel(conversationId);
          channel.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: { candidate: event.candidate.toJSON(), senderId: userId },
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudio.current && event.streams[0]) {
          remoteAudio.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          endCall();
        }
      };

      return pc;
    },
    [userId, getSignalingChannel]
  );

  const startCall = useCallback(
    async (conversationId: string, targetUserId: string, targetName: string) => {
      if (!userId || !userName) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current = stream;

        const pc = createPeerConnection(conversationId);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Ensure signaling channel is subscribed
        getSignalingChannel(conversationId);

        // Send offer via the target user's personal channel
        const targetChannel = supabase.channel(`calls-user-${targetUserId}`);
        targetChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            targetChannel.send({
              type: "broadcast",
              event: "call-offer",
              payload: {
                offer: offer,
                callerId: userId,
                callerName: userName,
                targetUserId: targetUserId,
                conversationId: conversationId,
              },
            });
            setTimeout(() => supabase.removeChannel(targetChannel), 2000);
          }
        });

        setState({
          status: "calling",
          conversationId,
          remoteUserId: targetUserId,
          remoteName: targetName,
          isMuted: false,
          duration: 0,
        });

        // Auto-end after 30s if no answer
        setTimeout(() => {
          setState((prev) => {
            if (prev.status === "calling") {
              cleanup();
              return {
                status: "ended",
                conversationId: null,
                remoteUserId: null,
                remoteName: null,
                isMuted: false,
                duration: 0,
              };
            }
            return prev;
          });
          setTimeout(
            () => setState((p) => (p.status === "ended" ? { ...p, status: "idle" } : p)),
            2000
          );
        }, 30000);
      } catch (e) {
        console.error("Failed to start call:", e);
        cleanup();
        setState((prev) => ({ ...prev, status: "idle" }));
      }
    },
    [userId, userName, createPeerConnection, getSignalingChannel, cleanup]
  );

  const acceptCall = useCallback(async () => {
    if (!state.conversationId || !incomingOfferRef.current || !userId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      const pc = createPeerConnection(state.conversationId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingOfferRef.current)
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const channel = getSignalingChannel(state.conversationId);
      channel.send({
        type: "broadcast",
        event: "call-answer",
        payload: { answer: answer },
      });

      incomingOfferRef.current = null;
      setState((prev) => ({ ...prev, status: "connected" }));
      startDurationTimer();
    } catch (e) {
      console.error("Failed to accept call:", e);
      cleanup();
      setState((prev) => ({ ...prev, status: "idle" }));
    }
  }, [state.conversationId, userId, createPeerConnection, getSignalingChannel, cleanup]);

  const rejectCall = useCallback(() => {
    if (state.remoteUserId) {
      const rejectChannel = supabase.channel(`calls-user-${state.remoteUserId}`);
      rejectChannel
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            rejectChannel.send({
              type: "broadcast",
              event: "call-rejected",
              payload: { targetUserId: state.remoteUserId, reason: "declined" },
            });
            setTimeout(() => supabase.removeChannel(rejectChannel), 1000);
          }
        });
    }
    incomingOfferRef.current = null;
    cleanup();
    setState({
      status: "idle",
      conversationId: null,
      remoteUserId: null,
      remoteName: null,
      isMuted: false,
      duration: 0,
    });
  }, [state.remoteUserId, cleanup]);

  const endCall = useCallback(() => {
    if (state.conversationId && channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "call-end",
        payload: { senderId: userId },
      });
    }
    cleanup();
    setState({
      status: "ended",
      conversationId: null,
      remoteUserId: null,
      remoteName: null,
      isMuted: false,
      duration: 0,
    });
    setTimeout(
      () => setState((p) => (p.status === "ended" ? { ...p, status: "idle" } : p)),
      2000
    );
  }, [state.conversationId, userId, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    callState: state,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    formatDuration,
  };
}
