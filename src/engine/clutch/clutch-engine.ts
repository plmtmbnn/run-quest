import type { SimulationState } from "@/types/engine";
import { getClutchMoment } from "./clutch-database";
import type { ActiveClutchMoment, ClutchMoment } from "./clutch-types";

/**
 * Clutch Engine
 * Manages high-stakes, all-or-nothing moments during races
 */
export class ClutchEngine {
  private shownClutchMoments: Set<string> = new Set();
  private activeClutchMoment: ActiveClutchMoment | null = null;
  private clutchAttempted: boolean = false;

  /**
   * Check if a clutch moment should trigger
   */
  public checkForClutchMoment(
    state: SimulationState,
    rivalAhead: boolean,
    position: "winning" | "losing" | "tied",
  ): ActiveClutchMoment | null {
    // Don't trigger if clutch is currently active
    if (this.activeClutchMoment && !this.activeClutchMoment.resolved) {
      return this.activeClutchMoment;
    }

    // Only one clutch moment per race
    if (this.clutchAttempted) {
      return null;
    }

    // Try to get clutch moment
    const clutchMoment = getClutchMoment(
      state,
      rivalAhead,
      position,
      this.shownClutchMoments,
    );

    if (!clutchMoment) {
      return null;
    }

    // Create active clutch moment
    this.activeClutchMoment = {
      clutchMoment,
      km: state.distanceCovered,
      timestamp: Date.now(),
      resolved: false,
    };

    // Track shown moments
    this.shownClutchMoments.add(clutchMoment.id);

    return this.activeClutchMoment;
  }

  /**
   * Resolve clutch attempt
   */
  public resolveClutch(
    attempted: boolean,
    state: SimulationState,
  ): { succeeded: boolean; effects: any } | null {
    if (!this.activeClutchMoment) {
      return null;
    }

    this.clutchAttempted = true;
    this.activeClutchMoment.resolved = true;
    this.activeClutchMoment.playerAttempted = attempted;

    if (!attempted) {
      // Player chose not to attempt
      this.activeClutchMoment.succeeded = false;
      return {
        succeeded: false,
        effects: {}, // No effects if not attempted
      };
    }

    // Calculate success probability
    const successChance =
      this.activeClutchMoment.clutchMoment.successProbability(state);
    const succeeded = Math.random() < successChance;

    this.activeClutchMoment.succeeded = succeeded;

    // Return outcome
    if (succeeded) {
      return {
        succeeded: true,
        effects: this.activeClutchMoment.clutchMoment.outcome.successEffects,
      };
    }

    return {
      succeeded: false,
      effects: this.activeClutchMoment.clutchMoment.outcome.failureEffects,
    };
  }

  /**
   * Get currently active clutch moment
   */
  public getActiveClutchMoment(): ActiveClutchMoment | null {
    return this.activeClutchMoment;
  }

  /**
   * Reset for new race
   */
  public reset(): void {
    this.shownClutchMoments.clear();
    this.activeClutchMoment = null;
    this.clutchAttempted = false;
  }

  /**
   * Get stats for debugging
   */
  public getStats() {
    return {
      clutchMomentsShown: this.shownClutchMoments.size,
      hasActiveClutchMoment:
        this.activeClutchMoment !== null && !this.activeClutchMoment.resolved,
      clutchAttempted: this.clutchAttempted,
    };
  }
}
