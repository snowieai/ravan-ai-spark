
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Influencers from "./pages/Influencers";
import KairaDashboard from "./pages/KairaDashboard";
import AishaDashboard from "./pages/AishaDashboard";
import BaileyDashboard from "./pages/BaileyDashboard";
import Ideas from "./pages/Ideas";
import KairaIdeas from "./pages/KairaIdeas";
import BaileyIdeas from "./pages/BaileyIdeas";
import Script from "./pages/Script";
import KairaScript from "./pages/KairaScript";
import BaileyScript from "./pages/BaileyScript";
import Video from "./pages/Video";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/kaira-dashboard" element={<KairaDashboard />} />
          <Route path="/aisha-dashboard" element={<AishaDashboard />} />
          <Route path="/bailey-dashboard" element={<BaileyDashboard />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/kaira-ideas" element={<KairaIdeas />} />
          <Route path="/bailey-ideas" element={<BaileyIdeas />} />
          <Route path="/script" element={<Script />} />
          <Route path="/kaira-script" element={<KairaScript />} />
          <Route path="/bailey-script" element={<BaileyScript />} />
          <Route path="/video" element={<Video />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
