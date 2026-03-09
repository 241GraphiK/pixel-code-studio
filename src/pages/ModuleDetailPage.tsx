import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, FileText, Video, Link2, Dumbbell, CheckCircle2, Circle, Clock, Users, Image, Trash2, Download } from "lucide-react";
import { exportCourseContentPdf } from "@/lib/pdf-export";
import ResourceUpload from "@/components/resources/ResourceUpload";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ModuleData {
  id: string; title: string; description: string | null; field: string; level: string; teacher_id: string | null;
}
interface CourseData {
  id: string; title: string; content: string | null; duration: string | null; order: number; module_id: string;
}
interface QuizData {
  id: string; title: string; duration: number; module_id: string; questions_count?: number;
}
interface ResourceData {
  id: string; title: string; type: string; url: string; course_id: string;
}

const hasHtmlTags = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

export default function ModuleDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const isTeacher = profile?.role === "teacher" || profile?.role === "admin";
  const [mod, setMod] = useState<ModuleData | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;

      const [modRes, coursesRes, quizzesRes] = await Promise.all([
        supabase.from("modules").select("*").eq("id", id).maybeSingle(),
        supabase.from("courses").select("*").eq("module_id", id).order("order"),
        supabase.from("quizzes").select("id, title, duration, module_id").eq("module_id", id),
      ]);

      if (modRes.data) {
        setMod(modRes.data);
        if (modRes.data.teacher_id) {
          const { data: prof } = await supabase.from("profiles").select("name").eq("id", modRes.data.teacher_id).maybeSingle();
          if (prof) setTeacherName(prof.name);
        }
      }

      if (coursesRes.data) {
        setCourses(coursesRes.data);
        if (coursesRes.data.length > 0) setSelectedCourse(coursesRes.data[0].id);

        // Fetch resources for all courses
        const courseIds = coursesRes.data.map(c => c.id);
        if (courseIds.length > 0) {
          const { data: res } = await supabase.from("resources").select("*").in("course_id", courseIds);
          if (res) setResources(res);
        }
      }

      if (quizzesRes.data) {
        // Get question counts
        const quizIds = quizzesRes.data.map(q => q.id);
        let qCounts: Record<string, number> = {};
        if (quizIds.length > 0) {
          const { data: questions } = await supabase.from("questions").select("quiz_id").in("quiz_id", quizIds);
          questions?.forEach(q => { qCounts[q.quiz_id] = (qCounts[q.quiz_id] || 0) + 1; });
        }
        setQuizzes(quizzesRes.data.map(q => ({ ...q, questions_count: qCounts[q.id] || 0 })));
      }

      // Fetch completed courses
      if (user) {
        const { data: progress } = await supabase
          .from("course_progress")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("completed", true);
        if (progress) setCompletedCourses(new Set(progress.map(p => p.course_id)));
      }

      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const course = courses.find(c => c.id === selectedCourse);
  const courseResources = resources.filter(r => r.course_id === selectedCourse);
  const courseContent = (course?.content || "").trim();
  const isRichTextContent = courseContent ? hasHtmlTags(courseContent) : false;

  const handleMarkComplete = async () => {
    if (!user || !selectedCourse) return;
    const { error } = await supabase
      .from("course_progress")
      .upsert({ user_id: user.id, course_id: selectedCourse, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,course_id" as any });
    if (error) {
      // If upsert fails due to no unique constraint, try insert
      await supabase.from("course_progress").insert({
        user_id: user.id, course_id: selectedCourse, completed: true, completed_at: new Date().toISOString()
      });
    }
    setCompletedCourses(prev => new Set([...prev, selectedCourse]));
    toast.success("Cours marqué comme terminé !");
  };

  const resourceIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-4 h-4" />;
    if (type === "video") return <Video className="w-4 h-4" />;
    if (type === "image") return <Image className="w-4 h-4" />;
    if (type === "link") return <Link2 className="w-4 h-4" />;
    return <Dumbbell className="w-4 h-4" />;
  };

  const refetchResources = async () => {
    if (!id) return;
    const courseIds = courses.map(c => c.id);
    if (courseIds.length > 0) {
      const { data: res } = await supabase.from("resources").select("*").in("course_id", courseIds);
      if (res) setResources(res);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const { error } = await supabase.from("resources").delete().eq("id", resourceId);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      setResources(prev => prev.filter(r => r.id !== resourceId));
      toast.success("Ressource supprimée");
    }
  };

  const completedCount = courses.filter(c => completedCourses.has(c.id)).length;
  const progressPercent = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!mod) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Module introuvable</p>
          <Link to="/modules" className="text-sm text-primary hover:underline">Retour aux modules</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <Link to="/modules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux modules
        </Link>

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
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {courses.length} cours</span>
                {teacherName && <span>{teacherName}</span>}
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-foreground">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground mb-3">Cours</h2>
            {courses.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm",
                  selectedCourse === c.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
                )}
              >
                {completedCourses.has(c.id) ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  {c.duration && (
                    <p className={cn("text-xs", selectedCourse === c.id ? "opacity-70" : "text-muted-foreground")}>
                      <Clock className="w-3 h-3 inline mr-1" />{c.duration}
                    </p>
                  )}
                </div>
              </button>
            ))}

            {quizzes.length > 0 && (
              <>
                <h2 className="font-semibold text-foreground mt-6 mb-3">QCM</h2>
                {quizzes.map(q => (
                  <Link key={q.id} to={`/quizzes/${q.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent transition-all text-sm">
                    <Play className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground">{q.questions_count} questions · {q.duration} min</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            {course ? (
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h2 className="text-xl font-bold text-foreground mb-2">{course.title}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                  {course.duration && <span><Clock className="w-4 h-4 inline mr-1" />{course.duration}</span>}
                  {completedCourses.has(course.id) && <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Terminé</span>}
                </div>
                <div className="course-content">
                  {courseContent ? (
                    isRichTextContent ? (
                      <div dangerouslySetInnerHTML={{ __html: courseContent }} />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{courseContent}</div>
                    )
                  ) : (
                    <p className="text-muted-foreground italic text-sm">Contenu à venir...</p>
                  )}
                </div>

                {(courseResources.length > 0 || (isTeacher && mod?.teacher_id === user?.id)) && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Ressources</h3>
                      {isTeacher && mod?.teacher_id === user?.id && selectedCourse && (
                        <ResourceUpload courseId={selectedCourse} onUploaded={refetchResources} />
                      )}
                    </div>
                    <div className="space-y-2">
                      {courseResources.map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                          <a href={r.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-primary">{resourceIcon(r.type)}</div>
                            <span className="text-sm font-medium text-foreground truncate">{r.title}</span>
                            <span className="text-xs text-muted-foreground uppercase ml-auto shrink-0">{r.type}</span>
                          </a>
                          {isTeacher && mod?.teacher_id === user?.id && (
                            <button
                              onClick={() => handleDeleteResource(r.id)}
                              className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {!completedCourses.has(course.id) && (
                    <Button onClick={handleMarkComplete}>Marquer comme terminé</Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => exportCourseContentPdf(
                      course.title,
                      mod?.title || "Module",
                      isRichTextContent ? courseContent : "",
                      isRichTextContent ? "" : courseContent
                    )}
                  >
                    <Download className="w-4 h-4 mr-2" /> Exporter en PDF
                  </Button>
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

