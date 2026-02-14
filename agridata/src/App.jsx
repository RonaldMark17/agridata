import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context & Security
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout & Core Pages
import Layout from './components/Layout';
import Login from './pages/Login';
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
 * ScrollToTop ensures the window resets to the top on every route change.
 * This is crucial since your Layout has a sticky sidebar and scrollable main area.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Authenticated Application Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Index & Analytics */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Farmer Module: List, Create, and Edit */}
            <Route path="farmers" element={<FarmersList />} />
            <Route path="farmers/new" element={<FarmerForm />} />
            <Route path="farmers/:id/edit" element={<FarmerForm />} />
            
            {/* Research & Wisdom Modules */}
            <Route path="experiences" element={<Experiences />} />
            <Route path="projects" element={<ResearchProjects />} />
            
            {/* Reference Data */}
            <Route path="barangays" element={<Barangays />} />
            <Route path="products" element={<Products />} />

            {/* Admin-Restricted: User Governance */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Audit & Compliance: Restricted Access */}
            <Route
              path="logs"
              element={
                <ProtectedRoute allowedRoles={['admin', 'researcher']}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* Global Catch-all / 404 Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;