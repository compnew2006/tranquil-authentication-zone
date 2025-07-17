import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Chat from "./pages/Chat";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  // Temporarily bypass auth for now
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
