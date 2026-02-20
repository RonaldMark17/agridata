import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context & Security
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout & Authentication
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './components/LandingPage';

// Core Analytics
import Dashboard from './pages/Dashboard';

// Farmer Management Module
import FarmersList from './pages/FarmersList';
import FarmerForm from './pages/FarmerForm'; 

// Geospatial Module
import GeospatialMapping from './pages/GeospatialMapping';

// Research & Community Modules
import Experiences from './pages/Experiences';
import ResearchProjects from './pages/ResearchProjects';
import SurveyQuestionnaires from './pages/SurveyQuestionnaires';
import Barangays from './pages/Barangays';
import Organizations from './pages/Organizations'; 
import Products from './pages/Products';

// Admin & Audit Modules
import Users from './pages/Users';
import ActivityLogs from './pages/ActivityLogs';

// Fallback Page
const ForgotPassword = () => <div className="p-10 text-center font-bold text-slate-500">Contact System Administrator to reset password.</div>;

// Scroll Management
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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          {/* --- PUBLIC ZONE --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* --- PROTECTED APP ZONE --- */}
          {/* The Layout wraps all internal routes, enforcing authentication globally */}
          <Route 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<GeospatialMapping />} />
            
            {/* Farmer Module */}
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/new" element={<FarmerForm />} />
            <Route path="/farmers/:id" element={<FarmerForm />} />
            <Route path="/farmers/:id/edit" element={<FarmerForm />} />
            
            {/* Knowledge & Data Modules */}
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/projects" element={<ResearchProjects />} />
            <Route path="/surveys" element={<SurveyQuestionnaires />} /> 
            
            {/* Registry Modules */}
            <Route path="/barangays" element={<Barangays />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/products" element={<Products />} />

            {/* Admin Modules (Double-Protected by Role) */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'researcher', 'data_encoder', 'viewer']}>
                  <ActivityLogs />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Global Fallback (404 Redirect) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;