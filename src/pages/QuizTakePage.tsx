import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, Zap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuizData {
  id: string; title: string; description: string | null; difficulty: string; duration: number;
}
interface QuestionData {
  id: string; text: string; explanation: string | null; difficulty: string; points: number; type: string;
  options: { text: string; isCorrect: boolean }[];
}

export default function QuizTakePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { awardXp } = useGamification();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const [quizRes, questionsRes] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", id).maybeSingle(),
        supabase.from("questions").select("*").eq("quiz_id", id),
      ]);
      if (quizRes.data) setQuiz(quizRes.data);
      if (questionsRes.data) {
        setQuestions(questionsRes.data.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? (q.options as any[]) : [],
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const totalQ = questions.length;
  const question = questions[currentQ];
  const progress = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;

  const toggleAnswer = (questionId: string, optionIndex: number, type: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (type === "single") return { ...prev, [questionId]: [optionIndex] };
      return { ...prev, [questionId]: current.includes(optionIndex) ? current.filter(x => x !== optionIndex) : [...current, optionIndex] };
    });
  };

  const calculateScore = () => {
    let earned = 0, total = 0;
    questions.forEach(q => {
      total += q.points;
      const selected = answers[q.id] || [];
      const correctIndices = q.options.map((o, i) => o.isCorrect ? i : -1).filter(i => i >= 0);
      if (JSON.stringify([...selected].sort()) === JSON.stringify([...correctIndices].sort())) earned += q.points;
    });
    return { earned, total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
  };

  const handleFinish = async () => {
    if (!user || !quiz) return;
    setSaving(true);
    const score = calculateScore();

    // Save attempt
    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      user_id: user.id,
      score: score.earned,
      max_score: score.total,
      answers: answers as any,
    });

    // Award XP based on score
    const baseXp = 10;
    const bonusXp = Math.round(score.percentage / 10);
    const difficultyMultiplier = quiz.difficulty === "hard" ? 2 : quiz.difficulty === "medium" ? 1.5 : 1;
    const totalXp = Math.round((baseXp + bonusXp) * difficultyMultiplier);

    await awardXp(totalXp, `QCM: ${quiz.title} (${score.percentage}%)`);
    setXpAwarded(totalXp);

    setSaving(false);
    setShowResults(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!quiz) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">QCM introuvable</p>
          <Link to="/quizzes" className="text-sm text-primary hover:underline">Retour aux QCM</Link>
        </div>
      </AppLayout>
    );
  }

  if (!started) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Link to="/quizzes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="bg-card rounded-xl border border-border p-8 shadow-soft text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.duration} min</span>
              <span>{totalQ} questions</span>
              <span className={cn(
                "font-medium",
                quiz.difficulty === "easy" ? "text-success" : quiz.difficulty === "medium" ? "text-warning" : "text-destructive"
              )}>
                {quiz.difficulty === "easy" ? "Facile" : quiz.difficulty === "medium" ? "Moyen" : "Difficile"}
              </span>
            </div>
            {totalQ > 0 ? (
              <Button size="lg" onClick={() => setStarted(true)}>Commencer le QCM</Button>
            ) : (
              <p className="text-muted-foreground">Ce QCM n'a pas encore de questions.</p>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-8 shadow-soft text-center space-y-4">
            <div className={cn("w-20 h-20 rounded-full mx-auto flex items-center justify-center", score.percentage >= 70 ? "bg-success/10" : score.percentage >= 50 ? "bg-warning/10" : "bg-destructive/10")}>
              {score.percentage >= 70 ? <CheckCircle2 className="w-10 h-10 text-success" /> : score.percentage >= 50 ? <AlertCircle className="w-10 h-10 text-warning" /> : <XCircle className="w-10 h-10 text-destructive" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">Résultats</h1>
            <p className="text-4xl font-bold text-primary">{score.percentage}%</p>
            <p className="text-muted-foreground">{score.earned}/{score.total} points</p>
            <p className={cn("font-medium", score.percentage >= 70 ? "text-success" : score.percentage >= 50 ? "text-warning" : "text-destructive")}>
              {score.percentage >= 70 ? "Excellent ! 🎉" : score.percentage >= 50 ? "Pas mal, continuez ! 💪" : "Révisez et réessayez ! 📚"}
            </p>
            {xpAwarded > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                <Zap className="w-5 h-5 text-warning" />
                <span className="font-bold text-warning">+{xpAwarded} XP</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => {
              const selected = answers[q.id] || [];
              const correctIndices = q.options.map((o, idx) => o.isCorrect ? idx : -1).filter(idx => idx >= 0);
              const isCorrect = JSON.stringify([...selected].sort()) === JSON.stringify([...correctIndices].sort());
              return (
                <div key={q.id} className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                    <p className="font-medium text-foreground">Q{i + 1}. {q.text}</p>
                  </div>
                  <div className="space-y-2 ml-8">
                    {q.options.map((o, oi) => (
                      <div key={oi} className={cn(
                        "p-2.5 rounded-lg text-sm border",
                        o.isCorrect ? "bg-success/10 border-success/30 text-success" :
                        selected.includes(oi) ? "bg-destructive/10 border-destructive/30 text-destructive" :
                        "border-border text-muted-foreground"
                      )}>
                        {o.text}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-sm text-muted-foreground mt-3 ml-8 p-3 bg-muted/50 rounded-lg">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStarted(false); setAnswers({}); setShowResults(false); setCurrentQ(0); setXpAwarded(0); }}>Réessayer</Button>
            <Link to="/quizzes"><Button>Retour aux QCM</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Question {currentQ + 1}/{totalQ}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.duration} min</p>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="bg-card rounded-xl border border-border p-6 shadow-soft space-y-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("px-2 py-0.5 rounded-full font-medium",
              question.difficulty === "easy" ? "bg-success/10 text-success" :
              question.difficulty === "medium" ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive"
            )}>
              {question.difficulty === "easy" ? "Facile" : question.difficulty === "medium" ? "Moyen" : "Difficile"}
            </span>
            <span>{question.points} pts</span>
            <span>{question.type === "single" ? "Choix unique" : "Choix multiple"}</span>
          </div>

          <h2 className="text-lg font-semibold text-foreground">{question.text}</h2>

          <div className="space-y-2">
            {question.options.map((o, oi) => {
              const selected = (answers[question.id] || []).includes(oi);
              return (
                <button
                  key={oi}
                  onClick={() => toggleAnswer(question.id, oi, question.type)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all text-sm",
                    selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50 text-foreground"
                  )}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)}>Précédent</Button>
          {currentQ < totalQ - 1 ? (
            <Button onClick={() => setCurrentQ(c => c + 1)}>Suivant</Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving}>
              {saving ? "Enregistrement..." : "Terminer"}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
