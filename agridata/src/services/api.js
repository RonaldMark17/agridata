import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
        // Only proceed if we actually have a refresh token
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
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Farmers API
export const farmersAPI = {
  // Get list of farmers with pagination/filters
  getAll: (params) => api.get('/farmers', { params }),

  // Get a single farmer's details (Used for View and Edit)
  getById: (id) => api.get(`/farmers/${id}`),

  // Create a new record
  create: (data) => api.post('/farmers', data),

  // Update an existing record
  // Matches signature: update(id, payload)
  update: (id, data) => api.put(`/farmers/${id}`, data),

  // Delete/Deactivate a record
  delete: (id) => api.delete(`/farmers/${id}`),

  // Add sub-data (Associations)
  addProduct: (farmerId, data) => api.post(`/farmers/${farmerId}/products`, data),
  addChild: (farmerId, data) => api.post(`/farmers/${farmerId}/children`, data),

  // Export data as a downloadable file (CSV/Excel)
  // Renamed to exportData to avoid 'export' reserved keyword issues
  exportData: () => api.get('/export/farmers', { responseType: 'blob' }),
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
};

// Organizations API
export const organizationsAPI = {
  getAll: () => api.get('/organizations'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params) => api.get('/activity-logs', { params }),
};

export default api;