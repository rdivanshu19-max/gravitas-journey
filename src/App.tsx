import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Account from "./pages/Account";
import Graveyard from "./pages/features/Graveyard";
import StudyRoast from "./pages/features/StudyRoast";
import RankPredictor from "./pages/features/RankPredictor";
import AnxietyCoach from "./pages/features/AnxietyCoach";
import SilenceScore from "./pages/features/SilenceScore";
import Confessions from "./pages/features/Confessions";
import TimeCapsule from "./pages/features/TimeCapsule";
import BrainFingerprint from "./pages/features/BrainFingerprint";
import ConceptDNA from "./pages/features/ConceptDNA";
import LastDay from "./pages/features/LastDay";
import SyllabusMap from "./pages/features/SyllabusMap";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
              <Route path="/feature/graveyard" element={<ProtectedRoute><Graveyard /></ProtectedRoute>} />
              <Route path="/feature/roast" element={<ProtectedRoute><StudyRoast /></ProtectedRoute>} />
              <Route path="/feature/rank-predictor" element={<ProtectedRoute><RankPredictor /></ProtectedRoute>} />
              <Route path="/feature/anxiety-coach" element={<ProtectedRoute><AnxietyCoach /></ProtectedRoute>} />
              <Route path="/feature/silence-score" element={<ProtectedRoute><SilenceScore /></ProtectedRoute>} />
              <Route path="/feature/confessions" element={<ProtectedRoute><Confessions /></ProtectedRoute>} />
              <Route path="/feature/time-capsule" element={<ProtectedRoute><TimeCapsule /></ProtectedRoute>} />
              <Route path="/feature/brain-fingerprint" element={<ProtectedRoute><BrainFingerprint /></ProtectedRoute>} />
              <Route path="/feature/concept-dna" element={<ProtectedRoute><ConceptDNA /></ProtectedRoute>} />
              <Route path="/feature/last-day" element={<ProtectedRoute><LastDay /></ProtectedRoute>} />
              <Route path="/feature/syllabus-map" element={<ProtectedRoute><SyllabusMap /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
