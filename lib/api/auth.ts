import { apiClient, setAuthToken, removeAuthToken } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Register
export const register = async (data: RegisterData) => {
  const response = await apiClient.post('/auth/register', data);
  if (response.data.token) {
    setAuthToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login
export const login = async (data: LoginData) => {
  const response = await apiClient.post('/auth/login', data);
  if (response.data.token) {
    setAuthToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Logout
export const logout = () => {
  removeAuthToken();
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
