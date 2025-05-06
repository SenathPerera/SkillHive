import { create } from 'zustand';
import { apiService } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.login(email, password);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('authToken', response.token);
      set({
        user: response.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('authToken');
      set({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
      throw error;
    }
  },

  signUp: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.register(userData);
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response format from server');
      }

      localStorage.setItem('authToken', response.token);
      set({
        user: response.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('authToken');
      set({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  signOut: () => {
    localStorage.removeItem('authToken');
    set({ user: null, loading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));