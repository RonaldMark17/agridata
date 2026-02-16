import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmersList from './pages/FarmersList';
import FarmerForm from './pages/FarmerForm';
import LandingPage from './components/LandingPage';

// --- PLACEHOLDER COMPONENTS (To prevent 404s on linked pages) ---
const Register = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900">Registration Portal</h2>
      <p className="text-slate-500 mt-2">Contact your System Administrator to request an account.</p>
      <a href="/" className="text-emerald-600 font-bold mt-4 inline-block">Back to Home</a>
    </div>
  </div>
);

const ForgotPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900">Account Recovery</h2>
      <p className="text-slate-500 mt-2">Please contact IT Support to reset your credentials.</p>
      <a href="/login" className="text-emerald-600 font-bold mt-4 inline-block">Back to Login</a>
    </div>
  </div>
);

const Experiences = () => <div className="card"><h2 className="text-2xl font-bold">Farmer Experiences</h2><p className="mt-2 text-gray-600">This module will display and manage farmer lived experiences.</p></div>;
const Projects = () => <div className="card"><h2 className="text-2xl font-bold">Research Projects</h2><p className="mt-2 text-gray-600">This module will manage research projects.</p></div>;
const Barangays = () => <div className="card"><h2 className="text-2xl font-bold">Barangays</h2><p className="mt-2 text-gray-600">This module will manage barangay information.</p></div>;
const Products = () => <div className="card"><h2 className="text-2xl font-bold">Agricultural Products</h2><p className="mt-2 text-gray-600">This module will manage agricultural product categories.</p></div>;
const Users = () => <div className="card"><h2 className="text-2xl font-bold">User Management</h2><p className="mt-2 text-gray-600">This module will manage system users.</p></div>;
const ActivityLogs = () => <div className="card"><h2 className="text-2xl font-bold">Activity Logs</h2><p className="mt-2 text-gray-600">This module will display system activity logs.</p></div>;

// Helper to scroll to top on route change
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
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* --- PROTECTED ROUTES (Wrapped in Layout) --- */}
          {/* We removed path="/" from here so it doesn't conflict with LandingPage */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /app to /dashboard if needed, or just map routes directly */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Farmers Module */}
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/new" element={<FarmerForm />} />
            <Route path="/farmers/:id/edit" element={<FarmerForm />} /> 
            
            {/* Other Modules */}
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/barangays" element={<Barangays />} />
            <Route path="/products" element={<Products />} />
            
            {/* Admin Routes */}
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
                <ProtectedRoute allowedRoles={['admin', 'researcher']}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* Fallback: 404 goes to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;