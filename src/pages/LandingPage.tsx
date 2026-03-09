import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  GraduationCap, BookOpen, Users, BarChart3, ArrowRight,
  Zap, Shield, Trophy, CheckCircle2, Star, Sparkles,
  ChevronDown, Play, Target, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const features = [
  { icon: BookOpen, title: "Modules & Cours", desc: "Cours structurés par niveau et filière, avec contenu riche et ressources téléchargeables.", color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500" },
  { icon: Brain, title: "QCM Intelligents", desc: "Testez vos connaissances avec feedback immédiat et explications détaillées.", color: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-500" },
  { icon: Users, title: "Classes & Collaboration", desc: "Rejoignez des classes, partagez vos progrès et compétitionnez avec vos pairs.", color: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-500" },
  { icon: BarChart3, title: "Suivi Détaillé", desc: "Graphiques de progression, statistiques personnalisées et historique complet.", color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-500" },
  { icon: Trophy, title: "Gamification", desc: "Gagnez des XP, montez de niveau, débloquez des badges et grimpez le classement.", color: "from-rose-500/20 to-pink-500/20", iconColor: "text-rose-500" },
  { icon: Shield, title: "Sécurisé & Fiable", desc: "Authentification robuste, données protégées et plateforme toujours disponible.", color: "from-teal-500/20 to-cyan-500/20", iconColor: "text-teal-500" },
];

const stats = [
  { value: "500+", label: "Étudiants actifs" },
  { value: "120+", label: "Modules de cours" },
  { value: "1000+", label: "QCM disponibles" },
  { value: "98%", label: "Satisfaction" },
];

const steps = [
  { num: "01", title: "Créez votre compte", desc: "Inscription rapide en tant qu'étudiant ou enseignant." },
  { num: "02", title: "Explorez les modules", desc: "Accédez aux cours par filière, niveau et spécialité." },
  { num: "03", title: "Testez-vous", desc: "Passez des QCM et obtenez un feedback immédiat." },
  { num: "04", title: "Progressez", desc: "Gagnez de l'XP, des badges et montez dans le classement." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Mentor</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</a>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">À propos</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-medium">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="font-medium shadow-lg shadow-primary/25">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-border/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/10" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Plateforme d'apprentissage nouvelle génération
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight leading-[1.05] mb-6"
          >
            Apprenez mieux,
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
              progressez plus vite
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
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
              <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 border-border/50 hover:bg-accent">
                J'ai déjà un compte
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section id="stats" className="relative py-16 border-y border-border/50 bg-card/50 backdrop-blur-sm">
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
                <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Target className="w-3 h-3" /> Fonctionnalités
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Tout pour <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">réussir</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Une plateforme complète pensée pour l'apprentissage interactif et la progression continue.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group relative bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 md:py-32 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Play className="w-3 h-3" /> Comment ça marche
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              4 étapes pour <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">commencer</span>
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
                className="flex gap-5 bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials / Social proof */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Star className="w-3 h-3" /> Témoignages
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Ce qu'ils en <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">pensent</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              { name: "Sarah K.", role: "Étudiante L2", quote: "La gamification me motive énormément. J'adore voir mon XP monter !" },
              { name: "Prof. Mbala", role: "Enseignant", quote: "Créer des modules et suivre la progression de mes étudiants est un jeu d'enfant." },
              { name: "Yannick T.", role: "Étudiant L3", quote: "Les QCM avec corrections détaillées m'ont vraiment aidé à progresser." },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="bg-card rounded-3xl border border-border/50 p-10 md:p-16 shadow-2xl shadow-primary/5">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Prêt à transformer votre apprentissage ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Rejoignez des centaines d'étudiants et enseignants sur Mentor. C'est gratuit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2 px-8 h-12 shadow-xl shadow-primary/25">
                  Créer un compte <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 h-12">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Mentor</span>
            <span className="text-sm text-muted-foreground">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
