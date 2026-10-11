import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SharedLocationViewerPage } from './pages/SharedLocationViewerPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Authenticated pages
import { DashboardPage } from './pages/DashboardPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { SafeJourneyPage } from './pages/SafeJourneyPage';
import { LiveLocationPage } from './pages/LiveLocationPage';
import { ContactsPage } from './pages/ContactsPage';
import { NearbyPlacesPage } from './pages/NearbyPlacesPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-950">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirects already authenticated users to dashboard)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-950">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/shared-location/:code" element={<SharedLocationViewerPage />} />

      {/* Authenticated Flow */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/journey" element={<SafeJourneyPage />} />
        <Route path="/location" element={<LiveLocationPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/places" element={<NearbyPlacesPage />} />
        <Route path="/history" element={<IncidentHistoryPage />} />
        <Route path="/history/:id" element={<IncidentDetailPage />} />
        <Route path="/evidence" element={<EvidenceVaultPage />} />
        <Route path="/assistant" element={<AiAssistantPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* Catch-all Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
