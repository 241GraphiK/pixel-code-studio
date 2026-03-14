import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "group relative bg-card rounded-2xl border border-border/60 p-5 shadow-soft transition-all duration-300 hover:shadow-medium hover:border-border",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</p>
          <p className="text-2xl font-bold font-display text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-semibold", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% cette semaine
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
          {icon}
        </div>
      </div>
    </div>
  );
}
