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

export function exportCourseContentPdf(
  courseTitle: string,
  moduleTitle: string,
  htmlContent: string,
  plainText: string
) {
  const now = new Date().toLocaleDateString("fr-FR");
  const safeCourseTitle = courseTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${courseTitle} — ${moduleTitle}</title>
  <style>
    @page { size: A4; margin: 20mm 18mm 20mm 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a2e;
    }
    .header {
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-brand { font-size: 18pt; font-weight: 700; color: #3b82f6; font-family: sans-serif; }
    .header-meta { font-size: 8pt; color: #6b7280; font-family: sans-serif; text-align: right; }
    .module-label {
      font-size: 9pt;
      font-family: sans-serif;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 20px;
      font-family: sans-serif;
    }
    .content h1, .content h2 {
      font-family: sans-serif;
      font-weight: 700;
      color: #111827;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .content h1 { font-size: 15pt; }
    .content h2 { font-size: 13pt; }
    .content h3 { font-size: 11pt; font-weight: 700; font-family: sans-serif; margin-top: 14px; margin-bottom: 6px; }
    .content p { margin-bottom: 10px; }
    .content ul, .content ol { margin: 8px 0 10px 22px; }
    .content li { margin-bottom: 4px; }
    .content strong { font-weight: 700; }
    .content em { font-style: italic; }
    .content a { color: #3b82f6; text-decoration: underline; }
    .content blockquote {
      border-left: 3px solid #3b82f6;
      padding: 6px 14px;
      margin: 12px 0;
      color: #374151;
      background: #f0f7ff;
      font-style: italic;
    }
    .content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      margin: 10px 0;
    }
    .content code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 9pt;
    }
    .content pre code { background: none; color: inherit; padding: 0; }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
    }
    .content table th {
      background: #3b82f6;
      color: #fff;
      padding: 6px 10px;
      text-align: left;
      font-family: sans-serif;
    }
    .content table td {
      padding: 5px 10px;
      border: 1px solid #e5e7eb;
      color: #374151;
    }
    .content table tr:nth-child(even) td { background: #f3f4f6; }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 8pt;
      color: #9ca3af;
      font-family: sans-serif;
      padding-bottom: 4mm;
    }
    @media print { .footer { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-brand">Mentor</div>
    <div class="header-meta">Exporté le ${now}</div>
  </div>
  <div class="module-label">${moduleTitle}</div>
  <h1>${courseTitle}</h1>
  <div class="content">
    ${htmlContent || `<p>${plainText}</p>`}
  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  doc.save(`${safeCourseTitle}-${now.replace(/\//g, "-")}.pdf`);
}

