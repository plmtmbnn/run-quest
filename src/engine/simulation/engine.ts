import { DECISION_DATABASE } from "@/content/events/decision-database";
import { EVENT_DATABASE } from "@/content/events/event-database";
import { calculateEnvironmentModifiers } from "@/engine/environment/environment-modifier";
import { calculatePerformance } from "@/engine/performance/calculator";
import { calculatePreparationScore } from "@/engine/scoring/preparation-score";
import { simulateKmStep } from "@/engine/simulation/checkpoint-loop";
import { generateDecisionTimeline } from "@/engine/simulation/decision-generator";
import { generateStory } from "@/engine/story/story-builder";
import type {
  ChoiceBehavior,
  DecisionCard,
  SimulationInput,
  SimulationResult,
  SimulationState,
  SimulationStepResult,
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
 * AI Decision fallback selection helper.
 * Calculates behavior weights based on past decision patterns.
 */
export function getFallbackChoice(
  card: DecisionCard,
  history: ChoiceBehavior[],
  seed: number,
): string {
  if (card.choices.length === 0) {
    throw new Error("Decision card has no choices");
  }

  const random = new SeededRandom(seed);

  // Count frequencies in history
  const counts: Record<ChoiceBehavior, number> = {
    aggressive: 0,
    balanced: 0,
    conservative: 0,
  };

  for (const b of history) {
    counts[b] = (counts[b] || 0) + 1;
  }

  const choicesWithWeights = card.choices.map((choice) => {
    const freq = counts[choice.behavior] || 0;
    const weight = 1 + freq;
    return { choice, weight };
  });

  const totalWeight = choicesWithWeights.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  let roll = random.nextRange(0, totalWeight);

  for (const item of choicesWithWeights) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.choice.id;
    }
  }

  return card.choices[0].id;
}

/**
 * Incremental, step-by-step runner for simulation.
 * Simulates up to the next decision or finish.
 */
export function advanceSimulation(
  input: SimulationInput,
  currentState?: SimulationState,
  lastChoiceId?: string,
): SimulationStepResult {
  const { challenge, preparation, seed } = input;
  const totalDistance = challenge.race.distance;

  let state: SimulationState;

  if (!currentState) {
    validateInput(input);

    const prepMods = calculatePreparationScore(
      preparation,
      challenge.race.surface,
      challenge.environment.weather,
    );
    const envMods = calculateEnvironmentModifiers(challenge);

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

    state = {
      distanceCovered: 0,
      energy: initialEnergy,
      hydration: 100,
      focus: 100,
      fatigue: 100 - initialEnergy,
      confidence: initialConfidence,
      accumulatedTime: 0,
      eventsResolved: [],
      muscleFatigue: 0,
      mentalFatigue: 0,
      momentum: 50,
      paceStability: preparation.mindset === "calm" ? 90 : preparation.mindset === "fearless" ? 60 : 80,
      riskLevel: preparation.pacing === "aggressive" ? 60 : preparation.pacing === "conservative" ? 10 : 30,
      decisionTimeline: generateDecisionTimeline(
        totalDistance,
        challenge,
        seed,
      ),
      decisionHistory: [],
      delayedEffects: [],
      randomSeedState: seed,
      accumulatedStateLog: [],
    };

    // DNS check (rare event roll on first step)
    const random = new SeededRandom(seed);
    const roll = Math.floor(random.nextRange(0, 500));
    state.randomSeedState = random.seed;

    if (roll === 42) {
      const rareEventRoll = Math.floor(random.nextRange(0, 4));
      state.randomSeedState = random.seed;

      if (rareEventRoll === 0) {
        // DNS
        const eventDef = EVENT_DATABASE.special_dns;
        if (eventDef) {
          state.eventsResolved.push({
            km: 0,
            title: eventDef.title,
            description: eventDef.description,
            effect: eventDef.effect,
          });
        }

        const { accumulatedStateLog: _, ...logState } = state;
        state.accumulatedStateLog = [logState];

        const performance = calculatePerformance(
          state.accumulatedTime,
          challenge.objective,
          state,
        );

        const story = generateStory(
          state,
          challenge,
          preparation,
          performance.grade,
          performance.outcome,
        );

        return {
          type: "finished",
          result: {
            finishTime: state.accumulatedTime,
            score: performance.score,
            grade: performance.grade,
            events: state.eventsResolved,
            outcome: performance.outcome,
            story,
            stateLog: state.accumulatedStateLog as SimulationState[],
          },
        };
      } else {
        const maxKms = Math.ceil(totalDistance);
        state.specialEventKm = Math.floor(random.nextRange(1, maxKms + 1));
        if (rareEventRoll === 1) state.specialEventId = "special_booster";
        else if (rareEventRoll === 2) state.specialEventId = "special_accident";
        else if (rareEventRoll === 3) state.specialEventId = "special_dnf";
        state.randomSeedState = random.seed;
      }
    }

    // Add initial km 0 snapshot to accumulated log
    const { accumulatedStateLog: _, ...initialLogState } = state;
    state.accumulatedStateLog?.push(initialLogState);
  } else {
    // Resume simulation from current state
    state = {
      ...currentState,
      eventsResolved: [...currentState.eventsResolved],
      decisionTimeline: { ...currentState.decisionTimeline },
      decisionHistory: currentState.decisionHistory
        ? [...currentState.decisionHistory]
        : [],
      delayedEffects: currentState.delayedEffects
        ? [...currentState.delayedEffects]
        : [],
      accumulatedStateLog: currentState.accumulatedStateLog
        ? [...currentState.accumulatedStateLog]
        : [],
    };

    if (state.pendingDecision) {
      // Resolve the decision using chosen or timeout behavior
      const choiceId =
        lastChoiceId ??
        getFallbackChoice(
          state.pendingDecision,
          state.decisionHistory || [],
          state.randomSeedState ?? seed,
        );

      const choice = state.pendingDecision.choices.find(
        (c) => c.id === choiceId,
      );
      if (choice) {
        state.energy = Math.max(
          0,
          Math.min(100, state.energy + choice.effects.stamina),
        );
        state.hydration = Math.max(
          0,
          Math.min(100, state.hydration + choice.effects.hydration),
        );
        state.focus = Math.max(
          0,
          Math.min(100, state.focus + choice.effects.morale),
        );
        state.confidence = Math.max(
          0,
          Math.min(100, state.confidence + choice.effects.morale * 0.5),
        );
        state.accumulatedTime = Math.max(
          0,
          state.accumulatedTime + choice.effects.pace,
        );

        state.decisionHistory?.push(choice.behavior);

        // Dynamic runner attribute updates based on choice behavior (Sprint 13.1)
        if (choice.behavior === "aggressive") {
          state.riskLevel = Math.min(100, (state.riskLevel ?? 20) + 15);
          state.muscleFatigue = Math.min(100, (state.muscleFatigue ?? 0) + 10);
          state.momentum = Math.min(100, (state.momentum ?? 50) + 15);
        } else if (choice.behavior === "conservative") {
          state.riskLevel = Math.max(5, (state.riskLevel ?? 20) - 10);
          state.muscleFatigue = Math.max(0, (state.muscleFatigue ?? 0) - 5);
          state.momentum = Math.max(0, (state.momentum ?? 50) - 10);
        } else {
          state.riskLevel = Math.max(5, (state.riskLevel ?? 20) - 2);
        }

        // Schedule delayed effects based on choices (Sprint 13.1)
        state.delayedEffects = state.delayedEffects ?? [];
        const currentKm = state.distanceCovered;
        if (choice.id === "aid_skip") {
          state.delayedEffects.push({
            km: currentKm + 3,
            stamina: 0,
            hydration: -20,
            morale: -5,
            pace: 0,
          });
        } else if (choice.behavior === "aggressive") {
          state.delayedEffects.push({
            km: currentKm + 2,
            stamina: -15,
            hydration: 0,
            morale: 0,
            pace: 5,
          });
        } else if (choice.id === "aid_water" || choice.id === "aid_electrolyte") {
          state.delayedEffects.push({
            km: currentKm + 2,
            stamina: 10,
            hydration: 5,
            morale: 5,
            pace: 0,
          });
        }

        // Record event
        state.eventsResolved.push({
          km: state.distanceCovered,
          title: state.pendingDecision.title,
          description: choice.description,
          effect: choice.effects,
        });

        // Update last log entry with outcome adjustments
        if (state.accumulatedStateLog && state.accumulatedStateLog.length > 0) {
          const lastIdx = state.accumulatedStateLog.length - 1;
          const { accumulatedStateLog: _, ...updatedState } = state;
          state.accumulatedStateLog[lastIdx] = updatedState;
        }
      }
      state.pendingDecision = undefined;
    }
  }

  const random = new SeededRandom(state.randomSeedState ?? seed);
  const prepMods = calculatePreparationScore(
    preparation,
    challenge.race.surface,
    challenge.environment.weather,
  );
  const envMods = calculateEnvironmentModifiers(challenge);

  const nextKm = state.distanceCovered + 1;
  const maxKms = Math.ceil(totalDistance);

  for (let km = nextKm; km <= maxKms; km++) {
    // Check if decision timeline triggers at this kilometer before simulating
    if (state.decisionTimeline?.[km]) {
      const cardId = state.decisionTimeline[km];
      const card = DECISION_DATABASE[cardId];
      if (card) {
        state.pendingDecision = card;
        state.randomSeedState = random.seed;
        delete state.decisionTimeline[km];
        return {
          type: "decision",
          state,
          prompt: {
            km,
            decisionCard: card,
            timeoutSeconds: 10,
          },
        };
      }
    }

    const checkpoint = challenge.race.checkpoints.find((cp) => cp.km === km);

    // Simulate km step
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
    if (km === state.specialEventKm && state.specialEventId) {
      const eventDef = EVENT_DATABASE[state.specialEventId];
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

        if (state.specialEventId === "special_dnf") {
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

    state.distanceCovered = km;
    state.randomSeedState = random.seed;

    const { accumulatedStateLog: _, ...logState } = state;
    state.accumulatedStateLog?.push(logState);

    // DNF check
    if (state.energy <= 0 || state.hydration <= 0) {
      break;
    }
  }

  // Final performance & story build
  const performance = calculatePerformance(
    state.accumulatedTime,
    challenge.objective,
    state,
  );

  const story = generateStory(
    state,
    challenge,
    preparation,
    performance.grade,
    performance.outcome,
  );

  return {
    type: "finished",
    result: {
      finishTime: state.accumulatedTime,
      score: performance.score,
      grade: performance.grade,
      events: state.eventsResolved,
      outcome: performance.outcome,
      story,
      stateLog: state.accumulatedStateLog as SimulationState[],
    },
  };
}

/**
 * Headless deterministic Simulation Engine.
 * Wrapper around advanceSimulation for compatibility with old interface.
 */
export function simulateRace(input: SimulationInput): SimulationResult {
  let stepRes = advanceSimulation(input);
  while (stepRes.type === "decision") {
    // Timeout fallback resolution loop
    const choiceId = getFallbackChoice(
      stepRes.prompt.decisionCard,
      stepRes.state.decisionHistory || [],
      stepRes.state.randomSeedState ?? input.seed,
    );
    stepRes = advanceSimulation(input, stepRes.state, choiceId);
  }
  return stepRes.result;
}
