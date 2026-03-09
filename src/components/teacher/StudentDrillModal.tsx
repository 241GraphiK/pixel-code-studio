import { useMemo } from "react";
import { X, TrendingUp, Award, Target, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
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
  attempts: RawAttempt[];
}

// Stable palette for quiz lines
const LINE_COLORS = [
  "hsl(221,83%,53%)",
  "hsl(142,71%,45%)",
  "hsl(38,92%,50%)",
  "hsl(199,89%,48%)",
  "hsl(270,70%,55%)",
  "hsl(0,84%,60%)",
];

export default function StudentDrillModal({ open, onClose, studentId, studentName, attempts }: Props) {
  const studentAttempts = useMemo(
    () => attempts
      .filter(a => a.user_id === studentId)
      .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()),
    [attempts, studentId]
  );

  // Group attempts by quiz for the multi-line chart
  const quizIds = useMemo(() => [...new Set(studentAttempts.map(a => a.quiz_id))], [studentAttempts]);

  // Build timeline: each row is { date, [quizId]: score }
  const chartData = useMemo(() => {
    return studentAttempts.map((a, i) => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
      return {
        label: `#${i + 1}`,
        date: new Date(a.completed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        quiz: a.quizTitle,
        score: pct,
        quizId: a.quiz_id,
      };
    });
  }, [studentAttempts]);

  // Per-quiz breakdown: group attempts by quiz for individual line series
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

  // Summary stats
  const allScores = studentAttempts.map(a => a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0);
  const avg = allScores.length ? Math.round(allScores.reduce((s, x) => s + x, 0) / allScores.length) : 0;
  const best = allScores.length ? Math.max(...allScores) : 0;
  const passed = allScores.filter(s => s >= 60).length;
  const passRate = allScores.length ? Math.round((passed / allScores.length) * 100) : 0;

  const initials = studentName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const scoreBadge = (score: number) =>
    cn(
      "inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-full text-xs font-semibold",
      score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : score >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          : "bg-destructive/10 text-destructive"
    );

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
              <p className="text-sm text-muted-foreground">{studentAttempts.length} tentative{studentAttempts.length > 1 ? "s" : ""} au total</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Target className="w-4 h-4" />, label: "Score moyen", value: `${avg}%` },
              { icon: <Award className="w-4 h-4" />, label: "Meilleur score", value: `${best}%` },
              { icon: <TrendingUp className="w-4 h-4" />, label: "Taux réussite", value: `${passRate}%` },
              { icon: <Calendar className="w-4 h-4" />, label: "QCM distincts", value: quizIds.length },
            ].map(k => (
              <div key={k.label} className="bg-muted/40 rounded-xl p-3 flex flex-col gap-1">
                <div className="text-primary">{k.icon}</div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold text-foreground">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Evolution chart — all attempts combined */}
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
                      formatter={(v: number, _: string, props: any) => [`${v}% — ${props.payload.quiz}`, props.payload.date]}
                    />
                    <ReferenceLine y={60} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "Seuil 60%", position: "insideTopRight", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
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

          {/* Per-quiz evolution charts */}
          {perQuizSeries.length > 1 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Progression par QCM</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="n" type="number" allowDuplicatedCategory={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Tentative n°", position: "insideBottomRight", offset: -4, fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
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
                    {["#", "QCM", "Module", "Score", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...studentAttempts].reverse().map((a, i) => {
                    const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0;
                    return (
                      <tr key={a.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{studentAttempts.length - i}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{a.quizTitle}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.moduleTitle}</td>
                        <td className="px-4 py-2.5">
                          <span className={scoreBadge(pct)}>{pct}%</span>
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
