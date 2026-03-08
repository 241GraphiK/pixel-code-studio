import { Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface XpBarProps {
  xp: number;
  level: number;
  xpProgress: number;
  xpInCurrentLevel: number;
  compact?: boolean;
}

export default function XpBar({ xp, level, xpProgress, xpInCurrentLevel, compact }: XpBarProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-bold text-warning">
          <Star className="w-3.5 h-3.5 fill-warning" />
          Niv. {level}
        </div>
        <Progress value={xpProgress} className="h-1.5 flex-1 max-w-20" />
        <span className="text-xs text-muted-foreground">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-warning fill-warning" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Niveau</p>
            <p className="text-2xl font-bold text-foreground">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">XP Total</p>
          <p className="text-xl font-bold text-foreground flex items-center gap-1">
            <Zap className="w-4 h-4 text-warning" /> {xp}
          </p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progression vers Niv. {level + 1}</span>
          <span>{xpInCurrentLevel}/100 XP</span>
        </div>
        <Progress value={xpProgress} className="h-2.5" />
      </div>
    </div>
  );
}
