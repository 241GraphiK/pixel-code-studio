import { Trophy, Zap, Star, Clock } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import XpBar from "@/components/gamification/XpBar";
import BadgeCard from "@/components/gamification/BadgeCard";
import { useGamification } from "@/hooks/use-gamification";

export default function AchievementsPage() {
  const {
    badges, userBadges, xpHistory, loading,
    xp, level, xpProgress, xpInCurrentLevel, earnedBadgeIds,
  } = useGamification();

  const earnedCount = userBadges.length;
  const totalCount = badges.length;

  const categoryLabels: Record<string, string> = {
    quizzes: "QCM",
    courses: "Cours",
    xp: "Expérience",
    general: "Général",
  };

  const categories = [...new Set(badges.map(b => b.category))];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-warning" /> Succès & Progression
          </h1>
          <p className="text-muted-foreground">
            {earnedCount}/{totalCount} badges débloqués
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* XP Overview */}
            <XpBar xp={xp} level={level} xpProgress={xpProgress} xpInCurrentLevel={xpInCurrentLevel} />

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4 shadow-soft text-center">
                <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{earnedCount}</p>
                <p className="text-xs text-muted-foreground">Badges gagnés</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 shadow-soft text-center">
                <Star className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{level}</p>
                <p className="text-xs text-muted-foreground">Niveau actuel</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 shadow-soft text-center">
                <Zap className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{xp}</p>
                <p className="text-xs text-muted-foreground">XP total</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 shadow-soft text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{xpHistory.length}</p>
                <p className="text-xs text-muted-foreground">Actions XP</p>
              </div>
            </div>

            {/* Badges by category */}
            {categories.map(cat => {
              const catBadges = badges.filter(b => b.category === cat);
              return (
                <div key={cat}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {categoryLabels[cat] || cat}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catBadges.map(badge => {
                      const ub = userBadges.find(u => u.badge_id === badge.id);
                      return (
                        <BadgeCard
                          key={badge.id}
                          badge={badge}
                          earned={earnedBadgeIds.has(badge.id)}
                          earnedAt={ub?.earned_at}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* XP History */}
            {xpHistory.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" /> Historique XP
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {xpHistory.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm text-foreground">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-success">+{tx.amount} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
