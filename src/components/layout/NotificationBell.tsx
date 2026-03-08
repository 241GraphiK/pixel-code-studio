import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, MessageSquare, Trophy, GraduationCap, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  message: { icon: MessageSquare, color: "text-blue-500" },
  badge: { icon: Trophy, color: "text-amber-500" },
  class: { icon: GraduationCap, color: "text-emerald-500" },
  info: { icon: Info, color: "text-primary" },
};

export default function NotificationBell({ collapsed }: { collapsed?: boolean }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = (notif: Notification) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Bell className="w-5 h-5" />
          {!collapsed && <span>Notifications</span>}
          {unreadCount > 0 && (
            <span className={cn(
              "absolute flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold",
              collapsed ? "top-1 right-1 w-4 h-4" : "top-1.5 left-6 w-4 h-4"
            )}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-0"
        sideOffset={12}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3 mr-1" />
              Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            notifications.map(notif => {
              const config = typeConfig[notif.type] || typeConfig.info;
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0",
                    !notif.read && "bg-primary/5"
                  )}
                  onClick={() => handleClick(notif)}
                >
                  <div className={cn("mt-0.5 shrink-0", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm truncate", !notif.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                    className="shrink-0 mt-0.5 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
