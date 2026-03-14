import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Target, Award, Zap, Download } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import { exportQuizResultsPdf, exportTeacherStatsPdf } from "@/lib/pdf-export";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = ["hsl(252, 85%, 60%)", "hsl(160, 84%, 39%)", "hsl(43, 96%, 56%)", "hsl(200, 98%, 48%)", "hsl(0, 72%, 51%)", "hsl(280, 70%, 55%)"];

export default function StatsPage() {
  const { user, profile } = useAuth();
  const { xp, level } = useGamification();
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [moduleScores, setModuleScores] = useState<{ subject: string; score: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ week: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherAttempts, setTeacherAttempts] = useState<any[]>([]);
  const isTeacher = profile?.role === "teacher" || profile?.role === "admin";

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: attempts } = await supabase.from("quiz_attempts").select("*, quizzes(title, module_id, modules(title))").eq("user_id", user.id).order("completed_at", { ascending: true });
      setQuizAttempts(attempts || []);
      const { data: progress } = await supabase.from("course_progress").select("id").eq("user_id", user.id).eq("completed", true);
      setCompletedCourses(progress?.length || 0);
      const { data: allCourses } = await supabase.from("courses").select("id");
      setTotalCourses(allCourses?.length || 0);

      if (attempts && attempts.length > 0) {
        const moduleMap: Record<string, { total: number; count: number; name: string }> = {};
        attempts.forEach((a: any) => {
          const modTitle = a.quizzes?.modules?.title || "Inconnu";
          const modId = a.quizzes?.module_id || "unknown";
          if (!moduleMap[modId]) moduleMap[modId] = { total: 0, count: 0, name: modTitle };
          moduleMap[modId].total += a.max_score > 0 ? (a.score / a.max_score) * 100 : 0;
          moduleMap[modId].count++;
        });
        setModuleScores(Object.values(moduleMap).map(m => ({ subject: m.name.length > 15 ? m.name.slice(0, 15) + "…" : m.name, score: Math.round(m.total / m.count) })));
        const weekly: { week: string; score: number }[] = [];
        const chunkSize = Math.max(1, Math.ceil(attempts.length / 8));
        for (let i = 0; i < attempts.length; i += chunkSize) {
          const chunk = attempts.slice(i, i + chunkSize);
          const avgScore = Math.round(chunk.reduce((sum: number, a: any) => sum + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / chunk.length);
          weekly.push({ week: `#${weekly.length + 1}`, score: avgScore });
        }
        setWeeklyData(weekly);
      }

      if (isTeacher) {
        const { data: myModules } = await supabase.from("modules").select("id").eq("teacher_id", user.id);
        if (myModules?.length) {
          const moduleIds = myModules.map(m => m.id);
          const { data: myQuizzes } = await supabase.from("quizzes").select("id, title, module_id").in("module_id", moduleIds);
          if (myQuizzes?.length) {
            const quizIds = myQuizzes.map(q => q.id);
            const { data: allAttempts } = await supabase.from("quiz_attempts").select("*").in("quiz_id", quizIds).order("completed_at", { ascending: false });
            if (allAttempts?.length) {
              const studentIds = [...new Set(allAttempts.map(a => a.user_id))];
              const { data: students } = await supabase.from("profiles").select("id, name").in("id", studentIds);
              const studentMap = new Map(students?.map(s => [s.id, s.name]) || []);
              const quizMap = new Map(myQuizzes.map(q => [q.id, { title: q.title, module_id: q.module_id }]));
              const { data: mods } = await supabase.from("modules").select("id, title").in("id", moduleIds);
              const modMap = new Map(mods?.map(m => [m.id, m.title]) || []);
              setTeacherAttempts(allAttempts.map(a => ({ ...a, studentName: studentMap.get(a.user_id) || "Inconnu", quizTitle: quizMap.get(a.quiz_id)?.title || "Inconnu", moduleTitle: modMap.get(quizMap.get(a.quiz_id)?.module_id || "") || "Inconnu" })));
            }
          }
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user, isTeacher]);

  const avgScore = quizAttempts.length > 0 ? Math.round(quizAttempts.reduce((s, a) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / quizAttempts.length) : 0;
  const completionData = [{ name: "Terminés", value: completedCourses }, { name: "Restants", value: Math.max(0, totalCourses - completedCourses) }];

  const handleExportResults = () => {
    if (teacherAttempts.length === 0) { toast.error("Aucune donnée à exporter"); return; }
    exportQuizResultsPdf(teacherAttempts.map(a => ({ studentName: a.studentName, quizTitle: a.quizTitle, score: a.score, maxScore: a.max_score, percentage: a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0, completedAt: new Date(a.completed_at).toLocaleDateString("fr-FR") })), profile?.name || "Enseignant");
    toast.success("PDF des résultats exporté !");
  };

  const handleExportStats = () => {
    if (teacherAttempts.length === 0) { toast.error("Aucune donnée à exporter"); return; }
    const modMap: Record<string, { name: string; scores: number[] }> = {};
    teacherAttempts.forEach((a: any) => { const key = a.moduleTitle; if (!modMap[key]) modMap[key] = { name: key, scores: [] }; modMap[key].scores.push(a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0); });
    const moduleStats = Object.values(modMap).map(m => ({ moduleName: m.name, avgScore: Math.round(m.scores.reduce((s, v) => s + v, 0) / m.scores.length), bestScore: Math.max(...m.scores), worstScore: Math.min(...m.scores), attempts: m.scores.length }));
    const studentIds = new Set(teacherAttempts.map((a: any) => a.user_id));
    const globalAvg = Math.round(teacherAttempts.reduce((s: number, a: any) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / teacherAttempts.length);
    exportTeacherStatsPdf(moduleStats, studentIds.size, teacherAttempts.length, globalAvg, profile?.name || "Enseignant");
    toast.success("PDF des statistiques exporté !");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<BarChart3 className="w-5 h-5" />}
          title="Statistiques"
          subtitle="Suivez votre progression détaillée"
          actions={isTeacher && !loading && teacherAttempts.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportResults} className="rounded-xl"><Download className="w-4 h-4 mr-1" /> Résultats PDF</Button>
              <Button variant="outline" size="sm" onClick={handleExportStats} className="rounded-xl"><Download className="w-4 h-4 mr-1" /> Stats PDF</Button>
            </div>
          ) : undefined}
        />

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Score moyen" value={`${avgScore}%`} icon={<Target className="w-5 h-5" />} />
              <StatCard title="QCM passés" value={quizAttempts.length} icon={<TrendingUp className="w-5 h-5" />} />
              <StatCard title="Cours terminés" value={`${completedCourses}/${totalCourses}`} icon={<Award className="w-5 h-5" />} />
              <StatCard title="XP / Niveau" value={`${xp} XP · Niv.${level}`} icon={<Zap className="w-5 h-5" />} />
            </div>

            {isTeacher && teacherAttempts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Étudiants actifs" value={new Set(teacherAttempts.map((a: any) => a.user_id)).size} icon={<Award className="w-5 h-5" />} />
                <StatCard title="Tentatives totales" value={teacherAttempts.length} icon={<TrendingUp className="w-5 h-5" />} />
                <StatCard title="Score moyen global" value={`${Math.round(teacherAttempts.reduce((s: number, a: any) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / teacherAttempts.length)}%`} icon={<Target className="w-5 h-5" />} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weeklyData.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
                  <h2 className="font-semibold font-display text-foreground mb-4">Évolution des scores</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {moduleScores.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
                  <h2 className="font-semibold font-display text-foreground mb-4">Scores par module</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleScores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {moduleScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
                <h2 className="font-semibold font-display text-foreground mb-4">Complétion des cours</h2>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {moduleScores.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
                  <h2 className="font-semibold font-display text-foreground mb-4">Points forts & faibles</h2>
                  <div className="space-y-4">
                    {[...moduleScores].sort((a, b) => b.score - a.score).map(s => (
                      <div key={s.subject}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-foreground font-medium">{s.subject}</span>
                          <span className={s.score >= 80 ? "text-success font-semibold" : s.score >= 60 ? "text-warning font-semibold" : "text-destructive font-semibold"}>{s.score}%</span>
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
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-semibold">Pas encore de données</p>
                <p className="text-sm mt-1">Passez des QCM et terminez des cours pour voir vos statistiques</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
