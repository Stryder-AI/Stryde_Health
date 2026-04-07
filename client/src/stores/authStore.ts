import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string | null;
  specialization: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Demo users — used when the backend API is not available            */
/* ------------------------------------------------------------------ */

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@strydehealth.com': {
    password: 'password123',
    user: { id: '1', email: 'admin@strydehealth.com', fullName: 'Admin User', role: 'super_admin', department: 'Administration', specialization: null, avatarUrl: null },
  },
  'ayesha@strydehealth.com': {
    password: 'password123',
    user: { id: '2', email: 'ayesha@strydehealth.com', fullName: 'Ayesha Khan', role: 'receptionist', department: 'Front Desk', specialization: null, avatarUrl: null },
  },
  'tariq@strydehealth.com': {
    password: 'password123',
    user: { id: '3', email: 'tariq@strydehealth.com', fullName: 'Dr. Tariq Ahmed', role: 'doctor', department: 'Cardiology', specialization: 'Cardiologist', avatarUrl: null },
  },
  'saira@strydehealth.com': {
    password: 'password123',
    user: { id: '4', email: 'saira@strydehealth.com', fullName: 'Dr. Saira Khan', role: 'doctor', department: 'General Medicine', specialization: 'General Physician', avatarUrl: null },
  },
  'imran@strydehealth.com': {
    password: 'password123',
    user: { id: '5', email: 'imran@strydehealth.com', fullName: 'Dr. Imran Malik', role: 'doctor', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', avatarUrl: null },
  },
  'hamza@strydehealth.com': {
    password: 'password123',
    user: { id: '6', email: 'hamza@strydehealth.com', fullName: 'Hamza Ali', role: 'lab_technician', department: 'Pathology', specialization: null, avatarUrl: null },
  },
  'bilal@strydehealth.com': {
    password: 'password123',
    user: { id: '7', email: 'bilal@strydehealth.com', fullName: 'Bilal Shah', role: 'pharmacist', department: 'Pharmacy', specialization: null, avatarUrl: null },
  },
};

function demoLogin(email: string, password: string): User | null {
  const entry = DEMO_USERS[email.toLowerCase()];
  if (entry && entry.password === password) return entry.user;
  return null;
}

/* ------------------------------------------------------------------ */

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Try the real API first
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data.data;
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          // API unavailable — fall back to demo mode
          const demoUser = demoLogin(email, password);
          if (demoUser) {
            set({ user: demoUser, token: 'demo-token', isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
            throw new Error('Invalid email or password');
          }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        api.post('/auth/logout').catch(() => {});
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;

        // In demo mode, keep existing user
        if (token === 'demo-token') return;

        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'stryde-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
