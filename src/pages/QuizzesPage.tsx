import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Search, Clock, Trophy, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface QuizRow {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  duration: number;
  module_id: string;
  questionCount: number;
  bestScore?: number;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: quizzesData } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
      if (!quizzesData) { setLoading(false); return; }
      const quizIds = quizzesData.map(q => q.id);
      let qCounts: Record<string, number> = {};
      if (quizIds.length > 0) {
        const { data: questions } = await supabase.from("questions").select("quiz_id").in("quiz_id", quizIds);
        questions?.forEach(q => { qCounts[q.quiz_id] = (qCounts[q.quiz_id] || 0) + 1; });
      }
      let bestScores: Record<string, number> = {};
      if (user && quizIds.length > 0) {
        const { data: attempts } = await supabase.from("quiz_attempts").select("quiz_id, score, max_score").eq("user_id", user.id).in("quiz_id", quizIds);
        attempts?.forEach(a => {
          const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
          if (!bestScores[a.quiz_id] || pct > bestScores[a.quiz_id]) bestScores[a.quiz_id] = pct;
        });
      }
      setQuizzes(quizzesData.map(q => ({ ...q, questionCount: qCounts[q.id] || 0, bestScore: bestScores[q.id] })));
      setLoading(false);
    };
    fetchQuizzes();
  }, [user]);

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "all" || q.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<FileQuestion className="w-5 h-5" />}
          title="QCM"
          subtitle="Testez vos connaissances"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un QCM..." className="pl-9 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={diffFilter} onValueChange={setDiffFilter}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl"><SelectValue placeholder="Difficulté" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(q => (
              <Link key={q.id} to={`/quizzes/${q.id}`} className="flex items-center gap-4 bg-card rounded-2xl border border-border/60 p-4 shadow-soft hover:shadow-medium hover:border-border transition-all duration-300 group">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                )}>
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{q.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{q.description || ""}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.duration} min</span>
                    <span>{q.questionCount} questions</span>
                    <span className={cn(
                      "font-semibold",
                      q.difficulty === "easy" ? "text-success" : q.difficulty === "medium" ? "text-warning" : "text-destructive"
                    )}>
                      {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  {q.bestScore !== undefined ? (
                    <div className="flex items-center gap-1 text-success">
                      <Trophy className="w-4 h-4" />
                      <span className="font-bold text-sm">{q.bestScore}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Non passé</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-8 h-8 opacity-40" />
            </div>
            <p className="font-semibold">Aucun QCM trouvé</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
