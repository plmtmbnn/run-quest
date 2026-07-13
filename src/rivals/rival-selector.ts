import type { RunnerProfile } from "@/runner/runner-types";
import { getRivalById, RIVALS } from "./rival-database";
import type { Rival } from "./rival-types";

/**
 * Select an appropriate rival for a race based on difficulty and player level
 */
export function selectRivalForRace(
  playerLevel: number,
  raceDifficulty: number,
  raceDistance: number,
  rivalHistory: Record<string, { wins: number; losses: number }> = {},
): Rival | null {
  // Don't introduce rivals until player is level 3
  if (playerLevel < 3) {
    return null;
  }

  // Calculate target rival level based on difficulty
  const targetLevel = Math.floor(playerLevel * (0.7 + raceDifficulty * 0.4));

  // Filter rivals based on preferred distance
  let suitableRivals = RIVALS.filter((rival) => {
    // Match rival to race distance
    if (raceDistance <= 5) return rival.preferredDistance === "5K";
    if (raceDistance <= 10)
      return (
        rival.preferredDistance === "10K" || rival.preferredDistance === "5K"
      );
    if (raceDistance <= 21)
      return (
        rival.preferredDistance === "half" || rival.preferredDistance === "10K"
      );
    if (raceDistance <= 42)
      return (
        rival.preferredDistance === "marathon" ||
        rival.preferredDistance === "half"
      );
    return (
      rival.preferredDistance === "ultra" ||
      rival.preferredDistance === "marathon"
    );
  });

  // If no suitable rivals, use all
  if (suitableRivals.length === 0) {
    suitableRivals = [...RIVALS];
  }

  // Sort by how close their base stats match target level
  const rivalsWithScore = suitableRivals.map((rival) => {
    const avgStat =
      (rival.baseSpeed + rival.baseStamina + rival.baseWillpower) / 3;
    const levelDiff = Math.abs(avgStat - targetLevel);

    // Add variety: prefer rivals we haven't faced recently
    const encounters = rivalHistory[rival.id];
    const recencyPenalty = encounters ? 10 : 0;

    // Slightly randomize to avoid always picking same rival
    const randomFactor = Math.random() * 5;

    return {
      rival,
      score: levelDiff + recencyPenalty + randomFactor,
    };
  });

  // Sort by score (lower is better)
  rivalsWithScore.sort((a, b) => a.score - b.score);

  // Return best match
  return rivalsWithScore[0]?.rival || null;
}

/**
 * Get a random pre-race quote from a rival
 */
export function getPreRaceQuote(rival: Rival): { en: string; id: string } {
  const quotes = rival.preRaceQuotes;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

/**
 * Get a post-race quote from a rival based on outcome
 */
export function getPostRaceQuote(
  rival: Rival,
  playerWon: boolean,
  marginSeconds: number,
): { en: string; id: string } {
  const isClose = Math.abs(marginSeconds) < 10;

  let quotePool: { en: string; id: string }[];

  if (isClose) {
    quotePool = rival.postRaceQuotes.close;
  } else if (playerWon) {
    quotePool = rival.postRaceQuotes.defeat;
  } else {
    quotePool = rival.postRaceQuotes.victory;
  }

  const randomIndex = Math.floor(Math.random() * quotePool.length);
  return quotePool[randomIndex];
}

/**
 * Calculate rival's performance in a race based on their stats
 */
export function calculateRivalPerformance(
  rival: Rival,
  raceDistance: number,
  weatherModifier: number = 1.0,
): {
  finishTime: number;
  pacePerKm: number;
} {
  // Base pace calculation (in seconds per km)
  const baseSpeedFactor = 100 - rival.baseSpeed;
  const baseStaminaFactor = 100 - rival.baseStamina;

  // Speed is more important for short races, stamina for long races
  const speedWeight = Math.max(0.3, 1 - raceDistance / 50);
  const staminaWeight = 1 - speedWeight;

  const combinedFactor =
    baseSpeedFactor * speedWeight + baseStaminaFactor * staminaWeight;

  // Base pace: 180-360 seconds per km (3:00 - 6:00 min/km)
  const basePacePerKm = 180 + combinedFactor * 1.8;

  // Apply weather modifier
  const adjustedPacePerKm = basePacePerKm * weatherModifier;

  // Calculate total finish time
  const finishTime = adjustedPacePerKm * raceDistance;

  return {
    finishTime,
    pacePerKm: adjustedPacePerKm,
  };
}

/**
 * Determine if rival should appear during race at specific km
 */
export function shouldShowRivalUpdate(
  currentKm: number,
  totalDistance: number,
  lastUpdateKm: number,
): boolean {
  // Show updates every 3-5 km
  const kmSinceLastUpdate = currentKm - lastUpdateKm;

  if (kmSinceLastUpdate < 3) {
    return false;
  }

  // More frequent updates in final 20%
  const percentComplete = currentKm / totalDistance;
  if (percentComplete > 0.8 && kmSinceLastUpdate >= 2) {
    return true;
  }

  // Standard updates every 3-5 km
  if (kmSinceLastUpdate >= 3) {
    // 70% chance to show update
    return Math.random() < 0.7;
  }

  return false;
}

/**
 * Calculate rival's position relative to player
 */
export function calculateRivalPosition(
  playerKm: number,
  playerPace: number,
  rivalPacePerKm: number,
  totalDistance: number,
): {
  rivalKm: number;
  distanceMeters: number;
  position: "ahead" | "behind" | "even";
} {
  // Simulate rival's progress
  const rivalKm = playerKm * (playerPace / rivalPacePerKm);

  // Calculate distance difference in meters
  const kmDifference = rivalKm - playerKm;
  const distanceMeters = Math.round(kmDifference * 1000);

  // Determine position
  let position: "ahead" | "behind" | "even";
  if (Math.abs(distanceMeters) < 20) {
    position = "even";
  } else if (distanceMeters > 0) {
    position = "ahead";
  } else {
    position = "behind";
  }

  return {
    rivalKm,
    distanceMeters,
    position,
  };
}
