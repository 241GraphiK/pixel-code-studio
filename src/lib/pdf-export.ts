import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuizAttemptRow {
  studentName: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

interface ModuleStatRow {
  moduleName: string;
  avgScore: number;
  attempts: number;
  bestScore: number;
  worstScore: number;
}

export function exportQuizResultsPdf(
  attempts: QuizAttemptRow[],
  teacherName: string,
  quizTitle?: string
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("fr-FR");

  // Header
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("Mentor", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Exporté le ${now} — ${teacherName}`, 14, 27);

  // Title
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(quizTitle ? `Résultats : ${quizTitle}` : "Résultats des QCM", 14, 38);

  // Summary stats
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
    : 0;
  const passed = attempts.filter(a => a.percentage >= 50).length;

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Total tentatives : ${attempts.length}  |  Score moyen : ${avgScore}%  |  Réussite (≥50%) : ${passed}/${attempts.length}`, 14, 46);

  // Table
  autoTable(doc, {
    startY: 52,
    head: [["Étudiant", "QCM", "Score", "Max", "%", "Date"]],
    body: attempts.map(a => [
      a.studentName,
      a.quizTitle,
      String(a.score),
      String(a.maxScore),
      `${a.percentage}%`,
      a.completedAt,
    ]),
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    styles: {
      cellPadding: 3,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i}/${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
  }

  doc.save(`resultats-qcm-${now.replace(/\//g, "-")}.pdf`);
}

export function exportTeacherStatsPdf(
  moduleStats: ModuleStatRow[],
  totalStudents: number,
  totalAttempts: number,
  globalAvg: number,
  teacherName: string
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("fr-FR");

  // Header
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("Mentor", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Rapport statistiques — ${teacherName} — ${now}`, 14, 27);

  // Title
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text("Rapport de statistiques enseignant", 14, 38);

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Étudiants : ${totalStudents}  |  Tentatives totales : ${totalAttempts}  |  Score moyen global : ${globalAvg}%`, 14, 46);

  // Module stats table
  autoTable(doc, {
    startY: 54,
    head: [["Module", "Score moyen", "Meilleur", "Plus bas", "Tentatives"]],
    body: moduleStats.map(m => [
      m.moduleName,
      `${m.avgScore}%`,
      `${m.bestScore}%`,
      `${m.worstScore}%`,
      String(m.attempts),
    ]),
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [55, 65, 81],
    },
    alternateRowStyles: {
      fillColor: [236, 253, 245],
    },
    styles: {
      cellPadding: 3,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i}/${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
  }

  doc.save(`statistiques-enseignant-${now.replace(/\//g, "-")}.pdf`);
}
