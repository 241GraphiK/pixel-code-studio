import { ReactNode } from "react";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-2xl">🚫</span>
        </div>
        <h3 className="font-semibold text-foreground mb-2">Accès refusé</h3>
        <p className="text-sm">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}