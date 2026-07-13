import type { LocalizedText, SimulationState } from "@/types/engine";

/**
 * Coach radio message tone
 */
export type CoachRadioTone =
  | "encouraging" // Supportive, motivational
  | "warning" // Cautionary, alert
  | "excited" // Enthusiastic, celebrating
  | "concerned" // Worried, protective
  | "proud" // Satisfied, congratulatory
  | "tactical"; // Strategic advice

/**
 * Represents a contextual coach radio message
 */
export interface CoachRadioMessage {
  id: string;
  condition: (state: SimulationState) => boolean;
  message: LocalizedText;
  tone: CoachRadioTone;
  priority: number; // Higher = more important (1-10)
  cooldown?: number; // Minimum km before can trigger again
}

/**
 * Active coach radio transmission
 */
export interface ActiveCoachRadio {
  message: LocalizedText;
  tone: CoachRadioTone;
  km: number;
  timestamp: number;
}
