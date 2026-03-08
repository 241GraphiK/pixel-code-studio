import { useState } from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Search, Clock, Trophy, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quizzes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function QuizzesPage() {
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");

  const filtered = quizzes.filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "all" || q.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-primary" /> QCM
          </h1>
          <p className="text-muted-foreground">Testez vos connaissances</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un QCM..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={diffFilter} onValueChange={setDiffFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Difficulté" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filtered.map((q) => (
            <Link key={q.id} to={`/quizzes/${q.id}`} className="flex items-center gap-4 bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all group">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
              )}>
                <FileQuestion className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{q.title}</h3>
                <p className="text-sm text-muted-foreground">{q.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {q.duration} min</span>
                  <span>{q.questions.length} questions</span>
                  <span className={cn(
                    "font-medium",
                    q.difficulty === "easy" ? "text-success" : q.difficulty === "medium" ? "text-warning" : "text-destructive"
                  )}>
                    {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {q.bestScore !== undefined ? (
                  <div className="flex items-center gap-1 text-success">
                    <Trophy className="w-4 h-4" />
                    <span className="font-semibold">{q.bestScore}%</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Non passé</span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun QCM trouvé</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
