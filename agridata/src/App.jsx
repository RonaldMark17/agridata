import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context & Security
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Authentication
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Core Analytics
import Dashboard from './pages/Dashboard';

// Farmer Management Module
import FarmersList from './pages/FarmersList';
import FarmerForm from './pages/FarmerForm'; 

// Research & Community Modules
import Experiences from './pages/Experiences';
import ResearchProjects from './pages/ResearchProjects';
import Barangays from './pages/Barangays';
import Products from './pages/Products';

// Admin & Audit Modules
import Users from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';

/**
 * ScrollToTop: Tactical helper to reset scroll position on navigation.
 * Essential for the "Aerospace" dashboard feel.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Internal Guard: Redirects unauthorized sessions to Login
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Component stays silent during auth check
  
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      {/* Enable v7 Future Flags to ensure the application remains compatible 
        with the next generation of React Router.
      */}
      <BrowserRouter 
        future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}
      >
        <ScrollToTop />
        <Routes>
          {/* --- PUBLIC AUTHENTICATION ZONE --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* --- PROTECTED SYSTEM SHELL --- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default Landing */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Farmer Module: Integrated CRUD & Dossier View */}
            <Route path="farmers">
              <Route index element={<FarmersList />} />
              <Route path="new" element={<FarmerForm />} />
              <Route path=":id" element={<FarmerForm />} /> {/* Read-only Dossier */}
              <Route path=":id/edit" element={<FarmerForm />} />
            </Route>
            
            {/* Knowledge & Research Initiatives */}
            <Route path="experiences" element={<Experiences />} />
            <Route path="projects" element={<ResearchProjects />} />
            
            {/* Territorial & Commodity Registry */}
            <Route path="barangays" element={<Barangays />} />
            <Route path="products" element={<Products />} />

            {/* Restricted: Identity Governance */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Restricted: System Audit Trail */}
            <Route
              path="logs"
              element={
                <ProtectedRoute allowedRoles={['admin', 'researcher']}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* SECURE FALLBACK: Redirect any invalid URL to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;