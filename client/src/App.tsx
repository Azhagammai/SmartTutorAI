import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import AssessmentPage from "@/pages/assessment-page";
import LearningPathPage from "@/pages/learning-path-page";
import CommunityPage from "@/pages/community-page";
import { AuthProvider } from "./hooks/use-auth";
import { LearningProvider } from "./contexts/learning-context";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/assessment" component={AssessmentPage} />
      <ProtectedRoute path="/learning-path" component={LearningPathPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <AuthPage path="/auth" />
      <NotFound component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LearningProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LearningProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
