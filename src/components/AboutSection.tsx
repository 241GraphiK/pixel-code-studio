import { motion } from "framer-motion";
import { Code2, Smartphone, Palette, ShieldCheck } from "lucide-react";

const highlights = [
  { icon: Code2, label: "Développement Web", desc: "React, TypeScript, Node.js, Next.js" },
  { icon: Smartphone, label: "Développement Mobile", desc: "React Native, Flutter, iOS & Android" },
  { icon: Palette, label: "Design Graphique", desc: "UI/UX, Branding, Figma, Adobe Suite" },
  { icon: ShieldCheck, label: "Cybersécurité", desc: "Pentesting, Analyse de vulnérabilités, OWASP" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-32 relative">
      <div className="container px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-sm text-primary mb-2 block">// à propos</span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-8">
            Qui suis-<span className="text-primary text-glow">je</span> ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-16">
            Passionné par la technologie sous toutes ses formes, je combine créativité et expertise technique
            pour construire des solutions digitales complètes — du design à la sécurité.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 group hover:border-primary/40 transition-all duration-300 hover:border-glow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg font-display mb-1">{item.label}</h3>
                  <p className="text-muted-foreground text-sm font-mono">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
