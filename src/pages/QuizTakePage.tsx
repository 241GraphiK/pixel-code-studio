import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { quizzes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function QuizTakePage() {
  const { id } = useParams();
  const quiz = quizzes.find((q) => q.id === id) || quizzes[0];

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);

  const question = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;
  const progress = totalQ > 0 ? ((currentQ + 1) / totalQ) * 100 : 0;

  const toggleAnswer = (questionId: string, optionId: string, type: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === "single") return { ...prev, [questionId]: [optionId] };
      return { ...prev, [questionId]: current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId] };
    });
  };

  const calculateScore = () => {
    let earned = 0, total = 0;
    quiz.questions.forEach((q) => {
      total += q.points;
      const selected = answers[q.id] || [];
      const correct = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      if (JSON.stringify(selected.sort()) === JSON.stringify(correct.sort())) earned += q.points;
    });
    return { earned, total, percentage: total > 0 ? Math.round((earned / total) * 100) : 0 };
  };

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
          </div>

          {/* Review answers */}
          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const selected = answers[q.id] || [];
              const correct = q.options.filter((o) => o.isCorrect).map((o) => o.id);
              const isCorrect = JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());
              return (
                <div key={q.id} className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                    <p className="font-medium text-foreground">Q{i + 1}. {q.text}</p>
                  </div>
                  <div className="space-y-2 ml-8">
                    {q.options.map((o) => (
                      <div key={o.id} className={cn(
                        "p-2.5 rounded-lg text-sm border",
                        o.isCorrect ? "bg-success/10 border-success/30 text-success" :
                        selected.includes(o.id) ? "bg-destructive/10 border-destructive/30 text-destructive" :
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
            <Button variant="outline" onClick={() => { setStarted(false); setAnswers({}); setShowResults(false); setCurrentQ(0); }}>Réessayer</Button>
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
            {question.options.map((o) => {
              const selected = (answers[question.id] || []).includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggleAnswer(question.id, o.id, question.type)}
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
          <Button variant="outline" disabled={currentQ === 0} onClick={() => setCurrentQ((c) => c - 1)}>Précédent</Button>
          {currentQ < totalQ - 1 ? (
            <Button onClick={() => setCurrentQ((c) => c + 1)}>Suivant</Button>
          ) : (
            <Button onClick={() => setShowResults(true)}>Terminer</Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
