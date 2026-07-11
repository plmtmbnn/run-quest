import { create } from "zustand";
import type {
  Gear,
  Mindset,
  Nutrition,
  PacingPlan,
  Preparation,
  Shoe,
  Warmup,
} from "@/types/engine";

export interface PreparationState {
  preparation: Preparation;
  setShoes: (shoes: Shoe) => void;
  toggleNutrition: (nutrition: Nutrition) => void;
  toggleGear: (gear: Gear) => void;
  setWarmup: (warmup: Warmup) => void;
  setPacing: (pacing: PacingPlan) => void;
  setMindset: (mindset: Mindset) => void;
  setWarmupBonus: (warmupBonus: "perfect" | "good" | "normal") => void;
  reset: () => void;
}

const DEFAULT_PREPARATION: Preparation = {
  shoes: "daily_trainer",
  nutrition: ["water"],
  gear: [],
  warmup: "none",
  pacing: "steady",
  mindset: "calm",
};

export const usePreparationStore = create<PreparationState>((set) => ({
  preparation: { ...DEFAULT_PREPARATION },

  setShoes: (shoes) =>
    set((state) => ({
      preparation: { ...state.preparation, shoes },
    })),

  toggleNutrition: (nutritionItem) =>
    set((state) => {
      const currentNutrition = state.preparation.nutrition;
      const exists = currentNutrition.includes(nutritionItem);
      const updatedNutrition = exists
        ? currentNutrition.filter((n) => n !== nutritionItem)
        : [...currentNutrition, nutritionItem];

      return {
        preparation: { ...state.preparation, nutrition: updatedNutrition },
      };
    }),

  toggleGear: (gearItem) =>
    set((state) => {
      const currentGear = state.preparation.gear;
      const exists = currentGear.includes(gearItem);
      const updatedGear = exists
        ? currentGear.filter((g) => g !== gearItem)
        : [...currentGear, gearItem];

      return {
        preparation: { ...state.preparation, gear: updatedGear },
      };
    }),

  setWarmup: (warmup) =>
    set((state) => ({
      preparation: { ...state.preparation, warmup },
    })),

  setPacing: (pacing) =>
    set((state) => ({
      preparation: { ...state.preparation, pacing },
    })),

  setMindset: (mindset) =>
    set((state) => ({
      preparation: { ...state.preparation, mindset },
    })),

  setWarmupBonus: (warmupBonus) =>
    set((state) => ({
      preparation: { ...state.preparation, warmupBonus },
    })),

  reset: () =>
    set(() => ({
      preparation: { ...DEFAULT_PREPARATION },
    })),
}));
