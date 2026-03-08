import { Shield, Users, BookOpen, FileQuestion, BarChart3, UserCog, TrendingUp, Activity } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { adminStats, studentProgress } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const activityData = [
  { day: "Lun", users: 85 }, { day: "Mar", users: 102 }, { day: "Mer", users: 95 },
  { day: "Jeu", users: 110 }, { day: "Ven", users: 127 }, { day: "Sam", users: 68 }, { day: "Dim", users: 45 },
];

export default function AdminPage() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Administration
          </h1>
          <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Utilisateurs" value={adminStats.totalUsers} icon={<Users className="w-5 h-5" />} trend={{ value: 12, positive: true }} />
          <StatCard title="Modules" value={adminStats.totalModules} icon={<BookOpen className="w-5 h-5" />} />
          <StatCard title="QCM" value={adminStats.totalQuizzes} icon={<FileQuestion className="w-5 h-5" />} />
          <StatCard title="Actifs aujourd'hui" value={adminStats.activeToday} icon={<Activity className="w-5 h-5" />} trend={{ value: 8, positive: true }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Activité quotidienne
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserCog className="w-4 h-4 text-primary" /> Répartition
            </h2>
            <div className="space-y-4">
              {[
                { label: "Étudiants", value: adminStats.totalStudents, total: adminStats.totalUsers, color: "bg-primary" },
                { label: "Enseignants", value: adminStats.totalTeachers, total: adminStats.totalUsers, color: "bg-success" },
                { label: "Administrateurs", value: adminStats.totalAdmins, total: adminStats.totalUsers, color: "bg-warning" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{r.label}</span>
                    <span className="text-muted-foreground">{r.value}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${(r.value / r.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
              <div><p className="text-2xl font-bold text-foreground">{adminStats.totalCourses}</p><p className="text-xs text-muted-foreground">Cours</p></div>
              <div><p className="text-2xl font-bold text-foreground">{adminStats.totalClasses}</p><p className="text-xs text-muted-foreground">Classes</p></div>
              <div><p className="text-2xl font-bold text-foreground">{adminStats.avgScore}%</p><p className="text-xs text-muted-foreground">Score moyen</p></div>
              <div><p className="text-2xl font-bold text-foreground">{adminStats.totalQuizzes}</p><p className="text-xs text-muted-foreground">QCM créés</p></div>
            </div>
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
          <h2 className="font-semibold text-foreground mb-4">Meilleurs étudiants</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Nom</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Modules</th>
                  <th className="pb-3 font-medium">QCM</th>
                  <th className="pb-3 font-medium">Temps</th>
                </tr>
              </thead>
              <tbody>
                {studentProgress.map((s) => (
                  <tr key={s.studentId} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{s.rank}</td>
                    <td className="py-3 text-foreground">{s.studentName}</td>
                    <td className="py-3"><span className={s.score >= 80 ? "text-success" : s.score >= 60 ? "text-warning" : "text-destructive"}>{s.score}%</span></td>
                    <td className="py-3 text-muted-foreground">{s.completedModules}/{s.totalModules}</td>
                    <td className="py-3 text-muted-foreground">{s.quizzesPassed}</td>
                    <td className="py-3 text-muted-foreground">{s.studyTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
