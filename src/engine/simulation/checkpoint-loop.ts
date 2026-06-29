import {
  EVENT_DATABASE,
  type EventDefinition,
} from "@/content/events/event-database";
import type { PrepScoreModifiers } from "@/engine/scoring/preparation-score";
import type {
  Checkpoint,
  Effect,
  EnvironmentModifiers,
  Preparation,
  RaceEvent,
  SimulationState,
} from "@/types/engine";
import type { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Adjusts event effects dynamically based on player equipment and strategy.
 */
export function adjustEventEffect(
  event: EventDefinition,
  prep: Preparation,
): Effect {
  const adjusted: Effect = { ...event.effect };

  if (event.id === "sun_glare") {
    if (prep.gear.includes("sunglasses")) {
      adjusted.morale = 0; // Glare blocked
      adjusted.hydration = Math.floor(adjusted.hydration / 2);
    } else if (prep.gear.includes("cap")) {
      adjusted.morale = Math.floor(adjusted.morale / 2);
    }
  }

  if (event.id === "loose_gravel") {
    if (prep.shoes === "trail") {
      adjusted.pace = 0; // Perfect traction
      adjusted.stamina = 0;
    }
  }

  if (event.id === "hydration_station") {
    if (prep.gear.includes("hydration_vest")) {
      adjusted.hydration = Math.floor(adjusted.hydration * 1.5); // Extra storage
    }
  }

  if (event.id === "strong_wind") {
    if (prep.pacing === "aggressive") {
      adjusted.stamina *= 1.5; // Fighting headwind aggressively wastes energy
      adjusted.pace *= 1.2;
    } else if (prep.pacing === "conservative") {
      adjusted.stamina *= 0.6; // Slipping through
      adjusted.pace *= 0.9;
    }
  }

  return adjusted;
}

/**
 * Resolves a checkpoint event, selecting one from the event pool and applying it to the state.
 */
export function resolveCheckpointEvent(
  checkpoint: Checkpoint,
  state: SimulationState,
  prep: Preparation,
  random: SeededRandom,
): RaceEvent | null {
  if (!checkpoint.eventPool || checkpoint.eventPool.length === 0) {
    return null;
  }

  // Determine weights based on preparation quality
  // E.g. bad prep might weight negative events higher. For Phase 0, we can use simple uniform weights or basic logic.
  const selectedEventId = random.pick(checkpoint.eventPool);
  const eventDef = EVENT_DATABASE[selectedEventId];

  if (!eventDef) {
    return null;
  }

  const adjustedEffect = adjustEventEffect(eventDef, prep);

  // Apply to state
  state.energy = Math.max(
    0,
    Math.min(100, state.energy + adjustedEffect.stamina),
  );
  state.hydration = Math.max(
    0,
    Math.min(100, state.hydration + adjustedEffect.hydration),
  );
  state.focus = Math.max(0, Math.min(100, state.focus + adjustedEffect.morale));
  state.confidence = Math.max(
    0,
    Math.min(100, state.confidence + adjustedEffect.morale * 0.5),
  );

  const resolvedEvent: RaceEvent = {
    km: checkpoint.km,
    title: eventDef.title,
    description: eventDef.description,
    effect: adjustedEffect,
  };

  state.eventsResolved.push(resolvedEvent);

  return resolvedEvent;
}

/**
 * Simulates a single kilometer step of the race.
 */
export function simulateKmStep(
  km: number,
  state: SimulationState,
  prep: Preparation,
  prepMods: PrepScoreModifiers,
  envMods: EnvironmentModifiers,
  checkpoint: Checkpoint | undefined,
  random: SeededRandom,
): void {
  // 1. Fatigue & Hydration consumption calculation
  const baseFatigueKm = 2.0;
  const baseHydrationKm = 2.2;

  const calculatedFatigue = Math.max(
    0.5,
    baseFatigueKm + prepMods.fatigueModifier + envMods.fatigueModifier,
  );
  const calculatedHydration = Math.max(
    0.5,
    baseHydrationKm + prepMods.hydrationModifier + envMods.hydrationModifier,
  );

  state.fatigue = Math.min(100, state.fatigue + calculatedFatigue);
  state.energy = Math.max(0, 100 - state.fatigue);
  state.hydration = Math.max(0, state.hydration - calculatedHydration);

  // Focus and Confidence decay over distance
  state.focus = Math.max(0, state.focus - (1.0 - prepMods.focusModifier));
  state.confidence = Math.max(0, state.confidence - 0.5);

  // 2. Pace determination for this kilometer (in seconds/km)
  // Base pace: 310 seconds/km (roughly 5:10 min/km)
  let paceSeconds = 310;

  // Apply preparation and environmental modifiers
  paceSeconds += prepMods.basePaceModifier;
  paceSeconds += envMods.paceModifier;

  // Fatigue penalties
  if (state.energy < 40) {
    const exhaustionPenalty = (40 - state.energy) * 1.8;
    paceSeconds += exhaustionPenalty;
  }

  // Dehydration penalties
  if (state.hydration < 30) {
    const dehydrationPenalty = (30 - state.hydration) * 2.2;
    paceSeconds += dehydrationPenalty;
  }

  // Focus penalties
  if (state.focus < 40) {
    const focusPenalty = (40 - state.focus) * 0.4;
    paceSeconds += focusPenalty;
  }

  // Seeded random variation (+- 3%)
  const variationPercent = random.nextRange(-0.03, 0.03);
  paceSeconds += paceSeconds * variationPercent;

  // 3. Resolve Checkpoint Events if present
  let eventPaceAdjustment = 0;
  if (checkpoint) {
    const resolvedEvent = resolveCheckpointEvent(
      checkpoint,
      state,
      prep,
      random,
    );
    if (resolvedEvent) {
      eventPaceAdjustment = resolvedEvent.effect.pace;
    }
  }

  // Calculate final elapsed time for this kilometer step
  const kmDuration = Math.max(180, paceSeconds + eventPaceAdjustment); // cap speed at 3:00/km max
  state.accumulatedTime += kmDuration;
  state.distanceCovered = km;
}
