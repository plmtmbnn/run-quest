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
const FIRST_NAMES = ["Racer", "Runner", "Sprint", "Dash", "Pace", "Chaser", "Fast", "Swift", "Bolt", "Shadow"];
const LAST_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Omega", "One", "Two", "Three", "Pro", "Max"];

export function advanceSimulation(
  input: SimulationInput,
  currentState?: SimulationState,
  lastChoiceId?: string,
  nextPacing?: import("@/types/engine").PacingPlan,
  stepByStep: boolean = false,
): SimulationStepResult {
  const { challenge, preparation, seed, runnerProfile } = input;
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

    // Reduce starting energy based on any training fatigue carried over
    const fatigueOffset = runnerProfile ? -runnerProfile.currentFatigue : 0;

    let warmupBonusOffset = 0;
    if (preparation.warmupBonus === "perfect") warmupBonusOffset = 15;
    else if (preparation.warmupBonus === "good") warmupBonusOffset = 5;

    const initialEnergy = Math.max(
      0,
      Math.min(115, 100 + prepMods.initialEnergyOffset + fatigueOffset + warmupBonusOffset),
    );

    // Adjust starting confidence based on readiness
    const readinessConfidenceMod = runnerProfile ? (runnerProfile.currentReadiness - 100) * 0.2 : 0;
    const initialConfidence = Math.max(
      0,
      Math.min(
        105,
        100 + prepMods.confidenceModifier + envMods.confidenceModifier + readinessConfidenceMod,
      ),
    );

    // Adjust starting focus based on readiness
    const startingFocus = runnerProfile
      ? Math.max(20, Math.min(100, 100 + (runnerProfile.currentReadiness - 100) * 0.4))
      : 100;

    // Generate 3-5 AI Opponents deterministically from the seed
    const random = new SeededRandom(seed);
    const opponentsCount = Math.floor(random.nextRange(3, 6)); // 3 to 5 opponents
    const opponents: import("@/types/engine").OpponentState[] = [];
    const archetypes: ("frontrunner" | "splitter" | "steady")[] = ["frontrunner", "splitter", "steady"];

    const hasNemesis = runnerProfile?.currentNemesis;

    for (let i = 0; i < opponentsCount; i++) {
      if (i === 0 && hasNemesis && runnerProfile.currentNemesis) {
        opponents.push({
          id: `nemesis_${seed}`,
          name: runnerProfile.currentNemesis.name,
          archetype: runnerProfile.currentNemesis.archetype as any,
          distanceCovered: 0,
          accumulatedTime: 0,
          energy: 100,
          hydration: 100,
          isDNF: false,
          paceSeconds: 310,
          isNemesis: true,
        });
      } else {
        const firstIdx = Math.floor(random.nextRange(0, FIRST_NAMES.length));
        const lastIdx = Math.floor(random.nextRange(0, LAST_NAMES.length));
        const name = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
        const archetype = archetypes[Math.floor(random.nextRange(0, archetypes.length))];
        opponents.push({
          id: `opponent_${i}_${seed}`,
          name,
          archetype,
          distanceCovered: 0,
          accumulatedTime: 0,
          energy: 100,
          hydration: 100,
          isDNF: false,
          paceSeconds: 310,
        });
      }
    }

    state = {
      distanceCovered: 0,
      energy: initialEnergy,
      hydration: 100,
      focus: startingFocus,
      fatigue: 100 - initialEnergy,
      confidence: initialConfidence,
      accumulatedTime: 0,
      eventsResolved: [],
      muscleFatigue: 0,
      mentalFatigue: 0,
      momentum: 50,
      paceStability:
        preparation.mindset === "calm"
          ? 90
          : preparation.mindset === "fearless"
            ? 60
            : 80,
      riskLevel:
        preparation.pacing === "aggressive"
          ? 60
          : preparation.pacing === "conservative"
            ? 10
            : 30,
      decisionTimeline: generateDecisionTimeline(
        totalDistance,
        challenge,
        seed,
      ),
      decisionHistory: [],
      delayedEffects: [],
      randomSeedState: seed,
      accumulatedStateLog: [],
      opponents,
      currentPacing: preparation.pacing,
      runnersHighTicks: 0,
      isRunnersHighActive: false,
      runnersHighCooldown: 0,
      hasTriggeredWall: false,
      hasTriggeredCramp: false,
    };

    // DNS check (rare event roll on first step)
    const initRandom = new SeededRandom(seed);
    const roll = Math.floor(initRandom.nextRange(0, 500));
    state.randomSeedState = initRandom.seed;

    if (roll === 42) {
      const rareEventRoll = Math.floor(initRandom.nextRange(0, 4));
      state.randomSeedState = initRandom.seed;

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
        state.specialEventKm = Math.floor(initRandom.nextRange(1, maxKms + 1));
        if (rareEventRoll === 1) state.specialEventId = "special_booster";
        else if (rareEventRoll === 2) state.specialEventId = "special_accident";
        else if (rareEventRoll === 3) state.specialEventId = "special_dnf";
        state.randomSeedState = initRandom.seed;
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
      opponents: currentState.opponents
        ? currentState.opponents.map((o) => ({ ...o }))
        : [],
      currentPacing: nextPacing || currentState.currentPacing || preparation.pacing,
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
        } else if (
          choice.id === "aid_water" ||
          choice.id === "aid_electrolyte"
        ) {
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

  const startKm = state.distanceCovered + 1;
  const maxKms = Math.ceil(totalDistance);
  let currentStepState = state;

  for (let km = startKm; km <= maxKms; km++) {
    // Weather shift logic mid-race (if distance >= 8, at half way point, 25% chance)
    if (km === Math.floor(totalDistance / 2) && totalDistance >= 8 && random.nextRange(0, 100) < 25) {
      const weathers: import("@/types/engine").Weather[] = ["rain", "storm", "hot", "cloudy"];
      const newWeather = weathers[Math.floor(random.nextRange(0, weathers.length))];
      challenge.environment.weather = newWeather;
      currentStepState.eventsResolved.push({
        km,
        title: { en: "Weather Shift!", id: "Perubahan Cuaca!" },
        description: {
          en: `The weather suddenly shifted to ${newWeather}!`,
          id: `Cuaca tiba-tiba berubah menjadi ${newWeather}!`,
        },
        effect: { stamina: 0, hydration: -5, morale: -10, pace: 5 },
      });
    }

    // Check for dynamic cramp/wall triggers before the km starts
    if (km >= 25 && currentStepState.energy < 30 && !currentStepState.hasTriggeredWall) {
      currentStepState.pendingDecision = DECISION_DATABASE.the_wall;
      currentStepState.hasTriggeredWall = true;
      currentStepState.randomSeedState = random.seed;
      return {
        type: "decision",
        state: currentStepState,
        prompt: {
          km,
          decisionCard: DECISION_DATABASE.the_wall,
          timeoutSeconds: 10,
        },
      };
    }

    if (currentStepState.hydration < 35 && !currentStepState.hasTriggeredCramp && random.nextRange(0, 100) < 30) {
      currentStepState.pendingDecision = DECISION_DATABASE.cramp_warning;
      currentStepState.hasTriggeredCramp = true;
      currentStepState.randomSeedState = random.seed;
      return {
        type: "decision",
        state: currentStepState,
        prompt: {
          km,
          decisionCard: DECISION_DATABASE.cramp_warning,
          timeoutSeconds: 10,
        },
      };
    }

    // Check if decision timeline triggers at this kilometer before simulating
    if (currentStepState.decisionTimeline?.[km]) {
      const cardId = currentStepState.decisionTimeline[km];
      const card = DECISION_DATABASE[cardId];
      if (card) {
        currentStepState.pendingDecision = card;
        currentStepState.randomSeedState = random.seed;
        delete currentStepState.decisionTimeline[km];
        return {
          type: "decision",
          state: currentStepState,
          prompt: {
            km,
            decisionCard: card,
            timeoutSeconds: 10,
          },
        };
      }
    }

    const checkpoint = challenge.race.checkpoints.find((cp) => cp.km === km);

    // Simulate AI Opponents first
    if (currentStepState.opponents) {
      const activeWeather = challenge.environment.weather;
      const analysis = challenge.analysis;
      let activeSegment: import("@/types/engine").RaceSegment | null = null;

      if (analysis?.segments && analysis.segments.length > 0) {
        let accumulatedDistance = 0;
        for (const seg of analysis.segments) {
          accumulatedDistance += seg.distance;
          if (km <= accumulatedDistance + 0.001) {
            activeSegment = seg;
            break;
          }
        }
      }

      for (const opp of currentStepState.opponents) {
        if (opp.isDNF) continue;

        let oppPace = challenge.objective.targetTime / challenge.race.distance;

        // Archetype pacing profiles
        if (opp.archetype === "frontrunner") {
          if (km <= maxKms * 0.5) {
            oppPace -= 15; // starts fast
          } else {
            oppPace += 20; // slows down
          }
        } else if (opp.archetype === "splitter") {
          if (km <= maxKms * 0.6) {
            oppPace += 12; // starts slow
          } else {
            oppPace -= 22; // negative split kick
          }
        } else {
          oppPace += 3; // steady pacing
        }

        // Apply Nemesis performance boost
        if (opp.isNemesis) {
          oppPace -= 8; // Nemesis runs 8 seconds faster per km
        }

        // Apply dynamic segment modifiers
        if (activeSegment) {
          if (activeSegment.type === "climb") {
            oppPace += 20;
          } else if (activeSegment.type === "descent") {
            oppPace -= 15;
          } else if (activeSegment.type === "sprint") {
            oppPace -= 25;
          }
        }

        // Random pace variation
        const variation = random.nextRange(-6, 6);
        oppPace += variation;

        // Energy & Hydration depletion
        let energyLoss = 2.0;
        if (opp.archetype === "frontrunner" && km <= maxKms * 0.5) {
          energyLoss = 3.5;
        }
        if (activeWeather === "hot" || activeWeather === "sunny") {
          energyLoss += 1.0;
          opp.hydration = Math.max(0, opp.hydration - 3.5);
        } else {
          opp.hydration = Math.max(0, opp.hydration - 2.0);
        }

        opp.energy = Math.max(0, opp.energy - energyLoss);
        opp.paceSeconds = Math.max(180, Math.round(oppPace));
        opp.accumulatedTime += opp.paceSeconds;
        opp.distanceCovered = km;

        if (opp.energy <= 0 || opp.hydration <= 0) {
          opp.isDNF = true;
        }
      }
    }

    // Simulate player step
    simulateKmStep(
      km,
      currentStepState,
      preparation,
      prepMods,
      envMods,
      checkpoint,
      random,
      challenge,
      runnerProfile,
    );

    // Apply special rare event if scheduled for this kilometer
    if (km === currentStepState.specialEventKm && currentStepState.specialEventId) {
      const eventDef = EVENT_DATABASE[currentStepState.specialEventId];
      if (eventDef) {
        currentStepState.energy = Math.max(
          0,
          Math.min(100, currentStepState.energy + eventDef.effect.stamina),
        );
        currentStepState.hydration = Math.max(
          0,
          Math.min(100, currentStepState.hydration + eventDef.effect.hydration),
        );
        currentStepState.focus = Math.max(
          0,
          Math.min(100, currentStepState.focus + eventDef.effect.morale),
        );
        currentStepState.confidence = Math.max(
          0,
          Math.min(100, currentStepState.confidence + eventDef.effect.morale * 0.5),
        );
        currentStepState.accumulatedTime = Math.max(
          0,
          currentStepState.accumulatedTime + eventDef.effect.pace,
        );

        if (currentStepState.specialEventId === "special_dnf") {
          currentStepState.energy = 0;
        }

        currentStepState.eventsResolved.push({
          km,
          title: eventDef.title,
          description: eventDef.description,
          effect: eventDef.effect,
        });
      }
    }

    // 1. Runner's High Logic
    if ((currentStepState.momentum ?? 50) > 80 && (currentStepState.focus ?? 100) > 80) {
      currentStepState.runnersHighTicks = (currentStepState.runnersHighTicks ?? 0) + 1;
    } else {
      currentStepState.runnersHighTicks = 0;
    }

    if ((currentStepState.runnersHighCooldown ?? 0) > 0) {
      currentStepState.runnersHighCooldown = currentStepState.runnersHighCooldown! - 1;
    }

    if (currentStepState.isRunnersHighActive) {
      if ((currentStepState.runnersHighTicks ?? 0) >= 2) {
        currentStepState.isRunnersHighActive = false;
        currentStepState.runnersHighTicks = 0;
        currentStepState.runnersHighCooldown = 5;
        currentStepState.eventsResolved.push({
          km,
          title: { en: "Runner's High Fades", id: "Runner's High Meredup" },
          description: {
            en: "The endorphin rush fades. Back to normal pacing.",
            id: "Efek endorfin meredup. Kembali ke ritme normal.",
          },
          effect: { stamina: 0, hydration: 0, morale: 0, pace: 0 },
        });
      }
    } else if (
      (currentStepState.runnersHighTicks ?? 0) >= 3 &&
      !currentStepState.isRunnersHighActive &&
      (currentStepState.runnersHighCooldown ?? 0) === 0
    ) {
      currentStepState.isRunnersHighActive = true;
      currentStepState.runnersHighTicks = 0;
      currentStepState.eventsResolved.push({
        km,
        title: { en: "Runner's High!", id: "Runner's High!" },
        description: {
          en: "You entered a flow state! Speed increased, energy drain reduced to zero.",
          id: "Kamu memasuki flow state! Kecepatan meningkat, stamina habis berkurang menjadi nol.",
        },
        effect: { stamina: 10, hydration: 0, morale: 20, pace: -20 },
      });
    }

    // 2. Overtake Commentary Log Logic
    const prevLogState = currentStepState.accumulatedStateLog && currentStepState.accumulatedStateLog.length > 0
      ? currentStepState.accumulatedStateLog[currentStepState.accumulatedStateLog.length - 1]
      : null;

    if (prevLogState && currentStepState.opponents) {
      for (const opp of currentStepState.opponents) {
        if (opp.isDNF) continue;
        const prevOpp = prevLogState.opponents?.find((o) => o.id === opp.id);
        if (prevOpp) {
          const prevPlayerTime = prevLogState.accumulatedTime;
          const prevOppTime = prevOpp.accumulatedTime;
          const currentPlayerTime = currentStepState.accumulatedTime;
          const currentOppTime = opp.accumulatedTime;

          if (prevPlayerTime > prevOppTime && currentPlayerTime < currentOppTime) {
            currentStepState.eventsResolved.push({
              km,
              title: { en: "Overtake!", id: "Menyalip!" },
              description: {
                en: `You just surged past ${opp.name}!`,
                id: `Kamu baru saja menyalip ${opp.name}!`,
              },
              effect: { stamina: 0, hydration: 0, morale: 5, pace: 0 },
            });
            currentStepState.focus = Math.min(100, currentStepState.focus + 5);
          } else if (prevPlayerTime < prevOppTime && currentPlayerTime > currentOppTime) {
            currentStepState.eventsResolved.push({
              km,
              title: { en: "Overtaken!", id: "Disalip!" },
              description: {
                en: `${opp.name} just blew past you!`,
                id: `${opp.name} baru saja menyalipmu!`,
              },
              effect: { stamina: 0, hydration: 0, morale: -5, pace: 0 },
            });
            currentStepState.focus = Math.max(0, currentStepState.focus - 5);
          }
        }
      }
    }

    currentStepState.distanceCovered = km;
    currentStepState.randomSeedState = random.seed;

    const { accumulatedStateLog: _, ...logState } = currentStepState;
    currentStepState.accumulatedStateLog?.push(logState);

    // Check if we should yield kilometer by kilometer (for live active pacing controls)
    const isPlayerDNF = currentStepState.energy <= 0 || currentStepState.hydration <= 0;
    if (stepByStep && km < maxKms && !isPlayerDNF) {
      return {
        type: "step",
        state: currentStepState,
      };
    }

    if (isPlayerDNF) {
      break;
    }
  }

  // Final performance & story build
  const performance = calculatePerformance(
    currentStepState.accumulatedTime,
    challenge.objective,
    currentStepState,
  );

  const story = generateStory(
    currentStepState,
    challenge,
    preparation,
    performance.grade,
    performance.outcome,
  );

  return {
    type: "finished",
    result: {
      finishTime: currentStepState.accumulatedTime,
      score: performance.score,
      grade: performance.grade,
      events: currentStepState.eventsResolved,
      outcome: performance.outcome,
      story,
      stateLog: currentStepState.accumulatedStateLog as SimulationState[],
    },
  };
}

export function simulateRace(input: SimulationInput): SimulationResult {
  let stepRes = advanceSimulation(input);
  while (stepRes.type === "decision" || stepRes.type === "step") {
    if (stepRes.type === "decision") {
      const choiceId = getFallbackChoice(
        stepRes.prompt.decisionCard,
        stepRes.state.decisionHistory || [],
        stepRes.state.randomSeedState ?? input.seed,
      );
      stepRes = advanceSimulation(input, stepRes.state, choiceId);
    } else {
      stepRes = advanceSimulation(input, stepRes.state);
    }
  }
  return stepRes.result;
}
