import { create } from 'zustand';
import { api } from '@/shared/api/api';
import type { UsuarioAuth } from '../types/auth.types';

interface AuthState {
  user: UsuarioAuth | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const res = await api.get<UsuarioAuth>('/auth/me');
    set({ user: res.data });
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
    }
  },
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<UsuarioAuth>('/auth/me');
      set({ user: res.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  clearSession: () => {
    set({ user: null, isLoading: false });
  },
}));