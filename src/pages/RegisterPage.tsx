import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, ArrowRight, Users, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student", institution: "", field: "", level: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      name: form.name,
      role: "student",
      institution: form.institution,
      field: form.field,
      level: form.level,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error, variant: "destructive" });
    } else {
      toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer votre compte." });
      navigate("/login");
    }
  };

  const inputClass = "h-12 rounded-xl bg-card border-border/60 px-4 transition-all duration-300 focus:shadow-glow focus:border-primary/40";

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background orbs */}
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-32 right-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-info/5 blur-3xl pointer-events-none" />

      {/* Left - Visual panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(280_80%_65%/0.4),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,hsl(200_98%_48%/0.3),transparent_50%)]" />

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
            Rejoignez Mentor
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg opacity-85 leading-relaxed"
          >
            Créez votre compte et commencez à apprendre dès aujourd'hui avec notre communauté.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {[
              { icon: Users, label: "Communauté active" },
              { icon: Sparkles, label: "Progression ludique" },
              { icon: Target, label: "Objectifs clairs" },
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

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-6"
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
            <h1 className="text-3xl font-bold font-display text-foreground">Créer un compte</h1>
            <p className="text-muted-foreground mt-2">Commencez votre parcours d'apprentissage</p>
          </motion.div>

          {/* Form */}
          <motion.form custom={2} variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input placeholder="Ahmed Benali" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label>Adresse email</Label>
              <Input type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirmer</Label>
                <Input type="password" placeholder="••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required className={inputClass} />
              </div>
            </div>

            <input type="hidden" name="role" value="student" />

            <div className="space-y-2">
              <Label>Institution</Label>
              <Input placeholder="Université d'Alger" value={form.institution} onChange={(e) => update("institution", e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Filière</Label>
                <Input placeholder="Informatique" value={form.field} onChange={(e) => update("field", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={form.level} onValueChange={(v) => update("level", v)}>
                  <SelectTrigger className="h-12 rounded-xl bg-card border-border/60 transition-all duration-300 focus:shadow-glow focus:border-primary/40">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {["L1", "L2", "L3", "M1", "M2"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-base shadow-glow hover:shadow-lg transition-all duration-300 group" disabled={loading}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <>
                    S'inscrire
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p custom={3} variants={fadeUp} className="text-sm text-center text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold transition-colors">
              Se connecter
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
