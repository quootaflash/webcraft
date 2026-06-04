import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage.js';
import LoginPage from './components/LoginPage.js';
import Dashboard from './components/Dashboard.js';
import BioLinkPage from './components/BioLinkPage.js';
import { User } from './types.js';

export default function App() {
  // Simple client-side router
  const [route, setRoute] = useState<string>('/');
  const [bioUsername, setBioUsername] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Lite' | 'Pro'>('Free');

  // Parse path and load token on initial load
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.startsWith('/u/')) {
      const username = path.split('/u/')[1] || '';
      if (username) {
        setBioUsername(username);
        setRoute('/u');
        return;
      }
    }

    // Try to load cached session
    const cachedToken = localStorage.getItem('dunnak_token');
    const cachedUser = localStorage.getItem('dunnak_user');

    if (cachedToken && cachedUser) {
      try {
        setToken(cachedToken);
        setUser(JSON.parse(cachedUser));
        setRoute('/dashboard');
        return;
      } catch (e) {
        localStorage.removeItem('dunnak_token');
        localStorage.removeItem('dunnak_user');
      }
    }

    if (path === '/login') {
      setRoute('/login');
    } else {
      setRoute('/');
    }
  }, []);

  // Custom navigate function to sync URL bar smoothly
  const navigate = (targetPath: string) => {
    if (targetPath.startsWith('/u/')) {
      const username = targetPath.split('/u/')[1] || '';
      setBioUsername(username);
      setRoute('/u');
      window.history.pushState(null, '', targetPath);
      return;
    }

    setRoute(targetPath);
    window.history.pushState(null, '', targetPath);
  };

  // Handle successful logins
  const handleLoginSuccess = (newToken: string, loggedInUser: User) => {
    setToken(newToken);
    setUser(loggedInUser);
    localStorage.setItem('dunnak_token', newToken);
    localStorage.setItem('dunnak_user', JSON.stringify(loggedInUser));
    navigate('/dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dunnak_token');
    localStorage.removeItem('dunnak_user');
    navigate('/');
  };

  const handleSelectPlanAndStart = (plan: 'Free' | 'Lite' | 'Pro') => {
    setSelectedPlan(plan);
    navigate('/login');
  };

  // Render correct page
  if (route === '/u') {
    return <BioLinkPage username={bioUsername} />;
  }

  if (route === '/login') {
    return (
      <LoginPage
        onNavigate={navigate}
        onLoginSuccess={handleLoginSuccess}
        initialPlan={selectedPlan}
      />
    );
  }

  if (route === '/dashboard' && token && user) {
    return (
      <Dashboard
        token={token}
        initialUser={user}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback to Landing Page
  return (
    <LandingPage
      onNavigate={navigate}
      onSelectPlanAndStart={handleSelectPlanAndStart}
    />
  );
}
