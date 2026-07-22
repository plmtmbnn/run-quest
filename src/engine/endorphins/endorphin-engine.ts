import type { SimulationState } from "@/types/engine";
import type { SeededRandom } from "@/utils/random/seeded-random";
import {
  ADDICTION_GAIN_RATES,
  calculateCravingIntensity,
  calculateWithdrawalEffects,
  determineEndorphinIntensity,
  ENDORPHIN_EFFECTS_DATABASE,
  ENDORPHIN_RUSH_MESSAGES,
  getEndorphinCrashEffects,
} from "./endorphin-database";
import type {
  ActiveEndorphinRush,
  EndorphinEffects,
  EndorphinIntensity,
  EndorphinState,
  EndorphinTrigger,
} from "./endorphin-types";
import { DEFAULT_ENDORPHIN_STATE } from "./endorphin-types";

/**
 * Endorphin Engine
 * Manages endorphin rushes, addiction, and withdrawal during races
 */
export class EndorphinEngine {
  private endorphinState: EndorphinState = { ...DEFAULT_ENDORPHIN_STATE };
  private activeRush: ActiveEndorphinRush | null = null;

  /**
   * Initialize endorphin state for a new race
   */
  public initializeForRace(
    existingAddictionLevel: number = 0,
    daysSinceLastUse: number = 0,
  ): EndorphinState {
    this.endorphinState = {
      ...DEFAULT_ENDORPHIN_STATE,
      addictionLevel: existingAddictionLevel,
      cravingIntensity: 0,
    };

    // Calculate if withdrawal is active
    if (existingAddictionLevel > 30 && daysSinceLastUse > 0) {
      this.endorphinState.cravingIntensity = Math.min(
        Math.round((existingAddictionLevel / 100) * 10),
        10,
      );
    }

    return this.endorphinState;
  }

  /**
   * Get current endorphin state
   */
  public getState(): EndorphinState {
    return { ...this.endorphinState };
  }

  /**
   * Get active endorphin rush
   */
  public getActiveRush(): ActiveEndorphinRush | null {
    return this.activeRush ? { ...this.activeRush } : null;
  }

  /**
   * Trigger an endorphin rush
   */
  public triggerEndorphinRush(
    state: SimulationState,
    trigger: EndorphinTrigger,
  ): {
    state: SimulationState;
    rush: ActiveEndorphinRush;
    effects: EndorphinEffects;
  } {
    // Determine intensity based on context
    let intensity: EndorphinIntensity;

    if (trigger.intensity) {
      intensity = trigger.intensity;
    } else {
      intensity = determineEndorphinIntensity(
        state.energy,
        state.muscleFatigue,
        state.mentalFatigue,
        trigger.risk,
      );
    }

    // Get effects for this intensity
    const effects = { ...ENDORPHIN_EFFECTS_DATABASE[intensity] };

    // Create active rush
    this.activeRush = {
      intensity,
      effects,
      km: state.distanceCovered,
      timestamp: Date.now(),
      dismissed: false,
    };

    // Update endorphin state
    this.endorphinState.isActive = true;
    this.endorphinState.activeEffects = effects;
    this.endorphinState.remainingDuration = effects.duration;
    this.endorphinState.lastEndorphinKm = state.distanceCovered;
    this.endorphinState.totalEndorphinUses += 1;
    this.endorphinState.currentLevel = 100; // Peak rush

    // Increase addiction
    const addictionGain = ADDICTION_GAIN_RATES[intensity];
    this.endorphinState.addictionLevel = Math.min(
      100,
      this.endorphinState.addictionLevel + addictionGain,
    );

    // Apply effects to state
    const updatedState = this.applyEndorphinEffects(state, effects);

    // Add event to log
    updatedState.eventsResolved.push({
      km: state.distanceCovered,
      title: { en: "⚡ ENDORPHIN RUSH!", id: "⚡ LONJAKAN ENDORFIN!" },
      description: ENDORPHIN_RUSH_MESSAGES[intensity],
      effect: {
        stamina: effects.energyBoost,
        hydration: 0,
        morale: effects.confidenceBoost,
        pace: effects.paceBonus,
      },
    });

    updatedState.hasUsedEndorphins = true;
    updatedState.activeEndorphinRush = this.activeRush;

    return {
      state: updatedState,
      rush: this.activeRush,
      effects,
    };
  }

  /**
   * Update endorphin effects each kilometer
   */
  public updateEndorphinEffects(
    state: SimulationState,
    km: number,
  ): {
    state: SimulationState;
    crashed: boolean;
    crashMessage?: string;
  } {
    if (!this.endorphinState.isActive || !this.endorphinState.activeEffects) {
      return { state, crashed: false };
    }

    // Decrease remaining duration
    this.endorphinState.remainingDuration -= 1;

    // Decay intensity
    const durationLeft = this.endorphinState.remainingDuration;
    const totalDuration = this.endorphinState.activeEffects.duration;
    const decayFactor = Math.max(0, durationLeft / totalDuration);

    this.endorphinState.currentLevel = Math.round(100 * decayFactor);

    // Check if rush has ended
    if (this.endorphinState.remainingDuration <= 0) {
      return this.endEndorphinRush(state);
    }

    // Apply diminishing effects
    const currentEffects = {
      ...this.endorphinState.activeEffects,
      energyBoost: Math.round(
        this.endorphinState.activeEffects.energyBoost * decayFactor,
      ),
      paceBonus: Math.round(
        this.endorphinState.activeEffects.paceBonus * decayFactor,
      ),
      painSuppression: Math.round(
        this.endorphinState.activeEffects.painSuppression * decayFactor,
      ),
      confidenceBoost: Math.round(
        this.endorphinState.activeEffects.confidenceBoost * decayFactor,
      ),
      momentumBoost: Math.round(
        (this.endorphinState.activeEffects.momentumBoost ?? 0) * decayFactor,
      ),
    };

    const updatedState = this.applyEndorphinEffects(state, currentEffects);

    return { state: updatedState, crashed: false };
  }

  /**
   * End endorphin rush and apply crash effects
   */
  private endEndorphinRush(state: SimulationState): {
    state: SimulationState;
    crashed: true;
    crashMessage: string;
  } {
    if (!this.activeRush) {
      return {
        state,
        crashed: true,
        crashMessage: "The rush fades...",
      };
    }

    const crashEffects = getEndorphinCrashEffects(this.activeRush.intensity);

    // Apply crash penalties
    const updatedState = {
      ...state,
      energy: Math.max(0, state.energy - crashEffects.energyDrain),
      muscleFatigue: Math.min(
        100,
        state.muscleFatigue + crashEffects.fatiguePenalty,
      ),
      confidence: Math.max(0, state.confidence - crashEffects.confidenceDrop),
    };

    // Add crash event
    updatedState.eventsResolved.push({
      km: state.distanceCovered,
      title: {
        en: "Endorphin Rush Fades",
        id: "Lonjakan Endorfin Memudar",
      },
      description: crashEffects.message,
      effect: {
        stamina: -crashEffects.energyDrain,
        hydration: 0,
        morale: -crashEffects.confidenceDrop,
        pace: 0,
      },
    });

    // Reset endorphin state
    this.endorphinState.isActive = false;
    this.endorphinState.activeEffects = null;
    this.endorphinState.remainingDuration = 0;
    this.endorphinState.currentLevel = 0;
    this.activeRush = null;

    updatedState.activeEndorphinRush = null;

    return {
      state: updatedState,
      crashed: true,
      crashMessage: crashEffects.message.en,
    };
  }

  /**
   * Apply endorphin effects to simulation state
   */
  private applyEndorphinEffects(
    state: SimulationState,
    effects: EndorphinEffects,
  ): SimulationState {
    const updatedState = { ...state };

    // Apply energy boost
    if (effects.energyBoost > 0) {
      updatedState.energy = Math.min(100, state.energy + effects.energyBoost);
    }

    // Apply confidence boost
    if (effects.confidenceBoost > 0) {
      updatedState.confidence = Math.min(
        100,
        state.confidence + effects.confidenceBoost,
      );
    }

    // Apply momentum boost
    if (effects.momentumBoost && effects.momentumBoost > 0) {
      updatedState.momentum = Math.min(
        100,
        state.momentum + effects.momentumBoost,
      );
    }

    // Pain suppression reduces perceived fatigue impact
    if (effects.painSuppression > 0) {
      const fatigueReduction = effects.painSuppression * 0.3;
      updatedState.muscleFatigue = Math.max(
        0,
        state.muscleFatigue - fatigueReduction,
      );
      updatedState.mentalFatigue = Math.max(
        0,
        state.mentalFatigue - fatigueReduction * 0.5,
      );
    }

    // Store endorphin state in simulation state
    updatedState.endorphinState = { ...this.endorphinState };

    return updatedState;
  }

  /**
   * Apply withdrawal effects at race start
   */
  public applyWithdrawalEffects(
    state: SimulationState,
    addictionLevel: number,
    daysSinceUse: number,
  ): SimulationState {
    const withdrawalEffects = calculateWithdrawalEffects(
      addictionLevel,
      daysSinceUse,
    );

    if (
      withdrawalEffects.energyPenalty === 0 &&
      withdrawalEffects.focusPenalty === 0
    ) {
      return state;
    }

    const updatedState = {
      ...state,
      energy: Math.max(0, state.energy - withdrawalEffects.energyPenalty),
      focus: Math.max(0, state.focus - withdrawalEffects.focusPenalty),
      confidence: Math.max(
        0,
        state.confidence - withdrawalEffects.confidencePenalty,
      ),
      mentalFatigue: Math.min(
        100,
        state.mentalFatigue + withdrawalEffects.mentalFatiguePenalty,
      ),
    };

    // Add withdrawal event
    if (withdrawalEffects.cravingMessage) {
      updatedState.eventsResolved.push({
        km: 0,
        title: { en: "Withdrawal Effects", id: "Efek Penarikan" },
        description: withdrawalEffects.cravingMessage,
        effect: {
          stamina: -withdrawalEffects.energyPenalty,
          hydration: 0,
          morale: -withdrawalEffects.confidencePenalty,
          pace: 0,
        },
      });
    }

    return updatedState;
  }

  /**
   * Check if player should see craving prompt
   */
  public shouldShowCravingPrompt(state: SimulationState): boolean {
    const craving = calculateCravingIntensity(
      this.endorphinState.addictionLevel,
      state.energy,
      state.muscleFatigue,
      state.mentalFatigue,
    );

    this.endorphinState.cravingIntensity = craving;

    // Show craving prompt if intensity is high and in a tough situation
    return (
      craving >= 6 &&
      (state.energy < 40 || state.muscleFatigue > 60) &&
      !this.endorphinState.isActive
    );
  }

  /**
   * Get final addiction level after race
   */
  public getFinalAddictionLevel(): number {
    return this.endorphinState.addictionLevel;
  }

  /**
   * Check if endorphins were used this race
   */
  public wasEndorphinUsed(): boolean {
    return this.endorphinState.totalEndorphinUses > 0;
  }
}
