import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
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

export default function ModulesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [modules, setModules] = useState<(ModuleRow & { teacherName: string; courseCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const { data: mods } = await supabase.from("modules").select("*").order("created_at", { ascending: false });
      if (!mods) { setLoading(false); return; }
      const teacherIds = [...new Set(mods.map(m => m.teacher_id).filter(Boolean))];
      let teacherMap: Record<string, string> = {};
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", teacherIds as string[]);
        if (profiles) profiles.forEach(p => { teacherMap[p.id] = p.name; });
      }
      const { data: courses } = await supabase.from("courses").select("module_id");
      const courseCountMap: Record<string, number> = {};
      courses?.forEach(c => { courseCountMap[c.module_id] = (courseCountMap[c.module_id] || 0) + 1; });
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
      <div className="space-y-6">
        <PageHeader
          icon={<BookOpen className="w-5 h-5" />}
          title="Modules"
          subtitle={`${filtered.length} modules disponibles`}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un module..." className="pl-9 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-32 rounded-xl"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-xl"><SelectValue placeholder="Filière" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => (
              <Link key={m.id} to={`/modules/${m.id}`} className="group bg-card rounded-2xl border border-border/60 p-5 shadow-soft hover:shadow-medium hover:border-border transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">{m.level}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground uppercase">{m.field}</span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{m.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.description || "Aucune description"}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {m.courseCount} cours</span>
                  <span>{m.teacherName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-semibold">Aucun module trouvé</p>
            <p className="text-sm mt-1">Essayez d'ajuster vos filtres</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
