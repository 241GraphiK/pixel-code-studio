import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface ModuleRow {
  id: string;
  title: string;
  description: string | null;
  field: string;
  level: string;
  teacher_id: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  name: string;
}

export default function ModulesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [modules, setModules] = useState<(ModuleRow & { teacherName: string; courseCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const { data: mods } = await supabase
        .from("modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mods) { setLoading(false); return; }

      // Get teacher names
      const teacherIds = [...new Set(mods.map(m => m.teacher_id).filter(Boolean))];
      let teacherMap: Record<string, string> = {};
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", teacherIds as string[]);
        if (profiles) {
          profiles.forEach(p => { teacherMap[p.id] = p.name; });
        }
      }

      // Get course counts
      const { data: courses } = await supabase
        .from("courses")
        .select("module_id");

      const courseCountMap: Record<string, number> = {};
      courses?.forEach(c => {
        courseCountMap[c.module_id] = (courseCountMap[c.module_id] || 0) + 1;
      });

      setModules(mods.map(m => ({
        ...m,
        teacherName: m.teacher_id ? teacherMap[m.teacher_id] || "Enseignant" : "Enseignant",
        courseCount: courseCountMap[m.id] || 0,
      })));
      setLoading(false);
    };
    fetchModules();
  }, [user]);

  const levels = [...new Set(modules.map(m => m.level))];
  const fields = [...new Set(modules.map(m => m.field))];

  const filtered = modules.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || (m.description || "").toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || m.level === levelFilter;
    const matchField = fieldFilter === "all" || m.field === fieldFilter;
    return matchSearch && matchLevel && matchField;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Modules
            </h1>
            <p className="text-muted-foreground">{filtered.length} modules disponibles</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un module..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filière" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => (
              <Link key={m.id} to={`/modules/${m.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.level}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{m.field}</span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.description || "Aucune description"}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {m.courseCount} cours</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.teacherName}</p>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun module trouvé</p>
            <p className="text-sm">Essayez d'ajuster vos filtres</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
