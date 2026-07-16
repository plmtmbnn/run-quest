/**
 * Earning Engine (Sprint 26 - Task 2)
 * 
 * Orchestrates all money earning sources in the game.
 */

import type { GameState } from "../engine/timeline/time-types";
import type { EconomyState, Transaction, RaceTier, TransactionCategory } from "./economy-types";
import { ECONOMIC_BALANCE } from "./economy-balance";

let transactionCounter = 0;

/**
 * Generate a unique transaction ID.
 */
function generateTransactionId(): string {
  transactionCounter++;
  return `txn_${Date.now()}_${transactionCounter}`;
}

/**
 * Record a transaction in the economy state.
 */
export function recordTransaction(
  economy: EconomyState,
  type: "earn" | "spend",
  category: TransactionCategory,
  amount: number,
  dayIndex: number,
  description: string,
  metadata?: Record<string, unknown>,
): { economy: EconomyState; transaction: Transaction } {
  const balanceDelta = type === "earn" ? amount : -amount;
  const balanceAfter = economy.currentBalance + balanceDelta;

  const transaction: Transaction = {
    id: generateTransactionId(),
    type,
    category,
    amount,
    balanceAfter,
    dayIndex,
    description,
    metadata,
  };

  return {
    economy: {
      ...economy,
      transactions: [transaction, ...economy.transactions].slice(0, 100), // Keep last 100
      totalEarned: economy.totalEarned + (type === "earn" ? amount : 0),
      totalSpent: economy.totalSpent + (type === "spend" ? amount : 0),
      currentBalance: balanceAfter,
      lastTransactionDay: dayIndex,
    },
    transaction,
  };
}

/**
 * Earn money from working (work action).
 */
export function earnFromWork(
  economy: EconomyState,
  gameState: GameState,
): { economy: EconomyState; earned: number } {
  const earned = ECONOMIC_BALANCE.earnings.workPerSession;
  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "work",
    earned,
    gameState.dayIndex,
    `Work day earnings`,
  );

  return { economy: updatedEconomy, earned };
}

/**
 * Earn prize money from a race result.
 */
export function earnRacePrize(
  economy: EconomyState,
  gameState: GameState,
  entryFee: number,
  totalEntrants: number,
  position: number,
  raceName: string,
): { economy: EconomyState; prize: number } {
  const prizePool = entryFee * totalEntrants * (ECONOMIC_BALANCE.prizePoolPercentage ?? 0.7);
  let prize = 0;

  // Find position distribution
  const dist = ECONOMIC_BALANCE.prizeDistribution.find(
    (d) => d.position === position,
  );

  if (dist) {
    prize = Math.floor(prizePool * (dist.percentage / 100));
  } else if (position <= totalEntrants) {
    // 6th+: split remaining 5%
    const remainingPool = prizePool * 0.05;
    const remainingFinishers = Math.max(1, totalEntrants - 5);
    prize = Math.floor(remainingPool / remainingFinishers);
  }

  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "race_prize",
    prize,
    gameState.dayIndex,
    `Prize money: ${position ? `${positionText(position)}` : "Finished"} in ${raceName}`,
    { position, entryFee, totalEntrants },
  );

  return { economy: updatedEconomy, prize };
}

/**
 * Earn championship win bonus (on top of prize money).
 */
export function earnChampionshipBonus(
  economy: EconomyState,
  gameState: GameState,
  tier: RaceTier,
  championshipName: string,
): { economy: EconomyState; bonus: number } {
  const bonus = ECONOMIC_BALANCE.earnings.championshipWin[tier];
  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "championship",
    bonus,
    gameState.dayIndex,
    `Championship bonus: ${championshipName}`,
    { tier },
  );

  return { economy: updatedEconomy, bonus };
}

/**
 * Earn sponsorship money (per training session or race).
 */
export function earnSponsorPayout(
  economy: EconomyState,
  gameState: GameState,
  sponsorName: string,
  amount: number,
  activity: string,
): { economy: EconomyState; earned: number } {
  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "sponsor",
    amount,
    gameState.dayIndex,
    `${sponsorName}: ${activity}`,
  );

  return { economy: updatedEconomy, earned: amount };
}

/**
 * Earn achievement bonus.
 */
export function earnAchievementBonus(
  economy: EconomyState,
  gameState: GameState,
  achievementName: string,
): { economy: EconomyState; bonus: number } {
  const bonus = getRandomBetween(
    ECONOMIC_BALANCE.earnings.achievementBonus.min,
    ECONOMIC_BALANCE.earnings.achievementBonus.max,
    gameState.seed + economy.totalEarned,
  );
  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "achievement",
    bonus,
    gameState.dayIndex,
    `Achievement unlocked: ${achievementName}`,
  );

  return { economy: updatedEconomy, bonus };
}

/**
 * Earn streak milestone bonus.
 */
export function earnStreakMilestone(
  economy: EconomyState,
  gameState: GameState,
  milestoneDays: number,
): { economy: EconomyState; earned: number } {
  const earned = getRandomBetween(
    ECONOMIC_BALANCE.earnings.streakMilestone.min,
    ECONOMIC_BALANCE.earnings.streakMilestone.max,
    gameState.seed + milestoneDays,
  );
  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "earn",
    "milestone",
    earned,
    gameState.dayIndex,
    `${milestoneDays} day streak milestone!`,
  );

  return { economy: updatedEconomy, earned };
}

/**
 * Spend money on race entry fee.
 */
export function spendRaceEntry(
  economy: EconomyState,
  gameState: GameState,
  entryFee: number,
  raceName: string,
): { economy: EconomyState; success: boolean } {
  if (economy.currentBalance < entryFee) {
    return { economy, success: false };
  }

  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "spend",
    "race_entry",
    entryFee,
    gameState.dayIndex,
    `Entry fee: ${raceName}`,
  );

  return { economy: updatedEconomy, success: true };
}

/**
 * Spend money on treatment.
 */
export function spendTreatment(
  economy: EconomyState,
  gameState: GameState,
  type: "active" | "medical",
): { economy: EconomyState; success: boolean } {
  const cost =
    type === "active"
      ? ECONOMIC_BALANCE.costs.treatmentActive
      : ECONOMIC_BALANCE.costs.treatmentMedical;

  if (economy.currentBalance < cost) {
    return { economy, success: false };
  }

  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "spend",
    "treatment",
    cost,
    gameState.dayIndex,
    `${type === "active" ? "Active recovery" : "Medical treatment"}`,
  );

  return { economy: updatedEconomy, success: true };
}

/**
 * Spend money on streak protection.
 */
export function spendStreakProtection(
  economy: EconomyState,
  gameState: GameState,
  type: "shield" | "freeze",
): { economy: EconomyState; success: boolean } {
  const cost =
    type === "shield"
      ? ECONOMIC_BALANCE.costs.streakShield
      : ECONOMIC_BALANCE.costs.streakFreeze;

  if (economy.currentBalance < cost) {
    return { economy, success: false };
  }

  const { economy: updatedEconomy } = recordTransaction(
    economy,
    "spend",
    "equipment",
    cost,
    gameState.dayIndex,
    `${type === "shield" ? "Streak shield" : "Streak freeze (3 days)"}`,
  );

  return { economy: updatedEconomy, success: true };
}

/**
 * Get recent transactions.
 */
export function getRecentTransactions(
  economy: EconomyState,
  count: number = 10,
): Transaction[] {
  return economy.transactions.slice(0, count);
}

/**
 * Get economic summary for player display.
 */
export function getEconomicSummary(economy: EconomyState): {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  raceEntrySpending: number;
  prizeEarnings: number;
  workEarnings: number;
  sponsorEarnings: number;
  netWorthVsStart: number;
} {
  const raceEntrySpending = economy.transactions
    .filter((t) => t.category === "race_entry")
    .reduce((sum, t) => sum + t.amount, 0);

  const prizeEarnings = economy.transactions
    .filter((t) => t.category === "race_prize")
    .reduce((sum, t) => sum + t.amount, 0);

  const workEarnings = economy.transactions
    .filter((t) => t.category === "work")
    .reduce((sum, t) => sum + t.amount, 0);

  const sponsorEarnings = economy.transactions
    .filter((t) => t.category === "sponsor")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    balance: economy.currentBalance,
    totalEarned: economy.totalEarned,
    totalSpent: economy.totalSpent,
    raceEntrySpending,
    prizeEarnings,
    workEarnings,
    sponsorEarnings,
    netWorthVsStart: economy.currentBalance - ECONOMIC_BALANCE.startingMoney,
  };
}

/**
 * Check if player can afford something.
 */
export function canAfford(
  economy: EconomyState,
  cost: number,
): boolean {
  return economy.currentBalance >= cost;
}

/**
 * Helper: get position text (1st, 2nd, 3rd, 4th...).
 */
function positionText(position: number): string {
  if (position === 1) return "1st";
  if (position === 2) return "2nd";
  if (position === 3) return "3rd";
  return `${position}th`;
}

/**
 * Helper: get random number between min and max deterministically.
 */
function getRandomBetween(min: number, max: number, seed: number): number {
  const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
  return Math.floor(min + pseudoRandom * (max - min + 1));
}
