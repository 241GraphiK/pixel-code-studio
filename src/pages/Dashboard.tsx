import { useState, useEffect } from "react";
import { BookOpen, FileQuestion, Trophy, Clock, TrendingUp, Users, Star, Zap, Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [leaderboard, setLeaderboard] = useState<{ name: string; xp: number; avatar_url: string | null; gamification_level: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    const { data: topUsers } = await supabase
      .from("profiles")
      .select("name, xp, avatar_url, gamification_level")
      .order("xp", { ascending: false })
      .limit(10);
    setLeaderboard(topUsers || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [attemptsRes, progressRes, coursesRes, modsRes, quizzesRes] = await Promise.all([
        supabase.from("quiz_attempts").select("score, max_score").eq("user_id", user.id),
        supabase.from("course_progress").select("id").eq("user_id", user.id).eq("completed", true),
        supabase.from("courses").select("id"),
        supabase.from("modules").select("id, title, field, level").order("created_at", { ascending: false }).limit(3),
        supabase.from("quizzes").select("id, title, difficulty, duration, description").order("created_at", { ascending: false }).limit(3),
      ]);

      if (attemptsRes.data) {
        setQuizCount(attemptsRes.data.length);
        if (attemptsRes.data.length > 0) {
          setAvgScore(Math.round(
            attemptsRes.data.reduce((s, a) => s + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0) / attemptsRes.data.length
          ));
        }
      }
      setCompletedCourses(progressRes.data?.length || 0);
      setTotalCourses(coursesRes.data?.length || 0);
      setRecentModules(modsRes.data || []);
      setRecentQuizzes(quizzesRes.data || []);

      await fetchLeaderboard();
      setLoading(false);
    };
    fetchData();

    // Realtime leaderboard
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
              <Crown className="w-4 h-4 text-warning" /> Classement XP
            </h2>
            <div className="space-y-2">
              {leaderboard.map((s, i) => {
                const isCurrentUser = s.name === firstName;
                const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
                return (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {i < 3 ? <Medal className={`w-4 h-4 ${medalColors[i]}`} /> : i + 1}
                    </span>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {s.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name} {isCurrentUser && <span className="text-xs text-primary">(vous)</span>}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3 text-warning" /> {s.xp} XP · Niv. {s.gamification_level}
                      </p>
                    </div>
                  </div>
                );
              })}
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
