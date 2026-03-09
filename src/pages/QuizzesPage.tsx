import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Search, Clock, Trophy, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
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
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!quizzesData) { setLoading(false); return; }

      // Get question counts
      const quizIds = quizzesData.map(q => q.id);
      let qCounts: Record<string, number> = {};
      if (quizIds.length > 0) {
        const { data: questions } = await supabase.from("questions").select("quiz_id").in("quiz_id", quizIds);
        questions?.forEach(q => { qCounts[q.quiz_id] = (qCounts[q.quiz_id] || 0) + 1; });
      }

      // Get best scores for current user
      let bestScores: Record<string, number> = {};
      if (user && quizIds.length > 0) {
        const { data: attempts } = await supabase
          .from("quiz_attempts")
          .select("quiz_id, score, max_score")
          .eq("user_id", user.id)
          .in("quiz_id", quizIds);
        attempts?.forEach(a => {
          const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
          if (!bestScores[a.quiz_id] || pct > bestScores[a.quiz_id]) {
            bestScores[a.quiz_id] = pct;
          }
        });
      }

      setQuizzes(quizzesData.map(q => ({
        ...q,
        questionCount: qCounts[q.id] || 0,
        bestScore: bestScores[q.id],
      })));
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
            <Input placeholder="Rechercher un QCM..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => (
              <Link key={q.id} to={`/quizzes/${q.id}`} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-card rounded-xl border border-border p-4 sm:p-5 shadow-soft hover:shadow-medium transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0",
                    q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  )}>
                    <FileQuestion className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0 sm:hidden">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{q.title}</h3>
                    {q.bestScore !== undefined && (
                      <div className="flex items-center gap-1 text-success text-xs mt-0.5">
                        <Trophy className="w-3 h-3" />
                        <span className="font-semibold">{q.bestScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{q.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{q.description || ""}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {q.duration} min</span>
                    <span>{q.questionCount} questions</span>
                    <span className={cn(
                      "font-medium",
                      q.difficulty === "easy" ? "text-success" : q.difficulty === "medium" ? "text-warning" : "text-destructive"
                    )}>
                      {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:hidden text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.duration} min</span>
                    <span>{q.questionCount} q.</span>
                    <span className={cn(
                      "font-medium",
                      q.difficulty === "easy" ? "text-success" : q.difficulty === "medium" ? "text-warning" : "text-destructive"
                    )}>
                      {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  {q.bestScore !== undefined ? (
                    <div className="flex items-center gap-1 text-success">
                      <Trophy className="w-4 h-4" />
                      <span className="font-semibold">{q.bestScore}%</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non passé</span>
                  )}
                </div>
                <ChevronRight className="hidden sm:block w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun QCM trouvé</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
