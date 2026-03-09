import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, Video, FileText, ClipboardList, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  event_date: string | null;
  end_date?: string | null;
  link_url?: string | null;
  location?: string | null;
  color?: string;
  is_all_day?: boolean;
  class_name?: string;
  class_id?: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  showClassName?: boolean;
}

const colorMap: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-green-500 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-blue-500 text-white",
  purple: "bg-purple-500 text-white",
};

const typeIcons: Record<string, typeof CalIcon> = {
  qcm: ClipboardList,
  evaluation: FileText,
  visio: Video,
  other: CalIcon,
};

export default function EventCalendar({ events, onEventClick, onDateClick, showClassName = false }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDay = startOfMonth(currentMonth).getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1; // Monday-based

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      if (!e.event_date) return false;
      const eventDate = parseISO(e.event_date);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Aujourd'hui
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Padding cells */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-24 p-1 border-b border-r border-border bg-muted/30" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "min-h-24 p-1 border-b border-r border-border transition-colors cursor-pointer hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1",
                today && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map(ev => {
                  const colorClass = colorMap[ev.color || "primary"] || colorMap.primary;
                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                      className={cn(
                        "text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                        colorClass
                      )}
                      title={ev.title}
                    >
                      {!ev.is_all_day && ev.event_date && (
                        <span className="opacity-75 mr-0.5">{format(parseISO(ev.event_date), "HH:mm")}</span>
                      )}
                      {ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} autres</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming events list */}
      <div className="p-4 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Prochains événements</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events
            .filter(e => e.event_date && new Date(e.event_date) >= new Date())
            .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
            .slice(0, 5)
            .map(ev => {
              const Icon = typeIcons[ev.type] || CalIcon;
              const colorClass = colorMap[ev.color || "primary"] || colorMap.primary;
              return (
                <div
                  key={ev.id}
                  onClick={() => onEventClick?.(ev)}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className={cn("p-1.5 rounded", colorClass.split(" ")[0], "bg-opacity-20")}>
                    <Icon className={cn("w-3.5 h-3.5", colorClass.split(" ")[0].replace("bg-", "text-"))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {ev.event_date && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(ev.event_date), "dd MMM HH:mm", { locale: fr })}
                        </span>
                      )}
                      {showClassName && ev.class_name && (
                        <Badge variant="outline" className="text-[10px] py-0">{ev.class_name}</Badge>
                      )}
                    </div>
                    {ev.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{ev.location}
                      </p>
                    )}
                  </div>
                  {ev.link_url && (
                    <a
                      href={ev.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          {events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">Aucun événement à venir</p>
          )}
        </div>
      </div>
    </div>
  );
}
