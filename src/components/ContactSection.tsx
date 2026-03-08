import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder
    console.log("Form submitted:", formData);
  };

  return (
    <section id="contact" className="py-32 relative">
      <div className="container px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-sm text-primary mb-2 block">// contact</span>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
            Travaillons <span className="text-primary text-glow">ensemble</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Un projet en tête ? N'hésitez pas à me contacter.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="glass rounded-xl p-8 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-2">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                placeholder="votre@email.com"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-muted-foreground block mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              placeholder="Décrivez votre projet..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)] transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-6 mt-8 text-sm text-muted-foreground font-mono"
        >
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> contact@monportfolio.dev
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Disponible en remote
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
