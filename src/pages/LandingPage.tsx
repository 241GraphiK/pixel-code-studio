import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Users, BarChart3, ArrowRight, CheckCircle2, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BookOpen, title: "Modules & Cours", desc: "Accédez à des cours structurés par niveau et filière." },
  { icon: Zap, title: "QCM Interactifs", desc: "Testez vos connaissances avec un feedback immédiat." },
  { icon: Users, title: "Classes & Groupes", desc: "Rejoignez des classes et collaborez avec vos camarades." },
  { icon: BarChart3, title: "Suivi & Stats", desc: "Suivez votre progression avec des graphiques détaillés." },
  { icon: Shield, title: "Sécurisé", desc: "Authentification robuste et données protégées." },
  { icon: CheckCircle2, title: "Personnalisable", desc: "Mode sombre, thèmes, et interface adaptative." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Mentor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" /> Plateforme d'apprentissage nouvelle génération
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Apprenez mieux,<br />
            <span className="text-primary">progressez plus vite</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Mentor est une plateforme interactive pour les étudiants et enseignants.
            Modules de cours, QCM, suivi de progression — tout en un seul endroit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base px-8">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-base px-8">
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Tout ce qu'il vous faut pour réussir</h2>
            <p className="text-muted-foreground mt-2">Une plateforme complète pour l'apprentissage interactif</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 shadow-soft hover:shadow-medium transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Prêt à commencer ?</h2>
          <p className="text-muted-foreground">Rejoignez des centaines d'étudiants et enseignants sur Mentor.</p>
          <Link to="/register">
            <Button size="lg" className="gap-2 px-8">
              Créer un compte <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Mentor © 2025</span>
          </div>
          <p>Plateforme d'apprentissage interactive</p>
        </div>
      </footer>
    </div>
  );
}
