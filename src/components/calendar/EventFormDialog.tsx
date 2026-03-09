import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Video, Link2, Bell, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface EventFormData {
  title: string;
  description: string;
  type: string;
  event_date: string;
  end_date: string;
  link_url: string;
  location: string;
  color: string;
  is_all_day: boolean;
  reminder_minutes: number | null;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  isEditing?: boolean;
}

const eventTypes = [
  { value: "qcm", label: "QCM" },
  { value: "evaluation", label: "Évaluation" },
  { value: "visio", label: "Visioconférence" },
  { value: "cours", label: "Cours" },
  { value: "deadline", label: "Date limite" },
  { value: "reunion", label: "Réunion" },
  { value: "other", label: "Autre" },
];

const colorOptions = [
  { value: "primary", label: "Bleu", class: "bg-primary" },
  { value: "destructive", label: "Rouge", class: "bg-destructive" },
  { value: "success", label: "Vert", class: "bg-green-500" },
  { value: "warning", label: "Orange", class: "bg-amber-500" },
  { value: "info", label: "Cyan", class: "bg-blue-500" },
  { value: "purple", label: "Violet", class: "bg-purple-500" },
];

const reminderOptions = [
  { value: null, label: "Pas de rappel" },
  { value: 5, label: "5 minutes avant" },
  { value: 15, label: "15 minutes avant" },
  { value: 30, label: "30 minutes avant" },
  { value: 60, label: "1 heure avant" },
  { value: 1440, label: "1 jour avant" },
];

const defaultFormData: EventFormData = {
  title: "",
  description: "",
  type: "other",
  event_date: "",
  end_date: "",
  link_url: "",
  location: "",
  color: "primary",
  is_all_day: false,
  reminder_minutes: null,
};

export default function EventFormDialog({ open, onOpenChange, onSave, initialData, isEditing = false }: EventFormDialogProps) {
  const [form, setForm] = useState<EventFormData>(defaultFormData);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (open) {
      const data = { ...defaultFormData, ...initialData };
      setForm(data);
      if (data.event_date) setStartDate(new Date(data.event_date));
      if (data.end_date) setEndDate(new Date(data.end_date));
    }
  }, [open, initialData]);

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      const timeStr = form.event_date ? form.event_date.split("T")[1] || "09:00" : "09:00";
      setForm(f => ({ ...f, event_date: `${format(date, "yyyy-MM-dd")}T${timeStr}` }));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      const timeStr = form.end_date ? form.end_date.split("T")[1] || "10:00" : "10:00";
      setForm(f => ({ ...f, end_date: `${format(date, "yyyy-MM-dd")}T${timeStr}` }));
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Titre de l'événement"
            />
          </div>

          {/* Type & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {eventTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Palette className="w-3.5 h-3.5" />Couleur</Label>
              <Select value={form.color} onValueChange={v => setForm(f => ({ ...f, color: v }))}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", colorOptions.find(c => c.value === form.color)?.class)} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", c.class)} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* All day toggle */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Toute la journée
            </Label>
            <Switch
              checked={form.is_all_day}
              onCheckedChange={v => setForm(f => ({ ...f, is_all_day: v }))}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: fr }) : "Choisir"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            {!form.is_all_day && (
              <div className="space-y-1.5">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={form.event_date?.split("T")[1]?.slice(0, 5) || "09:00"}
                  onChange={e => {
                    const datePart = form.event_date?.split("T")[0] || format(new Date(), "yyyy-MM-dd");
                    setForm(f => ({ ...f, event_date: `${datePart}T${e.target.value}` }));
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", { locale: fr }) : "Optionnel"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={handleEndDateSelect} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            {!form.is_all_day && endDate && (
              <div className="space-y-1.5">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={form.end_date?.split("T")[1]?.slice(0, 5) || "10:00"}
                  onChange={e => {
                    const datePart = form.end_date?.split("T")[0] || format(new Date(), "yyyy-MM-dd");
                    setForm(f => ({ ...f, end_date: `${datePart}T${e.target.value}` }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Lieu</Label>
            <Input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Salle, bâtiment, adresse..."
            />
          </div>

          {/* Link (for visio/online) */}
          {(form.type === "visio" || form.type === "reunion") && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Link2 className="w-3.5 h-3.5" />Lien de visio</Label>
              <Input
                value={form.link_url}
                onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                placeholder="https://zoom.us/j/... ou https://meet.google.com/..."
              />
            </div>
          )}

          {/* Reminder */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" />Rappel</Label>
            <Select
              value={form.reminder_minutes?.toString() || "null"}
              onValueChange={v => setForm(f => ({ ...f, reminder_minutes: v === "null" ? null : parseInt(v) }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {reminderOptions.map(r => (
                  <SelectItem key={r.value?.toString() || "null"} value={r.value?.toString() || "null"}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim()}>
              {isEditing ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
