import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const api = axios.create({
  baseURL: API_URL,
  // Removed 'Content-Type': 'application/json' to allow automatic detection (needed for file uploads)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  
  // Password Reset Flow
  requestOtp: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Login OTP Verification
  verifyOtp: (data) => api.post('/auth/verify-otp', data), // Fixed naming casing
  toggleOtp: (enable) => api.post('/auth/toggle-otp', { enable }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
};

// Farmers API
export const farmersAPI = {
  getAll: (params) => api.get('/farmers', { params }),
  getById: (id) => api.get(`/farmers/${id}`),
  create: (data) => api.post('/farmers', data),
  update: (id, data) => api.put(`/farmers/${id}`, data),
  delete: (id) => api.delete(`/farmers/${id}`),

  addProduct: (farmerId, data) => api.post(`/farmers/${farmerId}/products`, data),
  addChild: (farmerId, data) => api.post(`/farmers/${farmerId}/children`, data),
  exportData: () => api.get('/export/farmers', { responseType: 'blob' }),
  
  updateChild: (farmerId, childId, data) => 
        api.put(`/farmers/${farmerId}/children/${childId}`, data),

  deleteChild: (farmerId, childId) => 
        api.delete(`/farmers/${farmerId}/children/${childId}`),
};

// Experiences API
export const experiencesAPI = {
  getAll: (params) => api.get('/experiences', { params }),
  create: (data) => api.post('/experiences', data),
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  create: (data) => api.post('/projects', data),
};

// Barangays API
export const barangaysAPI = {
  getAll: () => api.get('/barangays'),
  create: (data) => api.post('/barangays', data),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Organizations API
export const organizationsAPI = {
  getAll: () => api.get('/organizations'),
  create: (data) => api.post('/organizations', data),
  update: (id, data) => api.put(`/organizations/${id}`, data),
  delete: (id) => api.delete(`/organizations/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`), 
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params) => api.get('/activity-logs', { params }),
};

// Surveys API
export const surveysAPI = {
  getAll: () => api.get('/surveys'),
  create: (data) => api.post('/surveys', data),
  update: (id, data) => api.put(`/surveys/${id}`, data),
  delete: (id) => api.delete(`/surveys/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  deleteAll: () => api.delete('/notifications')
};

export default api;