import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const floatingOrb = {
  animate: {
    y: [0, -20, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Erreur de connexion", description: error, variant: "destructive" });
    } else {
      toast({ title: "Connexion réussie", description: "Bienvenue sur Mentor !" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background orbs */}
      <motion.div {...floatingOrb} className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-info/5 blur-3xl pointer-events-none" />

      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display text-foreground">Mentor</span>
          </motion.div>

          {/* Header */}
          <motion.div custom={1} variants={fadeUp}>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Bon retour parmi nous
            </h1>
            <p className="text-muted-foreground mt-2">Accédez à votre espace d'apprentissage personnalisé</p>
          </motion.div>

          {/* Form */}
          <motion.form custom={2} variants={fadeUp} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-card border-border/60 px-4 transition-all duration-300 focus:shadow-glow focus:border-primary/40"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-card border-border/60 px-4 pr-12 transition-all duration-300 focus:shadow-glow focus:border-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-lg transition-all duration-300 group" disabled={loading}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p custom={3} variants={fadeUp} className="text-sm text-center text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold transition-colors">
              Créer un compte
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right - Visual panel */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(280_80%_65%/0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(200_98%_48%/0.3),transparent_50%)]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 text-center space-y-8 text-primary-foreground px-12 max-w-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/20"
          >
            <GraduationCap className="w-10 h-10" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl font-bold font-display"
          >
            Bienvenue sur Mentor
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg opacity-85 leading-relaxed"
          >
            Votre plateforme d'apprentissage interactive pour réussir vos études avec excellence.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {[
              { icon: BookOpen, label: "Cours interactifs" },
              { icon: Trophy, label: "Gamification" },
              { icon: Sparkles, label: "QCM intelligents" },
            ].map((item, i) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
