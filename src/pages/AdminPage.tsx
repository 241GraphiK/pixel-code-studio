import { useState, useEffect } from "react";
import { Shield, Users, BookOpen, FileQuestion, UserCog, Search, UserCheck, UserX } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import RoleGuard from "@/components/auth/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import type { UserRole } from "@/hooks/use-auth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string | null;
  field: string | null;
  level: string | null;
  created_at: string;
  blocked: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, institution, field, level, created_at, blocked")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } else {
      setUsers((data as unknown as UserProfile[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Update profile role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (profileError) {
      toast.error("Erreur lors de la mise à jour du rôle");
      console.error(profileError);
      return;
    }

    // Update user_roles table
    const { error: deleteError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting old roles:", deleteError);
    }

    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: newRole });

    if (insertError) {
      console.error("Error inserting new role:", insertError);
    }

    toast.success(`Rôle mis à jour: ${newRole}`);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleBlockToggle = async (userId: string, blocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ blocked })
      .eq("id", userId);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
      return;
    }

    toast.success(blocked ? "Utilisateur bloqué" : "Utilisateur débloqué");
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked } : u));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === "student").length,
    teachers: users.filter(u => u.role === "teacher").length,
    admins: users.filter(u => u.role === "admin").length,
    blocked: users.filter(u => u.blocked).length,
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin": return "destructive";
      case "teacher": return "default";
      default: return "secondary";
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" /> Administration
            </h1>
            <p className="text-muted-foreground">Gestion des utilisateurs de la plateforme</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">Étudiants</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.students}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileQuestion className="w-4 h-4" />
                <span className="text-xs">Enseignants</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.teachers}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <UserCog className="w-4 h-4" />
                <span className="text-xs">Admins</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <UserX className="w-4 h-4" />
                <span className="text-xs">Bloqués</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="student">Étudiants</SelectItem>
                <SelectItem value="teacher">Enseignants</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              Actualiser
            </Button>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.blocked ? "opacity-60" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{user.name || "Sans nom"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === "student" ? "Étudiant" : user.role === "teacher" ? "Enseignant" : "Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.institution || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!user.blocked}
                            onCheckedChange={(checked) => handleBlockToggle(user.id, !checked)}
                          />
                          <span className={`text-sm ${user.blocked ? "text-destructive" : "text-success"}`}>
                            {user.blocked ? "Bloqué" : "Actif"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Étudiant</SelectItem>
                            <SelectItem value="teacher">Enseignant</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
