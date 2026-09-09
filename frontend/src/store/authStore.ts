import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'fleet_manager' | 'employee';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  operatorId?: string;
  license?: string;
  experience?: number;
  rating?: number;
  avatarInitials: string;
}

export interface PendingCheckout {
  checkoutId: string;
  assetId: string;
  assetName: string;
  siteId: string;
  siteName: string;
  dueDate: string;
  operatorId: string;
  operatorName: string;
  generatedAt: string;
  generatedBy: string;
  status: 'PENDING' | 'COMPLETED';
}

interface AuthState {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  loginError: string | null;
  pendingCheckouts: PendingCheckout[];

  login: (username: string, password: string) => boolean;
  logout: () => void;
  addPendingCheckout: (checkout: PendingCheckout) => void;
  completeCheckout: (checkoutId: string) => void;
  clearLoginError: () => void;
}

// ─── Hardcoded user credentials (based on seed_data.py operators) ─────────
const USERS: Record<string, { password: string; user: AppUser }> = {
  'fleet.manager': {
    password: 'cat@2024',
    user: {
      id: 'USR-FM-001',
      name: 'Control Tower Alpha',
      role: 'fleet_manager',
      avatarInitials: 'OP',
    },
  },
  'rajesh.kumar': {
    password: 'op@1001',
    user: {
      id: 'USR-OP-001',
      name: 'Rajesh Kumar',
      role: 'employee',
      operatorId: 'OP001',
      license: 'MH12-2021-9988',
      experience: 7.5,
      rating: 4.9,
      avatarInitials: 'RK',
    },
  },
  'vikram.singh': {
    password: 'op@1002',
    user: {
      id: 'USR-OP-002',
      name: 'Vikram Singh',
      role: 'employee',
      operatorId: 'OP002',
      license: 'MH04-2019-4432',
      experience: 5.0,
      rating: 4.7,
      avatarInitials: 'VS',
    },
  },
  'amit.patel': {
    password: 'op@1003',
    user: {
      id: 'USR-OP-003',
      name: 'Amit Patel',
      role: 'employee',
      operatorId: 'OP003',
      license: 'MH14-2020-1122',
      experience: 3.5,
      rating: 4.6,
      avatarInitials: 'AP',
    },
  },
  'suresh.deshmukh': {
    password: 'op@1004',
    user: {
      id: 'USR-OP-004',
      name: 'Suresh Deshmukh',
      role: 'employee',
      operatorId: 'OP004',
      license: 'MH15-2018-7711',
      experience: 9.0,
      rating: 4.95,
      avatarInitials: 'SD',
    },
  },
  'ganesh.shinde': {
    password: 'op@1005',
    user: {
      id: 'USR-OP-005',
      name: 'Ganesh Shinde',
      role: 'employee',
      operatorId: 'OP005',
      license: 'MH02-2022-3344',
      experience: 2.0,
      rating: 4.3,
      avatarInitials: 'GS',
    },
  },
};

export const ALL_OPERATORS: AppUser[] = Object.values(USERS)
  .filter((u) => u.user.role === 'employee')
  .map((u) => u.user);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      loginError: null,
      pendingCheckouts: [],

      login: (username: string, password: string) => {
        const entry = USERS[username.toLowerCase().trim()];
        if (!entry) {
          set({ loginError: 'Invalid username or password.' });
          return false;
        }
        if (entry.password !== password) {
          set({ loginError: 'Invalid username or password.' });
          return false;
        }
        set({ currentUser: entry.user, isAuthenticated: true, loginError: null });
        return true;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, loginError: null });
      },

      addPendingCheckout: (checkout: PendingCheckout) => {
        set({ pendingCheckouts: [checkout, ...get().pendingCheckouts] });
      },

      completeCheckout: (checkoutId: string) => {
        set({
          pendingCheckouts: get().pendingCheckouts.map((c) =>
            c.checkoutId === checkoutId ? { ...c, status: 'COMPLETED' } : c
          ),
        });
      },

      clearLoginError: () => set({ loginError: null }),
    }),
    {
      name: 'cat-auth-session',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        pendingCheckouts: state.pendingCheckouts,
      }),
    }
  )
);
