/**
 * Economy Types (Sprint 26 - Task 1)
 * 
 * Core types for the unified economy system.
 * Uses 'money' from timeline engine as primary currency.
 */

export type TransactionCategory =
  | "race_entry"
  | "race_prize"
  | "work"
  | "treatment"
  | "equipment"
  | "achievement"
  | "sponsor"
  | "milestone"
  | "championship";

export type TransactionType = "earn" | "spend";

/**
 * A single economic transaction.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  balanceAfter: number;
  dayIndex: number;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Economic state tracking all financial activity.
 */
export interface EconomyState {
  transactions: Transaction[];
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  lastTransactionDay: number;
}

/**
 * Race tier for entry fee calculations.
 */
export type RaceTier = "local" | "regional" | "state" | "national" | "international";

/**
 * Prize money distribution configuration.
 */
export interface PrizeDistribution {
  position: number;
  percentage: number; // % of prize pool
}

/**
 * Economic balance configuration for the entire game.
 */
export interface EconomicBalance {
  // Starting amounts
  startingMoney: number;
  
  // Race entry costs by tier
  entryFees: Record<RaceTier, number>;
  
  // Prize pool configuration
  prizePoolPercentage: number; // % of total entry fees that go to prizes
  prizeDistribution: PrizeDistribution[];
  
  // Money earning rates
  earnings: {
    workPerSession: number;
    trainingSponsor: { min: number; max: number };
    achievementBonus: { min: number; max: number };
    streakMilestone: { min: number; max: number };
    championshipWin: Record<RaceTier, number>;
  };
  
  // Other costs
  costs: {
    treatmentActive: number;
    treatmentMedical: number;
    streakShield: number;
    streakFreeze: number;
  };
}

export const DEFAULT_ECONOMY_STATE: EconomyState = {
  transactions: [],
  totalEarned: 0,
  totalSpent: 0,
  currentBalance: 0,
  lastTransactionDay: 0,
};
