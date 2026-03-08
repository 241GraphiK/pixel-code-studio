import { BookOpen, FileQuestion, Trophy, Clock, TrendingUp, Users, Star } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { modules, quizzes, studentProgress, weeklyScores } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import XpBar from "@/components/gamification/XpBar";
import BadgeCard from "@/components/gamification/BadgeCard";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { profile } = useAuth();
  const firstName = profile?.name?.split(" ")[0] || "Utilisateur";
  const { xp, level, xpProgress, xpInCurrentLevel, badges, userBadges, earnedBadgeIds } = useGamification();

  // For now use mock progress data — will be replaced with real data later
  const myProgress = studentProgress[0];
  const recentModules = modules.slice(0, 3);
  const recentQuizzes = quizzes.slice(0, 3);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {firstName} 👋</h1>
          <p className="text-muted-foreground">Voici un résumé de votre progression</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Modules complétés" value={`${myProgress?.completedModules || 0}/${myProgress?.totalModules || 0}`} icon={<BookOpen className="w-5 h-5" />} trend={{ value: 12, positive: true }} />
          <StatCard title="QCM passés" value={myProgress?.quizzesPassed || 0} icon={<FileQuestion className="w-5 h-5" />} trend={{ value: 8, positive: true }} />
          <StatCard title="Score moyen" value={`${myProgress?.score || 0}%`} icon={<Trophy className="w-5 h-5" />} trend={{ value: 5, positive: true }} />
          <StatCard title="Temps d'étude" value={myProgress?.studyTime || "0h"} icon={<Clock className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Évolution des scores
              </h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" /> Classement
            </h2>
            <div className="space-y-3">
              {studentProgress.slice(0, 5).map((s) => (
                <div key={s.studentId} className="flex items-center gap-3 p-2 rounded-lg">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.rank <= 3 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.studentName}</p>
                    <p className="text-xs text-muted-foreground">{s.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Modules en cours</h2>
            <Link to="/modules" className="text-sm text-primary hover:underline">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentModules.map((m) => (
              <Link key={m.id} to={`/modules/${m.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.level}</span>
                  <span className="text-xs text-muted-foreground">{m.field}</span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">{m.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.teacherName}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-foreground">{m.progress}%</span>
                  </div>
                  <Progress value={m.progress} className="h-1.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">QCM récents</h2>
            <Link to="/quizzes" className="text-sm text-primary hover:underline">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentQuizzes.map((q) => (
              <Link key={q.id} to={`/quizzes/${q.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                    {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                  </span>
                  <span className="text-xs text-muted-foreground">{q.duration} min</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{q.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{q.description}</p>
                {q.bestScore !== undefined ? (
                  <p className="text-sm font-medium text-success">Meilleur score : {q.bestScore}%</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Pas encore passé</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
