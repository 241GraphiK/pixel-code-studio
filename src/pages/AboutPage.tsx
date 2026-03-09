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
  {
    icon: Target,
    title: "Accessibilité",
    description: "L'éducation de qualité doit être accessible à tous, partout et à tout moment."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Nous intégrons les meilleures pratiques pédagogiques et technologies modernes."
  },
  {
    icon: Heart,
    title: "Bienveillance",
    description: "Chaque apprenant progresse à son rythme, sans jugement ni pression excessive."
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Enseignants et étudiants travaillent ensemble pour un apprentissage enrichissant."
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Mentor</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="font-medium shadow-lg shadow-primary/25">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Notre mission
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Transformer l'éducation,
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
              un étudiant à la fois
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mentor est né d'un constat simple : l'apprentissage universitaire mérite d'être 
            plus structuré, plus engageant et plus efficace. Nous créons les outils qui 
            rendent cela possible.
          </p>
        </motion.div>
      </section>

      {/* Problems & Solutions */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium mb-4">
              <AlertTriangle className="w-3 h-3" /> Problèmes identifiés
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Les défis de l'éducation <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">aujourd'hui</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
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
                className="bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <problem.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{problem.description}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pl-4 border-l-2 border-primary/30 ml-6">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{problem.solution}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features recap */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Zap className="w-3 h-3" /> Notre solution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Un LMS <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">gamifié</span> et complet
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              { icon: BookOpen, label: "Modules structurés", color: "from-blue-500/20 to-cyan-500/20" },
              { icon: Brain, label: "QCM intelligents", color: "from-violet-500/20 to-purple-500/20" },
              { icon: Users, label: "Classes & Groupes", color: "from-emerald-500/20 to-green-500/20" },
              { icon: BarChart3, label: "Suivi détaillé", color: "from-amber-500/20 to-orange-500/20" },
              { icon: Trophy, label: "Gamification", color: "from-rose-500/20 to-pink-500/20" },
              { icon: Shield, label: "Sécurisé", color: "from-teal-500/20 to-cyan-500/20" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-xl border border-border/50 p-4 text-center hover:border-primary/20 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3`}>
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Heart className="w-3 h-3" /> Nos valeurs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Ce qui nous <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">guide</span>
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
                className="flex gap-4 bg-card rounded-2xl border border-border/50 p-6 hover:border-primary/20 transition-all"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
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
              Rejoignez l'aventure Mentor
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Que vous soyez étudiant ou enseignant, commencez gratuitement et découvrez une nouvelle façon d'apprendre.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2 px-8 h-12 shadow-xl shadow-primary/25">
                  Créer un compte <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="px-8 h-12">
                  Retour à l'accueil
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
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">S'inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
