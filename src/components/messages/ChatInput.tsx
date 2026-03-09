import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface ChatInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachment?: { url: string; name: string; type: string }) => Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ChatInput({ conversationId, onSendMessage }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      await onSendMessage(message.trim() || (file ? file.name : ""), attachment);
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-3 border-t border-border space-y-2">
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
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Écrivez un message..."
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
