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

  // Electrolyte reduces cramp/stitch severity (Sprint 13.1)
  if (
    event.id.includes("cramp") ||
    event.id.includes("muscle_tightness") ||
    event.id.includes("stitch")
  ) {
    if (prep.nutrition.includes("electrolyte")) {
      adjusted.stamina = Math.floor(adjusted.stamina * 0.4);
      adjusted.pace = Math.floor(adjusted.pace * 0.4);
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
  // Initialize new state variables safely (Sprint 13.1)
  state.muscleFatigue = state.muscleFatigue ?? 0;
  state.mentalFatigue = state.mentalFatigue ?? 0;
  state.momentum = state.momentum ?? 50;
  state.paceStability = state.paceStability ?? 80;
  state.riskLevel = state.riskLevel ?? 20;
  state.delayedEffects = state.delayedEffects ?? [];

  // Apply delayed effects scheduled for this kilometer (Sprint 13.1)
  let delayedPaceAdjustment = 0;
  const activeDelayed = state.delayedEffects.filter(
    (e) => Math.floor(e.km) === km,
  );
  for (const effect of activeDelayed) {
    state.energy = Math.max(0, Math.min(100, state.energy + effect.stamina));
    state.hydration = Math.max(
      0,
      Math.min(100, state.hydration + effect.hydration),
    );
    state.focus = Math.max(0, Math.min(100, state.focus + effect.morale));
    state.confidence = Math.max(
      0,
      Math.min(100, state.confidence + effect.morale * 0.5),
    );
    delayedPaceAdjustment += effect.pace;

    state.eventsResolved.push({
      km,
      title: { en: "Delayed Consequence", id: "Konsekuensi Tertunda" },
      description: {
        en: "A delayed consequence from a previous decision affects your stats.",
        id: "Konsekuensi tertunda dari keputusan sebelumnya memengaruhi statistik Anda.",
      },
      effect: {
        stamina: effect.stamina,
        hydration: effect.hydration,
        morale: effect.morale,
        pace: effect.pace,
      },
    });
  }
  state.delayedEffects = state.delayedEffects.filter(
    (e) => Math.floor(e.km) !== km,
  );

  // Caffeine crash calculation (Sprint 13.1)
  const hasCaffeine = prep.nutrition.includes("caffeine");
  const isCaffeineCrash = hasCaffeine && km >= 6;

  // 1. Fatigue & Hydration consumption calculation
  const baseFatigueKm = 2.0;
  const baseHydrationKm = 2.2;

  const calculatedFatigue = Math.max(
    0.5,
    baseFatigueKm + prepMods.fatigueModifier + envMods.fatigueModifier,
  );
  let calculatedHydration = Math.max(
    0.5,
    baseHydrationKm + prepMods.hydrationModifier + envMods.hydrationModifier,
  );

  // Water provides hydration stability
  if (prep.nutrition.includes("water")) {
    calculatedHydration *= 0.75;
  }

  state.fatigue = Math.min(100, state.fatigue + calculatedFatigue);
  state.energy = Math.max(0, 100 - state.fatigue);
  state.hydration = Math.max(0, state.hydration - calculatedHydration);

  // Focus and Confidence decay over distance (caffeine boosts or crashes focus)
  if (hasCaffeine) {
    if (isCaffeineCrash) {
      state.focus = Math.max(0, state.focus - 4.0); // crash drops focus fast
      state.confidence = Math.max(0, state.confidence - 1.5);
    } else {
      state.focus = Math.min(100, state.focus + 2.0); // caffeine boosts focus early
      state.confidence = Math.min(100, state.confidence + 1.0);
    }
  } else {
    state.focus = Math.max(0, state.focus - (1.0 - prepMods.focusModifier));
    state.confidence = Math.max(0, state.confidence - 0.5);
  }

  // Runner attribute evolution (Sprint 13.1)
  let muscleFatigueDelta = calculatedFatigue * 0.7;
  if (prep.shoes === "carbon_racer") muscleFatigueDelta += 0.8;
  if (envMods.fatigueModifier > 0) muscleFatigueDelta += 0.4;
  state.muscleFatigue = Math.max(
    0,
    Math.min(100, state.muscleFatigue + muscleFatigueDelta),
  );

  let mentalFatigueDelta = (100 - state.focus) * 0.1 + 0.6;
  if (isCaffeineCrash) mentalFatigueDelta += 1.8;
  state.mentalFatigue = Math.max(
    0,
    Math.min(100, state.mentalFatigue + mentalFatigueDelta),
  );

  let momentumDelta = (state.energy - 50) * 0.08;
  if (prep.nutrition.includes("energy_gel")) momentumDelta += 0.8;
  if (hasCaffeine && !isCaffeineCrash) momentumDelta += 1.5;
  if (isCaffeineCrash) momentumDelta -= 2.0;
  state.momentum = Math.max(
    0,
    Math.min(100, state.momentum + momentumDelta),
  );

  state.paceStability = Math.max(
    10,
    Math.min(
      100,
      90 - (state.muscleFatigue * 0.5 + state.mentalFatigue * 0.4),
    ),
  );

  let riskDelta = (state.confidence - 50) * 0.05;
  state.riskLevel = Math.max(5, Math.min(100, state.riskLevel + riskDelta));

  // 2. Pace determination for this kilometer (in seconds/km)
  let paceSeconds = 310;

  // Apply preparation and environmental modifiers
  paceSeconds += prepMods.basePaceModifier;
  paceSeconds += envMods.paceModifier;

  // Muscle & Mental fatigue penalties
  if (state.muscleFatigue > 50) {
    paceSeconds += (state.muscleFatigue - 50) * 1.0;
  }
  if (state.mentalFatigue > 50) {
    paceSeconds += (state.mentalFatigue - 50) * 0.4;
  }
  // Momentum speed adjustment
  paceSeconds -= (state.momentum - 50) * 0.3;

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

  // Seeded random variation based on pace stability
  const stabilityFactor = (100 - state.paceStability) / 100;
  const maxVariation = 0.03 + 0.05 * stabilityFactor;
  const variationPercent = random.nextRange(-maxVariation, maxVariation);
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
  const kmDuration = Math.max(
    180,
    paceSeconds + eventPaceAdjustment + delayedPaceAdjustment,
  );
  state.accumulatedTime += kmDuration;
  state.distanceCovered = km;
}
