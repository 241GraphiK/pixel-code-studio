import { useState, useEffect } from "react";
import { BookOpen, FileQuestion, Trophy, Clock, TrendingUp, Users, Star, Zap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/shared/StatCard";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import XpBar from "@/components/gamification/XpBar";
import BadgeCard from "@/components/gamification/BadgeCard";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const firstName = profile?.name?.split(" ")[0] || "Utilisateur";
  const { xp, level, xpProgress, xpInCurrentLevel, badges, userBadges, earnedBadgeIds } = useGamification();

  const [quizCount, setQuizCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [recentModules, setRecentModules] = useState<any[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; xp: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;

      // Quiz attempts stats
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, max_score")
        .eq("user_id", user.id);
      if (attempts) {
        setQuizCount(attempts.length);
        if (attempts.length > 0) {
          setAvgScore(Math.round(
            attempts.reduce((s, a) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / attempts.length
          ));
        }
      }

      // Completed courses
      const { data: progress } = await supabase
        .from("course_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed", true);
      setCompletedCourses(progress?.length || 0);

      const { data: allCourses } = await supabase.from("courses").select("id");
      setTotalCourses(allCourses?.length || 0);

      // Recent modules
      const { data: mods } = await supabase
        .from("modules")
        .select("id, title, field, level")
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentModules(mods || []);

      // Recent quizzes
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("id, title, difficulty, duration, description")
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentQuizzes(quizzes || []);

      // Leaderboard by XP
      const { data: topUsers } = await supabase
        .from("profiles")
        .select("name, xp")
        .order("xp", { ascending: false })
        .limit(5);
      setLeaderboard(topUsers || []);

      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {firstName} 👋</h1>
          <p className="text-muted-foreground">Voici un résumé de votre progression</p>
        </div>

        <XpBar xp={xp} level={level} xpProgress={xpProgress} xpInCurrentLevel={xpInCurrentLevel} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Cours terminés" value={`${completedCourses}/${totalCourses}`} icon={<BookOpen className="w-5 h-5" />} />
          <StatCard title="QCM passés" value={quizCount} icon={<FileQuestion className="w-5 h-5" />} />
          <StatCard title="Score moyen" value={`${avgScore}%`} icon={<Trophy className="w-5 h-5" />} />
          <StatCard title="Niveau" value={`Niv. ${level}`} icon={<Star className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-soft lg:col-span-1">
            <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" /> Classement XP
            </h2>
            <div className="space-y-3">
              {leaderboard.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> {s.xp} XP</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun classement pour le moment</p>
              )}
            </div>
          </div>

          {/* Recent modules */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Modules récents</h2>
              <Link to="/modules" className="text-sm text-primary hover:underline">Voir tout →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentModules.map(m => (
                <Link key={m.id} to={`/modules/${m.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.level}</span>
                    <span className="text-xs text-muted-foreground">{m.field}</span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{m.title}</h3>
                </Link>
              ))}
              {recentModules.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-4">Aucun module pour le moment</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">QCM récents</h2>
            <Link to="/quizzes" className="text-sm text-primary hover:underline">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentQuizzes.map(q => (
              <Link key={q.id} to={`/quizzes/${q.id}`} className="bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.difficulty === "easy" ? "bg-success/10 text-success" : q.difficulty === "medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                    {q.difficulty === "easy" ? "Facile" : q.difficulty === "medium" ? "Moyen" : "Difficile"}
                  </span>
                  <span className="text-xs text-muted-foreground">{q.duration} min</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{q.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{q.description || ""}</p>
              </Link>
            ))}
            {recentQuizzes.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3 text-center py-4">Aucun QCM pour le moment</p>
            )}
          </div>
        </div>

        {badges.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" /> Badges
              </h2>
              <Link to="/achievements" className="text-sm text-primary hover:underline">Voir tout →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {badges.slice(0, 6).map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
