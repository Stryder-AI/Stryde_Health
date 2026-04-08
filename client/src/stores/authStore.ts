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
    password: 'password',
    user: { id: '1', email: 'admin@strydehealth.com', fullName: 'Admin User', role: 'super_admin', department: 'Administration', specialization: null, avatarUrl: null },
  },
  'receptionist@strydehealth.com': {
    password: 'password',
    user: { id: '2', email: 'receptionist@strydehealth.com', fullName: 'Ayesha Khan', role: 'receptionist', department: 'Front Desk', specialization: null, avatarUrl: null },
  },
  'doctor@strydehealth.com': {
    password: 'password',
    user: { id: '3', email: 'doctor@strydehealth.com', fullName: 'Dr. Tariq Ahmed', role: 'doctor', department: 'Cardiology', specialization: 'Cardiologist', avatarUrl: null },
  },
  'doctor2@strydehealth.com': {
    password: 'password',
    user: { id: '4', email: 'doctor2@strydehealth.com', fullName: 'Dr. Saira Khan', role: 'doctor', department: 'General Medicine', specialization: 'General Physician', avatarUrl: null },
  },
  'doctor3@strydehealth.com': {
    password: 'password',
    user: { id: '5', email: 'doctor3@strydehealth.com', fullName: 'Dr. Imran Malik', role: 'doctor', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', avatarUrl: null },
  },
  'lab@strydehealth.com': {
    password: 'password',
    user: { id: '6', email: 'lab@strydehealth.com', fullName: 'Hamza Ali', role: 'lab_technician', department: 'Pathology', specialization: null, avatarUrl: null },
  },
  'pharmacist@strydehealth.com': {
    password: 'password',
    user: { id: '7', email: 'pharmacist@strydehealth.com', fullName: 'Bilal Shah', role: 'pharmacist', department: 'Pharmacy', specialization: null, avatarUrl: null },
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
          const token = res.data?.data?.token;
          const user = res.data?.data?.user;
          if (!token || !user) throw new Error('NO_BACKEND');
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          // Fall back to demo mode if:
          // 1. Network error (API unreachable)
          // 2. API returned HTML/non-JSON (SPA rewrite on Vercel — no backend)
          // 3. Response missing expected data structure
          const err = error as { code?: string; response?: unknown; message?: string };
          const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
          const isNoBackend = err.message === 'NO_BACKEND';
          const isSpaFallback = err.code === 'ERR_BAD_RESPONSE';

          if (isNetworkError || isNoBackend || isSpaFallback) {
            const demoUser = demoLogin(email, password);
            if (demoUser) {
              set({ user: demoUser, token: 'demo-token', isAuthenticated: true, isLoading: false });
            } else {
              set({ isLoading: false });
              throw new Error('Invalid email or password');
            }
          } else {
            set({ isLoading: false });
            throw new Error('Invalid email or password');
          }
        }
      },

      logout: () => {
        const { token } = get();
        set({ user: null, token: null, isAuthenticated: false });
        if (token && token !== 'demo-token') {
          api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
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
