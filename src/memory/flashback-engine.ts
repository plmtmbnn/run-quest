import type { SimulationState } from "@/types/engine";
import { getAllFlashbacks } from "./flashback-database";
import type {
  ActiveFlashback,
  FlashbackMemory,
  RaceMemory,
} from "./memory-types";

/**
 * Flashback Engine
 * Manages memory-based emotional moments during races
 */
export class FlashbackEngine {
  private raceMemories: RaceMemory[];
  private shownFlashbacks: Set<string> = new Set();
  private lastFlashbackKm: number = 0;
  private activeFlashback: ActiveFlashback | null = null;
  private currentLocation: string;
  private rivalName?: string;

  constructor(
    raceMemories: RaceMemory[],
    currentLocation: string,
    rivalName?: string,
  ) {
    this.raceMemories = raceMemories;
    this.currentLocation = currentLocation;
    this.rivalName = rivalName;
  }

  /**
   * Check if a flashback should trigger
   */
  public checkForFlashback(state: SimulationState): ActiveFlashback | null {
    // Don't trigger if flashback is currently active
    if (this.activeFlashback && !this.activeFlashback.dismissed) {
      return this.activeFlashback;
    }

    // Minimum 5km between flashbacks
    if (state.distanceCovered - this.lastFlashbackKm < 5) {
      return null;
    }

    // Get all available flashbacks
    const flashbacks = getAllFlashbacks(
      this.raceMemories,
      state.distanceCovered,
      this.currentLocation,
      this.rivalName,
    );

    // Filter by trigger conditions and not shown
    const matchingFlashbacks = flashbacks.filter((fb) => {
      if (this.shownFlashbacks.has(fb.id)) {
        return false;
      }

      return this.checkTriggerCondition(fb, state);
    });

    if (matchingFlashbacks.length === 0) {
      return null;
    }

    // Sort by priority (highest first)
    matchingFlashbacks.sort((a, b) => b.priority - a.priority);

    // Create active flashback
    const selectedMemory = matchingFlashbacks[0];
    this.activeFlashback = {
      memory: selectedMemory,
      km: state.distanceCovered,
      timestamp: Date.now(),
      dismissed: false,
    };

    // Track shown flashbacks
    this.shownFlashbacks.add(selectedMemory.id);
    this.lastFlashbackKm = state.distanceCovered;

    return this.activeFlashback;
  }

  /**
   * Check if trigger condition is met
   */
  private checkTriggerCondition(
    flashback: FlashbackMemory,
    state: SimulationState,
  ): boolean {
    const { trigger } = flashback;

    switch (trigger.type) {
      case "location":
        return trigger.location === this.currentLocation;

      case "rival":
        return trigger.rival === this.rivalName;

      case "situation":
        if (trigger.situation === "struggling") {
          return state.energy < 40 && state.confidence < 60;
        }
        if (trigger.situation === "leading") {
          return state.confidence > 70 && state.momentum > 60;
        }
        if (trigger.situation === "close_race") {
          return (
            state.distanceCovered > state.totalDistance * 0.7 &&
            state.confidence > 50
          );
        }
        if (trigger.situation === "breaking_point") {
          return (
            state.energy < 30 &&
            (state.muscleFatigue > 70 || state.mentalFatigue > 70)
          );
        }
        return false;

      case "distance":
        if (trigger.km) {
          return Math.abs(state.distanceCovered - trigger.km) < 0.5;
        }
        return false;

      case "emotional":
        if (trigger.emotionalState) {
          const { energyBelow, confidenceBelow, momentumAbove } =
            trigger.emotionalState;

          if (energyBelow && state.energy >= energyBelow) return false;
          if (confidenceBelow && state.confidence >= confidenceBelow)
            return false;
          if (momentumAbove && state.momentum <= momentumAbove) return false;

          return true;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Dismiss active flashback
   */
  public dismissFlashback(): void {
    if (this.activeFlashback) {
      this.activeFlashback.dismissed = true;
    }
  }

  /**
   * Get currently active flashback
   */
  public getActiveFlashback(): ActiveFlashback | null {
    return this.activeFlashback;
  }

  /**
   * Reset for new race
   */
  public reset(
    newMemories: RaceMemory[],
    newLocation: string,
    newRivalName?: string,
  ): void {
    this.raceMemories = newMemories;
    this.currentLocation = newLocation;
    this.rivalName = newRivalName;
    this.shownFlashbacks.clear();
    this.lastFlashbackKm = 0;
    this.activeFlashback = null;
  }

  /**
   * Get stats for debugging
   */
  public getStats() {
    return {
      totalMemories: this.raceMemories.length,
      flashbacksShown: this.shownFlashbacks.size,
      lastFlashbackKm: this.lastFlashbackKm,
      hasActiveFlashback:
        this.activeFlashback !== null && !this.activeFlashback.dismissed,
    };
  }
}
