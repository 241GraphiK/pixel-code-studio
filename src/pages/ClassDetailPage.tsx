import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Calendar, MessageCircle, UsersRound,
  Plus, Trash2, ArrowLeft, Send, Video, FileText, ClipboardList,
  Search, X, ExternalLink, MapPin, Clock
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import EventFormDialog, { EventFormData } from "@/components/calendar/EventFormDialog";
import { cn } from "@/lib/utils";

// ─── Types ───
interface ClassInfo { id: string; name: string; code: string; teacher_id: string; }
interface Member { id: string; user_id: string; name: string; email: string; joined_at: string; }
interface Module { id: string; title: string; field: string; level: string; }
interface ClassModule { id: string; module_id: string; title: string; field: string; level: string; }
interface Event { id: string; title: string; description: string | null; type: string; event_date: string | null; end_date: string | null; link_url: string | null; quiz_id: string | null; color: string | null; location: string | null; is_all_day: boolean | null; reminder_minutes: number | null; }
interface ChatMsg { id: string; content: string; sender_id: string; sender_name: string; created_at: string; group_id: string | null; }
interface Group { id: string; name: string; member_count: number; }

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Students
  const [members, setMembers] = useState<Member[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [allStudents, setAllStudents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addStudentSearch, setAddStudentSearch] = useState("");

  // Modules
  const [classModules, setClassModules] = useState<ClassModule[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [addModuleOpen, setAddModuleOpen] = useState(false);

  // Events
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatGroupId, setChatGroupId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ group_id: string; user_id: string; name: string }[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [addGroupMemberOpen, setAddGroupMemberOpen] = useState<string | null>(null);

  const isTeacher = classInfo?.teacher_id === user?.id || profile?.role === "admin";

  // ─── Fetch class info ───
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", id).single();
      if (data) setClassInfo(data);
      setLoading(false);
    })();
  }, [id]);

  // ─── Fetch members ───
  const fetchMembers = async () => {
    if (!id) return;
    const { data } = await supabase.from("class_members").select("id, user_id, joined_at").eq("class_id", id);
    if (!data) return;
    const userIds = data.map(m => m.user_id);
    if (userIds.length === 0) { setMembers([]); return; }
    const { data: profiles } = await supabase.from("profiles").select("id, name, email").in("id", userIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    setMembers(data.map(m => {
      const p = profileMap.get(m.user_id);
      return { id: m.id, user_id: m.user_id, name: p?.name || "", email: p?.email || "", joined_at: m.joined_at };
    }));
  };

  // ─── Fetch all students for adding ───
  const fetchAllStudents = async () => {
    const { data } = await supabase.from("profiles").select("id, name, email").eq("role", "student");
    setAllStudents(data || []);
  };

  // ─── Fetch class modules ───
  const fetchClassModules = async () => {
    if (!id) return;
    const { data } = await supabase.from("class_modules").select("id, module_id").eq("class_id", id);
    if (!data || data.length === 0) { setClassModules([]); return; }
    const moduleIds = data.map(cm => cm.module_id);
    const { data: mods } = await supabase.from("modules").select("id, title, field, level").in("id", moduleIds);
    const modMap = new Map((mods || []).map(m => [m.id, m]));
    setClassModules(data.map(cm => {
      const m = modMap.get(cm.module_id);
      return { id: cm.id, module_id: cm.module_id, title: m?.title || "", field: m?.field || "", level: m?.level || "" };
    }));
  };

  const fetchAvailableModules = async () => {
    if (!user) return;
    const { data } = await supabase.from("modules").select("id, title, field, level").eq("teacher_id", user.id);
    setAvailableModules(data || []);
  };

  // ─── Fetch events ───
  const fetchEvents = async () => {
    if (!id) return;
    const { data } = await supabase.from("class_events").select("*").eq("class_id", id).order("event_date", { ascending: true });
    setEvents(data || []);
  };

  // ─── Fetch groups ───
  const fetchGroups = async () => {
    if (!id) return;
    const { data: grps } = await supabase.from("student_groups").select("id, name").eq("class_id", id);
    if (!grps) { setGroups([]); return; }
    const { data: gm } = await supabase.from("group_members").select("group_id, user_id").in("group_id", grps.map(g => g.id));
    const gmList = gm || [];
    setGroups(grps.map(g => ({ ...g, member_count: gmList.filter(m => m.group_id === g.id).length })));
    
    // fetch group member names
    const userIds = [...new Set(gmList.map(m => m.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", userIds);
      const pMap = new Map((profiles || []).map(p => [p.id, p.name]));
      setGroupMembers(gmList.map(m => ({ group_id: m.group_id, user_id: m.user_id, name: pMap.get(m.user_id) || "" })));
    } else {
      setGroupMembers([]);
    }
  };

  // ─── Fetch chat messages ───
  const fetchMessages = async () => {
    if (!id) return;
    let query = supabase.from("class_messages").select("id, content, sender_id, created_at, group_id").eq("class_id", id);
    if (chatGroupId) {
      query = query.eq("group_id", chatGroupId);
    } else {
      query = query.is("group_id", null);
    }
    const { data } = await query.order("created_at", { ascending: true }).limit(200);
    if (!data) { setMessages([]); return; }
    const senderIds = [...new Set(data.map(m => m.sender_id))];
    const { data: profiles } = senderIds.length > 0
      ? await supabase.from("profiles").select("id, name").in("id", senderIds)
      : { data: [] };
    const pMap = new Map((profiles || []).map(p => [p.id, p.name]));
    setMessages(data.map(m => ({ ...m, sender_name: pMap.get(m.sender_id) || "Inconnu", description: null })));
  };

  useEffect(() => { if (id) { fetchMembers(); fetchClassModules(); fetchEvents(); fetchGroups(); } }, [id]);
  useEffect(() => { if (id) fetchMessages(); }, [id, chatGroupId]);

  // Realtime chat
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`class-chat-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "class_messages", filter: `class_id=eq.${id}` },
        () => { fetchMessages(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, chatGroupId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ─── Actions ───
  const addStudent = async (studentId: string) => {
    if (!id) return;
    if (members.some(m => m.user_id === studentId)) { toast.error("Déjà inscrit"); return; }
    const { error } = await supabase.from("class_members").insert({ class_id: id, user_id: studentId });
    if (error) toast.error(error.message); else { toast.success("Étudiant ajouté"); fetchMembers(); }
  };

  const removeStudent = async (membershipId: string) => {
    const { error } = await supabase.from("class_members").delete().eq("id", membershipId);
    if (error) toast.error(error.message); else { toast.success("Étudiant retiré"); fetchMembers(); }
  };

  const addModule = async (moduleId: string) => {
    if (!id) return;
    if (classModules.some(cm => cm.module_id === moduleId)) { toast.error("Module déjà ajouté"); return; }
    const { error } = await supabase.from("class_modules").insert({ class_id: id, module_id: moduleId });
    if (error) toast.error(error.message); else { toast.success("Module ajouté"); fetchClassModules(); }
  };

  const removeModule = async (cmId: string) => {
    const { error } = await supabase.from("class_modules").delete().eq("id", cmId);
    if (error) toast.error(error.message); else { toast.success("Module retiré"); fetchClassModules(); }
  };

  const saveEvent = async (data: EventFormData) => {
    if (!id) return;
    const payload = {
      class_id: id,
      title: data.title,
      description: data.description || null,
      type: data.type,
      event_date: data.event_date || null,
      end_date: data.end_date || null,
      link_url: data.link_url || null,
      location: data.location || null,
      color: data.color || "primary",
      is_all_day: data.is_all_day,
      reminder_minutes: data.reminder_minutes,
    };
    if (editingEvent) {
      const { error } = await supabase.from("class_events").update(payload).eq("id", editingEvent.id);
      if (error) toast.error(error.message); else toast.success("Événement modifié");
    } else {
      const { error } = await supabase.from("class_events").insert(payload);
      if (error) toast.error(error.message); else toast.success("Événement créé");
    }
    setEditingEvent(null);
    fetchEvents();
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const { error } = await supabase.from("class_events").delete().eq("id", eventId);
    if (error) toast.error(error.message); else { toast.success("Événement supprimé"); fetchEvents(); }
  };

  const openEditEvent = (e: Event) => {
    setEditingEvent(e);
    setEventDialogOpen(true);
  };

  const sendMessage = async () => {
    if (!id || !user || !chatInput.trim()) return;
    const { error } = await supabase.from("class_messages").insert({
      class_id: id, sender_id: user.id, content: chatInput.trim(), group_id: chatGroupId
    });
    if (error) toast.error(error.message); else setChatInput("");
  };

  const createGroup = async () => {
    if (!id || !newGroupName.trim()) return;
    const { error } = await supabase.from("student_groups").insert({ class_id: id, name: newGroupName.trim() });
    if (error) toast.error(error.message); else { toast.success("Groupe créé"); setNewGroupName(""); fetchGroups(); }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Supprimer ce groupe ?")) return;
    await supabase.from("group_members").delete().eq("group_id", groupId);
    const { error } = await supabase.from("student_groups").delete().eq("id", groupId);
    if (error) toast.error(error.message); else { toast.success("Groupe supprimé"); fetchGroups(); }
  };

  const addGroupMember = async (groupId: string, userId: string) => {
    if (groupMembers.some(gm => gm.group_id === groupId && gm.user_id === userId)) {
      toast.error("Déjà dans ce groupe"); return;
    }
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: userId });
    if (error) toast.error(error.message); else { toast.success("Membre ajouté au groupe"); fetchGroups(); }
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
    if (error) toast.error(error.message); else { toast.success("Membre retiré du groupe"); fetchGroups(); }
  };

  const eventTypeLabel: Record<string, string> = {
    qcm: "QCM", evaluation: "Évaluation", visio: "Visioconférence", other: "Autre"
  };
  const eventTypeIcon: Record<string, typeof ClipboardList> = {
    qcm: ClipboardList, evaluation: FileText, visio: Video, other: Calendar
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div></AppLayout>;
  if (!classInfo) return <AppLayout><p className="text-center py-20 text-muted-foreground">Classe introuvable</p></AppLayout>;

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(studentSearch.toLowerCase()) || m.email.toLowerCase().includes(studentSearch.toLowerCase()));
  const addableStudents = allStudents.filter(s => !members.some(m => m.user_id === s.id) && (s.name.toLowerCase().includes(addStudentSearch.toLowerCase()) || s.email.toLowerCase().includes(addStudentSearch.toLowerCase())));

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/classes")}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{classInfo.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">Code : {classInfo.code}</p>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="students" className="gap-1 text-xs sm:text-sm"><Users className="w-4 h-4 hidden sm:block" />Étudiants</TabsTrigger>
            <TabsTrigger value="modules" className="gap-1 text-xs sm:text-sm"><BookOpen className="w-4 h-4 hidden sm:block" />Modules</TabsTrigger>
            <TabsTrigger value="events" className="gap-1 text-xs sm:text-sm"><Calendar className="w-4 h-4 hidden sm:block" />Événements</TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 text-xs sm:text-sm"><MessageCircle className="w-4 h-4 hidden sm:block" />Chat</TabsTrigger>
            <TabsTrigger value="groups" className="gap-1 text-xs sm:text-sm"><UsersRound className="w-4 h-4 hidden sm:block" />Groupes</TabsTrigger>
          </TabsList>

          {/* ─── Students Tab ─── */}
          <TabsContent value="students" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher un étudiant..." className="pl-9" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              </div>
              {isTeacher && (
                <Dialog open={addStudentOpen} onOpenChange={(o) => { setAddStudentOpen(o); if (o) fetchAllStudents(); }}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Inscrire</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Inscrire un étudiant</DialogTitle></DialogHeader>
                    <Input placeholder="Rechercher par nom ou email..." value={addStudentSearch} onChange={e => setAddStudentSearch(e.target.value)} />
                    <ScrollArea className="max-h-64">
                      <div className="space-y-1">
                        {addableStudents.slice(0, 30).map(s => (
                          <div key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                            <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                            <Button size="sm" variant="outline" onClick={() => addStudent(s.id)}>Ajouter</Button>
                          </div>
                        ))}
                        {addableStudents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun étudiant trouvé</p>}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {filteredMembers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">Aucun étudiant inscrit</p>
              ) : (
                <div className="divide-y divide-border">
                  {filteredMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{format(new Date(m.joined_at), "dd MMM yyyy", { locale: fr })}</span>
                        {isTeacher && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeStudent(m.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{members.length} étudiant(s) inscrit(s)</p>
          </TabsContent>

          {/* ─── Modules Tab ─── */}
          <TabsContent value="modules" className="space-y-4 mt-4">
            {isTeacher && (
              <Dialog open={addModuleOpen} onOpenChange={(o) => { setAddModuleOpen(o); if (o) fetchAvailableModules(); }}>
                <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Ajouter un module</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Ajouter un module à la classe</DialogTitle></DialogHeader>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1">
                      {availableModules.filter(m => !classModules.some(cm => cm.module_id === m.id)).map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                          <div><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-muted-foreground">{m.field} • {m.level}</p></div>
                          <Button size="sm" variant="outline" onClick={() => { addModule(m.id); setAddModuleOpen(false); }}>Ajouter</Button>
                        </div>
                      ))}
                      {availableModules.filter(m => !classModules.some(cm => cm.module_id === m.id)).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucun module disponible</p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classModules.map(cm => (
                <div key={cm.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{cm.title}</p>
                    <p className="text-xs text-muted-foreground">{cm.field} • {cm.level}</p>
                  </div>
                  {isTeacher && (
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeModule(cm.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {classModules.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Aucun module assigné</p>}
          </TabsContent>

          {/* ─── Events Tab ─── */}
          <TabsContent value="events" className="space-y-4 mt-4">
            {isTeacher && (
              <>
                <Button size="sm" onClick={() => { setEditingEvent(null); setEventDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" />Créer un événement
                </Button>
                <EventFormDialog
                  open={eventDialogOpen}
                  onOpenChange={(o) => { setEventDialogOpen(o); if (!o) setEditingEvent(null); }}
                  onSave={saveEvent}
                  isEditing={!!editingEvent}
                  initialData={editingEvent ? {
                    title: editingEvent.title,
                    description: editingEvent.description || "",
                    type: editingEvent.type,
                    event_date: editingEvent.event_date || "",
                    end_date: editingEvent.end_date || "",
                    link_url: editingEvent.link_url || "",
                    location: editingEvent.location || "",
                    color: editingEvent.color || "primary",
                    is_all_day: editingEvent.is_all_day ?? false,
                    reminder_minutes: editingEvent.reminder_minutes ?? null,
                  } : undefined}
                />
              </>
            )}
            <div className="space-y-3">
              {events.map(ev => {
                const Icon = eventTypeIcon[ev.type] || Calendar;
                const colorDot: Record<string, string> = {
                  primary: "bg-primary", destructive: "bg-destructive", success: "bg-green-500",
                  warning: "bg-amber-500", info: "bg-blue-500", purple: "bg-purple-500",
                };
                return (
                  <div key={ev.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3">
                        <div className="mt-0.5 p-2 rounded-lg bg-primary/10 shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{ev.title}</p>
                            {ev.color && <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", colorDot[ev.color] || "bg-primary")} />}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{eventTypeLabel[ev.type] || ev.type}</Badge>
                            {ev.is_all_day
                              ? ev.event_date && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(ev.event_date), "dd MMM yyyy", { locale: fr })} · Journée</span>
                              : ev.event_date && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(ev.event_date), "dd MMM yyyy HH:mm", { locale: fr })}{ev.end_date && ` → ${format(new Date(ev.end_date), "HH:mm")}`}</span>
                            }
                          </div>
                          {ev.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{ev.location}
                            </p>
                          )}
                          {ev.description && <p className="text-sm text-muted-foreground mt-1">{ev.description}</p>}
                          {ev.link_url && (
                            <a href={ev.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" />Ouvrir le lien
                            </a>
                          )}
                        </div>
                      </div>
                      {isTeacher && (
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => openEditEvent(ev)}>Modifier</Button>
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteEvent(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Aucun événement planifié</p>}
            </div>
          </TabsContent>

          {/* ─── Chat Tab ─── */}
          <TabsContent value="chat" className="mt-4">
            <div className="flex gap-2 mb-3 flex-wrap">
              <Button size="sm" variant={chatGroupId === null ? "default" : "outline"} onClick={() => setChatGroupId(null)}>Canal général</Button>
              {groups.map(g => (
                <Button key={g.id} size="sm" variant={chatGroupId === g.id ? "default" : "outline"} onClick={() => setChatGroupId(g.id)}>
                  {g.name}
                </Button>
              ))}
            </div>
            <div className="bg-card rounded-xl border border-border flex flex-col" style={{ height: "400px" }}>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {!isMe && <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.sender_name}</p>}
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-0.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-border p-2 flex gap-2">
                <Input
                  placeholder="Écrire un message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                />
                <Button size="icon" onClick={sendMessage} disabled={!chatInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ─── Groups Tab ─── */}
          <TabsContent value="groups" className="space-y-4 mt-4">
            {isTeacher && (
              <div className="flex gap-2">
                <Input placeholder="Nom du groupe..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="max-w-xs" />
                <Button size="sm" onClick={createGroup} disabled={!newGroupName.trim()}><Plus className="w-4 h-4 mr-1" />Créer</Button>
              </div>
            )}
            <div className="space-y-3">
              {groups.map(g => {
                const gMembers = groupMembers.filter(gm => gm.group_id === g.id);
                return (
                  <div key={g.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-4 h-4 text-primary" />
                        <p className="font-medium text-foreground">{g.name}</p>
                        <Badge variant="secondary" className="text-xs">{g.member_count} membre(s)</Badge>
                      </div>
                      {isTeacher && (
                        <div className="flex gap-1">
                          <Dialog open={addGroupMemberOpen === g.id} onOpenChange={o => setAddGroupMemberOpen(o ? g.id : null)}>
                            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-3 h-3 mr-1" />Ajouter</Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Ajouter un membre à "{g.name}"</DialogTitle></DialogHeader>
                              <ScrollArea className="max-h-64">
                                <div className="space-y-1">
                                  {members.filter(m => !gMembers.some(gm => gm.user_id === m.user_id)).map(m => (
                                    <div key={m.user_id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                      <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                                      <Button size="sm" variant="outline" onClick={() => { addGroupMember(g.id, m.user_id); setAddGroupMemberOpen(null); }}>Ajouter</Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteGroup(g.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {gMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {gMembers.map(gm => (
                          <Badge key={gm.user_id} variant="outline" className="gap-1">
                            {gm.name}
                            {isTeacher && (
                              <button onClick={() => removeGroupMember(g.id, gm.user_id)} className="hover:text-destructive">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {groups.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Aucun groupe créé</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
