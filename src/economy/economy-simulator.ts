/**
 * Economy Simulator (Sprint 26 - Task 5)
 * 
 * Simulates economic scenarios to verify balance and sustainability.
 * Tests different playstyles to ensure no game-breaking economic issues.
 */

import type { GameState } from "../engine/timeline/time-types";
import type { EconomyState } from "./economy-types";
import type { RaceTier } from "./economy-types";
import { ECONOMIC_BALANCE, calculateExpectedPrize } from "./economy-balance";
import {
  earnFromWork,
  earnRacePrize,
  spendRaceEntry,
} from "./earning-engine";

/**
 * Player archetype for simulation.
 */
export interface PlayerArchetype {
  name: string;
  description: string;
  
  /** Daily routine */
  workFrequency: number; // How often they work (0-1, 1 = every day)
  raceFrequency: number; // How often they race (0-1, 1 = every day)
  trainFrequency: number; // How often they train (0-1, 1 = every day)
  
  /** Performance */
  winRate: number; // 0-1
  averagePosition: number;
  
  /** Progression */
  raceTier: RaceTier;
  raceTierDay: number; // Day when they move to this tier
}

/**
 * Simulation result.
 */
export interface SimulationResult {
  archetype: string;
  daysSimulated: number;
  
  // Financial stats
  startingBalance: number;
  endingBalance: number;
  totalEarned: number;
  totalSpent: number;
  
  // Activity stats
  racesCompleted: number;
  racesWon: number;
  workSessions: number;
  trainingSessions: number;
  
  // Sustainability
  bankrupt: boolean;
  bankruptOnDay: number;
  avgDailyNetIncome: number;
  
  // Verdict
  verdict: "sustainable" | "barely_sustainable" | "unsustainable";
  notes: string[];
}

/**
 * Player archetypes for testing balance.
 */
export const PLAYER_ARCHETYPES: PlayerArchetype[] = [
  {
    name: "Casual Runner",
    description: "Plays daily, races every other day, mixes work",
    workFrequency: 0.5,
    raceFrequency: 0.5,
    trainFrequency: 0.3,
    winRate: 0.3, // Wins 30% of races
    averagePosition: 4,
    raceTier: "local",
    raceTierDay: 1,
  },
  {
    name: "Competitive Racer",
    description: "Focuses on racing, works occasionally",
    workFrequency: 0.2,
    raceFrequency: 0.8,
    trainFrequency: 0.4,
    winRate: 0.6, // Wins 60% of races
    averagePosition: 2,
    raceTier: "local",
    raceTierDay: 30,
  },
  {
    name: "Grinder",
    description: "Works a lot, races rarely but enters high-tier events",
    workFrequency: 0.7,
    raceFrequency: 0.2,
    trainFrequency: 0.5,
    winRate: 0.4,
    averagePosition: 3,
    raceTier: "state",
    raceTierDay: 60,
  },
  {
    name: "Elite Athlete",
    description: "High performance, attracts sponsors, wins frequently",
    workFrequency: 0.1,
    raceFrequency: 0.6,
    trainFrequency: 0.6,
    winRate: 0.8, // Wins 80% of races
    averagePosition: 1,
    raceTier: "regional",
    raceTierDay: 20,
  },
];

/**
 * Simulate an archetype's economic journey.
 */
export function simulateArchetype(
  archetype: PlayerArchetype,
  days: number = 90,
): SimulationResult {
  let economy: EconomyState = {
    transactions: [],
    totalEarned: ECONOMIC_BALANCE.startingMoney,
    totalSpent: 0,
    currentBalance: ECONOMIC_BALANCE.startingMoney,
    lastTransactionDay: 0,
  };

  const stats = {
    racesCompleted: 0,
    racesWon: 0,
    workSessions: 0,
    trainingSessions: 0,
  };

  const notes: string[] = [];
  let bankrupt = false;
  let bankruptOnDay = 0;

  // Use deterministic seed
  let seed = 42;

  for (let day = 1; day <= days; day++) {
    const currentTier = getCurrentTier(archetype, day);
    const entryFee = ECONOMIC_BALANCE.entryFees[currentTier];

    // Work activity
    const workRoll = ((seed + day * 3) % 100) / 100;
    if (workRoll < archetype.workFrequency) {
      const result = earnFromWork(economy, makeGameState(day, seed));
      economy = result.economy;
      stats.workSessions++;
    }

    // Race activity
    const raceRoll = ((seed + day * 7) % 100) / 100;
    if (raceRoll < archetype.raceFrequency) {
      // Check if can afford
      if (economy.currentBalance >= entryFee) {
        // Pay entry fee
        const entryResult = spendRaceEntry(
          economy,
          makeGameState(day, seed),
          entryFee,
          `${currentTier} Race Day ${day}`,
        );
        if (!entryResult.success) {
          bankrupt = true;
          bankruptOnDay = day;
          notes.push(`Went bankrupt on day ${day} (couldn't afford ${currentTier} race fee $${entryFee})`);
          break;
        }
        economy = entryResult.economy;

        // Simulate race outcome
        const winRoll = ((seed + day * 13) % 100) / 100;
        const position = winRoll < archetype.winRate ? 1 : archetype.averagePosition;
        
        // Earn prize
        const prizeResult = earnRacePrize(
          economy,
          makeGameState(day, seed),
          entryFee,
          50,
          position,
          `${currentTier} Race`,
        );
        economy = prizeResult.economy;

        stats.racesCompleted++;
        if (position === 1) stats.racesWon++;
      } else {
        // Can't afford - check if this causes bankruptcy
        const workNeeded = Math.ceil(entryFee / ECONOMIC_BALANCE.earnings.workPerSession);
        notes.push(`Day ${day}: Couldn't afford $${entryFee} race (balance: $${economy.currentBalance}, need ${workNeeded} work sessions)`);
      }
    }

    // Training activity
    const trainRoll = ((seed + day * 17) % 100) / 100;
    if (trainRoll < archetype.trainFrequency) {
      stats.trainingSessions++;
    }
  }

  // Calculate sustainability
  const avgDailyNetIncome = (economy.currentBalance - ECONOMIC_BALANCE.startingMoney) / days;

  let verdict: SimulationResult["verdict"] = "sustainable";
  if (economy.currentBalance < ECONOMIC_BALANCE.startingMoney * 0.5) {
    verdict = "barely_sustainable";
    notes.push("Ending balance less than 50% of starting money");
  }
  if (economy.currentBalance < 0 || bankrupt) {
    verdict = "unsustainable";
    notes.push("Economy is not sustainable - player runs out of money");
  }

  if (economy.currentBalance > ECONOMIC_BALANCE.startingMoney * 2) {
    notes.push("Player is accumulating wealth comfortably");
  }

  return {
    archetype: archetype.name,
    daysSimulated: days,
    startingBalance: ECONOMIC_BALANCE.startingMoney,
    endingBalance: economy.currentBalance,
    totalEarned: economy.totalEarned,
    totalSpent: economy.totalSpent,
    racesCompleted: stats.racesCompleted,
    racesWon: stats.racesWon,
    workSessions: stats.workSessions,
    trainingSessions: stats.trainingSessions,
    bankrupt,
    bankruptOnDay,
    avgDailyNetIncome: Math.round(avgDailyNetIncome),
    verdict,
    notes,
  };
}

/**
 * Run full economic simulation across all archetypes.
 */
export function runFullSimulation(days: number = 90): SimulationResult[] {
  return PLAYER_ARCHETYPES.map((archetype) => simulateArchetype(archetype, days));
}

/**
 * Print simulation results in readable format.
 */
export function printSimulationResults(results: SimulationResult[]): string {
  let output = "═══════════════════════════════════════════════\n";
  output += " ECONOMIC BALANCE SIMULATION RESULTS\n";
  output += ` Days Simulated: ${results[0]?.daysSimulated ?? 90}\n`;
  output += "═══════════════════════════════════════════════\n\n";

  for (const result of results) {
    output += `📊 ${result.archetype}\n`;
    output += `   ${"─".repeat(40)}\n`;
    output += `   Balance: $${result.startingBalance} → $${result.endingBalance}\n`;
    output += `   Earned: $${result.totalEarned} | Spent: $${result.totalSpent}\n`;
    output += `   Races: ${result.racesCompleted} (${result.racesWon} wins)\n`;
    output += `   Work: ${result.workSessions}x | Train: ${result.trainingSessions}x\n`;
    output += `   Daily Net: $${result.avgDailyNetIncome}/day\n`;
    output += `   Verdict: ${result.verdict}\n`;

    if (result.notes.length > 0) {
      output += `   Notes:\n`;
      for (const note of result.notes) {
        output += `     • ${note}\n`;
      }
    }
    output += "\n";
  }

  // Summary
  const sustainable = results.filter((r) => r.verdict === "sustainable").length;
  const total = results.length;
  output += "═══════════════════════════════════════════════\n";
  output += ` OVERALL: ${sustainable}/${total} archetypes sustainable\n`;
  output += "═══════════════════════════════════════════════\n";

  return output;
}

/**
 * Get current race tier based on day progression.
 */
function getCurrentTier(archetype: PlayerArchetype, day: number): RaceTier {
  if (day >= 120) return "international";
  if (day >= 90) return "national";
  if (day >= 60) return "state";
  if (day >= 30) return "regional";
  return archetype.raceTier;
}

/**
 * Create a minimal GameState for simulation.
 */
function makeGameState(dayIndex: number, seed: number): GameState {
  return {
    dayIndex,
    startAge: 25,
    lifespan: 80,
    seed,
    energy: 100,
    energyMax: 100,
    resources: { money: 0 },
    stats: { health: 80, strength: 50, intellect: 30, charisma: 40 },
    skills: { running: 10 },
    relationships: { network: 5 },
    routine: ["work", "train", "rest", "work", "train", "compete", "rest"],
    flags: { rating: 1500 },
  };
}

// Quick test: run and log
export function testEconomyBalance(): void {
  const results = runFullSimulation(90);
  console.log(printSimulationResults(results));
}
