import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion, Plus, Trash2, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OptionForm {
  text: string;
  isCorrect: boolean;
}

interface QuestionForm {
  text: string;
  explanation: string;
  difficulty: string;
  points: number;
  options: OptionForm[];
}

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiCourseId, setAiCourseId] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [coursesForModule, setCoursesForModule] = useState<{ id: string; title: string; content: string | null }[]>([]);

  const [modules, setModules] = useState<{ id: string; title: string }[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [duration, setDuration] = useState(15);

  const emptyQuestion = (): QuestionForm => ({
    text: "", explanation: "", difficulty: "medium", points: 1,
    options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);

  useEffect(() => {
    if (!user) return;
    supabase.from("modules").select("id, title").eq("teacher_id", user.id).then(({ data }) => {
      if (data) setModules(data);
    });
  }, [user]);

  // Load courses when module changes
  useEffect(() => {
    if (!moduleId) { setCoursesForModule([]); return; }
    supabase.from("courses").select("id, title, content").eq("module_id", moduleId).order("order").then(({ data }) => {
      if (data) setCoursesForModule(data);
    });
  }, [moduleId]);

  const handleAiGenerate = async () => {
    const course = coursesForModule.find(c => c.id === aiCourseId);
    if (!course?.content?.trim()) {
      toast.error("Le cours sélectionné n'a pas de contenu");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { courseContent: course.content, courseTitle: course.title, numQuestions: aiNumQuestions, difficulty: aiDifficulty },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.questions?.length) {
        setQuestions(data.questions.map((q: any) => ({
          text: q.text || "",
          explanation: q.explanation || "",
          difficulty: q.difficulty || "medium",
          points: q.points || 1,
          options: (q.options || []).map((o: any) => ({ text: o.text || "", isCorrect: !!o.isCorrect })),
        })));
        if (!title.trim()) setTitle(`QCM - ${course.title}`);
        setDifficulty(aiDifficulty);
        toast.success(`${data.questions.length} questions générées par IA !`);
        setAiDialogOpen(false);
      } else {
        toast.error("Aucune question générée");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération IA");
    } finally {
      setGenerating(false);
    }
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const updateQuestion = (i: number, key: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [key]: value };
    setQuestions(updated);
  };

  const updateOption = (qi: number, oi: number, key: keyof OptionForm, value: any) => {
    const updated = [...questions];
    const opts = [...updated[qi].options];
    opts[oi] = { ...opts[oi], [key]: value };
    updated[qi] = { ...updated[qi], options: opts };
    setQuestions(updated);
  };

  const addOption = (qi: number) => {
    const updated = [...questions];
    updated[qi] = { ...updated[qi], options: [...updated[qi].options, { text: "", isCorrect: false }] };
    setQuestions(updated);
  };

  const removeOption = (qi: number, oi: number) => {
    const updated = [...questions];
    updated[qi] = { ...updated[qi], options: updated[qi].options.filter((_, idx) => idx !== oi) };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !moduleId) {
      toast.error("Veuillez sélectionner un module");
      return;
    }
    if (!title.trim()) {
      toast.error("Veuillez remplir le titre");
      return;
    }

    const validQuestions = questions.filter(q => q.text.trim() && q.options.some(o => o.text.trim() && o.isCorrect));
    if (validQuestions.length === 0) {
      toast.error("Ajoutez au moins une question avec une bonne réponse");
      return;
    }

    setSaving(true);
    try {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({ title: title.trim(), description: description.trim(), module_id: moduleId, difficulty, duration })
        .select()
        .single();

      if (quizError) throw quizError;

      const { error: qError } = await supabase
        .from("questions")
        .insert(validQuestions.map(q => ({
          quiz_id: quiz.id,
          text: q.text.trim(),
          explanation: q.explanation.trim(),
          difficulty: q.difficulty,
          points: q.points,
          type: "single",
          options: q.options.filter(o => o.text.trim()).map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
        })));

      if (qError) throw qError;

      toast.success("QCM créé avec succès !");
      navigate("/quizzes");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-primary" /> Créer un QCM
          </h1>
          <p className="text-muted-foreground">Ajoutez un nouveau questionnaire à choix multiples</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz info */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
            <h2 className="font-semibold text-foreground">Informations du QCM</h2>
            <div className="space-y-2">
              <Label>Module *</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un module" /></SelectTrigger>
                <SelectContent>
                  {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
              {modules.length === 0 && (
                <p className="text-xs text-muted-foreground">Créez d'abord un module avant de créer un QCM.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtitle">Titre *</Label>
              <Input id="qtitle" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: QCM - Chapitre 1" required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qdesc">Description</Label>
              <Textarea id="qdesc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du QCM..." rows={2} maxLength={500} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulté</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dur">Durée (minutes)</Label>
                <Input id="dur" type="number" min={1} max={180} value={duration} onChange={e => setDuration(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Questions ({questions.length})</h2>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Question {qi + 1}</h3>
                  {questions.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qi)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <Textarea value={q.text} onChange={e => updateQuestion(qi, "text", e.target.value)} placeholder="Texte de la question..." rows={2} maxLength={1000} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Difficulté</Label>
                    <Select value={q.difficulty} onValueChange={v => updateQuestion(qi, "difficulty", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Facile</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="hard">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Points</Label>
                    <Input type="number" min={1} max={10} value={q.points} onChange={e => updateQuestion(qi, "points", Number(e.target.value))} className="h-8 text-xs" />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Options (cochez la/les bonne(s) réponse(s))</Label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <Checkbox
                        checked={opt.isCorrect}
                        onCheckedChange={(checked) => updateOption(qi, oi, "isCorrect", !!checked)}
                      />
                      <Input
                        value={opt.text}
                        onChange={e => updateOption(qi, oi, "text", e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 h-8 text-sm"
                        maxLength={500}
                      />
                      {q.options.length > 2 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(qi, oi)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qi)} className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Option
                  </Button>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Explication (affichée après réponse)</Label>
                  <Input value={q.explanation} onChange={e => updateQuestion(qi, "explanation", e.target.value)} placeholder="Explication de la bonne réponse..." maxLength={1000} className="text-sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" disabled={saving || modules.length === 0}>
              {saving ? "Création..." : "Créer le QCM"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
