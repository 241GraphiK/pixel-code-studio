import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, FileText, Video, Link2, Dumbbell, CheckCircle2, Circle, Clock, Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { modules, courses, quizzes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ModuleDetailPage() {
  const { id } = useParams();
  const mod = modules.find((m) => m.id === id) || modules[0];
  const moduleCourses = courses.filter((c) => c.moduleId === mod.id);
  const moduleQuizzes = quizzes.filter((q) => q.moduleId === mod.id);
  const [selectedCourse, setSelectedCourse] = useState(moduleCourses[0]?.id);

  const course = moduleCourses.find((c) => c.id === selectedCourse);

  const resourceIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-4 h-4" />;
    if (type === "video") return <Video className="w-4 h-4" />;
    if (type === "link") return <Link2 className="w-4 h-4" />;
    return <Dumbbell className="w-4 h-4" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <Link to="/modules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux modules
        </Link>

        {/* Module header */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{mod.level}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{mod.field}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{mod.title}</h1>
              <p className="text-muted-foreground">{mod.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {mod.courseCount} cours</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {mod.studentCount} étudiants</span>
                <span>{mod.teacherName}</span>
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-foreground">{mod.progress}%</span>
              </div>
              <Progress value={mod.progress} className="h-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course list */}
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground mb-3">Cours</h2>
            {moduleCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm",
                  selectedCourse === c.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
                )}
              >
                {c.completed ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className={cn("text-xs", selectedCourse === c.id ? "opacity-70" : "text-muted-foreground")}>
                    <Clock className="w-3 h-3 inline mr-1" />{c.duration}
                  </p>
                </div>
              </button>
            ))}

            {/* Module quizzes */}
            {moduleQuizzes.length > 0 && (
              <>
                <h2 className="font-semibold text-foreground mt-6 mb-3">QCM</h2>
                {moduleQuizzes.map((q) => (
                  <Link key={q.id} to={`/quizzes/${q.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent transition-all text-sm">
                    <Play className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.questions.length} questions · {q.duration} min</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Course content */}
          <div className="lg:col-span-2">
            {course ? (
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h2 className="text-xl font-bold text-foreground mb-2">{course.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                  <span><Clock className="w-4 h-4 inline mr-1" />{course.duration}</span>
                  {course.completed && <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Terminé</span>}
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p>{course.content}</p>
                  <p className="text-muted-foreground mt-4">
                    Ce cours couvre les concepts fondamentaux avec des exemples pratiques et des exercices.
                    Le contenu détaillé sera disponible une fois la base de données connectée.
                  </p>
                </div>

                {course.resources.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Ressources</h3>
                    <div className="space-y-2">
                      {course.resources.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="text-primary">{resourceIcon(r.type)}</div>
                          <span className="text-sm font-medium text-foreground">{r.title}</span>
                          <span className="text-xs text-muted-foreground uppercase ml-auto">{r.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {!course.completed && (
                    <Button>Marquer comme terminé</Button>
                  )}
                  <Button variant="outline">Cours suivant →</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez un cours</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
