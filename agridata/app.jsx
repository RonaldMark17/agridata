import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmersList from './pages/FarmersList';

// Placeholder components for other pages
const Experiences = () => <div className="card"><h2 className="text-2xl font-bold">Farmer Experiences</h2><p className="mt-2 text-gray-600">This module will display and manage farmer lived experiences, cultural traditions, and success stories.</p></div>;
const Projects = () => <div className="card"><h2 className="text-2xl font-bold">Research Projects</h2><p className="mt-2 text-gray-600">This module will manage research projects, surveys, and data collection activities.</p></div>;
const Barangays = () => <div className="card"><h2 className="text-2xl font-bold">Barangays</h2><p className="mt-2 text-gray-600">This module will manage barangay information and agricultural profiles.</p></div>;
const Products = () => <div className="card"><h2 className="text-2xl font-bold">Agricultural Products</h2><p className="mt-2 text-gray-600">This module will manage agricultural product categories and information.</p></div>;
const Users = () => <div className="card"><h2 className="text-2xl font-bold">User Management</h2><p className="mt-2 text-gray-600">This module will manage system users and permissions.</p></div>;
const ActivityLogs = () => <div className="card"><h2 className="text-2xl font-bold">Activity Logs</h2><p className="mt-2 text-gray-600">This module will display system activity logs and audit trails.</p></div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="farmers" element={<FarmersList />} />
            <Route path="experiences" element={<Experiences />} />
            <Route path="projects" element={<Projects />} />
            <Route path="barangays" element={<Barangays />} />
            <Route path="products" element={<Products />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;