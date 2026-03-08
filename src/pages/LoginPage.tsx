import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Connexion réussie", description: "Bienvenue sur Mentor !" });
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Mentor</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace d'apprentissage</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">Mot de passe oublié ?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">S'inscrire</Link>
          </p>
        </div>
      </div>
      {/* Right side - decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center gradient-primary p-12">
        <div className="text-center space-y-4 text-primary-foreground">
          <GraduationCap className="w-16 h-16 mx-auto opacity-90" />
          <h2 className="text-3xl font-bold">Bienvenue sur Mentor</h2>
          <p className="text-lg opacity-80 max-w-sm">Votre plateforme d'apprentissage interactive pour réussir vos études.</p>
        </div>
      </div>
    </div>
  );
}
