import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, Users, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { modules } from "@/lib/mock-data";

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");

  const levels = [...new Set(modules.map((m) => m.level))];
  const fields = [...new Set(modules.map((m) => m.field))];

  const filtered = modules.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un module..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Niveau" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filière" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Modules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Link key={m.id} to={`/modules/${m.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.level}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{m.field}</span>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {m.courseCount} cours</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {m.studentCount} étudiants</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{m.teacherName}</p>
              {m.progress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-foreground">{m.progress}%</span>
                  </div>
                  <Progress value={m.progress} className="h-1.5" />
                </div>
              )}
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
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
