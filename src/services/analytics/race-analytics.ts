/**
 * Race Analytics Service
 *
 * Processes SimulationResult data to generate comprehensive race analytics including:
 * - Pace metrics (average, best, worst, variability)
 * - Energy analysis (drain rate, consumable usage)
 * - Position progression tracking
 * - Critical moments identification
 * - "What If" scenario generation
 *
 * Analytics are stored in localStorage for the last 10 races per distance.
 */

import type {
  DailyChallenge,
  Preparation,
  RaceEvent,
  SimulationResult,
  SimulationState,
} from "@/types/engine";

const ANALYTICS_STORAGE_KEY = "runquest.race_analytics";
const MAX_STORED_ANALYTICS = 10;

export interface RaceAnalytics {
  raceId: string;
  date: string;
  distance: number;
  splits: { km: number; pace: number; time: number }[];
  bestSplit: { km: number; pace: number };
  worstSplit: { km: number; pace: number };
  averagePace: number;
  paceVariability: number;
  energyDrainRate: number;
  energyCurve: { km: number; energy: number }[];
  momentumPeaks: number[];
  fatigueProgression: {
    km: number;
    muscle: number;
    mental: number;
  }[];
  positionProgression: { km: number; position: number }[];
  consumableUsage: { km: number; item: string; energyBefore: number }[];
  criticalMoments: {
    km: number;
    event: string;
    impact: string;
    statsChange: { energy?: number; focus?: number; hydration?: number };
  }[];
  whatIfScenarios: WhatIfScenario[];
}

export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  estimatedImpact: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Main analyzer function - processes race result and generates full analytics
 */
export function analyzeRacePerformance(
  result: SimulationResult,
  challenge: DailyChallenge,
  preparation: Preparation,
): RaceAnalytics {
  const stateLog = result.stateLog || [];

  // Calculate all metrics
  const paceMetrics = calculatePaceMetrics(stateLog);
  const energyMetrics = calculateEnergyMetrics(stateLog);
  const positionData = calculatePositionProgression(stateLog);
  const fatigueData = calculateFatigueProgression(stateLog);
  const momentumData = identifyMomentumPeaks(stateLog);
  const consumables = identifyConsumableUsage(stateLog, preparation);
  const criticalMoments = identifyCriticalMoments(result, stateLog);

  const analytics: RaceAnalytics = {
    raceId: challenge.id,
    date: new Date().toISOString(),
    distance: challenge.race.distance,
    splits: paceMetrics.splits,
    bestSplit: paceMetrics.bestSplit,
    worstSplit: paceMetrics.worstSplit,
    averagePace: paceMetrics.averagePace,
    paceVariability: paceMetrics.paceVariability,
    energyDrainRate: energyMetrics.drainRate,
    energyCurve: energyMetrics.curve,
    momentumPeaks: momentumData,
    fatigueProgression: fatigueData,
    positionProgression: positionData,
    consumableUsage: consumables,
    criticalMoments,
    whatIfScenarios: [],
  };

  // Generate "What If" scenarios
  analytics.whatIfScenarios = generateWhatIfScenarios(
    analytics,
    result,
    challenge,
  );

  // Save analytics
  saveAnalytics(challenge.id, challenge.race.distance, analytics);

  return analytics;
}

/**
 * Calculate pace metrics from state log
 */
function calculatePaceMetrics(stateLog: SimulationState[]) {
  const splits: { km: number; pace: number; time: number }[] = [];
  let totalPace = 0;

  // Skip km 0, start from km 1
  for (let i = 1; i < stateLog.length; i++) {
    const currentState = stateLog[i];
    const prevState = stateLog[i - 1];

    const splitTime = currentState.accumulatedTime - prevState.accumulatedTime;
    const km = Math.round(currentState.distanceCovered);

    splits.push({
      km,
      pace: splitTime,
      time: splitTime,
    });

    totalPace += splitTime;
  }

  const averagePace = splits.length > 0 ? totalPace / splits.length : 0;

  // Find best and worst splits
  const sortedByPace = [...splits].sort((a, b) => a.pace - b.pace);
  const bestSplit = sortedByPace[0] || { km: 0, pace: 0 };
  const worstSplit = sortedByPace[sortedByPace.length - 1] || {
    km: 0,
    pace: 0,
  };

  // Calculate pace variability (standard deviation)
  const variance =
    splits.reduce((sum, split) => {
      return sum + (split.pace - averagePace) ** 2;
    }, 0) / splits.length;
  const paceVariability = Math.sqrt(variance);

  return {
    splits,
    bestSplit,
    worstSplit,
    averagePace,
    paceVariability,
  };
}

/**
 * Calculate energy metrics from state log
 */
function calculateEnergyMetrics(stateLog: SimulationState[]) {
  const curve: { km: number; energy: number }[] = [];

  for (let i = 0; i < stateLog.length; i++) {
    const state = stateLog[i];
    curve.push({
      km: Math.round(state.distanceCovered),
      energy: state.energy,
    });
  }

  const startEnergy = stateLog[0]?.energy || 100;
  const endEnergy = stateLog[stateLog.length - 1]?.energy || 0;
  const totalKm = stateLog.length > 0 ? stateLog.length - 1 : 1;
  const drainRate = (startEnergy - endEnergy) / totalKm;

  return {
    curve,
    drainRate,
  };
}

/**
 * Calculate position progression throughout the race
 */
function calculatePositionProgression(stateLog: SimulationState[]) {
  const progression: { km: number; position: number }[] = [];

  for (let i = 0; i < stateLog.length; i++) {
    const state = stateLog[i];

    // Build runner array and sort by distance/time
    const allRunners = [
      {
        id: "player",
        distanceCovered: state.distanceCovered,
        accumulatedTime: state.accumulatedTime,
        isDNF: false,
      },
      ...(state.opponents || []).map((opp) => ({
        id: opp.id,
        distanceCovered: opp.distanceCovered,
        accumulatedTime: opp.accumulatedTime,
        isDNF: opp.isDNF || false,
      })),
    ];

    // Sort: DNF last, then by distance desc, then by time asc
    allRunners.sort((a, b) => {
      if (a.isDNF && !b.isDNF) return 1;
      if (!a.isDNF && b.isDNF) return -1;
      if (b.distanceCovered !== a.distanceCovered) {
        return b.distanceCovered - a.distanceCovered;
      }
      return a.accumulatedTime - b.accumulatedTime;
    });

    const playerPosition = allRunners.findIndex((r) => r.id === "player") + 1;

    progression.push({
      km: Math.round(state.distanceCovered),
      position: playerPosition,
    });
  }

  return progression;
}

/**
 * Calculate fatigue progression (muscle and mental)
 */
function calculateFatigueProgression(stateLog: SimulationState[]) {
  const progression: { km: number; muscle: number; mental: number }[] = [];

  for (let i = 0; i < stateLog.length; i++) {
    const state = stateLog[i];
    progression.push({
      km: Math.round(state.distanceCovered),
      muscle: state.muscleFatigue || 0,
      mental: state.mentalFatigue || 0,
    });
  }

  return progression;
}

/**
 * Identify momentum peaks (km where momentum was highest)
 */
function identifyMomentumPeaks(stateLog: SimulationState[]) {
  const momentumData = stateLog.map((state, i) => ({
    km: Math.round(state.distanceCovered),
    momentum: state.momentum || 50,
  }));

  // Find local maxima
  const peaks: number[] = [];
  for (let i = 1; i < momentumData.length - 1; i++) {
    const prev = momentumData[i - 1].momentum;
    const current = momentumData[i].momentum;
    const next = momentumData[i + 1].momentum;

    if (current > prev && current > next && current > 70) {
      peaks.push(momentumData[i].km);
    }
  }

  return peaks;
}

/**
 * Identify consumable usage from nutrition in preparation
 */
function identifyConsumableUsage(
  stateLog: SimulationState[],
  preparation: Preparation,
) {
  const usage: { km: number; item: string; energyBefore: number }[] = [];

  // Track energy spikes that indicate consumable use
  for (let i = 1; i < stateLog.length; i++) {
    const prevState = stateLog[i - 1];
    const currentState = stateLog[i];

    const energyChange = currentState.energy - prevState.energy;

    // Positive energy change indicates consumable usage
    if (energyChange > 5) {
      usage.push({
        km: Math.round(currentState.distanceCovered),
        item: "nutrition", // Generic since we don't track specific items during race
        energyBefore: prevState.energy,
      });
    }
  }

  return usage;
}

/**
 * Identify critical moments from events and state changes
 */
function identifyCriticalMoments(
  result: SimulationResult,
  stateLog: SimulationState[],
) {
  const moments: {
    km: number;
    event: string;
    impact: string;
    statsChange: { energy?: number; focus?: number; hydration?: number };
  }[] = [];

  // Process events
  for (const event of result.events) {
    const km = event.km;
    const stateIndex = stateLog.findIndex(
      (s) => Math.round(s.distanceCovered) === km,
    );

    if (stateIndex > 0) {
      const prevState = stateLog[stateIndex - 1];
      const currentState = stateLog[stateIndex];

      const statsChange: {
        energy?: number;
        focus?: number;
        hydration?: number;
      } = {};

      if (Math.abs(currentState.energy - prevState.energy) > 5) {
        statsChange.energy = currentState.energy - prevState.energy;
      }
      if (Math.abs(currentState.focus - prevState.focus) > 5) {
        statsChange.focus = currentState.focus - prevState.focus;
      }
      if (Math.abs(currentState.hydration - prevState.hydration) > 5) {
        statsChange.hydration = currentState.hydration - prevState.hydration;
      }

      const impact = Object.values(statsChange).some((v) => v && v < 0)
        ? "negative"
        : "positive";

      moments.push({
        km,
        event: event.title.en,
        impact,
        statsChange,
      });
    }
  }

  return moments;
}

/**
 * Generate "What If" scenarios
 */
function generateWhatIfScenarios(
  analytics: RaceAnalytics,
  result: SimulationResult,
  challenge: DailyChallenge,
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];

  // Scenario 1: Steady Pace
  if (analytics.paceVariability > 10) {
    const bestPace = analytics.bestSplit.pace;
    const currentFinish = result.finishTime;
    const projectedFinish = bestPace * challenge.race.distance;
    const timeDiff = currentFinish - projectedFinish;

    if (timeDiff > 5) {
      scenarios.push({
        id: "steady_pace",
        title: "Maintain Best Split Pace",
        description: `If you held your best split pace (${formatPace(bestPace)}/km) throughout the entire race instead of varying your pace...`,
        estimatedImpact: `${Math.round(timeDiff)} seconds faster`,
        confidence: "medium",
      });
    }
  }

  // Scenario 2: Better Nutrition Timing
  if (analytics.consumableUsage.length > 0) {
    const firstUsage = analytics.consumableUsage[0];
    const energyCrisisKm = analytics.energyCurve.findIndex(
      (e) => e.energy < 30,
    );

    if (energyCrisisKm > 0 && energyCrisisKm > firstUsage.km + 2) {
      scenarios.push({
        id: "nutrition_timing",
        title: "Earlier Nutrition Timing",
        description: `Taking nutrition at km ${energyCrisisKm - 2} instead of km ${firstUsage.km} could have prevented the energy crisis at km ${energyCrisisKm}...`,
        estimatedImpact: `15-20 seconds faster`,
        confidence: "medium",
      });
    }
  }

  // Scenario 3: Conservative Start
  const firstThirdAvg =
    analytics.splits
      .slice(0, Math.floor(analytics.splits.length / 3))
      .reduce((sum, s) => sum + s.pace, 0) /
    Math.floor(analytics.splits.length / 3);
  const lastThirdAvg =
    analytics.splits
      .slice(Math.floor((analytics.splits.length * 2) / 3))
      .reduce((sum, s) => sum + s.pace, 0) /
    (analytics.splits.length - Math.floor((analytics.splits.length * 2) / 3));

  if (lastThirdAvg > firstThirdAvg + 15) {
    const potentialSavings =
      (lastThirdAvg - firstThirdAvg) * Math.floor(analytics.splits.length / 3);
    scenarios.push({
      id: "conservative_start",
      title: "More Conservative Start",
      description: `Starting ${Math.round(lastThirdAvg - firstThirdAvg)}s/km slower would have preserved energy for a stronger finish...`,
      estimatedImpact: `${Math.round(potentialSavings * 0.6)} seconds faster`,
      confidence: "high",
    });
  }

  return scenarios;
}

/**
 * Format pace for display (mm:ss)
 */
function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Save analytics to localStorage
 */
export function saveAnalytics(
  challengeId: string,
  distance: number,
  analytics: RaceAnalytics,
) {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
      return;

    const key = `${ANALYTICS_STORAGE_KEY}.${distance}km`;
    const stored = localStorage.getItem(key);
    const analyticsArray: RaceAnalytics[] = stored ? JSON.parse(stored) : [];

    // Add new analytics
    analyticsArray.push(analytics);

    // Keep only last 10
    if (analyticsArray.length > MAX_STORED_ANALYTICS) {
      analyticsArray.shift();
    }

    localStorage.setItem(key, JSON.stringify(analyticsArray));
  } catch (error) {
    console.error("Failed to save race analytics:", error);
  }
}

/**
 * Load analytics from localStorage
 */
export function loadAnalytics(distance: number): RaceAnalytics[] {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
      return [];

    const key = `${ANALYTICS_STORAGE_KEY}.${distance}km`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load race analytics:", error);
    return [];
  }
}

/**
 * Get analytics for a specific race
 */
export function getAnalyticsForRace(
  challengeId: string,
  distance: number,
): RaceAnalytics | null {
  const allAnalytics = loadAnalytics(distance);
  return allAnalytics.find((a) => a.raceId === challengeId) || null;
}
