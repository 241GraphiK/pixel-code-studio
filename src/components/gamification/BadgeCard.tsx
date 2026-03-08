import { Trophy, Rocket, BookOpen, Award, GraduationCap, Library, Crown, Star, Flame, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/hooks/use-gamification";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  rocket: Rocket,
  "book-open": BookOpen,
  award: Award,
  "graduation-cap": GraduationCap,
  library: Library,
  crown: Crown,
  star: Star,
  flame: Flame,
};

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  compact?: boolean;
}

export default function BadgeCard({ badge, earned, earnedAt, compact }: BadgeCardProps) {
  const Icon = iconMap[badge.icon] || Trophy;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border transition-all",
        earned
          ? "bg-warning/5 border-warning/20"
          : "bg-muted/30 border-border opacity-50"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          earned ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
        )}>
          {earned ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <p className={cn("text-xs font-medium truncate", earned ? "text-foreground" : "text-muted-foreground")}>{badge.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative bg-card rounded-xl border p-5 shadow-soft transition-all",
      earned
        ? "border-warning/30 hover:shadow-medium"
        : "border-border opacity-60"
    )}>
      {earned && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-warning flex items-center justify-center">
          <Star className="w-3 h-3 text-warning-foreground fill-warning-foreground" />
        </div>
      )}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3",
        earned
          ? "bg-gradient-to-br from-warning/20 to-warning/5 text-warning"
          : "bg-muted text-muted-foreground"
      )}>
        {earned ? <Icon className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
      </div>
      <h3 className={cn("text-sm font-semibold text-center mb-1", earned ? "text-foreground" : "text-muted-foreground")}>
        {badge.name}
      </h3>
      <p className="text-xs text-muted-foreground text-center mb-2">{badge.description}</p>
      <div className="flex items-center justify-center gap-1 text-xs">
        <Star className="w-3 h-3 text-warning" />
        <span className={cn("font-medium", earned ? "text-warning" : "text-muted-foreground")}>+{badge.xp_reward} XP</span>
      </div>
      {earned && earnedAt && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Obtenu le {new Date(earnedAt).toLocaleDateString("fr-FR")}
        </p>
      )}
    </div>
  );
}
