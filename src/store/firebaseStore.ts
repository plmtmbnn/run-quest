// src/store/firebaseStore.ts
import { create } from "zustand";

interface FirebaseState {
  enabled: boolean;
  pending: number;
  error?: string;
  setEnabled: (v: boolean) => void;
  incrementPending: () => void;
  decrementPending: () => void;
  clearPending: () => void;
  setError: (e: string) => void;
}

export const useFirebaseStore = create<FirebaseState>((set) => ({
  enabled: false,
  pending: 0,
  error: undefined,
  setEnabled: (v) => set({ enabled: v }),
  incrementPending: () => set((s) => ({ pending: s.pending + 1 })),
  decrementPending: () => set((s) => ({ pending: Math.max(0, s.pending - 1) })),
  clearPending: () => set({ pending: 0, error: undefined }),
  setError: (e) => set({ error: e }),
}));
