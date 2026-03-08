import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Target, Clock, Award, Zap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(199, 89%, 48%)", "hsl(0, 84%, 60%)", "hsl(270, 70%, 55%)"];

export default function StatsPage() {
  const { user } = useAuth();
  const { xp, level } = useGamification();
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [moduleScores, setModuleScores] = useState<{ subject: string; score: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ week: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;

      // Fetch quiz attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title, module_id, modules(title))")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true });

      setQuizAttempts(attempts || []);

      // Completed courses
      const { data: progress } = await supabase
        .from("course_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed", true);
      setCompletedCourses(progress?.length || 0);

      // Total courses available
      const { data: allCourses } = await supabase.from("courses").select("id");
      setTotalCourses(allCourses?.length || 0);

      // Build module scores
      if (attempts && attempts.length > 0) {
        const moduleMap: Record<string, { total: number; count: number; name: string }> = {};
        attempts.forEach((a: any) => {
          const modTitle = a.quizzes?.modules?.title || "Inconnu";
          const modId = a.quizzes?.module_id || "unknown";
          if (!moduleMap[modId]) moduleMap[modId] = { total: 0, count: 0, name: modTitle };
          moduleMap[modId].total += a.max_score > 0 ? (a.score / a.max_score) * 100 : 0;
          moduleMap[modId].count++;
        });
        setModuleScores(Object.values(moduleMap).map(m => ({
          subject: m.name.length > 15 ? m.name.slice(0, 15) + "…" : m.name,
          score: Math.round(m.total / m.count),
        })));

        // Build weekly data (last 8 attempts grouped)
        const weekly: { week: string; score: number }[] = [];
        const chunkSize = Math.max(1, Math.ceil(attempts.length / 8));
        for (let i = 0; i < attempts.length; i += chunkSize) {
          const chunk = attempts.slice(i, i + chunkSize);
          const avgScore = Math.round(
            chunk.reduce((sum: number, a: any) => sum + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / chunk.length
          );
          weekly.push({ week: `#${weekly.length + 1}`, score: avgScore });
        }
        setWeeklyData(weekly);
      }

      setLoading(false);
    };
    fetch();
  }, [user]);

  const avgScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / quizAttempts.length)
    : 0;

  const completionData = [
    { name: "Terminés", value: completedCourses },
    { name: "Restants", value: Math.max(0, totalCourses - completedCourses) },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Statistiques
          </h1>
          <p className="text-muted-foreground">Suivez votre progression détaillée</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Score moyen" value={`${avgScore}%`} icon={<Target className="w-5 h-5" />} />
              <StatCard title="QCM passés" value={quizAttempts.length} icon={<TrendingUp className="w-5 h-5" />} />
              <StatCard title="Cours terminés" value={`${completedCourses}/${totalCourses}`} icon={<Award className="w-5 h-5" />} />
              <StatCard title="XP / Niveau" value={`${xp} XP · Niv.${level}`} icon={<Zap className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weeklyData.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <h2 className="font-semibold text-foreground mb-4">Évolution des scores</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {moduleScores.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <h2 className="font-semibold text-foreground mb-4">Scores par module</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleScores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {moduleScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <h2 className="font-semibold text-foreground mb-4">Complétion des cours</h2>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {moduleScores.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <h2 className="font-semibold text-foreground mb-4">Points forts & faibles</h2>
                  <div className="space-y-4">
                    {[...moduleScores].sort((a, b) => b.score - a.score).map(s => (
                      <div key={s.subject}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{s.subject}</span>
                          <span className={s.score >= 80 ? "text-success" : s.score >= 60 ? "text-warning" : "text-destructive"}>{s.score}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted">
                          <div className={`h-2 rounded-full transition-all ${s.score >= 80 ? "bg-success" : s.score >= 60 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {quizAttempts.length === 0 && moduleScores.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Pas encore de données</p>
                <p className="text-sm">Passez des QCM et terminez des cours pour voir vos statistiques</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
