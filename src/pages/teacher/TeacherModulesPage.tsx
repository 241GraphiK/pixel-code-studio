import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, FileQuestion, Pencil, Trash2, Settings2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModuleRow {
  id: string;
  title: string;
  description: string | null;
  field: string;
  level: string;
  created_at: string;
}

export default function TeacherModulesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("modules")
      .select("id, title, description, field, level, created_at")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    setModules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce module et tous ses cours/QCM ?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Module supprimé");
    fetchModules();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Mes modules
            </h1>
            <p className="text-muted-foreground">Gérez vos modules et cours</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/teacher/modules/create"><Plus className="w-4 h-4 mr-1" /> Nouveau module</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/teacher/quizzes/create"><FileQuestion className="w-4 h-4 mr-1" /> Nouveau QCM</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun module créé</p>
            <p className="text-sm mb-4">Commencez par créer votre premier module</p>
            <Button asChild>
              <Link to="/teacher/modules/create"><Plus className="w-4 h-4 mr-1" /> Créer un module</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(m => (
              <div key={m.id} className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.level}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{m.field}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.description || "Aucune description"}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/modules/${m.id}`}><Pencil className="w-3.5 h-3.5 mr-1" /> Voir</Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/teacher/modules/${m.id}/edit`}><Settings2 className="w-3.5 h-3.5 mr-1" /> Modifier</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
