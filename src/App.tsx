import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ModulesPage from "./pages/ModulesPage";
import ModuleDetailPage from "./pages/ModuleDetailPage";
import QuizzesPage from "./pages/QuizzesPage";
import QuizTakePage from "./pages/QuizTakePage";
import ClassesPage from "./pages/ClassesPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import TeacherModulesPage from "./pages/teacher/TeacherModulesPage";
import CreateModulePage from "./pages/teacher/CreateModulePage";
import CreateQuizPage from "./pages/teacher/CreateQuizPage";
import AchievementsPage from "./pages/AchievementsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MessagesPage from "./pages/MessagesPage";
import TeacherStatsPage from "./pages/teacher/TeacherStatsPage";
import EditModulePage from "./pages/teacher/EditModulePage";
import ClassDetailPage from "./pages/ClassDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
              <Route path="/modules/:id" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
              <Route path="/quizzes" element={<ProtectedRoute><QuizzesPage /></ProtectedRoute>} />
              <Route path="/quizzes/:id" element={<ProtectedRoute><QuizTakePage /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/teacher/modules" element={<ProtectedRoute><TeacherModulesPage /></ProtectedRoute>} />
              <Route path="/teacher/modules/create" element={<ProtectedRoute><CreateModulePage /></ProtectedRoute>} />
              <Route path="/teacher/modules/:id/edit" element={<ProtectedRoute><EditModulePage /></ProtectedRoute>} />
              <Route path="/teacher/quizzes/create" element={<ProtectedRoute><CreateQuizPage /></ProtectedRoute>} />
              <Route path="/teacher/stats" element={<ProtectedRoute><TeacherStatsPage /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
