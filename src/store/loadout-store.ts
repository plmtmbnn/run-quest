import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Distance } from "@/store/focus-progression-store";
import type { Preparation } from "@/types/engine";

/**
 * Race Loadout - Pre-configured preparation setup
 */
export interface RaceLoadout {
  id: string;
  name: string;
  distance: Distance | "all"; // "all" means works for any distance
  preparation: Preparation;
  autoApply: boolean; // If true, skip prep screen and use this loadout
  createdAt: number;
  lastUsed: number | null;
}

export interface LoadoutState {
  loadouts: RaceLoadout[];
  defaultLoadout: string | null; // Default loadout ID per distance

  // Actions
  createLoadout: (
    loadout: Omit<RaceLoadout, "id" | "createdAt" | "lastUsed">,
  ) => string;
  updateLoadout: (
    id: string,
    updates: Partial<Omit<RaceLoadout, "id" | "createdAt">>,
  ) => void;
  deleteLoadout: (id: string) => void;
  setDefaultLoadout: (id: string | null) => void;
  getLoadoutById: (id: string) => RaceLoadout | null;
  getLoadoutsForDistance: (distance: Distance) => RaceLoadout[];
  useLoadout: (id: string) => void; // Mark as used (updates lastUsed timestamp)
  duplicateLoadout: (id: string, newName: string) => string | null;
}

const DEFAULT_LOADOUTS: RaceLoadout[] = [
  {
    id: "5k-speed",
    name: "5K Speed",
    distance: 5,
    preparation: {
      shoes: "carbon_racer",
      nutrition: ["water"],
      gear: ["cap", "sunglasses"],
      warmup: "dynamic",
      pacing: "aggressive",
      mindset: "confident",
      nutritionQuantities: { water: 1 },
    },
    autoApply: false,
    createdAt: Date.now(),
    lastUsed: null,
  },
  {
    id: "10k-balanced",
    name: "10K Balanced",
    distance: 10,
    preparation: {
      shoes: "lightweight",
      nutrition: ["water", "electrolyte"],
      gear: ["cap", "arm_sleeves"],
      warmup: "full",
      pacing: "steady",
      mindset: "calm",
      nutritionQuantities: { water: 1, electrolyte: 1 },
    },
    autoApply: false,
    createdAt: Date.now(),
    lastUsed: null,
  },
  {
    id: "half-endurance",
    name: "Half Marathon",
    distance: 21.1,
    preparation: {
      shoes: "marathon_racer",
      nutrition: ["water", "electrolyte", "energy_gel"],
      gear: ["cap", "hydration_vest"],
      warmup: "full",
      pacing: "conservative",
      mindset: "calm",
      nutritionQuantities: { water: 2, electrolyte: 1, energy_gel: 2 },
    },
    autoApply: false,
    createdAt: Date.now(),
    lastUsed: null,
  },
  {
    id: "marathon-conservative",
    name: "Marathon Conservative",
    distance: 42.2,
    preparation: {
      shoes: "plated_supershoe",
      nutrition: ["water", "electrolyte", "energy_gel", "salt_tablets"],
      gear: ["cap", "hydration_vest", "compression_socks"],
      warmup: "full",
      pacing: "conservative",
      mindset: "calm",
      nutritionQuantities: {
        water: 3,
        electrolyte: 2,
        energy_gel: 3,
        salt_tablets: 1,
      },
    },
    autoApply: false,
    createdAt: Date.now(),
    lastUsed: null,
  },
];

export const useLoadoutStore = create<LoadoutState>()(
  persist(
    (set, get) => ({
      loadouts: DEFAULT_LOADOUTS,
      defaultLoadout: null,

      createLoadout: (loadout) => {
        const id = `loadout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newLoadout: RaceLoadout = {
          ...loadout,
          id,
          createdAt: Date.now(),
          lastUsed: null,
        };

        set((state) => ({
          loadouts: [...state.loadouts, newLoadout],
        }));

        return id;
      },

      updateLoadout: (id, updates) =>
        set((state) => ({
          loadouts: state.loadouts.map((loadout) =>
            loadout.id === id ? { ...loadout, ...updates } : loadout,
          ),
        })),

      deleteLoadout: (id) =>
        set((state) => ({
          loadouts: state.loadouts.filter((loadout) => loadout.id !== id),
          defaultLoadout:
            state.defaultLoadout === id ? null : state.defaultLoadout,
        })),

      setDefaultLoadout: (id) => set({ defaultLoadout: id }),

      getLoadoutById: (id) => {
        const state = get();
        return state.loadouts.find((loadout) => loadout.id === id) || null;
      },

      getLoadoutsForDistance: (distance) => {
        const state = get();
        return state.loadouts.filter(
          (loadout) =>
            loadout.distance === distance || loadout.distance === "all",
        );
      },

      useLoadout: (id) =>
        set((state) => ({
          loadouts: state.loadouts.map((loadout) =>
            loadout.id === id ? { ...loadout, lastUsed: Date.now() } : loadout,
          ),
        })),

      duplicateLoadout: (id, newName) => {
        const state = get();
        const original = state.loadouts.find((l) => l.id === id);
        if (!original) return null;

        const newId = `loadout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const duplicated: RaceLoadout = {
          ...original,
          id: newId,
          name: newName,
          createdAt: Date.now(),
          lastUsed: null,
        };

        set((state) => ({
          loadouts: [...state.loadouts, duplicated],
        }));

        return newId;
      },
    }),
    {
      name: "runquest.loadouts",
    },
  ),
);
