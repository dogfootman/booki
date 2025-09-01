import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, type AuthenticatedUser, type AuthState } from '@/types/user';

// Dummy users for demonstration
const dummyUsers: AuthenticatedUser[] = [
  {
    id: 'admin-001',
    email: 'admin@bookie.com',
    name: '시스템 관리자',
    role: UserRole.ADMIN,
    avatar_url: 'https://picsum.photos/200/200?random=1',
    is_active: true,
    permissions: ['all'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agency-001',
    email: 'sarah@hawaii-tours.com',
    name: 'Sarah Johnson',
    role: UserRole.AGENCY_MANAGER,
    avatar_url: 'https://picsum.photos/200/200?random=2',
    is_active: true,
    agency_id: 'agency-001',
    agency_name: 'Hawaii Adventure Tours',
    permissions: ['manage_agents', 'manage_activities', 'view_bookings', 'manage_schedules'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'agent-001',
    email: 'mike@hawaii-tours.com',
    name: 'Mike Chen',
    role: UserRole.AGENT,
    avatar_url: 'https://picsum.photos/200/200?random=3',
    is_active: true,
    agency_id: 'agency-001',
    agency_name: 'Hawaii Adventure Tours',
    specialties: ['Surfing', 'Hiking', 'Cultural Tours'],
    languages: ['English', 'Korean'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (role: UserRole) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by email (dummy authentication)
        const user = dummyUsers.find(u => u.email === email);
        
        if (user && password === 'password') { // Simple password check for demo
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } else {
          set({
            isLoading: false,
            error: '이메일 또는 비밀번호가 올바르지 않습니다',
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      switchUser: (role: UserRole) => {
        const user = dummyUsers.find(u => u.role === role);
        if (user) {
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'bookie-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions
export const getCurrentUser = () => useAuthStore.getState().user;
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;
export const hasRole = (role: UserRole) => {
  const user = getCurrentUser();
  return user?.role === role;
};
export const hasPermission = (permission: string) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (user.role === UserRole.ADMIN) return true;
  if (user.role === UserRole.AGENCY_MANAGER) {
    return user.permissions.includes(permission);
  }
  
  return false;
};
