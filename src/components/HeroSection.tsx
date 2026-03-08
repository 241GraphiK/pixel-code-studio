import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const roles = [
  "Développeur Web",
  "Développeur Mobile",
  "Graphiste & Designer",
  "Étudiant en Cybersécurité",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none" />
      
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Terminal-style intro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-sm text-muted-foreground mb-6 flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>~/portfolio $</span>
            <span className="text-primary">whoami</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold font-display tracking-tight mb-6"
          >
            <span className="text-foreground">Créateur</span>
            <br />
            <span className="text-primary text-glow">Digital</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {roles.map((role, i) => (
              <motion.span
                key={role}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="glass px-4 py-2 rounded-full text-sm font-mono text-secondary-foreground border-glow"
              >
                {role}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Je conçois et développe des expériences numériques modernes, sécurisées et visuellement percutantes.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-10 flex gap-4"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)] transition-all duration-300"
            >
              Voir mes projets
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 glass rounded-lg text-foreground hover:border-primary/50 transition-all duration-300"
            >
              Me contacter
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
