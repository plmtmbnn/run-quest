import type { SimulationState } from "@/types/engine";
import { getCoachRadioMessage } from "./coach-radio-messages";
import type { ActiveCoachRadio, CoachRadioMessage } from "./coach-radio-types";

/**
 * Coach Radio Engine
 * Manages contextual coaching messages during races
 */
export class CoachRadioEngine {
  private lastMessageKm: number = 0;
  private shownMessages: Set<string> = new Set();
  private activeMessage: ActiveCoachRadio | null = null;

  /**
   * Check if a new coach radio message should be triggered
   */
  public checkForMessage(state: SimulationState): ActiveCoachRadio | null {
    // Don't show message if one is currently active
    if (
      this.activeMessage &&
      Date.now() - this.activeMessage.timestamp < 4000
    ) {
      return this.activeMessage;
    }

    // Clear active message if expired
    if (
      this.activeMessage &&
      Date.now() - this.activeMessage.timestamp >= 4000
    ) {
      this.activeMessage = null;
    }

    // Try to get new message
    const message = getCoachRadioMessage(state, this.lastMessageKm);

    if (!message) {
      return null;
    }

    // Don't repeat messages (except high priority)
    if (this.shownMessages.has(message.id) && message.priority < 9) {
      return null;
    }

    // Create active message
    this.activeMessage = {
      message: message.message,
      tone: message.tone,
      km: state.distanceCovered,
      timestamp: Date.now(),
    };

    // Track message
    this.shownMessages.add(message.id);
    this.lastMessageKm = state.distanceCovered;

    return this.activeMessage;
  }

  /**
   * Get currently active message (if any)
   */
  public getActiveMessage(): ActiveCoachRadio | null {
    if (!this.activeMessage) {
      return null;
    }

    // Check if expired
    if (Date.now() - this.activeMessage.timestamp >= 4000) {
      this.activeMessage = null;
      return null;
    }

    return this.activeMessage;
  }

  /**
   * Force dismiss active message
   */
  public dismissMessage(): void {
    this.activeMessage = null;
  }

  /**
   * Reset engine for new race
   */
  public reset(): void {
    this.lastMessageKm = 0;
    this.shownMessages.clear();
    this.activeMessage = null;
  }

  /**
   * Get stats for debugging
   */
  public getStats() {
    return {
      totalMessagesShown: this.shownMessages.size,
      lastMessageKm: this.lastMessageKm,
      hasActiveMessage: this.activeMessage !== null,
    };
  }
}
