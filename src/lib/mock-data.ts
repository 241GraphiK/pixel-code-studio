// Mock data for the entire application

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  institution?: string;
  field?: string;
  level?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  level: string;
  field: string;
  courseCount: number;
  studentCount: number;
  progress?: number;
  teacherName: string;
  image?: string;
}

export interface Course {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  duration: string;
  resources: Resource[];
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "video" | "link" | "exercise";
  url: string;
}

export interface Question {
  id: string;
  text: string;
  type: "single" | "multiple";
  options: { id: string; text: string; isCorrect: boolean }[];
  points: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  attempts: number;
  bestScore?: number;
}

export interface ClassGroup {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  moduleCount: number;
  createdAt: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  avatar?: string;
  score: number;
  completedModules: number;
  totalModules: number;
  quizzesPassed: number;
  studyTime: string;
  rank: number;
}

// Current user
export const currentUser: User = {
  id: "u1",
  name: "Ahmed Benali",
  email: "ahmed.benali@university.dz",
  role: "student",
  institution: "Université d'Alger",
  field: "Informatique",
  level: "L3",
};

// Modules
export const modules: Module[] = [
  { id: "m1", title: "Algorithmique & Structures de Données", description: "Fondamentaux des algorithmes, complexité, structures de données avancées.", level: "L2", field: "Informatique", courseCount: 12, studentCount: 87, progress: 75, teacherName: "Dr. Karim Medjber", },
  { id: "m2", title: "Bases de Données Avancées", description: "SQL avancé, normalisation, optimisation de requêtes, NoSQL.", level: "L3", field: "Informatique", courseCount: 10, studentCount: 62, progress: 45, teacherName: "Dr. Amina Belkacem", },
  { id: "m3", title: "Réseaux & Sécurité", description: "Protocoles réseau, architecture TCP/IP, cryptographie, sécurité des systèmes.", level: "M1", field: "Cybersécurité", courseCount: 15, studentCount: 43, progress: 20, teacherName: "Pr. Mohamed Saidi", },
  { id: "m4", title: "Développement Web Full-Stack", description: "HTML/CSS/JS, React, Node.js, API REST, déploiement.", level: "L3", field: "Informatique", courseCount: 18, studentCount: 95, progress: 60, teacherName: "Dr. Sara Hamidi", },
  { id: "m5", title: "Intelligence Artificielle", description: "Machine Learning, Deep Learning, NLP, vision par ordinateur.", level: "M1", field: "IA & Data", courseCount: 14, studentCount: 38, progress: 10, teacherName: "Pr. Yacine Bouzid", },
  { id: "m6", title: "Systèmes d'Exploitation", description: "Gestion des processus, mémoire, systèmes de fichiers, Linux.", level: "L2", field: "Informatique", courseCount: 8, studentCount: 71, progress: 90, teacherName: "Dr. Karim Medjber", },
];

// Courses for module m1
export const courses: Course[] = [
  { id: "c1", moduleId: "m1", title: "Introduction aux Algorithmes", content: "Les algorithmes sont au cœur de l'informatique...", order: 1, duration: "45 min", resources: [{ id: "r1", title: "Slides du cours", type: "pdf", url: "#" }, { id: "r2", title: "Vidéo explicative", type: "video", url: "#" }], completed: true },
  { id: "c2", moduleId: "m1", title: "Complexité Algorithmique", content: "La complexité permet de mesurer l'efficacité...", order: 2, duration: "60 min", resources: [{ id: "r3", title: "Exercices pratiques", type: "exercise", url: "#" }], completed: true },
  { id: "c3", moduleId: "m1", title: "Structures Linéaires", content: "Les listes, piles et files sont des structures fondamentales...", order: 3, duration: "50 min", resources: [], completed: false },
  { id: "c4", moduleId: "m1", title: "Arbres et Graphes", content: "Les arbres sont des structures hiérarchiques...", order: 4, duration: "75 min", resources: [{ id: "r4", title: "Documentation", type: "link", url: "#" }], completed: false },
];

// Quizzes
export const quizzes: Quiz[] = [
  {
    id: "q1", moduleId: "m1", title: "QCM - Complexité Algorithmique", description: "Testez vos connaissances sur la complexité.", duration: 20, difficulty: "medium", attempts: 2, bestScore: 85,
    questions: [
      { id: "qq1", text: "Quelle est la complexité d'une recherche binaire ?", type: "single", points: 2, difficulty: "easy", explanation: "La recherche binaire divise l'espace de recherche par 2 à chaque étape.", options: [{ id: "o1", text: "O(n)", isCorrect: false }, { id: "o2", text: "O(log n)", isCorrect: true }, { id: "o3", text: "O(n²)", isCorrect: false }, { id: "o4", text: "O(1)", isCorrect: false }] },
      { id: "qq2", text: "Quel algorithme de tri a la meilleure complexité moyenne ?", type: "single", points: 2, difficulty: "medium", explanation: "Le tri rapide (Quicksort) a une complexité moyenne de O(n log n).", options: [{ id: "o5", text: "Tri à bulles", isCorrect: false }, { id: "o6", text: "Tri par insertion", isCorrect: false }, { id: "o7", text: "Tri rapide", isCorrect: true }, { id: "o8", text: "Tri par sélection", isCorrect: false }] },
      { id: "qq3", text: "Quelles structures de données ont un accès en O(1) ?", type: "multiple", points: 3, difficulty: "hard", explanation: "Les tableaux et les tables de hachage offrent un accès en O(1).", options: [{ id: "o9", text: "Tableau", isCorrect: true }, { id: "o10", text: "Liste chaînée", isCorrect: false }, { id: "o11", text: "Table de hachage", isCorrect: true }, { id: "o12", text: "Arbre binaire", isCorrect: false }] },
    ],
  },
  { id: "q2", moduleId: "m2", title: "QCM - SQL Avancé", description: "Évaluez vos compétences SQL.", duration: 15, difficulty: "easy", attempts: 1, bestScore: 70, questions: [] },
  { id: "q3", moduleId: "m3", title: "QCM - Sécurité des Réseaux", description: "Cryptographie et protocoles de sécurité.", duration: 30, difficulty: "hard", attempts: 0, questions: [] },
];

// Classes
export const classes: ClassGroup[] = [
  { id: "cl1", name: "L3 Informatique - Groupe A", code: "L3-INF-A", teacherId: "t1", teacherName: "Dr. Karim Medjber", studentCount: 32, moduleCount: 4, createdAt: "2024-09-01" },
  { id: "cl2", name: "M1 Cybersécurité", code: "M1-CYBER", teacherId: "t2", teacherName: "Pr. Mohamed Saidi", studentCount: 25, moduleCount: 3, createdAt: "2024-09-01" },
  { id: "cl3", name: "L2 Informatique - Section B", code: "L2-INF-B", teacherId: "t1", teacherName: "Dr. Karim Medjber", studentCount: 40, moduleCount: 5, createdAt: "2024-09-15" },
];

// Student progress for rankings
export const studentProgress: StudentProgress[] = [
  { studentId: "u1", studentName: "Ahmed Benali", score: 87, completedModules: 4, totalModules: 6, quizzesPassed: 8, studyTime: "45h 30min", rank: 1 },
  { studentId: "u2", studentName: "Fatima Zahra", score: 82, completedModules: 3, totalModules: 6, quizzesPassed: 7, studyTime: "38h 15min", rank: 2 },
  { studentId: "u3", studentName: "Mohamed Amine", score: 78, completedModules: 3, totalModules: 6, quizzesPassed: 6, studyTime: "34h 00min", rank: 3 },
  { studentId: "u4", studentName: "Sara Benmoussa", score: 75, completedModules: 3, totalModules: 6, quizzesPassed: 6, studyTime: "30h 45min", rank: 4 },
  { studentId: "u5", studentName: "Yassine Khelifi", score: 71, completedModules: 2, totalModules: 6, quizzesPassed: 5, studyTime: "28h 20min", rank: 5 },
  { studentId: "u6", studentName: "Amira Boudjouda", score: 68, completedModules: 2, totalModules: 6, quizzesPassed: 4, studyTime: "25h 10min", rank: 6 },
  { studentId: "u7", studentName: "Riad Mansouri", score: 64, completedModules: 2, totalModules: 6, quizzesPassed: 4, studyTime: "22h 55min", rank: 7 },
  { studentId: "u8", studentName: "Nadia Ferhat", score: 59, completedModules: 1, totalModules: 6, quizzesPassed: 3, studyTime: "18h 30min", rank: 8 },
];

// Stats data for charts
export const weeklyScores = [
  { week: "Sem 1", score: 65 },
  { week: "Sem 2", score: 70 },
  { week: "Sem 3", score: 68 },
  { week: "Sem 4", score: 78 },
  { week: "Sem 5", score: 82 },
  { week: "Sem 6", score: 85 },
  { week: "Sem 7", score: 87 },
];

export const subjectScores = [
  { subject: "Algo", score: 90 },
  { subject: "BDD", score: 75 },
  { subject: "Réseaux", score: 60 },
  { subject: "Web", score: 85 },
  { subject: "IA", score: 45 },
  { subject: "OS", score: 92 },
];

// Admin stats
export const adminStats = {
  totalUsers: 342,
  totalStudents: 298,
  totalTeachers: 38,
  totalAdmins: 6,
  totalModules: 24,
  totalCourses: 186,
  totalQuizzes: 72,
  totalClasses: 15,
  activeToday: 127,
  avgScore: 74,
};
