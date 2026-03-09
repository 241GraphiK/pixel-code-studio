import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function OnlineIndicator({ isOnline, size = "sm", className }: OnlineIndicatorProps) {
  return (
    <span
      className={cn(
        "rounded-full border-2 border-background",
        isOnline ? "bg-green-500" : "bg-muted-foreground/40",
        size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
        className
      )}
      title={isOnline ? "En ligne" : "Hors ligne"}
    />
  );
}
