import { useState } from "react";
import { Settings, User, Bell, Palette, Shield, Volume2, VolumeX, Phone } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCallSoundSettings, saveSettings as saveCallSoundSettings, playTestSound } from "@/lib/call-sounds";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [field, setField] = useState(profile?.field || "");
  const [notifications, setNotifications] = useState({ email: true, push: true, quiz: true });
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [callSoundSettings, setCallSoundSettings] = useState(getCallSoundSettings);

  const updateCallSounds = (updates: Partial<{ enabled: boolean; volume: number }>) => {
    const next = { ...callSoundSettings, ...updates };
    setCallSoundSettings(next);
    saveCallSoundSettings(next);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, institution, field, updated_at: new Date().toISOString() } as any).eq("id", profile.id);
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { await refreshProfile(); toast({ title: "Profil mis à jour !" }); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" }); return; }
    if (newPassword.length < 6) { toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" }); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Mot de passe modifié !" }); setNewPassword(""); setConfirmPassword(""); }
  };

  const roleLabel = profile?.role === "student" ? "Étudiant" : profile?.role === "teacher" ? "Enseignant" : "Administrateur";
  const initials = profile?.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <PageHeader
          icon={<Settings className="w-5 h-5" />}
          title="Paramètres"
          subtitle="Gérez votre compte et vos préférences"
        />

        <Tabs defaultValue="profile">
          <TabsList className="flex-wrap rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-1.5 rounded-lg text-xs"><User className="w-3.5 h-3.5" /> Profil</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 rounded-lg text-xs"><Bell className="w-3.5 h-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="calls" className="gap-1.5 rounded-lg text-xs"><Phone className="w-3.5 h-3.5" /> Appels</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 rounded-lg text-xs"><Palette className="w-3.5 h-3.5" /> Apparence</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 rounded-lg text-xs"><Shield className="w-3.5 h-3.5" /> Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-border/40">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-glow">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">{roleLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ""} readOnly className="opacity-60 rounded-xl" /></div>
                <div className="space-y-2"><Label>Institution</Label><Input value={institution} onChange={(e) => setInstitution(e.target.value)} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Filière</Label><Input value={field} onChange={(e) => setField(e.target.value)} className="rounded-xl" /></div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="rounded-xl">
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-5">
              {[
                { key: "email" as const, label: "Notifications par email", desc: "Recevez des résumés par email" },
                { key: "push" as const, label: "Notifications push", desc: "Notifications dans le navigateur" },
                { key: "quiz" as const, label: "Rappels de QCM", desc: "Rappels avant les deadlines" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-1">
                  <div><p className="font-medium text-sm text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <Switch checked={notifications[n.key]} onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calls" className="mt-6">
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm text-foreground">Sons d'appel</p><p className="text-xs text-muted-foreground">Activer les sonneries et tonalités d'appel</p></div>
                <Switch checked={callSoundSettings.enabled} onCheckedChange={(v) => updateCallSounds({ enabled: v })} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">Volume</p>
                  <div className="flex items-center gap-2">
                    {callSoundSettings.volume === 0 || !callSoundSettings.enabled ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-xs text-muted-foreground w-8 text-right">{callSoundSettings.enabled ? callSoundSettings.volume : 0}%</span>
                  </div>
                </div>
                <Slider value={[callSoundSettings.volume]} onValueChange={([v]) => updateCallSounds({ volume: v })} min={0} max={100} step={5} disabled={!callSoundSettings.enabled} className="w-full" />
              </div>
              <div className="pt-2 border-t border-border/40">
                <Button variant="outline" size="sm" disabled={!callSoundSettings.enabled || callSoundSettings.volume === 0} onClick={playTestSound} className="gap-2 rounded-xl">
                  <Volume2 className="w-4 h-4" /> Tester le son
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm text-foreground">Mode sombre</p><p className="text-xs text-muted-foreground">Basculer entre les thèmes clair et sombre</p></div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-soft space-y-4">
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Confirmer</Label><Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl" /></div>
              <Button onClick={handleChangePassword} className="rounded-xl">Changer le mot de passe</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
