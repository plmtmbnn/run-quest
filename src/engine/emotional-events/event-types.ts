import type { LocalizedText, SimulationState } from "@/types/engine";

/**
 * Types of dramatic events that can occur during races
 */
export type DramaticEventType =
  | "rival_encounter" // Rival appears or interactions
  | "flashback" // Memory triggers
  | "crowd_moment" // Crowd reactions
  | "weather_shift" // Sudden weather changes
  | "mental_battle" // Internal struggle
  | "physical_crisis"; // Body warnings (cramp, stitch, etc.)

/**
 * Emotional tone of the event
 */
export type EmotionalTone =
  | "tense" // High stakes, pressure
  | "inspiring" // Motivational, uplifting
  | "challenging" // Difficult, testing
  | "triumphant"; // Victory, breakthrough

/**
 * State modifiers applied by dramatic events
 */
export interface StateModifiers {
  energy?: number;
  hydration?: number;
  focus?: number;
  confidence?: number;
  muscleFatigue?: number;
  mentalFatigue?: number;
  momentum?: number;
  paceStability?: number;
}

/**
 * Choice in a dramatic event decision
 */
export interface DramaticChoice {
  id: string;
  text: LocalizedText;
  effect: StateModifiers;
  outcome: LocalizedText; // Result text shown after choice
  risk?: "low" | "medium" | "high"; // Risk level indicator
}

/**
 * Dramatic race event
 */
export interface DramaticEvent {
  id: string;
  type: DramaticEventType;
  trigger: (state: SimulationState, context: RaceContext) => boolean;
  title: LocalizedText;
  description: LocalizedText;
  emotionalTone: EmotionalTone;
  effects?: StateModifiers; // Automatic effects (no choice)
  choices?: DramaticChoice[]; // Player decisions
  priority: number; // Higher = more important (1-10)
  cooldown?: number; // Minimum km before can trigger again
}

/**
 * Context for race events
 */
export interface RaceContext {
  hasRival: boolean;
  rivalName?: string;
  rivalAhead?: boolean;
  raceDistance: number;
  weather: string;
  pastRacesAtLocation?: number;
  previousDefeatHere?: boolean;
}

/**
 * Active dramatic event
 */
export interface ActiveDramaticEvent {
  event: DramaticEvent;
  km: number;
  timestamp: number;
  resolved: boolean;
  chosenOption?: string;
}
