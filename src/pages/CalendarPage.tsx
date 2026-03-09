import { useState, useEffect } from "react";
import { Calendar as CalIcon, Plus, Filter } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import EventCalendar, { type CalendarEvent } from "@/components/calendar/EventCalendar";
import EventFormDialog, { type EventFormData } from "@/components/calendar/EventFormDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface ClassOption {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const { user, profile } = useAuth();
  const isTeacher = profile?.role === "teacher" || profile?.role === "admin";
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Event form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Event detail view
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);

  const fetchData = async () => {
    if (!user) return;

    // Fetch classes user has access to
    const { data: memberships } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("user_id", user.id);

    const memberClassIds = memberships?.map(m => m.class_id) || [];

    // Also get classes where user is teacher
    const { data: teacherClasses } = await supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", user.id);

    const allClassIds = [...new Set([...memberClassIds, ...(teacherClasses?.map(c => c.id) || [])])];

    if (allClassIds.length === 0) {
      setEvents([]);
      setClasses([]);
      setLoading(false);
      return;
    }

    // Fetch class info
    const { data: classData } = await supabase
      .from("classes")
      .select("id, name")
      .in("id", allClassIds);

    setClasses(classData || []);

    // Fetch all events from these classes
    const { data: eventsData } = await supabase
      .from("class_events")
      .select("*")
      .in("class_id", allClassIds)
      .order("event_date", { ascending: true });

    const classMap = new Map((classData || []).map(c => [c.id, c.name]));

    const mappedEvents: CalendarEvent[] = (eventsData || []).map(e => ({
      ...e,
      class_name: classMap.get(e.class_id) || "",
    }));

    setEvents(mappedEvents);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredEvents = filterClass === "all"
    ? events
    : events.filter(e => e.class_id === filterClass);

  const handleEventClick = (event: CalendarEvent) => {
    setViewEvent(event);
  };

  const handleDateClick = (date: Date) => {
    if (!isTeacher) return;
    setEditingEvent(null);
    setSelectedClassId(classes[0]?.id || "");
    setFormOpen(true);
  };

  const handleSaveEvent = async (data: EventFormData) => {
    if (!selectedClassId) {
      toast.error("Veuillez sélectionner une classe");
      return;
    }

    const payload = {
      class_id: selectedClassId,
      title: data.title,
      description: data.description || null,
      type: data.type,
      event_date: data.event_date || null,
      end_date: data.end_date || null,
      link_url: data.link_url || null,
      location: data.location || null,
      color: data.color,
      is_all_day: data.is_all_day,
      reminder_minutes: data.reminder_minutes,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from("class_events")
        .update(payload)
        .eq("id", editingEvent.id);
      if (error) toast.error(error.message);
      else toast.success("Événement modifié");
    } else {
      const { error } = await supabase.from("class_events").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Événement créé");
    }

    setFormOpen(false);
    setEditingEvent(null);
    fetchData();
  };

  const handleDeleteEvent = async () => {
    if (!viewEvent) return;
    if (!confirm("Supprimer cet événement ?")) return;

    const { error } = await supabase.from("class_events").delete().eq("id", viewEvent.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Événement supprimé");
      setViewEvent(null);
      fetchData();
    }
  };

  const handleEditEvent = () => {
    if (!viewEvent) return;
    setEditingEvent(viewEvent);
    setSelectedClassId(viewEvent.class_id || "");
    setViewEvent(null);
    setFormOpen(true);
  };

  const typeLabels: Record<string, string> = {
    qcm: "QCM", evaluation: "Évaluation", visio: "Visioconférence",
    cours: "Cours", deadline: "Date limite", reunion: "Réunion", other: "Autre"
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalIcon className="w-6 h-6 text-primary" /> Calendrier
            </h1>
            <p className="text-muted-foreground">Tous vos événements au même endroit</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isTeacher && classes.length > 0 && (
              <Button onClick={() => { setEditingEvent(null); setSelectedClassId(classes[0]?.id || ""); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Événement
              </Button>
            )}
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune classe</p>
            <p className="text-sm">Rejoignez une classe pour voir ses événements</p>
          </div>
        ) : (
          <EventCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            showClassName
          />
        )}
      </div>

      {/* Event form */}
      {formOpen && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Classe *</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveEvent}
        initialData={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description || "",
          type: editingEvent.type,
          event_date: editingEvent.event_date || "",
          end_date: editingEvent.end_date || "",
          link_url: editingEvent.link_url || "",
          location: editingEvent.location || "",
          color: editingEvent.color || "primary",
          is_all_day: editingEvent.is_all_day || false,
          reminder_minutes: null,
        } : undefined}
        isEditing={!!editingEvent}
      />

      {/* Event detail view */}
      <Dialog open={!!viewEvent} onOpenChange={(o) => !o && setViewEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewEvent?.title}</DialogTitle>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{typeLabels[viewEvent.type] || viewEvent.type}</Badge>
                {viewEvent.class_name && <Badge variant="outline">{viewEvent.class_name}</Badge>}
              </div>
              {viewEvent.event_date && (
                <p className="text-sm text-muted-foreground">
                  📅 {format(parseISO(viewEvent.event_date), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  {viewEvent.end_date && ` → ${format(parseISO(viewEvent.end_date), "HH:mm", { locale: fr })}`}
                </p>
              )}
              {viewEvent.location && <p className="text-sm text-muted-foreground">📍 {viewEvent.location}</p>}
              {viewEvent.description && <p className="text-sm">{viewEvent.description}</p>}
              {viewEvent.link_url && (
                <a href={viewEvent.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  🔗 Ouvrir le lien
                </a>
              )}
              {isTeacher && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={handleEditEvent}>Modifier</Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>Supprimer</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
