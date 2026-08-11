import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GhostType = "personal" | "friend" | "world" | "rival";

export interface GhostRunner {
  id: string;
  name: string;
  type: GhostType;
  splitTimes: number[]; // Accumulated time in seconds at each km [0, t_1km, t_2km...]
  finalTime: number; // Total finish time in seconds
  avatarColor: string;
  distance: number; // Distance of the race (e.g. 5, 10, 21.1, 42.2)
}

interface GhostStoreState {
  storedGhosts: GhostRunner[];
  selectedGhostIds: string[];

  // Actions
  addGhost: (ghost: GhostRunner) => void;
  removeGhost: (id: string) => void;
  setSelectedGhosts: (ids: string[]) => void;
  toggleSelectGhost: (id: string) => void;
  getGhostsForDistance: (distance: number) => GhostRunner[];
  getActiveGhosts: () => GhostRunner[];
}

// Default initial preset ghosts for benchmarking
const DEFAULT_PRESET_GHOSTS: GhostRunner[] = [
  {
    id: "preset_pb_5k",
    name: "My 5K Personal Best",
    type: "personal",
    distance: 5,
    splitTimes: [0, 240, 485, 730, 975, 1220], // 20m20s total
    finalTime: 1220,
    avatarColor: "#3b82f6", // Blue
  },
  {
    id: "preset_friend_jake",
    name: "Jake (Pacing Buddy)",
    type: "friend",
    distance: 5,
    splitTimes: [0, 250, 500, 755, 1010, 1260], // 21m00s
    finalTime: 1260,
    avatarColor: "#22c55e", // Green
  },
  {
    id: "preset_world_record",
    name: "World Record Pace",
    type: "world",
    distance: 5,
    splitTimes: [0, 150, 301, 452, 603, 755], // 12m35s
    finalTime: 755,
    avatarColor: "#eab308", // Gold
  },
  {
    id: "preset_rival_marcus",
    name: "Marcus (Rival)",
    type: "rival",
    distance: 5,
    splitTimes: [0, 235, 475, 715, 960, 1205], // 20m05s
    finalTime: 1205,
    avatarColor: "#ef4444", // Red
  },
];

export const useGhostStore = create<GhostStoreState>()(
  persist(
    (set, get) => ({
      storedGhosts: DEFAULT_PRESET_GHOSTS,
      selectedGhostIds: ["preset_pb_5k"],

      addGhost: (ghost) =>
        set((state) => ({
          storedGhosts: [
            ghost,
            ...state.storedGhosts.filter((g) => g.id !== ghost.id),
          ],
        })),

      removeGhost: (id) =>
        set((state) => ({
          storedGhosts: state.storedGhosts.filter((g) => g.id !== id),
          selectedGhostIds: state.selectedGhostIds.filter((gId) => gId !== id),
        })),

      setSelectedGhosts: (ids) =>
        set({
          selectedGhostIds: ids.slice(0, 3), // Max 3 ghosts
        }),

      toggleSelectGhost: (id) =>
        set((state) => {
          const isSelected = state.selectedGhostIds.includes(id);
          if (isSelected) {
            return {
              selectedGhostIds: state.selectedGhostIds.filter(
                (gId) => gId !== id,
              ),
            };
          }
          if (state.selectedGhostIds.length >= 3) {
            return state; // Limit max 3
          }
          return { selectedGhostIds: [...state.selectedGhostIds, id] };
        }),

      getGhostsForDistance: (distance) => {
        return get().storedGhosts.filter(
          (g) => Math.abs(g.distance - distance) < 0.5,
        );
      },

      getActiveGhosts: () => {
        const { storedGhosts, selectedGhostIds } = get();
        return storedGhosts.filter((g) => selectedGhostIds.includes(g.id));
      },
    }),
    {
      name: "runquest.ghosts",
    },
  ),
);
