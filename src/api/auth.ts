import axios from 'axios';

const API_URL = '/api';

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    // In a real app, this would be an API call to your backend
    // This is a mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          const user = {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            token: 'dummy-jwt-token',
          };
          localStorage.setItem('user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getAuthHeader() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      return { 'Authorization': 'Bearer ' + user.token };
    } else {
      return {};
    }
  }
};

// Add a request interceptor to include auth token in requests
axios.interceptors.request.use(
  (config) => {
    const authHeader = authService.getAuthHeader();
    if (authHeader.Authorization) {
      config.headers.Authorization = authHeader.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
