import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, FileQuestion, Users, BarChart3,
  Settings, GraduationCap, Moon, Sun, LogOut, Menu, X,
  Shield, UserCog, ChevronDown, Trophy, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: ["student", "teacher", "admin"] },
  { label: "Modules", href: "/modules", icon: BookOpen, roles: ["student", "teacher", "admin"] },
  { label: "QCM", href: "/quizzes", icon: FileQuestion, roles: ["student", "teacher", "admin"] },
  { label: "Classes", href: "/classes", icon: Users, roles: ["student", "teacher", "admin"] },
  { label: "Succès", href: "/achievements", icon: Trophy, roles: ["student", "teacher", "admin"] },
  { label: "Classement", href: "/leaderboard", icon: Crown, roles: ["student", "teacher", "admin"] },
  { label: "Mes modules", href: "/teacher/modules", icon: BookOpen, roles: ["teacher"] },
  { label: "Statistiques", href: "/stats", icon: BarChart3, roles: ["student", "teacher", "admin"] },
  { label: "Utilisateurs", href: "/admin/users", icon: UserCog, roles: ["admin"] },
  { label: "Administration", href: "/admin", icon: Shield, roles: ["admin"] },
  { label: "Paramètres", href: "/settings", icon: Settings, roles: ["student", "teacher", "admin"] },
];

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
  const roleColor = userRole === "student" ? "text-primary" : userRole === "teacher" ? "text-success" : "text-warning";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "?";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-border", collapsed && "justify-center px-2")}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Mentor</h1>
            <p className={cn("text-xs font-medium", roleColor)}>{roleLabel}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>}
        </button>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border shadow-medium"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      <aside className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform", collapsed ? "-rotate-90" : "rotate-90")} />
        </button>
      </aside>
    </>
  );
}
