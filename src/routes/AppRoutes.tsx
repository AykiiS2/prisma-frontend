import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landing } from '../pages/Landing/Landing';
import { Login } from '../pages/Login/Login';
import { Register } from '../pages/Register/Register';
import { Onboarding } from '../pages/Onboarding/Onboarding';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Analytics } from '../pages/Analytics/Analytics';
import { Messages } from '../pages/Messages/Messages';
import { Tutorial } from '../pages/Tutorial/Tutorial';
import { Feedback } from '@/pages/Feedback/Feedback';
import { Settings } from '../pages/Settings/Settings';
import { Tools } from '../pages/Tools/Tools';
import { Plans } from '../pages/Plans/Plans';
import { Payment } from '../pages/Payment/Payment';
import { SubmitOpportunity } from '../pages/SubmitOpportunity/SubmitOpportunity';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PaymentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/enviar-oportunidade" element={<SubmitOpportunity />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutorial"
          element={
            <PrivateRoute>
              <Tutorial />
            </PrivateRoute>
          }
        />
        <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/tools/:toolId"
          element={
            <PrivateRoute>
              <Tools />
            </PrivateRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <PrivateRoute>
              <Plans />
            </PrivateRoute>
          }
        />

        <Route
          path="/payment/:planId"
          element={
            <PaymentRoute>
              <Payment />
            </PaymentRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
