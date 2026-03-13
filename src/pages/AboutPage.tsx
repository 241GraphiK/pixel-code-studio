import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Users, BarChart3, ArrowLeft,
  Target, Lightbulb, Heart, Sparkles, CheckCircle2,
  AlertTriangle, ArrowRight, Trophy, Brain, Shield, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const problems = [
  {
    icon: AlertTriangle,
    title: "Cours éparpillés",
    description: "Les étudiants jonglent entre plusieurs plateformes, PDF et emails pour accéder à leurs cours.",
    solution: "Modules structurés par filière et niveau, centralisés en un seul endroit avec ressources téléchargeables."
  },
  {
    icon: AlertTriangle,
    title: "Manque de pratique",
    description: "Peu d'outils interactifs pour s'entraîner et vérifier sa compréhension avant les examens.",
    solution: "QCM intelligents avec feedback immédiat, explications détaillées et suivi des erreurs fréquentes."
  },
  {
    icon: AlertTriangle,
    title: "Démotivation",
    description: "L'apprentissage solitaire et sans objectifs clairs mène à l'abandon et au décrochage.",
    solution: "Gamification complète : XP, badges, niveaux et classement pour maintenir l'engagement."
  },
  {
    icon: AlertTriangle,
    title: "Suivi difficile",
    description: "Les enseignants peinent à suivre la progression individuelle de chaque étudiant.",
    solution: "Tableaux de bord détaillés, statistiques par classe et alertes sur les étudiants en difficulté."
  },
];

const values = [
  { icon: Target, title: "Accessibilité", description: "L'éducation de qualité doit être accessible à tous, partout et à tout moment." },
  { icon: Lightbulb, title: "Innovation", description: "Nous intégrons les meilleures pratiques pédagogiques et technologies modernes." },
  { icon: Heart, title: "Bienveillance", description: "Chaque apprenant progresse à son rythme, sans jugement ni pression excessive." },
  { icon: Users, title: "Collaboration", description: "Enseignants et étudiants travaillent ensemble pour un apprentissage enrichissant." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground tracking-tight">Mentor</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="font-semibold gradient-primary border-0 shadow-glow hover:shadow-lg transition-all">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_30%_20%,hsl(252_85%_60%/0.08),transparent_50%),radial-gradient(ellipse_at_70%_60%,hsl(200_98%_48%/0.06),transparent_50%)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-primary text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            Notre mission
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display text-foreground tracking-tight leading-tight mb-8">
            Transformer l'éducation,
            <br />
            <span className="text-gradient">un étudiant à la fois</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mentor est né d'un constat simple : l'apprentissage universitaire mérite d'être 
            plus structuré, plus engageant et plus efficace. Nous créons les outils qui 
            rendent cela possible.
          </p>
        </motion.div>
      </section>

      {/* Problems & Solutions */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" /> Problèmes identifiés
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
              Les défis de l'éducation <span className="text-gradient">aujourd'hui</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Nous avons identifié les principaux obstacles à un apprentissage efficace et construit des solutions concrètes.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-3xl border border-border/50 p-8 hover:border-primary/20 transition-all duration-300 hover:shadow-medium"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <problem.icon className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-foreground text-xl">{problem.title}</h3>
                    <p className="text-muted-foreground mt-1.5">{problem.description}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pl-5 border-l-2 border-primary/30 ml-7">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <p className="text-foreground font-medium">{problem.solution}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features recap */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Notre solution
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
              Un LMS <span className="text-gradient">gamifié</span> et complet
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {[
              { icon: BookOpen, label: "Modules structurés" },
              { icon: Brain, label: "QCM intelligents" },
              { icon: Users, label: "Classes & Groupes" },
              { icon: BarChart3, label: "Suivi détaillé" },
              { icon: Trophy, label: "Gamification" },
              { icon: Shield, label: "Sécurisé" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-2xl border border-border/50 p-5 text-center hover:border-primary/20 transition-all hover:shadow-medium group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.2))' }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 relative">
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
              <Heart className="w-3.5 h-3.5" /> Nos valeurs
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
              Ce qui nous <span className="text-gradient">guide</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {values.map((value, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="flex gap-5 bg-card rounded-3xl border border-border/50 p-8 hover:border-primary/20 transition-all hover:shadow-medium group"
              >
                <div className="shrink-0 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow/50">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-foreground text-xl mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
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
                Rejoignez l'aventure Mentor
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
                Que vous soyez étudiant ou enseignant, commencez gratuitement et découvrez une nouvelle façon d'apprendre.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2 px-8 h-14 gradient-primary border-0 shadow-glow hover:shadow-lg transition-all rounded-2xl font-semibold text-base">
                    Créer un compte <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="px-8 h-14 rounded-2xl font-semibold text-base">
                    Retour à l'accueil
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
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">S'inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
