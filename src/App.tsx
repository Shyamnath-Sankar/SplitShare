import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import RecentActivity from './pages/RecentActivity';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Privacy from './pages/Privacy';
import TermsAndCondition from './pages/TermsAndCondition';
import Landing from './pages/Landing';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Add class immediately so CSS padding applies on first render
      document.body.classList.add('native-platform');
      
      StatusBar.setBackgroundColor({ color: '#044d4b' }).catch(console.error);
      StatusBar.setStyle({ style: Style.Dark }).catch(console.error);
      StatusBar.setOverlaysWebView({ overlay: false }).catch(console.error);
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/termsandcondition" element={<TermsAndCondition />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recent" element={<RecentActivity />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
