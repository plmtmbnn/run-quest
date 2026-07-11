import {
  EVENT_DATABASE,
  type EventDefinition,
} from "@/content/events/event-database";
import { calculateDynamicEnvironmentModifiers } from "@/engine/environment/environment-modifier";
import type { PrepScoreModifiers } from "@/engine/scoring/preparation-score";
import type { RunnerProfile } from "@/runner/runner-types";
import type {
  Checkpoint,
  DailyChallenge,
  Effect,
  EnvironmentModifiers,
  Preparation,
  RaceEvent,
  RaceSegment,
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
  _envMods: EnvironmentModifiers,
  checkpoint: Checkpoint | undefined,
  random: SeededRandom,
  challenge: DailyChallenge,
  runnerProfile?: RunnerProfile,
): void {
  // Load default/fallback values for the runner profile if missing
  const profile = runnerProfile || {
    currentFitness: 50,
    currentFatigue: 0,
    currentReadiness: 100,
    speedAttr: 10,
    staminaAttr: 10,
    hydrationAttr: 10,
    willpowerAttr: 10,
  };

  // Initialize new state variables safely (Sprint 13.1)
  state.muscleFatigue = state.muscleFatigue ?? 0;
  state.mentalFatigue = state.mentalFatigue ?? 0;
  state.momentum = state.momentum ?? 50;
  state.paceStability = state.paceStability ?? 80;
  state.riskLevel = state.riskLevel ?? 20;
  state.delayedEffects = state.delayedEffects ?? [];

  // Determine dynamic weather and active segment at this kilometer
  let activeWeather = challenge.environment.weather;
  let activeTemp = challenge.environment.temperature;
  let activeHumidity = challenge.environment.humidity;
  let activeWind = challenge.environment.wind;
  let activeElevation = challenge.race.elevation;

  const analysis = challenge.analysis;
  let activeSegment: RaceSegment | null = null;

  if (analysis) {
    // 1. Resolve active segment at this kilometer
    if (analysis.segments && analysis.segments.length > 0) {
      let accumulatedDistance = 0;
      for (const seg of analysis.segments) {
        accumulatedDistance += seg.distance;
        if (km <= accumulatedDistance + 0.001) {
          activeSegment = seg;
          break;
        }
      }
      if (!activeSegment) {
        activeSegment = analysis.segments[analysis.segments.length - 1];
      }
    }

    // 2. Resolve active weather at this kilometer from weather timeline
    if (analysis.weather) {
      const timeline = analysis.weather;
      let activeIdx = 0;
      for (let i = 0; i < timeline.checkpoints.length; i++) {
        if (timeline.checkpoints[i] <= km) {
          activeIdx = i;
        }
      }
      activeWeather = timeline.rain[activeIdx]
        ? "rain"
        : challenge.environment.weather;
      activeTemp = timeline.temperature[activeIdx];
      activeHumidity = timeline.humidity[activeIdx];
      activeWind = timeline.wind[activeIdx];
    }
  }

  if (activeSegment) {
    activeElevation = activeSegment.elevation;
  }

  // Calculate dynamic environmental modifiers for this kilometer step
  const currentEnvMods = calculateDynamicEnvironmentModifiers(
    activeWeather,
    activeTemp,
    activeHumidity,
    activeWind,
    challenge.race.surface,
    activeElevation,
  );

  // Apply segment-specific modifiers
  let segmentPaceModifier = 0;
  let segmentFatigueModifier = 0;
  if (activeSegment) {
    if (activeSegment.type === "climb") {
      segmentPaceModifier += 20; // +20 seconds/km climbing penalty
      segmentFatigueModifier += 1.5;
    } else if (activeSegment.type === "descent") {
      segmentPaceModifier -= 15; // -15 seconds/km descending boost
      segmentFatigueModifier -= 0.5;
    } else if (activeSegment.type === "sprint") {
      segmentPaceModifier -= 25; // -25 seconds/km sprint kick
      segmentFatigueModifier += 2.0;
    }
  }

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

  // Determine active pacing strategy (supporting mid-race adjustments)
  const activePacing = state.currentPacing || prep.pacing;
  
  let dynamicFatigueModifier = 0;
  
  if (activePacing === "jog" || activePacing === "conservative") {
    dynamicFatigueModifier = -2.5;
  } else if (activePacing === "push" || activePacing === "aggressive") {
    dynamicFatigueModifier = 3.5;
  } else if (activePacing === "sprint") {
    dynamicFatigueModifier = 8.5;
  } else if (activePacing === "negative_split") {
    const isSecondHalf = km > Math.ceil(challenge.race.distance / 2);
    if (isSecondHalf) {
      dynamicFatigueModifier = 2.0;
    } else {
      dynamicFatigueModifier = -1.5;
    }
  }

  let initialFatigueOffset = 0;
  switch (prep.pacing) {
    case "negative_split":
      initialFatigueOffset = -1.0;
      break;
    case "steady":
      initialFatigueOffset = 0;
      break;
    case "aggressive":
      initialFatigueOffset = 3.5;
      break;
    case "conservative":
      initialFatigueOffset = -2.5;
      break;
  }

  const netFatigueModifier = prepMods.fatigueModifier - initialFatigueOffset;

  // Apply Stamina and Hydration attributes to reduce consumption rates
  const staminaReductionFactor = (100 - (profile.staminaAttr || 10) * 0.4) / 100;
  const hydrationReductionFactor = (100 - (profile.hydrationAttr || 10) * 0.4) / 100;

  const calculatedFatigue = Math.max(
    0.5,
    (baseFatigueKm +
      netFatigueModifier +
      dynamicFatigueModifier +
      currentEnvMods.fatigueModifier +
      segmentFatigueModifier) *
      staminaReductionFactor,
  );
  let calculatedHydration = Math.max(
    0.5,
    (baseHydrationKm +
      prepMods.hydrationModifier +
      currentEnvMods.hydrationModifier) *
      hydrationReductionFactor,
  );

  // Water provides hydration stability
  if (prep.nutrition.includes("water")) {
    calculatedHydration *= 0.75;
  }

  // Momentum improves energy efficiency (better momentum reduces fatigue rate)
  const momentumEfficiency = 1.0 - ((state.momentum ?? 50) - 50) * 0.003;
  state.fatigue = Math.min(
    100,
    state.fatigue + calculatedFatigue * momentumEfficiency,
  );
  state.energy = Math.max(0, 100 - state.fatigue);
  state.hydration = Math.max(0, state.hydration - calculatedHydration);

  // Focus and Confidence decay over distance (caffeine boosts or crashes focus)
  // Confidence influences focus recovery/decay
  const confidenceFocusBoost = ((state.confidence ?? 50) - 50) * 0.02;
  if (hasCaffeine) {
    if (isCaffeineCrash) {
      state.focus = Math.max(0, state.focus - 4.0 + confidenceFocusBoost);
      state.confidence = Math.max(0, state.confidence - 1.5);
    } else {
      state.focus = Math.min(100, state.focus + 2.0 + confidenceFocusBoost);
      state.confidence = Math.min(100, state.confidence + 1.0);
    }
  } else {
    state.focus = Math.max(
      0,
      state.focus - (1.0 - prepMods.focusModifier) + confidenceFocusBoost,
    );
    state.confidence = Math.max(0, state.confidence - 0.5);
  }

  // Runner attribute evolution (Sprint 13.1)
  let muscleFatigueDelta = calculatedFatigue * 0.7;
  if (prep.shoes === "carbon_racer") muscleFatigueDelta += 0.8;
  if (currentEnvMods.fatigueModifier > 0) muscleFatigueDelta += 0.4;
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

  // Segment influences on momentum and confidence
  if (activeSegment) {
    if (activeSegment.type === "climb") {
      momentumDelta -= 1.0;
      state.confidence = Math.max(0, state.confidence - 0.4);
    } else if (activeSegment.type === "descent") {
      momentumDelta += 0.8;
      state.confidence = Math.min(100, state.confidence + 0.6);
    } else if (activeSegment.type === "sprint") {
      momentumDelta += 2.0;
      state.confidence = Math.min(100, state.confidence + 1.2);
    }
  }

  // Momentum affects confidence recovery
  const momentumConfidenceBoost = ((state.momentum ?? 50) - 50) * 0.05;
  state.momentum = Math.max(0, Math.min(100, state.momentum + momentumDelta));

  state.confidence = Math.max(
    0,
    Math.min(100, state.confidence + momentumConfidenceBoost),
  );

  state.paceStability = Math.max(
    10,
    Math.min(100, 90 - (state.muscleFatigue * 0.5 + state.mentalFatigue * 0.4)),
  );

  const riskDelta = (state.confidence - 50) * 0.05;
  state.riskLevel = Math.max(5, Math.min(100, state.riskLevel + riskDelta));

  // 2. Pace determination for this kilometer (in seconds/km)
  let paceSeconds = 310;

  // Apply runner profile speed and fitness modifiers
  paceSeconds += (50 - profile.currentFitness) * 0.4;
  paceSeconds -= (profile.speedAttr || 10) * 0.3;

  // Calculate dynamic pacing speed adjustments
  let dynamicPaceModifier = 0;
  if (activePacing === "jog" || activePacing === "conservative") {
    dynamicPaceModifier = 15;
  } else if (activePacing === "push" || activePacing === "aggressive") {
    dynamicPaceModifier = -12;
  } else if (activePacing === "sprint") {
    dynamicPaceModifier = -35;
  } else if (activePacing === "negative_split") {
    const isSecondHalf = km > Math.ceil(challenge.race.distance / 2);
    if (isSecondHalf) {
      dynamicPaceModifier = -15;
    } else {
      dynamicPaceModifier = 5;
    }
  }

  let initialPaceOffset = 0;
  switch (prep.pacing) {
    case "negative_split":
      initialPaceOffset = -2;
      break;
    case "steady":
      initialPaceOffset = 0;
      break;
    case "aggressive":
      initialPaceOffset = -12;
      break;
    case "conservative":
      initialPaceOffset = 15;
      break;
  }

  const netBasePaceModifier = prepMods.basePaceModifier - initialPaceOffset;

  // Apply preparation, dynamic pacing strategy, and environmental modifiers
  paceSeconds += netBasePaceModifier + dynamicPaceModifier;
  paceSeconds += currentEnvMods.paceModifier + segmentPaceModifier;

  // Willpower (Grit) reduces penalties by up to 50% at 100 willpower
  const gritMitigation = (100 - (profile.willpowerAttr || 10) * 0.5) / 100;

  // Muscle & Mental fatigue penalties
  if (state.muscleFatigue > 50) {
    paceSeconds += (state.muscleFatigue - 50) * 1.0 * gritMitigation;
  }
  if (state.mentalFatigue > 50) {
    paceSeconds += (state.mentalFatigue - 50) * 0.4 * gritMitigation;
  }
  // Momentum speed adjustment
  paceSeconds -= (state.momentum - 50) * 0.3;

  // Fatigue penalties
  if (state.energy < 40) {
    const exhaustionPenalty = (40 - state.energy) * 1.8 * gritMitigation;
    paceSeconds += exhaustionPenalty;
  }

  // Dehydration penalties
  if (state.hydration < 30) {
    const dehydrationPenalty = (30 - state.hydration) * 2.2 * gritMitigation;
    paceSeconds += dehydrationPenalty;
  }

  // Focus penalties
  if (state.focus < 40) {
    const focusPenalty = (40 - state.focus) * 0.4 * gritMitigation;
    paceSeconds += focusPenalty;
  }

  // Seeded random variation based on pace stability
  const stabilityFactor = (100 - state.paceStability) / 100;
  const maxVariation = 0.03 + 0.05 * stabilityFactor;
  const variationPercent = random.nextRange(-maxVariation, maxVariation);
  paceSeconds += paceSeconds * variationPercent;

  // Sprint 14.5: Risk checks (Cramp risk)
  const segmentDifficulty = activeSegment ? activeSegment.difficulty : 3;
  const crampProbability =
    0.01 + state.riskLevel * 0.001 + segmentDifficulty * 0.01;
  const isCrampTriggered =
    !prep.nutrition.includes("electrolyte") && random.next() < crampProbability;

  if (isCrampTriggered) {
    const staminaLoss = Math.floor(random.nextRange(10, 25));
    const paceLoss = Math.floor(random.nextRange(15, 30) * gritMitigation);

    state.energy = Math.max(0, state.energy - staminaLoss);
    state.muscleFatigue = Math.min(100, state.muscleFatigue + 15);
    state.confidence = Math.max(0, state.confidence - 10);
    state.momentum = Math.max(0, state.momentum - 20);

    state.eventsResolved.push({
      km,
      title: { en: "Muscle Cramping", id: "Kram Otot" },
      description: {
        en: "You feel a sharp muscle contraction. You are forced to reduce your speed.",
        id: "Anda merasakan kontraksi otot yang tajam. Anda terpaksa mengurangi kecepatan.",
      },
      effect: {
        stamina: -staminaLoss,
        hydration: 0,
        morale: -10,
        pace: paceLoss,
      },
    });
    paceSeconds += paceLoss;
  }

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
