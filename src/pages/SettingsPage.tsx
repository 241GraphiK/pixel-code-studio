import { useState } from "react";
import { Settings, User, Bell, Palette, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [field, setField] = useState(profile?.field || "");
  const [notifications, setNotifications] = useState({ email: true, push: true, quiz: true });
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, institution, field, updated_at: new Date().toISOString() } as any)
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profil mis à jour !" });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe modifié !" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const roleLabel = profile?.role === "student" ? "Étudiant" : profile?.role === "teacher" ? "Enseignant" : "Administrateur";
  const initials = profile?.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Paramètres
          </h1>
          <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1"><User className="w-4 h-4" /> Profil</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1"><Palette className="w-4 h-4" /> Apparence</TabsTrigger>
            <TabsTrigger value="security" className="gap-1"><Shield className="w-4 h-4" /> Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">{roleLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ""} readOnly className="opacity-60" /></div>
                <div className="space-y-2"><Label>Institution</Label><Input value={institution} onChange={(e) => setInstitution(e.target.value)} /></div>
                <div className="space-y-2"><Label>Filière</Label><Input value={field} onChange={(e) => setField(e.target.value)} /></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-6">
              {[
                { key: "email" as const, label: "Notifications par email", desc: "Recevez des résumés par email" },
                { key: "push" as const, label: "Notifications push", desc: "Notifications dans le navigateur" },
                { key: "quiz" as const, label: "Rappels de QCM", desc: "Rappels avant les deadlines" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <div><p className="font-medium text-foreground">{n.label}</p><p className="text-sm text-muted-foreground">{n.desc}</p></div>
                  <Switch checked={notifications[n.key]} onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-foreground">Mode sombre</p><p className="text-sm text-muted-foreground">Basculer entre les thèmes clair et sombre</p></div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
              <div className="space-y-2"><Label>Confirmer</Label><Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              <Button onClick={handleChangePassword}>Changer le mot de passe</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
