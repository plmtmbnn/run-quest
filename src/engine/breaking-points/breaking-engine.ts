import type { SimulationState } from "@/types/engine";
import type { SeededRandom } from "@/utils/random/seeded-random";
import { getBreakingPoint } from "./breaking-database";
import type {
  ActiveBreakingPoint,
  BreakingPointEffects,
} from "./breaking-types";

/**
 * Breaking Point Engine
 * Manages physical and mental crisis points during races
 */
export class BreakingPointEngine {
  private shownBreakingPoints: Set<string> = new Set();
  private activeBreakingPoint: ActiveBreakingPoint | null = null;

  /**
   * Get shown breaking points Set
   */
  public getShownBreakingPoints(): Set<string> {
    return this.shownBreakingPoints;
  }

  /**
   * Set active breaking point
   */
  public setActiveBreakingPoint(active: ActiveBreakingPoint | null): void {
    this.activeBreakingPoint = active;
  }

  /**
   * Check if a breaking point should trigger
   */
  public checkForBreakingPoint(
    state: SimulationState,
  ): ActiveBreakingPoint | null {
    // Don't trigger if breaking point is currently active
    if (this.activeBreakingPoint && !this.activeBreakingPoint.resolved) {
      return this.activeBreakingPoint;
    }

    // Try to get breaking point
    const breakingPoint = getBreakingPoint(state, this.shownBreakingPoints);

    if (!breakingPoint) {
      return null;
    }

    // Create active breaking point
    this.activeBreakingPoint = {
      breakingPoint,
      km: state.distanceCovered,
      timestamp: Date.now(),
      resolved: false,
    };

    // Track shown breaking points
    this.shownBreakingPoints.add(breakingPoint.id);

    return this.activeBreakingPoint;
  }

  /**
   * Attempt recovery from breaking point
   */
  public attemptRecovery(
    recoveryOptionId: string,
    _state: SimulationState,
    random?: SeededRandom,
  ): { recovered: boolean; effects: BreakingPointEffects } | null {
    if (!this.activeBreakingPoint) {
      return null;
    }

    // Find recovery option
    const option = this.activeBreakingPoint.breakingPoint.recoveryOptions.find(
      (opt) => opt.id === recoveryOptionId,
    );

    if (!option) {
      return null;
    }

    // Calculate recovery success using seeded random if provided
    const roll = random ? random.nextRange(0, 1) : Math.random();
    const recovered = roll < option.recoveryChance;

    // Mark as resolved
    this.activeBreakingPoint.resolved = true;
    this.activeBreakingPoint.recoveryAttempted = recoveryOptionId;
    this.activeBreakingPoint.recovered = recovered;

    return {
      recovered,
      effects: option.effects,
    };
  }

  /**
   * Get currently active breaking point
   */
  public getActiveBreakingPoint(): ActiveBreakingPoint | null {
    return this.activeBreakingPoint;
  }

  /**
   * Reset for new race
   */
  public reset(): void {
    this.shownBreakingPoints.clear();
    this.activeBreakingPoint = null;
  }

  /**
   * Get stats for debugging
   */
  public getStats() {
    return {
      breakingPointsShown: this.shownBreakingPoints.size,
      hasActiveBreakingPoint:
        this.activeBreakingPoint !== null && !this.activeBreakingPoint.resolved,
    };
  }
}
