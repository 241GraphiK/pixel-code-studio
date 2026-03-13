import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  GraduationCap, BookOpen, Users, BarChart3, ArrowRight,
  Zap, Shield, Trophy, Star, Sparkles,
  ChevronDown, Play, Target, Brain, ArrowUpRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const features = [
  { icon: BookOpen, title: "Modules & Cours", desc: "Cours structurés par niveau et filière, avec contenu riche et ressources téléchargeables.", accent: "from-primary to-info" },
  { icon: Brain, title: "QCM Intelligents", desc: "Testez vos connaissances avec feedback immédiat et explications détaillées.", accent: "from-primary to-accent" },
  { icon: Users, title: "Classes & Collaboration", desc: "Rejoignez des classes, partagez vos progrès et compétitionnez avec vos pairs.", accent: "from-success to-info" },
  { icon: BarChart3, title: "Suivi Détaillé", desc: "Graphiques de progression, statistiques personnalisées et historique complet.", accent: "from-warning to-destructive" },
  { icon: Trophy, title: "Gamification", desc: "Gagnez des XP, montez de niveau, débloquez des badges et grimpez le classement.", accent: "from-primary to-destructive" },
  { icon: Shield, title: "Sécurisé & Fiable", desc: "Authentification robuste, données protégées et plateforme toujours disponible.", accent: "from-info to-success" },
];

const stats = [
  { value: "500+", label: "Étudiants actifs" },
  { value: "120+", label: "Modules de cours" },
  { value: "1 000+", label: "QCM disponibles" },
  { value: "98%", label: "Satisfaction" },
];

const steps = [
  { num: "01", title: "Créez votre compte", desc: "Inscription rapide en tant qu'étudiant ou enseignant.", icon: Zap },
  { num: "02", title: "Explorez les modules", desc: "Accédez aux cours par filière, niveau et spécialité.", icon: BookOpen },
  { num: "03", title: "Testez-vous", desc: "Passez des QCM et obtenez un feedback immédiat.", icon: Brain },
  { num: "04", title: "Progressez", desc: "Gagnez de l'XP, des badges et montez dans le classement.", icon: Trophy },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground tracking-tight">Mentor</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Fonctionnalités</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Comment ça marche</a>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">À propos</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-semibold">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="font-semibold gradient-primary border-0 shadow-glow hover:shadow-lg transition-all duration-300">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_30%_20%,hsl(252_85%_60%/0.08),transparent_50%),radial-gradient(ellipse_at_70%_60%,hsl(200_98%_48%/0.06),transparent_50%),radial-gradient(ellipse_at_50%_80%,hsl(280_80%_65%/0.05),transparent_40%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-border/10 animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-border/5 animate-[spin_45s_linear_infinite_reverse]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-primary text-sm font-semibold mb-10"
          >
            <Sparkles className="w-4 h-4" />
            Plateforme d'apprentissage nouvelle génération
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold font-display text-foreground tracking-tight leading-[1.05] mb-8"
          >
            Apprenez mieux,
            <br />
            <span className="text-gradient">
              progressez plus vite
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Modules de cours structurés, QCM interactifs, gamification et suivi de progression.
            Tout ce dont les étudiants et enseignants ont besoin, en un seul endroit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base px-8 h-14 gradient-primary border-0 shadow-glow hover:shadow-lg transition-all duration-300 rounded-2xl font-semibold">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-base px-8 h-14 rounded-2xl font-semibold hover:bg-accent">
                J'ai déjà un compte
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-14 flex items-center justify-center gap-6 text-muted-foreground text-sm"
          >
            {["Gratuit pour commencer", "Aucune carte requise", "Support réactif"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative py-20 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold font-display text-gradient tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 md:py-36 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Fonctionnalités
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground tracking-tight">
              Tout pour <span className="text-gradient">réussir</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Une plateforme complète pensée pour l'apprentissage interactif et la progression continue.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group relative bg-card rounded-3xl border border-border/50 p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} bg-opacity-10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.2))` }}
                  >
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold font-display text-foreground text-xl mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-28 md:py-36 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
              <Play className="w-3.5 h-3.5" /> Comment ça marche
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground tracking-tight">
              4 étapes pour <span className="text-gradient">commencer</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="flex gap-5 bg-card rounded-3xl border border-border/50 p-7 hover:border-primary/20 transition-all duration-300 group hover:shadow-medium"
              >
                <div className="shrink-0 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow/50">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono">{step.num}</span>
                  </div>
                  <h3 className="font-bold font-display text-foreground text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5" /> Témoignages
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-foreground tracking-tight">
              Ce qu'ils en <span className="text-gradient">pensent</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { name: "Sarah K.", role: "Étudiante L2", quote: "La gamification me motive énormément. J'adore voir mon XP monter !", avatar: "SK" },
              { name: "Prof. Mbala", role: "Enseignant", quote: "Créer des modules et suivre la progression de mes étudiants est un jeu d'enfant.", avatar: "PM" },
              { name: "Yannick T.", role: "Étudiant L3", quote: "Les QCM avec corrections détaillées m'ont vraiment aidé à progresser.", avatar: "YT" },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-3xl border border-border/50 p-8 hover:border-primary/20 transition-all duration-300 hover:shadow-medium"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-warning text-warning" />)}
                </div>
                <p className="text-foreground leading-relaxed mb-6 text-lg font-medium">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="rounded-[2rem] border border-border/50 p-12 md:p-20 shadow-2xl shadow-primary/5 overflow-hidden relative">
            <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-foreground tracking-tight mb-5">
                Prêt à transformer votre apprentissage ?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
                Rejoignez des centaines d'étudiants et enseignants sur Mentor. C'est gratuit.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2 px-8 h-14 gradient-primary border-0 shadow-glow hover:shadow-lg transition-all rounded-2xl font-semibold text-base">
                    Créer un compte <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 h-14 rounded-2xl font-semibold text-base">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-display text-foreground">Mentor</span>
            <span className="text-sm text-muted-foreground">© 2026</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
