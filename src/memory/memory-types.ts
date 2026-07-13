import type { LocalizedText, SimulationState } from "@/types/engine";

/**
 * Types of flashback triggers
 */
export type FlashbackTriggerType =
  | "location" // Same course as past race
  | "rival" // Same rival encountered
  | "situation" // Similar race situation
  | "distance" // Specific kilometer marker
  | "emotional"; // Emotional state match

/**
 * Memory trigger conditions
 */
export interface MemoryTrigger {
  type: FlashbackTriggerType;
  location?: string; // Course ID
  rival?: string; // Rival ID
  situation?: "struggling" | "leading" | "close_race" | "breaking_point";
  km?: number; // Specific kilometer
  emotionalState?: {
    energyBelow?: number;
    confidenceBelow?: number;
    momentumAbove?: number;
  };
}

/**
 * Flashback memory
 */
export interface FlashbackMemory {
  id: string;
  trigger: MemoryTrigger;
  type: "victory" | "defeat" | "breakthrough" | "struggle" | "redemption";
  title: LocalizedText;
  text: LocalizedText;
  emotionalImpact: "motivating" | "haunting" | "inspiring" | "warning";
  effect: {
    confidence?: number;
    focus?: number;
    willpower?: number;
    energy?: number;
    mentalFatigue?: number;
    momentum?: number;
  };
  priority: number; // Higher = more impactful (1-10)
}

/**
 * Race memory stored from past races
 */
export interface RaceMemory {
  id: string;
  date: string; // ISO timestamp
  location: string; // Course ID
  rival?: string; // Rival ID if present
  outcome: "victory" | "defeat";
  wasClose: boolean; // Finished within 10 seconds
  hadBreakthrough: boolean; // Personal best or major achievement
  hadStruggle: boolean; // Nearly quit, breaking point
  finishTime: number;
  grade: string;
  criticalKm?: number; // Where key moment happened
}

/**
 * Active flashback during race
 */
export interface ActiveFlashback {
  memory: FlashbackMemory;
  km: number;
  timestamp: number;
  dismissed: boolean;
}
