
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Influencers from "./pages/Influencers";
import KairaDashboard from "./pages/KairaDashboard";
import AishaDashboard from "./pages/AishaDashboard";
import BaileyDashboard from "./pages/BaileyDashboard";
import MayraDashboard from "./pages/MayraDashboard";
import Ideas from "./pages/Ideas";
import KairaIdeas from "./pages/KairaIdeas";
import KairaCalendar from "./pages/KairaCalendar";
import KairaCalendarThemes from "./pages/KairaCalendarThemes";
import AishaCalendarThemes from "./pages/AishaCalendarThemes";
import MayraCalendarThemes from "./pages/MayraCalendarThemes";
import BaileyCalendarThemes from "./pages/BaileyCalendarThemes";
import BaileyCalendar from "./pages/BaileyCalendar";
import MayraCalendar from "./pages/MayraCalendar";
import AishaCalendar from "./pages/AishaCalendar";
import BaileyIdeas from "./pages/BaileyIdeas";
import MayraIdeas from "./pages/MayraIdeas";
import Script from "./pages/Script";
import KairaScript from "./pages/KairaScript";
import AishaScript from "./pages/AishaScript";
import BaileyScript from "./pages/BaileyScript";
import MayraScript from "./pages/MayraScript";
import Video from "./pages/Video";
import VideoResults from "./pages/VideoResults";
import Diagnostics from "./pages/Diagnostics";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/influencers" element={<ProtectedRoute><Influencers /></ProtectedRoute>} />
              <Route path="/kaira-dashboard" element={<ProtectedRoute><KairaDashboard /></ProtectedRoute>} />
              <Route path="/aisha-dashboard" element={<ProtectedRoute><AishaDashboard /></ProtectedRoute>} />
              <Route path="/bailey-dashboard" element={<ProtectedRoute><BaileyDashboard /></ProtectedRoute>} />
              <Route path="/mayra-dashboard" element={<ProtectedRoute><MayraDashboard /></ProtectedRoute>} />
              <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
              <Route path="/kaira-ideas" element={<ProtectedRoute><KairaIdeas /></ProtectedRoute>} />
              <Route path="/kaira-calendar" element={<ProtectedRoute><KairaCalendar /></ProtectedRoute>} />
              <Route path="/kaira-calendar-themes" element={<ProtectedRoute><KairaCalendarThemes /></ProtectedRoute>} />
              <Route path="/aisha-calendar-themes" element={<ProtectedRoute><AishaCalendarThemes /></ProtectedRoute>} />
              <Route path="/mayra-calendar-themes" element={<ProtectedRoute><MayraCalendarThemes /></ProtectedRoute>} />
              <Route path="/bailey-calendar-themes" element={<ProtectedRoute><BaileyCalendarThemes /></ProtectedRoute>} />
              <Route path="/bailey-calendar" element={<ProtectedRoute><BaileyCalendar /></ProtectedRoute>} />
              <Route path="/mayra-calendar" element={<ProtectedRoute><MayraCalendar /></ProtectedRoute>} />
              <Route path="/aisha-calendar" element={<ProtectedRoute><AishaCalendar /></ProtectedRoute>} />
              <Route path="/bailey-ideas" element={<ProtectedRoute><BaileyIdeas /></ProtectedRoute>} />
              <Route path="/mayra-ideas" element={<ProtectedRoute><MayraIdeas /></ProtectedRoute>} />
              <Route path="/script" element={<ProtectedRoute><Script /></ProtectedRoute>} />
              <Route path="/kaira-script" element={<ProtectedRoute><KairaScript /></ProtectedRoute>} />
              <Route path="/aisha-script" element={<ProtectedRoute><AishaScript /></ProtectedRoute>} />
              <Route path="/bailey-script" element={<ProtectedRoute><BaileyScript /></ProtectedRoute>} />
              <Route path="/mayra-script" element={<ProtectedRoute><MayraScript /></ProtectedRoute>} />
              <Route path="/video" element={<ProtectedRoute><Video /></ProtectedRoute>} />
              <Route path="/video-results" element={<ProtectedRoute><VideoResults /></ProtectedRoute>} />
          <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
