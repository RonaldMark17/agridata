import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token validity with backend
          const response = await authAPI.getCurrentUser();
          
          // Update user data with latest from server
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // If token invalid or user parse fails, clear everything
          console.error("Auth Initialization Error:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    // 1. Call Login API
    const response = await authAPI.login(credentials);
    
    // 2. Check if OTP is required (Stop here if true)
    if (response.data.otp_required) {
        return response.data; // Login.jsx will see this and switch to OTP screen
    }

    // 3. If No OTP required, log the user in immediately
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    return response.data;
  };

  // --- NEW: VERIFY OTP FUNCTION ---
  const verifyOtp = async (data) => {
    try {
        const response = await authAPI.verifyOtp(data);
        
        // Backend returns tokens upon successful verification
        const { access_token, refresh_token, user } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        return response.data;
    } catch (error) {
        throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    verifyOtp, // Exposed for Login.jsx
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};