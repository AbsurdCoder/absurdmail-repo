import { create } from 'zustand';
import { User, getCurrentUser } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  clearUser: () => set({ user: null, isAuthenticated: false }),
  
  initializeAuth: () => {
    const user = getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
}));
