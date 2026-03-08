import { useState } from "react";
import { Settings, User, Bell, Palette, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { currentUser } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [notifications, setNotifications] = useState({ email: true, push: true, quiz: true });

  const handleSave = () => toast({ title: "Paramètres sauvegardés !" });

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
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.role === "student" ? "Étudiant" : currentUser.role === "teacher" ? "Enseignant" : "Admin"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>Institution</Label><Input value={currentUser.institution} readOnly /></div>
                <div className="space-y-2"><Label>Filière</Label><Input value={currentUser.field} readOnly /></div>
              </div>
              <Button onClick={handleSave}>Sauvegarder</Button>
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
              <div className="space-y-2"><Label>Mot de passe actuel</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Confirmer</Label><Input type="password" placeholder="••••••••" /></div>
              <Button onClick={handleSave}>Changer le mot de passe</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
