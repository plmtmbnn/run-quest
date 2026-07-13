import type { LocalizedText } from "@/types/engine";

/**
 * Rival archetypes define their racing style and strengths
 */
export type RivalArchetype =
  | "endurance" // Never tires, strong in long races
  | "speed" // Explosive, strong in short races
  | "tactical" // Smart pacing, adapts well
  | "mental" // Strong willpower, clutch performer
  | "versatile"; // Balanced, no major weakness

/**
 * Rival personalities affect their quotes and behavior
 */
export type RivalPersonality =
  | "cocky" // Trash talks, confident
  | "respectful" // Sportsmanlike, compliments
  | "silent" // Few words, lets performance speak
  | "friendly" // Encouraging, supportive
  | "intense"; // Serious, focused, no nonsense

/**
 * Represents a named rival with personality and quotes
 */
export interface Rival {
  id: string;
  name: string;
  archetype: RivalArchetype;
  personality: RivalPersonality;
  baseSpeed: number; // Base performance level (50-100)
  baseStamina: number; // Stamina attribute (50-100)
  baseWillpower: number; // Mental strength (50-100)
  preferredDistance: "5K" | "10K" | "half" | "marathon" | "ultra";
  avatar?: string; // Future: avatar image path
  preRaceQuotes: LocalizedText[];
  postRaceQuotes: {
    victory: LocalizedText[]; // When rival wins
    defeat: LocalizedText[]; // When rival loses
    close: LocalizedText[]; // Close race (< 10 seconds)
  };
  backstory?: LocalizedText; // Optional background story
}

/**
 * Tracks the relationship between player and a rival
 */
export interface RivalRelationship {
  rivalId: string;
  wins: number; // Player victories against this rival
  losses: number; // Player defeats against this rival
  lastEncounter: string | null; // ISO date of last race
  relationshipLevel: number; // -100 to 100 (rivalry to friendship)
  totalEncounters: number;
  closestMargin: number; // Closest finish time difference (seconds)
  biggestWin: number; // Largest victory margin (seconds)
  biggestLoss: number; // Largest defeat margin (seconds)
}

/**
 * Rival encounter during a race
 */
export interface RivalEncounter {
  rivalId: string;
  rivalName: string;
  km: number; // Where encounter happened
  type: "spotted" | "passed_by" | "overtook" | "side_by_side";
  distanceDifference: number; // Meters ahead (positive) or behind (negative)
  message: LocalizedText;
}

/**
 * Rival state during simulation
 */
export interface RivalSimulationState {
  rivalId: string;
  rivalName: string;
  currentKm: number;
  finishTime: number | null;
  energy: number;
  pace: number; // Current pace in seconds per km
  position: "ahead" | "behind" | "even";
  distanceMeters: number; // Distance in meters from player
}
