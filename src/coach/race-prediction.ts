/**
 * Coach Race Prediction Engine
 * Analyzes player stats vs competition to predict race outcome
 */

import type { RunnerProfile } from "@/runner/runner-types";
import type { DailyChallenge, Preparation } from "@/types/engine";

export interface RacePrediction {
  winProbability: number; // 0-100
  winProbabilityLabel: "Very High" | "High" | "Medium" | "Low" | "Very Low";
  recommendedStrategy: string;
  suggestedPaceRange: { min: number; max: number }; // seconds per km
  keyThreats: string[]; // Top 3 AI competitors to watch
  confidenceFactors: {
    fitness: "excellent" | "good" | "adequate" | "poor";
    fatigue: "fresh" | "normal" | "tired" | "exhausted";
    experience: "veteran" | "experienced" | "novice";
    conditions: "favorable" | "neutral" | "challenging";
  };
  coachNotes: string; // Personalized message
}

/**
 * Generate race prediction based on player state and race conditions
 */
export function predictRaceOutcome(
  profile: RunnerProfile,
  challenge: DailyChallenge,
  preparation: Preparation
): RacePrediction {
  // Calculate effective race pace considering all modifiers
  const effectivePace = calculateEffectivePace(profile, challenge, preparation);
  
  // Estimate AI field strength
  const aiFieldStrength = estimateAIStrength(challenge.tier || "local", challenge.race.distance);
  
  // Calculate win probability
  const winProbability = calculateWinProbability(
    effectivePace,
    aiFieldStrength,
    profile,
    challenge
  );
  
  // Generate strategy recommendation
  const strategy = generateStrategy(profile, challenge, winProbability);
  
  // Calculate suggested pace range
  const paceRange = calculatePaceRange(effectivePace, aiFieldStrength);
  
  // Identify key threats
  const threats = identifyKeyThreats(challenge, aiFieldStrength);
  
  // Assess confidence factors
  const factors = assessConfidenceFactors(profile, challenge);
  
  // Generate personalized coach notes
  const notes = generateCoachNotes(winProbability, factors, challenge);
  
  return {
    winProbability,
    winProbabilityLabel: getWinProbabilityLabel(winProbability),
    recommendedStrategy: strategy,
    suggestedPaceRange: paceRange,
    keyThreats: threats,
    confidenceFactors: factors,
    coachNotes: notes,
  };
}

/**
 * Calculate player's effective race pace (seconds per km)
 * All modifiers combined together
 */
function calculateEffectivePace(
  profile: RunnerProfile,
  challenge: DailyChallenge,
  preparation: Preparation
): number {
  // Base pace from fitness level
  const basePace = calculatePlayerBasePace(profile, challenge.race.distance);
  
  // Gear bonus (from shoes and other gear)
  const gearBonus = calculateGearBonus(preparation);
  
  // Condition penalty (weather, terrain)
  const conditionPenalty = calculateConditionPenalty(challenge);
  
  // Fatigue penalty
  const fatiguePenalty = calculateFatiguePenalty(profile.currentFatigue || 0);
  
  // Readiness adjustment
  const readinessAdjustment = calculateReadinessAdjustment(profile.currentReadiness || 100);
  
  // Experience multiplier
  const experienceMultiplier = calculateExperienceModifier(profile.totalRuns || 0);
  
  // Cumulative effect
  let pace = basePace - gearBonus + conditionPenalty + fatiguePenalty + readinessAdjustment;
  pace *= experienceMultiplier;
  
  return Math.round(pace);
}

/**
 * Calculate player's base race pace without modifiers
 */
function calculatePlayerBasePace(
  profile: RunnerProfile,
  distance: number
): number {
  const fitnessLevel = profile.currentFitness || 50;
  const basePaceAt100Fitness = 240; // 4:00 min/km at 100 fitness
  const basePaceAt0Fitness = 420; // 7:00 min/km at 0 fitness
  
  let pace = basePaceAt0Fitness - (fitnessLevel / 100) * (basePaceAt0Fitness - basePaceAt100Fitness);
  
  // Adjust for distance (longer distances have slower average paces)
  if (distance >= 42) pace += 30; // Marathon+ penalty
  else if (distance >= 21) pace += 15; // Half marathon penalty
  else if (distance >= 10) pace += 5; // 10K penalty
  
  return pace;
}

/**
 * Calculate gear bonus (seconds per km reduction)
 */
function calculateGearBonus(preparation: Preparation): number {
  let bonus = 0;
  
  // Shoes bonus (from shop-catalog stats)
  const shoeBonus: Record<string, number> = {
    carbon_racer: 3,
    lightweight: 1,
    plated_supershoe: 4,
    speed_flats: 3,
    marathon_racer: 2,
    stability: 0.5,
    recovery_slides: 0,
    daily_trainer: 0,
    trail: 0.5,
    minimalist_trail: 1,
    aggressive_trail: 0.8,
    max_cushion: 0,
  };
  bonus += shoeBonus[preparation.shoes] || 0;
  
  // Other minor gear bonuses
  if (preparation.gear.includes("gps_watch")) bonus += 1;
  if (preparation.gear.includes("sunglasses")) bonus += 0.5;
  if (preparation.gear.includes("compression_socks")) bonus += 1;
  
  return bonus;
}

/**
 * Calculate condition penalty (seconds per km added)
 */
function calculateConditionPenalty(challenge: DailyChallenge): number {
  let penalty = 0;
  const env = challenge.environment;
  const race = challenge.race;
  
  // Weather penalties
  if (env.weather === "rain") penalty += 10;
  if (env.weather === "storm") penalty += 20;
  if (env.weather === "fog") penalty += 5;
  
  // Temperature penalties
  if (env.temperature > 28) penalty += 15; // Hot
  if (env.temperature > 32) penalty += 30; // Very hot
  if (env.temperature < 5) penalty += 10; // Cold
  if (env.temperature < -5) penalty += 20; // Very cold
  
  // Wind penalty
  if (env.wind.speed > 20) penalty += 10;
  if (env.wind.speed > 30) penalty += 20;
  
  // Surface modifiers
  if (race.surface === "trail") penalty += 5;
  if (race.elevation === "hilly") penalty += 10;
  
  return penalty;
}

/**
 * Calculate fatigue penalty from current fatigue level
 */
function calculateFatiguePenalty(fatigue: number): number {
  // Higher fatigue = slower pace
  // At 0% fatigue: no penalty
  // At 100% fatigue: up to +60s/km penalty
  return Math.floor((fatigue / 100) * 60);
}

/**
 * Calculate readiness adjustment
 */
function calculateReadinessAdjustment(readiness: number): number {
  // Lower readiness = positive pace penalty
  return Math.floor(((100 - readiness) / 100) * 30);
}

/**
 * Calculate experience modifier based on total races completed
 */
function calculateExperienceModifier(totalRaces: number): number {
  if (totalRaces < 5) return 1.1; // Novice: -10% penalty
  if (totalRaces < 20) return 1.03; // Moderate: -3% penalty
  if (totalRaces < 50) return 0.98; // Experienced: +2% bonus
  return 0.95; // Veteran: +5% bonus
}

/**
 * Estimate AI field average pace (seconds per km)
 */
function estimateAIStrength(tier: string, distance: number): number {
  const tierPace: Record<string, number> = {
    local: 300,      // 5:00 min/km average
    regional: 270,   // 4:30 min/km
    state: 255,      // 4:15 min/km
    national: 240,   // 4:00 min/km
    international: 225, // 3:45 min/km
  };
  
  let pace = tierPace[tier] || 300;
  
  // Distance adjustment
  if (distance >= 42) pace += 20;
  else if (distance >= 21) pace += 10;
  
  return pace;
}

/**
 * Calculate win probability (0-100%)
 */
function calculateWinProbability(
  playerPace: number,
  aiPace: number,
  profile: RunnerProfile,
  challenge: DailyChallenge
): number {
  // Pace differential (negative means player is faster than field average)
  const paceDiff = playerPace - aiPace;
  
  // Base probability from pace comparison
  let probability = 50 - (paceDiff * 2); // ±2% per second difference
  
  // Adjust for experience
  const totalRuns = profile.totalRuns || 0;
  if (totalRuns > 50) probability += 10;
  else if (totalRuns > 20) probability += 5;
  else if (totalRuns < 5) probability -= 10;
  
  // Adjust for race tier (higher tier = more variance/uncertainty)
  if (challenge.tier === "international") probability -= 5;
  if (challenge.tier === "national") probability -= 3;
  
  // Add conditioning factor (race difficulty based on weather/elevation)
  const conditioningFactor = calculateConditionFactor(challenge);
  probability += conditioningFactor;
  
  // Clamp to 1-99% (never absolute certainty)
  return Math.max(1, Math.min(99, Math.round(probability)));
}

/**
 * Calculate how challenging the race conditions are
 */
function calculateConditionFactor(challenge: DailyChallenge): number {
  let factor = 0;
  const weather = challenge.environment.weather;
  const elevation = challenge.race.elevation;
  
  // Difficult weather reduces win probability likelihood
  if (["storm", "hot", "cold"].includes(weather)) factor -= 15;
  if (["rain"].includes(weather)) factor -= 5;
  
  // Hilly/mountainous terrain makes underdog potential higher
  if (elevation === "hilly") factor += 3;
  
  return factor;
}

/**
 * Generate recommended strategy
 */
function generateStrategy(
  profile: RunnerProfile,
  challenge: DailyChallenge,
  winProb: number
): string {
  const distance = challenge.race.distance;
  const fatigue = profile.currentFatigue || 0;
  
  if (winProb > 70) {
    return `Start conservatively and control the pace. Attack at ${Math.floor(distance * 0.7)}K to break away.`;
  } else if (winProb > 40) {
    return `Stay with the lead pack early. Make your move at the ${Math.floor(distance * 0.6)}K mark.`;
  } else if (fatigue > 60) {
    return `You're fatigued. Focus on finishing strong rather than winning. Consider cruising.`;
  } else {
    return `Take risks early and push hard. This will be a tough race—give it everything you've got!`;
  }
}

/**
 * Calculate competitive pace range
 */
function calculatePaceRange(
  playerPace: number,
  aiPace: number
): { min: number; max: number } {
  // Suggest a range that's competitive but realistic
  const targetPace = Math.min(playerPace, aiPace);
  
  return {
    min: targetPace - 5,  // Push pace (faster)
    max: targetPace + 10, // Safe pace (slower)
  };
}

/**
 * Generate top 3 competitor names for race context
 */
function identifyKeyThreats(challenge: DailyChallenge, aiStrength: number): string[] {
  const names = [
    "Sarah Chen", "Marcus Rodriguez", "Emily Watson",
    "David Kim", "Anna Kowalski", "James Thompson",
    "Maria Silva", "Ahmed Hassan", "Sophie Dubois",
    "Li Wei", "Fatima Al-Zahra", "Carlos Mendes"
  ];
  
  // Sort AI opponents by name seeded by race ID
  const seed = challenge.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const threats: string[] = [];
  
  for (let i = 0; i < 3; i++) {
    const index = (seed + i * 17) % names.length;
    threats.push(names[index]);
  }
  
  return threats;
}

/**
 * Assess various confidence factors for the prediction
 */
function assessConfidenceFactors(
  profile: RunnerProfile,
  challenge: DailyChallenge
): RacePrediction["confidenceFactors"] {
  const fitness = profile.currentFitness || 50;
  const fatigue = profile.currentFatigue || 0;
  const totalRuns = profile.totalRuns || 0;
  const temp = challenge.environment.temperature;
  const weather = challenge.environment.weather;
  const elevation = challenge.race.elevation;
  
  return {
    fitness: fitness > 80 ? "excellent" : fitness > 60 ? "good" : fitness > 40 ? "adequate" : "poor",
    fatigue: fatigue < 20 ? "fresh" : fatigue < 50 ? "normal" : fatigue < 75 ? "tired" : "exhausted",
    experience: totalRuns > 50 ? "veteran" : totalRuns > 10 ? "experienced" : "novice",
    conditions: 
      weather === "sunny" && temp > 10 && temp < 25 && elevation === "flat" ? "favorable" :
      weather === "rain" || weather === "storm" || temp > 30 || temp < 5 ? "challenging" :
      "neutral",
  };
}

/**
 * Generate personalized coach notes based on prediction and factors
 */
function generateCoachNotes(
  winProb: number,
  factors: RacePrediction["confidenceFactors"],
  challenge: DailyChallenge
): string {
  const notes: string[] = [];
  
  // Fitness feedback
  if (factors.fitness === "excellent") {
    notes.push("Your fitness is outstanding this week - you're primed for a great performance!");
  } else if (factors.fitness === "poor") {
    notes.push("Your fitness needs improvement. Consider this a learning opportunity before focusing on results.");
  }
  
  // Fatigue warning/warning
  if (factors.fatigue === "exhausted") {
    notes.push("⚠️ Warning: You're carrying significant fatigue. Avoid pushing too hard on early segments.");
  } else if (factors.fatigue === "fresh") {
    notes.push("You're well-rested and ready to give your best effort today.");
  }
  
  // Experience note
  if (factors.experience === "novice") {
    notes.push("Remember to stick to your pacing strategy. Don't go out too fast in the first few kilometers.");
  } else if (factors.experience === "veteran") {
    notes.push("Trust your instincts and your training - you know exactly what needs to happen.");
  }
  
  // Conditions note
  if (factors.conditions === "challenging") {
    notes.push("The race conditions are tougher today. Adjust your expectations and focus on executing your strategy.");
  }
  
  // Win probability encouragement
  if (winProb > 70) {
    notes.push("🌟 You're the favorite to win! Execute your race plan and make it yours!");
  } else if (winProb < 30) {
    notes.push("🛡️ This will be an uphill battle against stronger competitors. Focus on a strong finish and personal improvement.");
  }
  
  // Personal message based on combo of factors
  if (winProb > 60 && factors.fitness === "excellent") {
    notes.push("This could be your breakthrough race - go show them what you've got!");
  }
  
  return notes.join(" ");
}

/**
 * Get win probability label for display
 */
function getWinProbabilityLabel(prob: number): RacePrediction["winProbabilityLabel"] {
  if (prob >= 80) return "Very High";
  if (prob >= 60) return "High";
  if (prob >= 40) return "Medium";
  if (prob >= 20) return "Low";
  return "Very Low";
}

/**
 * Format pace as MM:SS
 */
export function formatPace(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.round(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration as HH:MM:SS or MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}
