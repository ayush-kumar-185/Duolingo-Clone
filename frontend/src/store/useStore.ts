import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  xp: number;
  streak: number;
  hearts: number;
}

interface UserStore {
  user: User | null;
  activeUsername: string;
  setActiveUsername: (username: string) => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  activeUsername: typeof window !== 'undefined' ? localStorage.getItem('username') || 'duo_learner' : 'duo_learner',
  setActiveUsername: (username: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('username', username);
    set({ activeUsername: username });
    get().fetchUser();
  },
  fetchUser: async () => {
    try {
      const username = get().activeUsername;
      const res = await fetch('http://localhost:8000/api/user', {
        headers: { 'x-username': username }
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data });
      }
    } catch (e) {
      console.error('Failed to fetch user', e);
    }
  },
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
}));
