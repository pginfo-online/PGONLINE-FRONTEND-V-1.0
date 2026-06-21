import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (updatedUser) =>
        set((state) => ({ user: { ...state.user, ...updatedUser } })),

      // Selectors
      isAdmin: () => get().user?.role === 'admin',
      isOwner: () => get().user?.role === 'owner',
    }),
    {
      name: 'pginfo-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
