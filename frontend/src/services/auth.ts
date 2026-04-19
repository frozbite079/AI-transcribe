/**
 * Authentication API service
 */
import { api } from '../lib/api';
import type { UserResponse, TokenResponse } from '../types/api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  mobile?: string;
  company?: string;
  language?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authService = {
  async register(data: RegisterData): Promise<UserResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<TokenResponse & { user: UserResponse }> {
    // Use FormData for OAuth2PasswordRequestForm compatibility
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Fetch user profile
    const userRes = await api.get('/auth/me');
    return { ...response.data, user: userRes.data };
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (e) {
        // Ignore errors on logout
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getMe(): Promise<UserResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<RegisterData>): Promise<UserResponse> {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
  },
};
