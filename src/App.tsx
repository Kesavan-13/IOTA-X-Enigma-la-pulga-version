import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { ConsoleLayout } from './layouts/ConsoleLayout';
import { OverviewPage } from './pages/OverviewPage';
import { SessionsPage } from './pages/SessionsPage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { DecoyPreviewPage } from './pages/DecoyPreviewPage';
import { PolicyPage } from './pages/PolicyPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { SecurityPage } from './pages/SecurityPage';
import { ProtectedAppLoginPage } from './pages/ProtectedAppLoginPage';
import { ProtectedAppWorkspacePage } from './pages/ProtectedAppWorkspacePage';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ConsoleLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
            <Route path="decoy-preview" element={<DecoyPreviewPage />} />
            <Route path="policy" element={<PolicyPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
          <Route path="/protected-app" element={<ProtectedAppLoginPage />} />
          <Route path="/protected-app/workspace" element={<ProtectedAppWorkspacePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
