import { useState } from "react";
import { Users, Search, Plus, Copy, Check } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { classes } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const filtered = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Code copié !" });
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    toast({ title: "Classe rejointe !", description: `Vous avez rejoint la classe avec le code ${joinCode}` });
    setJoinCode("");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Classes
            </h1>
            <p className="text-muted-foreground">Gérez et rejoignez des classes</p>
          </div>
          <div className="flex gap-2">
            {/* Join class dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Rejoindre</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Rejoindre une classe</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code d'invitation</Label>
                    <Input placeholder="Ex: L3-INF-A" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleJoin}>Rejoindre</Button>
                </div>
              </DialogContent>
            </Dialog>
            {profile?.role !== "student" && (
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Créer</Button>
            )}
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <button onClick={() => copyCode(c.code, c.id)} className="text-muted-foreground hover:text-foreground p-1">
                  {copiedId === c.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-mono text-muted-foreground mb-3">
                {c.code}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{c.teacherName}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{c.studentCount} étudiants</span>
                <span>{c.moduleCount} modules</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune classe trouvée</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
