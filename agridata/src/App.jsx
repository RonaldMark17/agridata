import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context & Security
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout & Authentication
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register'; // Ensure you created this file
import LandingPage from './components/LandingPage'; // Ensure you created this file

// Core Analytics
import Dashboard from './pages/Dashboard';

// Farmer Management Module
import FarmersList from './pages/FarmersList';
import FarmerForm from './pages/FarmerForm'; 

// Research & Community Modules
import Experiences from './pages/Experiences';
import ResearchProjects from './pages/ResearchProjects';
import SurveyQuestionnaires from './pages/SurveyQuestionnaires'; // <--- NEW MODULE
import Barangays from './pages/Barangays';
import Organizations from './pages/Organizations'; 
import Products from './pages/Products';

// Admin & Audit Modules
import Users from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';

// Placeholders for missing pages (Delete these if you have real files)
const ForgotPassword = () => <div className="p-10 text-center">Contact Admin to reset password.</div>;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          {/* --- PUBLIC ZONE --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* --- PROTECTED APP ZONE --- */}
          {/* We use a Layout Route without a path so it wraps all children */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /app or unknown routes to dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Farmer Module */}
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/new" element={<FarmerForm />} />
            <Route path="/farmers/:id" element={<FarmerForm />} />
            <Route path="/farmers/:id/edit" element={<FarmerForm />} />
            
            {/* Knowledge Modules */}
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/projects" element={<ResearchProjects />} />
            <Route path="/surveys" element={<SurveyQuestionnaires />} /> 
            
            {/* Registry Modules */}
            <Route path="/barangays" element={<Barangays />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/products" element={<Products />} />

            {/* Admin Modules */}
            <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route path="/logs" element={
                <ProtectedRoute allowedRoles={['admin', 'researcher']}>
                  <ActivityLogs />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;