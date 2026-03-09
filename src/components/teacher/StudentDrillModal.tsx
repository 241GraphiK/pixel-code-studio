import { useMemo } from "react";
import { TrendingUp, Award, Target, Calendar, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell,
} from "recharts";

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

interface Props {
  open: boolean;
  onClose: () => void;
  studentId: string | null;
  studentName: string;
  /** All attempts across all students (for class average computation) */
  attempts: RawAttempt[];
}

const LINE_COLORS = [
  "hsl(221,83%,53%)",
  "hsl(142,71%,45%)",
  "hsl(38,92%,50%)",
  "hsl(199,89%,48%)",
  "hsl(270,70%,55%)",
  "hsl(0,84%,60%)",
];

const scoreBadge = (score: number) =>
  cn(
    "inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-full text-xs font-semibold",
    score >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : score >= 60
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-destructive/10 text-destructive"
  );

export default function StudentDrillModal({ open, onClose, studentId, studentName, attempts }: Props) {
  // ── Student's own attempts ───────────────────────────────────────────────
  const studentAttempts = useMemo(
    () =>
      attempts
        .filter(a => a.user_id === studentId)
        .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()),
    [attempts, studentId]
  );

  const quizIds = useMemo(() => [...new Set(studentAttempts.map(a => a.quiz_id))], [studentAttempts]);

  // ── Class average per quiz (all students, for the quizzes this student took) ──
  const classAvgByQuiz = useMemo(() => {
    const map: Record<string, number[]> = {};
    attempts.forEach(a => {
      if (!quizIds.includes(a.quiz_id)) return;
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      if (!map[a.quiz_id]) map[a.quiz_id] = [];
      map[a.quiz_id].push(pct);
    });
    const result: Record<string, number> = {};
    Object.entries(map).forEach(([qId, scores]) => {
      result[qId] = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
    });
    return result;
  }, [attempts, quizIds]);

  // ── Student average per quiz ─────────────────────────────────────────────
  const studentAvgByQuiz = useMemo(() => {
    const map: Record<string, { scores: number[]; title: string }> = {};
    studentAttempts.forEach(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      if (!map[a.quiz_id]) map[a.quiz_id] = { scores: [], title: a.quizTitle };
      map[a.quiz_id].scores.push(pct);
    });
    const result: Record<string, { avg: number; title: string }> = {};
    Object.entries(map).forEach(([qId, v]) => {
      result[qId] = {
        avg: Math.round(v.scores.reduce((s, x) => s + x, 0) / v.scores.length),
        title: v.title,
      };
    });
    return result;
  }, [studentAttempts]);

  // ── Comparison chart data: student avg vs class avg per quiz ─────────────
  const comparisonData = useMemo(
    () =>
      quizIds.map(qId => ({
        quiz: (studentAvgByQuiz[qId]?.title || "?").length > 20
          ? (studentAvgByQuiz[qId]?.title || "?").slice(0, 20) + "…"
          : studentAvgByQuiz[qId]?.title || "?",
        Étudiant: studentAvgByQuiz[qId]?.avg ?? 0,
        Classe: classAvgByQuiz[qId] ?? 0,
        delta: (studentAvgByQuiz[qId]?.avg ?? 0) - (classAvgByQuiz[qId] ?? 0),
      })),
    [quizIds, studentAvgByQuiz, classAvgByQuiz]
  );

  // ── Global timeline ──────────────────────────────────────────────────────
  const chartData = useMemo(
    () =>
      studentAttempts.map((a, i) => ({
        label: `#${i + 1}`,
        date: new Date(a.completed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        quiz: a.quizTitle,
        score: a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0,
        classAvg: classAvgByQuiz[a.quiz_id] ?? null,
      })),
    [studentAttempts, classAvgByQuiz]
  );

  // ── Per-quiz series for multi-line progression ───────────────────────────
  const perQuizSeries = useMemo(() => {
    const map: Record<string, { title: string; data: { n: number; score: number; date: string }[] }> = {};
    studentAttempts.forEach(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      if (!map[a.quiz_id]) map[a.quiz_id] = { title: a.quizTitle, data: [] };
      map[a.quiz_id].data.push({
        n: map[a.quiz_id].data.length + 1,
        score: pct,
        date: new Date(a.completed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      });
    });
    return Object.entries(map).map(([id, v], i) => ({
      quizId: id,
      title: v.title,
      color: LINE_COLORS[i % LINE_COLORS.length],
      data: v.data,
    }));
  }, [studentAttempts]);

  // ── Summary KPIs ─────────────────────────────────────────────────────────
  const allScores = studentAttempts.map(a => a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0);
  const avg = allScores.length ? Math.round(allScores.reduce((s, x) => s + x, 0) / allScores.length) : 0;
  const best = allScores.length ? Math.max(...allScores) : 0;
  const passRate = allScores.length ? Math.round((allScores.filter(s => s >= 60).length / allScores.length) * 100) : 0;
  const globalClassAvg = quizIds.length
    ? Math.round(Object.values(classAvgByQuiz).reduce((s, x) => s + x, 0) / Object.values(classAvgByQuiz).length)
    : 0;

  const initials = studentName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Custom tooltip for comparison chart
  const ComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const student = payload.find((p: any) => p.dataKey === "Étudiant");
    const classe = payload.find((p: any) => p.dataKey === "Classe");
    const diff = (student?.value ?? 0) - (classe?.value ?? 0);
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-lg space-y-1">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p style={{ color: student?.color }}>Étudiant : <strong>{student?.value}%</strong></p>
        <p style={{ color: classe?.color }}>Classe : <strong>{classe?.value}%</strong></p>
        <p className={cn("font-semibold mt-1", diff > 0 ? "text-green-600 dark:text-green-400" : diff < 0 ? "text-destructive" : "text-muted-foreground")}>
          {diff > 0 ? `+${diff}` : diff}% vs classe
        </p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">{studentName}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {studentAttempts.length} tentative{studentAttempts.length > 1 ? "s" : ""} · {quizIds.length} QCM distinct{quizIds.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* KPI row — includes vs class delta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Target className="w-4 h-4" />, label: "Score moyen", value: `${avg}%` },
              { icon: <Award className="w-4 h-4" />, label: "Meilleur score", value: `${best}%` },
              { icon: <TrendingUp className="w-4 h-4" />, label: "Taux réussite", value: `${passRate}%` },
              {
                icon: <Users className="w-4 h-4" />,
                label: "Vs moy. classe",
                value: avg - globalClassAvg === 0
                  ? `=${globalClassAvg}%`
                  : avg - globalClassAvg > 0
                    ? `+${avg - globalClassAvg}%`
                    : `${avg - globalClassAvg}%`,
                accent: avg - globalClassAvg > 0
                  ? "text-green-600 dark:text-green-400"
                  : avg - globalClassAvg < 0
                    ? "text-destructive"
                    : "text-foreground",
              },
            ].map(k => (
              <div key={k.label} className="bg-muted/40 rounded-xl p-3 flex flex-col gap-1">
                <div className="text-primary">{k.icon}</div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className={cn("text-xl font-bold", (k as any).accent || "text-foreground")}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* ── Comparison chart: student vs class avg per quiz ── */}
          {comparisonData.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-sm">Score étudiant vs moyenne classe</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-primary" /> Étudiant</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-muted-foreground/60" /> Classe</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} barCategoryGap="30%" barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="quiz" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <Tooltip content={<ComparisonTooltip />} />
                    <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Bar dataKey="Étudiant" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.delta >= 0 ? "hsl(221,83%,53%)" : "hsl(var(--destructive))"}
                          fillOpacity={0.9}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Classe" fill="hsl(var(--muted-foreground))" fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Delta badges */}
              <div className="mt-3 flex flex-wrap gap-2">
                {comparisonData.map((d, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      d.delta > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : d.delta < 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {d.quiz}: {d.delta > 0 ? "+" : ""}{d.delta}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Global evolution + class avg overlay */}
          {chartData.length > 1 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Évolution globale des scores</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      formatter={(v: number, key: string, props: any) =>
                        key === "score"
                          ? [`${v}% — ${props.payload.quiz}`, props.payload.date]
                          : [`${v}% (moy. classe)`, props.payload.quiz]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => v === "score" ? "Étudiant" : "Moy. classe"} />
                    <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="classAvg"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const color = payload.score >= 80 ? "#22c55e" : payload.score >= 60 ? "#f59e0b" : "#ef4444";
                        return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill={color} stroke="hsl(var(--card))" strokeWidth={2} />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per-quiz progression (multi-line) */}
          {perQuizSeries.length > 1 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Progression par QCM</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="n" type="number" allowDuplicatedCategory={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      formatter={(v: number, name: string) => [`${v}%`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {perQuizSeries.map(s => (
                      <Line
                        key={s.quizId}
                        data={s.data}
                        dataKey="score"
                        name={s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title}
                        stroke={s.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Attempt history table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Historique complet</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    {["#", "QCM", "Module", "Score", "Vs classe", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...studentAttempts].reverse().map((a, i) => {
                    const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
                    const delta = pct - (classAvgByQuiz[a.quiz_id] ?? pct);
                    return (
                      <tr key={a.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{studentAttempts.length - i}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{a.quizTitle}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.moduleTitle}</td>
                        <td className="px-4 py-2.5">
                          <span className={scoreBadge(pct)}>{pct}%</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn(
                            "text-xs font-semibold",
                            delta > 0 ? "text-green-600 dark:text-green-400" : delta < 0 ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {delta > 0 ? "+" : ""}{delta}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(a.completed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
