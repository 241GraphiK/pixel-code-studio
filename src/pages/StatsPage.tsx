import { BarChart3, TrendingUp, Target, Clock, Award } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { weeklyScores, subjectScores, studentProgress } from "@/lib/mock-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(199, 89%, 48%)", "hsl(0, 84%, 60%)", "hsl(270, 70%, 55%)"];

export default function StatsPage() {
  const myProgress = studentProgress[0]; // Will be replaced with real user data later

  const completionData = [
    { name: "Terminés", value: myProgress?.completedModules || 0 },
    { name: "Restants", value: (myProgress?.totalModules || 0) - (myProgress?.completedModules || 0) },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Score moyen" value={`${myProgress?.score || 0}%`} icon={<Target className="w-5 h-5" />} trend={{ value: 5, positive: true }} />
          <StatCard title="Classement" value={`#${myProgress?.rank || "-"}`} subtitle="sur la classe" icon={<Award className="w-5 h-5" />} />
          <StatCard title="QCM réussis" value={myProgress?.quizzesPassed || 0} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard title="Temps total" value={myProgress?.studyTime || "0h"} icon={<Clock className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line chart */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4">Évolution des scores</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4">Scores par matière</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {subjectScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4">Complétion des modules</h2>
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

          {/* Strengths */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4">Points forts & faibles</h2>
            <div className="space-y-4">
              {subjectScores.sort((a, b) => b.score - a.score).map((s) => (
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
        </div>
      </div>
    </AppLayout>
  );
}
