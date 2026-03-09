import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X, Loader2, Reply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Message } from "@/hooks/use-messages";

interface ChatInputProps {
  conversationId: string;
  replyTo?: Message | null;
  onClearReply?: () => void;
  onSendMessage: (content: string, attachment?: { url: string; name: string; type: string }, replyToId?: string) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ChatInput({ conversationId, replyTo, onClearReply, onSendMessage, onTyping, onStopTyping }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 2000);
  }, [onTyping, onStopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    setFile(selected);
  };

  const handleSend = async () => {
    if (!message.trim() && !file) return;
    setUploading(true);

    try {
      let attachment: { url: string; name: string; type: string } | undefined;

      if (file && user) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${conversationId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(path, file);

        if (uploadError) {
          toast.error("Erreur lors de l'envoi du fichier");
          setUploading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("message-attachments")
          .getPublicUrl(path);

        attachment = {
          url: urlData.publicUrl,
          name: file.name,
          type: file.type,
        };
      }

      await onSendMessage(message.trim() || (file ? file.name : ""), attachment, replyTo?.id);
      setMessage("");
      setFile(null);
      onClearReply?.();
      onStopTyping?.();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 border-t border-border space-y-2">
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg text-sm border-l-2 border-primary">
          <Reply className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">{replyTo.sender?.name || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <button onClick={onClearReply}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
      {file && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
          <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="truncate flex-1 text-foreground">{file.name}</span>
          <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}
      <form
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        className="flex items-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          placeholder={replyTo ? "Répondre..." : "Écrivez un message..."}
          className="flex-1"
          disabled={uploading}
        />
        <Button type="submit" size="icon" disabled={(!message.trim() && !file) || uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
