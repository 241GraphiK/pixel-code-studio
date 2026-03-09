import { useState, useEffect, useMemo } from "react";
import { BarChart3, Users, Target, TrendingUp, ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { exportQuizResultsPdf, exportTeacherStatsPdf } from "@/lib/pdf-export";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import StudentDrillModal from "@/components/teacher/StudentDrillModal";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

const SCORE_COLORS = ["hsl(var(--destructive))", "hsl(38,92%,50%)", "hsl(142,71%,45%)"];

interface QuizStat {
  quizId: string;
  quizTitle: string;
  moduleTitle: string;
  attempts: number;
  uniqueStudents: number;
  avgScore: number;
  passRate: number; // % >= 60
  scores: number[];
}

interface StudentStat {
  userId: string;
  name: string;
  attempts: number;
  avgScore: number;
  bestScore: number;
  lastAttempt: string;
}

interface RawAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  completed_at: string;
  studentName: string;
  quizTitle: string;
  moduleTitle: string;
}

type SortKey = keyof StudentStat;

export default function TeacherStatsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<RawAttempt[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStat[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("avgScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [drillStudent, setDrillStudent] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: myModules } = await supabase
        .from("modules")
        .select("id, title")
        .eq("teacher_id", user.id);

      if (!myModules?.length) { setLoading(false); return; }

      const moduleIds = myModules.map(m => m.id);
      const modMap = new Map(myModules.map(m => [m.id, m.title]));

      const { data: myQuizzes } = await supabase
        .from("quizzes")
        .select("id, title, module_id")
        .in("module_id", moduleIds);

      if (!myQuizzes?.length) { setLoading(false); return; }

      const quizIds = myQuizzes.map(q => q.id);
      const quizMap = new Map(myQuizzes.map(q => [q.id, { title: q.title, moduleId: q.module_id }]));

      const { data: allAttempts } = await supabase
        .from("quiz_attempts")
        .select("id, user_id, quiz_id, score, max_score, completed_at")
        .in("quiz_id", quizIds)
        .order("completed_at", { ascending: false });

      if (!allAttempts?.length) { setLoading(false); return; }

      const studentIds = [...new Set(allAttempts.map(a => a.user_id))];
      const { data: students } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds);
      const studentMap = new Map(students?.map(s => [s.id, s.name]) || []);

      const rich: RawAttempt[] = allAttempts.map(a => ({
        ...a,
        studentName: studentMap.get(a.user_id) || "Inconnu",
        quizTitle: quizMap.get(a.quiz_id)?.title || "Inconnu",
        moduleTitle: modMap.get(quizMap.get(a.quiz_id)?.moduleId || "") || "Inconnu",
      }));
      setAttempts(rich);

      // Build per-quiz stats
      const qMap: Record<string, { scores: number[]; users: Set<string>; title: string; moduleTitle: string }> = {};
      rich.forEach(a => {
        if (!qMap[a.quiz_id]) qMap[a.quiz_id] = { scores: [], users: new Set(), title: a.quizTitle, moduleTitle: a.moduleTitle };
        const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
        qMap[a.quiz_id].scores.push(pct);
        qMap[a.quiz_id].users.add(a.user_id);
      });
      setQuizStats(
        Object.entries(qMap).map(([qId, v]) => ({
          quizId: qId,
          quizTitle: v.title,
          moduleTitle: v.moduleTitle,
          attempts: v.scores.length,
          uniqueStudents: v.users.size,
          avgScore: Math.round(v.scores.reduce((s, x) => s + x, 0) / v.scores.length),
          passRate: Math.round((v.scores.filter(s => s >= 60).length / v.scores.length) * 100),
          scores: v.scores,
        })).sort((a, b) => b.attempts - a.attempts)
      );

      setLoading(false);
    };
    fetchData();
  }, [user]);

  // ── Filtered attempts for selected quiz ──────────────────────────────────
  const filteredAttempts = useMemo(() =>
    selectedQuiz === "all" ? attempts : attempts.filter(a => a.quiz_id === selectedQuiz),
    [attempts, selectedQuiz]);

  // ── Per-student aggregation ──────────────────────────────────────────────
  const studentStats = useMemo<StudentStat[]>(() => {
    const map: Record<string, { name: string; scores: number[]; dates: string[] }> = {};
    filteredAttempts.forEach(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      if (!map[a.user_id]) map[a.user_id] = { name: a.studentName, scores: [], dates: [] };
      map[a.user_id].scores.push(pct);
      map[a.user_id].dates.push(a.completed_at);
    });
    return Object.entries(map).map(([uid, v]) => ({
      userId: uid,
      name: v.name,
      attempts: v.scores.length,
      avgScore: Math.round(v.scores.reduce((s, x) => s + x, 0) / v.scores.length),
      bestScore: Math.max(...v.scores),
      lastAttempt: new Date(v.dates.sort().at(-1)!).toLocaleDateString("fr-FR"),
    }));
  }, [filteredAttempts]);

  const sorted = useMemo(() => {
    return [...studentStats]
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === "number" && typeof vb === "number")
          return sortDir === "desc" ? vb - va : va - vb;
        return sortDir === "desc"
          ? String(vb).localeCompare(String(va))
          : String(va).localeCompare(String(vb));
      });
  }, [studentStats, search, sortKey, sortDir]);

  // ── Score distribution for selected quiz/all ─────────────────────────────
  const distribution = useMemo(() => {
    const buckets = [
      { label: "< 40%", count: 0 },
      { label: "40–59%", count: 0 },
      { label: "60–79%", count: 0 },
      { label: "≥ 80%", count: 0 },
    ];
    filteredAttempts.forEach(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      if (pct < 40) buckets[0].count++;
      else if (pct < 60) buckets[1].count++;
      else if (pct < 80) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [filteredAttempts]);

  const distColors = [
    "hsl(var(--destructive))",
    "hsl(38,92%,50%)",
    "hsl(199,89%,48%)",
    "hsl(142,71%,45%)",
  ];

  // ── Global KPIs ──────────────────────────────────────────────────────────
  const globalAvg = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / attempts.length)
    : 0;
  const passRate = attempts.length > 0
    ? Math.round((attempts.filter(a => a.max_score > 0 && (a.score / a.max_score) * 100 >= 60).length / attempts.length) * 100)
    : 0;
  const uniqueStudents = new Set(attempts.map(a => a.user_id)).size;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3 inline ml-1" /> : <ChevronUp className="w-3 h-3 inline ml-1" />
      : null;

  const handleExport = () => {
    if (!filteredAttempts.length) { toast.error("Aucune donnée à exporter"); return; }
    exportQuizResultsPdf(
      filteredAttempts.map(a => ({
        studentName: a.studentName,
        quizTitle: a.quizTitle,
        score: a.score,
        maxScore: a.max_score,
        percentage: a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0,
        completedAt: new Date(a.completed_at).toLocaleDateString("fr-FR"),
      })),
      profile?.name || "Enseignant"
    );
    toast.success("PDF exporté !");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" /> Statistiques étudiants
            </h1>
            <p className="text-muted-foreground text-sm">Performances aux QCM de vos modules</p>
          </div>
          {!loading && attempts.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Exporter PDF
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BarChart3 className="w-14 h-14 mx-auto mb-3 opacity-25" />
            <p className="font-medium text-lg">Pas encore de données</p>
            <p className="text-sm">Les statistiques apparaîtront dès que des étudiants passeront vos QCM.</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Étudiants actifs" value={uniqueStudents} icon={<Users className="w-5 h-5" />} />
              <StatCard title="Tentatives totales" value={attempts.length} icon={<TrendingUp className="w-5 h-5" />} />
              <StatCard title="Score moyen global" value={`${globalAvg}%`} icon={<Target className="w-5 h-5" />} />
              <StatCard title="Taux de réussite" value={`${passRate}%`} icon={<BarChart3 className="w-5 h-5" />} />
            </div>

            {/* Per-quiz table */}
            <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Résultats par QCM</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {["QCM", "Module", "Tentatives", "Étudiants", "Score moy.", "Taux réussite"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quizStats.map(q => (
                      <tr
                        key={q.quizId}
                        onClick={() => setSelectedQuiz(prev => prev === q.quizId ? "all" : q.quizId)}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-accent/50",
                          selectedQuiz === q.quizId && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{q.quizTitle}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.moduleTitle}</td>
                        <td className="px-4 py-3 text-center font-mono">{q.attempts}</td>
                        <td className="px-4 py-3 text-center font-mono">{q.uniqueStudents}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "font-semibold",
                            q.avgScore >= 80 ? "text-green-600 dark:text-green-400" : q.avgScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-destructive"
                          )}>{q.avgScore}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted">
                              <div
                                className={cn("h-1.5 rounded-full", q.passRate >= 60 ? "bg-green-500" : "bg-yellow-500")}
                                style={{ width: `${q.passRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">{q.passRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedQuiz !== "all" && (
                <div className="px-5 py-2 bg-primary/5 border-t border-border text-xs text-primary font-medium">
                  Filtré sur : {quizStats.find(q => q.quizId === selectedQuiz)?.quizTitle} — <button className="underline" onClick={() => setSelectedQuiz("all")}>Voir tout</button>
                </div>
              )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score distribution */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <h2 className="font-semibold text-foreground mb-4">
                  Distribution des scores {selectedQuiz !== "all" && <span className="text-xs text-muted-foreground font-normal">(QCM sélectionné)</span>}
                </h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(v: number) => [`${v} tentative${v > 1 ? "s" : ""}`, "Nombre"]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {distribution.map((_, i) => <Cell key={i} fill={distColors[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Average score per quiz */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <h2 className="font-semibold text-foreground mb-4">Score moyen par QCM</h2>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizStats.map(q => ({ name: q.quizTitle.length > 18 ? q.quizTitle.slice(0, 18) + "…" : q.quizTitle, score: q.avgScore }))} layout="vertical" barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(v: number) => [`${v}%`, "Score moyen"]}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {quizStats.map((q, i) => (
                          <Cell key={i} fill={q.avgScore >= 80 ? "hsl(142,71%,45%)" : q.avgScore >= 60 ? "hsl(38,92%,50%)" : "hsl(var(--destructive))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Per-student table */}
            <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Performance par étudiant
                  {selectedQuiz !== "all" && <span className="text-xs text-muted-foreground font-normal">(QCM sélectionné)</span>}
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {(
                        [
                          ["Étudiant", "name"],
                          ["Tentatives", "attempts"],
                          ["Score moyen", "avgScore"],
                          ["Meilleur score", "bestScore"],
                          ["Dernière tentative", "lastAttempt"],
                        ] as [string, SortKey][]
                      ).map(([label, key]) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-foreground"
                        >
                          {label}<SortIcon k={key} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sorted.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Aucun résultat</td></tr>
                    ) : sorted.map(s => (
                      <tr
                        key={s.userId}
                        onClick={() => setDrillStudent({ id: s.userId, name: s.name })}
                        className="hover:bg-accent/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {s.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            {s.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">{s.attempts}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-full text-xs font-semibold",
                            s.avgScore >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : s.avgScore >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-destructive/10 text-destructive"
                          )}>{s.avgScore}%</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">{s.bestScore}%</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{s.lastAttempt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
