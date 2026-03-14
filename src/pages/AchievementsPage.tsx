import { Trophy, Zap, Star, Clock } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import XpBar from "@/components/gamification/XpBar";
import BadgeCard from "@/components/gamification/BadgeCard";
import { useGamification } from "@/hooks/use-gamification";

export default function AchievementsPage() {
  const { badges, userBadges, xpHistory, loading, xp, level, xpProgress, xpInCurrentLevel, earnedBadgeIds } = useGamification();
  const earnedCount = userBadges.length;
  const totalCount = badges.length;

  const categoryLabels: Record<string, string> = { quizzes: "QCM", courses: "Cours", xp: "Expérience", general: "Général" };
  const categories = [...new Set(badges.map(b => b.category))];

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<Trophy className="w-5 h-5" />}
          title="Succès & Progression"
          subtitle={`${earnedCount}/${totalCount} badges débloqués`}
        />

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <>
            <XpBar xp={xp} level={level} xpProgress={xpProgress} xpInCurrentLevel={xpInCurrentLevel} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Trophy className="w-5 h-5 text-warning" />, value: earnedCount, label: "Badges gagnés" },
                { icon: <Star className="w-5 h-5 text-warning" />, value: level, label: "Niveau actuel" },
                { icon: <Zap className="w-5 h-5 text-warning" />, value: xp, label: "XP total" },
                { icon: <Clock className="w-5 h-5 text-primary" />, value: xpHistory.length, label: "Actions XP" },
              ].map((stat, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/60 p-4 shadow-soft text-center">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <p className="text-xl font-bold font-display text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {categories.map(cat => {
              const catBadges = badges.filter(b => b.category === cat);
              return (
                <div key={cat}>
                  <h2 className="text-base font-semibold font-display text-foreground mb-3">{categoryLabels[cat] || cat}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catBadges.map(badge => {
                      const ub = userBadges.find(u => u.badge_id === badge.id);
                      return <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} earnedAt={ub?.earned_at} />;
                    })}
                  </div>
                </div>
              );
            })}

            {xpHistory.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-soft">
                <h2 className="font-semibold font-display text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" /> Historique XP
                </h2>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {xpHistory.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-sm text-foreground">{tx.reason}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
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
