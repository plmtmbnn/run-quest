import type { LocalizedText } from "@/types/engine";

export interface DesperationMode {
  trigger: "final_km" | "final_500m" | "final_100m";
  condition: "winning" | "losing" | "close";
  mentalState: "determined" | "desperate" | "resigned";
  boostAvailable: boolean;
}

export interface DesperationOption {
  id: string;
  action: LocalizedText;
  description: LocalizedText;
  effects: {
    energy?: number;
    pace?: number; // Seconds per km
    muscleFatigue?: number;
    mentalFatigue?: number;
    confidence?: number;
  };
  failureEffects?: {
    energy?: number;
    pace?: number;
    muscleFatigue?: number;
    mentalFatigue?: number;
    confidence?: number;
  };
  successChance: number; // 0-1
  risk: "low" | "medium" | "high";
}
