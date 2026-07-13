import type { SimulationState } from "@/types/engine";
import { getNextDramaticEvent } from "./event-database";
import type {
  ActiveDramaticEvent,
  DramaticEvent,
  RaceContext,
} from "./event-types";

/**
 * Dramatic Event Engine
 * Manages dramatic events during races to create tension and emotion
 */
export class DramaticEventEngine {
  private shownEvents: Set<string> = new Set();
  private lastEventKm: number = 0;
  private activeEvent: ActiveDramaticEvent | null = null;
  private context: RaceContext;

  constructor(context: RaceContext) {
    this.context = context;
  }

  /**
   * Check if a dramatic event should trigger
   */
  public checkForEvent(state: SimulationState): ActiveDramaticEvent | null {
    // Don't trigger if event is currently active
    if (this.activeEvent && !this.activeEvent.resolved) {
      return this.activeEvent;
    }

    // Try to get next event
    const event = getNextDramaticEvent(
      state,
      this.context,
      this.shownEvents,
      this.lastEventKm,
    );

    if (!event) {
      return null;
    }

    // Create active event
    this.activeEvent = {
      event,
      km: state.distanceCovered,
      timestamp: Date.now(),
      resolved: false,
    };

    // Track shown events
    this.shownEvents.add(event.id);
    this.lastEventKm = state.distanceCovered;

    return this.activeEvent;
  }

  /**
   * Resolve event with player choice
   */
  public resolveEvent(choiceId?: string): void {
    if (this.activeEvent) {
      this.activeEvent.resolved = true;
      this.activeEvent.chosenOption = choiceId;
    }
  }

  /**
   * Get currently active event
   */
  public getActiveEvent(): ActiveDramaticEvent | null {
    return this.activeEvent;
  }

  /**
   * Update race context (for dynamic changes)
   */
  public updateContext(updates: Partial<RaceContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Reset for new race
   */
  public reset(newContext: RaceContext): void {
    this.shownEvents.clear();
    this.lastEventKm = 0;
    this.activeEvent = null;
    this.context = newContext;
  }

  /**
   * Get stats for debugging
   */
  public getStats() {
    return {
      eventsShown: this.shownEvents.size,
      lastEventKm: this.lastEventKm,
      hasActiveEvent: this.activeEvent !== null && !this.activeEvent.resolved,
    };
  }
}
