import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "@/components/layout/NotificationBell";
import {
  LayoutDashboard, BookOpen, FileQuestion, Users, BarChart3,
  Settings, GraduationCap, Moon, Sun, LogOut, Menu, X,
  Shield, ChevronLeft, Trophy, Crown, MessageSquare, PhoneCall, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: string;
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: ["student", "teacher", "admin"], group: "main" },
  { label: "Modules", href: "/modules", icon: BookOpen, roles: ["student", "teacher", "admin"], group: "main" },
  { label: "QCM", href: "/quizzes", icon: FileQuestion, roles: ["student", "teacher", "admin"], group: "main" },
  { label: "Classes", href: "/classes", icon: Users, roles: ["student", "teacher", "admin"], group: "main" },
  { label: "Calendrier", href: "/calendar", icon: Calendar, roles: ["student", "teacher", "admin"], group: "main" },
  { label: "Succès", href: "/achievements", icon: Trophy, roles: ["student", "teacher", "admin"], group: "social" },
  { label: "Classement", href: "/leaderboard", icon: Crown, roles: ["student", "teacher", "admin"], group: "social" },
  { label: "Messages", href: "/messages", icon: MessageSquare, roles: ["student", "teacher", "admin"], group: "social" },
  { label: "Appels", href: "/call-history", icon: PhoneCall, roles: ["student", "teacher", "admin"], group: "social" },
  { label: "Mes modules", href: "/teacher/modules", icon: BookOpen, roles: ["teacher", "admin"], group: "teacher" },
  { label: "Stats étudiants", href: "/teacher/stats", icon: BarChart3, roles: ["teacher", "admin"], group: "teacher" },
  { label: "Statistiques", href: "/stats", icon: BarChart3, roles: ["student", "teacher", "admin"], group: "other" },
  { label: "Administration", href: "/admin", icon: Shield, roles: ["admin"], group: "other" },
  { label: "Paramètres", href: "/settings", icon: Settings, roles: ["student", "teacher", "admin"], group: "other" },
];

const groupLabels: Record<string, string> = {
  main: "Navigation",
  social: "Communauté",
  teacher: "Enseignant",
  other: "Autres",
};

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (profile?.role || "student") as UserRole;
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  const roleLabel = userRole === "student" ? "Étudiant" : userRole === "teacher" ? "Enseignant" : "Administrateur";
  const roleBadgeClass = userRole === "student" ? "bg-primary/10 text-primary" : userRole === "teacher" ? "bg-success/10 text-success" : "bg-warning/10 text-warning";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "?";

  const groups = [...new Set(filteredItems.map(i => i.group))];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-5 h-16 border-b border-border/50 shrink-0", collapsed && "justify-center px-3")}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold font-display text-foreground tracking-tight">Mentor</span>
        )}
      </div>

      {/* User card */}
      {!collapsed && profile && (
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile.name}</p>
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider", roleBadgeClass)}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin">
        {groups.map(group => {
          const items = filteredItems.filter(i => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {groupLabels[group] || group}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "drop-shadow-sm")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-border/50 p-3 space-y-0.5 shrink-0">
        <NotificationBell collapsed={collapsed} />
        
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {!collapsed && <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>}
        </button>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-card border border-border shadow-medium"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[272px] bg-card border-r border-border/50 transform transition-transform duration-300 ease-out md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-screen bg-card/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 sticky top-0",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[26px] w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-10"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  );
}
