import { FileText, Download, Play, Image as ImageIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageAttachmentProps {
  url: string;
  name: string;
  type: string;
  isMe: boolean;
}

function getFileCategory(type: string): "image" | "video" | "pdf" | "document" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/") || type.includes("youtube") || type.includes("vimeo")) return "video";
  if (type === "application/pdf") return "pdf";
  return "document";
}

function getFileIcon(category: string) {
  switch (category) {
    case "image": return ImageIcon;
    case "video": return Play;
    case "pdf": return FileText;
    default: return File;
  }
}

export function MessageAttachment({ url, name, type, isMe }: MessageAttachmentProps) {
  const category = getFileCategory(type);
  const Icon = getFileIcon(category);

  if (category === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={url}
          alt={name}
          className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </a>
    );
  }

  if (category === "video") {
    return (
      <video
        src={url}
        controls
        className="max-w-full max-h-64 rounded-lg"
        preload="metadata"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        isMe
          ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
          : "bg-background/50 hover:bg-background/80"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs truncate flex-1">{name}</span>
      <Download className="w-4 h-4 shrink-0 opacity-60" />
    </a>
  );
}
