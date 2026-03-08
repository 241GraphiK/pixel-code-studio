import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    desc: "Application web complète avec paiement intégré, dashboard admin et gestion des stocks.",
    tags: ["React", "Node.js", "Stripe", "PostgreSQL"],
    color: "primary",
  },
  {
    title: "App Mobile Fitness",
    desc: "Application mobile de suivi sportif avec plans personnalisés et statistiques en temps réel.",
    tags: ["React Native", "Firebase", "UI/UX Design"],
    color: "accent",
  },
  {
    title: "Brand Identity — Studio X",
    desc: "Création complète d'identité visuelle : logo, charte graphique, supports print et digital.",
    tags: ["Illustrator", "Photoshop", "Branding"],
    color: "primary",
  },
  {
    title: "Security Audit Tool",
    desc: "Outil d'audit de sécurité automatisé pour applications web avec rapports détaillés.",
    tags: ["Python", "OWASP", "Kali Linux", "API"],
    color: "accent",
  },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-32 relative">
      <div className="container px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-sm text-primary mb-2 block">// projets</span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-16">
            Réalisations <span className="text-primary text-glow">récentes</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden"
            >
              {/* Gradient line top */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${project.color === 'accent' ? 'from-transparent via-accent to-transparent' : 'from-transparent via-primary to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-display">{project.title}</h3>
                <div className="flex gap-2 text-muted-foreground">
                  <Github className="w-4 h-4 hover:text-primary transition-colors cursor-pointer" />
                  <ExternalLink className="w-4 h-4 hover:text-primary transition-colors cursor-pointer" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
