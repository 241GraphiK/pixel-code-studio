import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus, Copy, Check, Trash2, Eye } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface ClassRow { id: string; name: string; code: string; teacher_id: string; created_at: string; }

export default function ClassesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [myMemberships, setMyMemberships] = useState<string[]>([]);
  const { profile, user } = useAuth();

  const fetchClasses = async () => {
    if (!user) return;
    const { data: allClasses } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
    const { data: memberships } = await supabase.from("class_members").select("class_id").eq("user_id", user.id);
    setClasses(allClasses || []);
    setMyMemberships(memberships?.map(m => m.class_id) || []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, [user]);

  const filtered = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Code copié !");
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewClassCode(code);
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !user) return;
    setSaving(true);
    const { data: foundClass, error: findError } = await supabase.from("classes").select("id").eq("code", joinCode.trim().toUpperCase()).maybeSingle();
    if (findError || !foundClass) { toast.error("Code invalide ou classe introuvable"); setSaving(false); return; }
    if (myMemberships.includes(foundClass.id)) { toast.error("Vous êtes déjà membre de cette classe"); setSaving(false); return; }
    const { error } = await supabase.from("class_members").insert({ class_id: foundClass.id, user_id: user.id });
    if (error) { toast.error(error.message); } else { toast.success("Classe rejointe avec succès !"); setJoinCode(""); setJoinOpen(false); fetchClasses(); }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newClassName.trim() || !newClassCode.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("classes").insert({ name: newClassName.trim(), code: newClassCode.trim().toUpperCase(), teacher_id: user.id });
    if (error) { error.code === "23505" ? toast.error("Ce code de classe existe déjà") : toast.error(error.message); }
    else { toast.success("Classe créée avec succès !"); setNewClassName(""); setNewClassCode(""); setCreateOpen(false); fetchClasses(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette classe et tous ses membres ?")) return;
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Classe supprimée"); fetchClasses(); }
  };

  const handleLeave = async (classId: string) => {
    if (!user) return;
    const { error } = await supabase.from("class_members").delete().eq("class_id", classId).eq("user_id", user.id);
    if (error) toast.error(error.message); else { toast.success("Vous avez quitté la classe"); fetchClasses(); }
  };

  const isTeacher = profile?.role === "teacher" || profile?.role === "admin";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Users className="w-5 h-5" />}
          title="Classes"
          subtitle="Gérez et rejoignez des classes"
          actions={
            <div className="flex gap-2">
              <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">Rejoindre</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Rejoindre une classe</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Code d'invitation</Label>
                      <Input placeholder="Ex: ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={10} className="rounded-xl" />
                    </div>
                    <Button className="w-full rounded-xl" onClick={handleJoin} disabled={saving || !joinCode.trim()}>
                      {saving ? "Rejoindre..." : "Rejoindre"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {isTeacher && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1 rounded-xl"><Plus className="w-4 h-4" /> Créer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Créer une classe</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom de la classe *</Label>
                        <Input placeholder="Ex: L3 Informatique - Groupe A" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} maxLength={100} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Code d'invitation *</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Ex: L3INFA" value={newClassCode} onChange={(e) => setNewClassCode(e.target.value.toUpperCase())} maxLength={10} className="rounded-xl" />
                          <Button type="button" variant="outline" onClick={generateCode} className="rounded-xl">Générer</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Code unique que les étudiants utiliseront pour rejoindre</p>
                      </div>
                      <Button className="w-full rounded-xl" onClick={handleCreate} disabled={saving || !newClassName.trim() || !newClassCode.trim()}>
                        {saving ? "Création..." : "Créer la classe"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          }
        />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const isOwner = c.teacher_id === user?.id;
              const isMember = myMemberships.includes(c.id);
              return (
                <div key={c.id} className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft hover:shadow-medium hover:border-border transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    <button onClick={() => copyCode(c.code, c.id)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/60 transition-colors">
                      {copiedId === c.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/60 rounded-lg text-xs font-mono text-muted-foreground">{c.code}</span>
                    {isOwner && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">Votre classe</span>}
                    {!isOwner && isMember && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success uppercase">Membre</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/classes/${c.id}`)} className="gap-1 rounded-xl flex-1">
                      <Eye className="w-3.5 h-3.5" /> Voir
                    </Button>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive rounded-xl">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {!isOwner && isMember && (
                      <Button variant="outline" size="sm" onClick={() => handleLeave(c.id)} className="rounded-xl">Quitter</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-semibold">Aucune classe trouvée</p>
            <p className="text-sm mt-1">Rejoignez une classe avec un code d'invitation</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
