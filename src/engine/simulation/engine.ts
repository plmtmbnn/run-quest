import { EVENT_DATABASE } from "@/content/events/event-database";
import { calculateEnvironmentModifiers } from "@/engine/environment/environment-modifier";
import { calculatePerformance } from "@/engine/performance/calculator";
import { calculatePreparationScore } from "@/engine/scoring/preparation-score";
import { simulateKmStep } from "@/engine/simulation/checkpoint-loop";
import { generateStory } from "@/engine/story/story-builder";
import type {
  SimulationInput,
  SimulationResult,
  SimulationState,
} from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Validates the core simulation inputs to avoid garbage data.
 */
function validateInput(input: SimulationInput): void {
  if (!input.player || !input.player.id) {
    throw new Error("Invalid simulation input: Player ID is missing.");
  }
  if (
    !input.challenge ||
    !input.challenge.id ||
    input.challenge.race.distance <= 0
  ) {
    throw new Error(
      "Invalid simulation input: Daily challenge is invalid or empty.",
    );
  }
  if (!input.preparation) {
    throw new Error(
      "Invalid simulation input: Preparation settings are missing.",
    );
  }
  if (typeof input.seed !== "number" || Number.isNaN(input.seed)) {
    throw new Error("Invalid simulation input: Seed must be a valid number.");
  }
}

/**
 * Headless deterministic Simulation Engine.
 * Runs a daily running simulation based on player choices and challenge criteria.
 */
export function simulateRace(input: SimulationInput): SimulationResult {
  // 1. Input Validation
  validateInput(input);

  const { challenge, preparation, seed } = input;
  const random = new SeededRandom(seed);

  // 2. Modifier calculations
  const prepMods = calculatePreparationScore(
    preparation,
    challenge.race.surface,
    challenge.environment.weather,
  );
  const envMods = calculateEnvironmentModifiers(challenge);

  // 3. Initialize state
  const initialEnergy = Math.max(
    0,
    Math.min(100, 100 + prepMods.initialEnergyOffset),
  );
  const initialConfidence = Math.max(
    0,
    Math.min(
      100,
      100 + prepMods.confidenceModifier + envMods.confidenceModifier,
    ),
  );

  const state: SimulationState = {
    distanceCovered: 0,
    energy: initialEnergy,
    hydration: 100,
    focus: 100,
    fatigue: 100 - initialEnergy,
    confidence: initialConfidence,
    accumulatedTime: 0,
    eventsResolved: [],
  };

  const stateLog: SimulationState[] = [
    { ...state, eventsResolved: [...state.eventsResolved] }
  ];

  const totalDistance = challenge.race.distance;

  // 4. Roll for rare special event (1:500 chance)
  const roll = Math.floor(random.nextRange(0, 500));
  let specialEventKm = -1;
  let specialEventId = "";
  let isDNS = false;

  if (roll === 42) {
    const rareEventRoll = Math.floor(random.nextRange(0, 4));
    if (rareEventRoll === 0) {
      isDNS = true;
      specialEventId = "special_dns";
    } else {
      const maxKms = Math.ceil(totalDistance);
      specialEventKm = Math.floor(random.nextRange(1, maxKms + 1));
      if (rareEventRoll === 1) specialEventId = "special_booster";
      else if (rareEventRoll === 2) specialEventId = "special_accident";
      else if (rareEventRoll === 3) specialEventId = "special_dnf";
    }
  }

  if (isDNS) {
    const eventDef = EVENT_DATABASE[specialEventId];
    if (eventDef) {
      state.eventsResolved.push({
        km: 0,
        title: eventDef.title,
        description: eventDef.description,
        effect: eventDef.effect,
      });
    }
    stateLog.push({ ...state, eventsResolved: [...state.eventsResolved] });
  } else {
    // 5. Run the checkpoint kilometer loop
    for (let km = 1; km <= Math.ceil(totalDistance); km++) {
      // Check if there is a specific checkpoint registered at this km
      const checkpoint = challenge.race.checkpoints.find((cp) => cp.km === km);

      // Run the step
      simulateKmStep(
        km,
        state,
        preparation,
        prepMods,
        envMods,
        checkpoint,
        random,
      );

      // Apply special rare event if scheduled for this kilometer
      if (km === specialEventKm && specialEventId) {
        const eventDef = EVENT_DATABASE[specialEventId];
        if (eventDef) {
          state.energy = Math.max(
            0,
            Math.min(100, state.energy + eventDef.effect.stamina),
          );
          state.hydration = Math.max(
            0,
            Math.min(100, state.hydration + eventDef.effect.hydration),
          );
          state.focus = Math.max(
            0,
            Math.min(100, state.focus + eventDef.effect.morale),
          );
          state.confidence = Math.max(
            0,
            Math.min(100, state.confidence + eventDef.effect.morale * 0.5),
          );
          state.accumulatedTime = Math.max(
            0,
            state.accumulatedTime + eventDef.effect.pace,
          );

          if (specialEventId === "special_dnf") {
            state.energy = 0;
          }

          state.eventsResolved.push({
            km,
            title: eventDef.title,
            description: eventDef.description,
            effect: eventDef.effect,
          });
        }
      }

      // Push copy of simulation state
      stateLog.push({ ...state, eventsResolved: [...state.eventsResolved] });

      // If runner is depleted, they DNF immediately
      if (state.energy <= 0 || state.hydration <= 0) {
        break;
      }
    }
  }

  // 5. Final performance scoring & mapping
  const performance = calculatePerformance(
    state.accumulatedTime,
    challenge.objective,
    state,
  );

  // 6. Build the story logs
  const story = generateStory(
    state,
    challenge,
    preparation,
    performance.grade,
    performance.outcome,
  );

  return {
    finishTime: state.accumulatedTime,
    score: performance.score,
    grade: performance.grade,
    events: state.eventsResolved,
    outcome: performance.outcome,
    story,
    stateLog,
  };
}
