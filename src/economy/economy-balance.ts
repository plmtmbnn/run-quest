/**
 * Economic Balance Configuration (Sprint 26 - Task 1)
 *
 * Defines all costs, earnings, and economic parameters for the game.
 * Carefully balanced to create sustainable gameplay loop.
 */

import type { EconomicBalance, PrizeDistribution } from "./economy-types";

/**
 * Prize distribution by position (as % of prize pool).
 * Positions 1-5 get specified %, rest split remaining 5%.
 */
export const PRIZE_DISTRIBUTION: PrizeDistribution[] = [
  { position: 1, percentage: 40 }, // Winner gets 40%
  { position: 2, percentage: 25 }, // 2nd place gets 25%
  { position: 3, percentage: 15 }, // 3rd place gets 15%
  { position: 4, percentage: 10 }, // 4th place gets 10%
  { position: 5, percentage: 5 }, // 5th place gets 5%
  // Remaining 5% split among 6th+ finishers
];

/**
 * Main economic balance configuration.
 *
 * Design Philosophy:
 * - Start with enough for ~10 local races
 * - Work provides safety net (can always earn more)
 * - Winning 50%+ of races = net positive
 * - Sponsors provide 20-30% of mid-game income
 * - High-tier races are high risk/high reward
 */
export const ECONOMIC_BALANCE: EconomicBalance = {
  // Starting money
  startingMoney: 100,

  // Race entry fees by tier
  entryFees: {
    local: 50, // Accessible early game
    regional: 150, // Mid-game progression
    state: 400, // Requires some success
    national: 1000, // High stakes
    international: 2500, // Elite level
  },

  // Prize pool: 70% of entry fees go to prizes, 30% to "organizers"
  prizePoolPercentage: 0.7,

  // Prize distribution (see above)
  prizeDistribution: PRIZE_DISTRIBUTION,

  // Money earning rates
  earnings: {
    // Work action (from timeline/actions.ts)
    workPerSession: 50,

    // Sponsored training (if you have a sponsor)
    trainingSponsor: { min: 10, max: 30 },

    // Achievement bonuses (one-time rewards)
    achievementBonus: { min: 100, max: 500 },

    // Streak milestones (already defined in Sprint 25)
    streakMilestone: { min: 50, max: 200 },

    // Championship win bonuses (on top of prize money)
    championshipWin: {
      local: 500,
      regional: 1000,
      state: 2500,
      national: 5000,
      international: 10000,
    },
  },

  // Other costs in the game
  costs: {
    treatmentActive: 50, // Active recovery (Sprint 24)
    treatmentMedical: 200, // Medical treatment (Sprint 24)
    streakShield: 100, // Streak shield (Sprint 25)
    streakFreeze: 200, // Streak freeze (Sprint 25)
  },
};

/**
 * Calculate expected prize money for a position.
 */
export function calculateExpectedPrize(
  entryFee: number,
  totalEntrants: number,
  position: number,
): number {
  const prizePool =
    entryFee * totalEntrants * ECONOMIC_BALANCE.prizePoolPercentage;

  // Find position in distribution
  const dist = PRIZE_DISTRIBUTION.find((d) => d.position === position);

  if (dist) {
    return Math.floor(prizePool * (dist.percentage / 100));
  }

  // 6th+ place: split remaining 5% equally among rest
  if (position <= totalEntrants) {
    const remainingPool = prizePool * 0.05;
    const remainingFinishers = Math.max(1, totalEntrants - 5);
    return Math.floor(remainingPool / remainingFinishers);
  }

  return 0;
}

/**
 * Calculate break-even win rate for a race tier.
 *
 * Example: If entry is $150 and average prize for 50% win rate is $180,
 * break-even is ~45% win rate.
 */
export function calculateBreakEvenWinRate(
  raceTier: keyof typeof ECONOMIC_BALANCE.entryFees,
  averageEntrants: number = 50,
): number {
  const entryFee = ECONOMIC_BALANCE.entryFees[raceTier];

  // Assume 50/50 split between 1st and 2nd place for break-even calc
  const avgPrize1st = calculateExpectedPrize(entryFee, averageEntrants, 1);
  const avgPrize2nd = calculateExpectedPrize(entryFee, averageEntrants, 2);
  const avgPrizePerWin = (avgPrize1st + avgPrize2nd) / 2;

  // Break-even: entryFee = avgPrizePerWin * winRate
  const breakEvenRate = entryFee / avgPrizePerWin;

  return Math.round(breakEvenRate * 100); // Return as percentage
}

/**
 * Economic sustainability check for testing.
 */
export function checkEconomicSustainability(): {
  sustainable: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check starting money vs local race cost
  const localAffordability = Math.floor(
    ECONOMIC_BALANCE.startingMoney / ECONOMIC_BALANCE.entryFees.local,
  );

  if (localAffordability < 5) {
    issues.push(
      `Can only afford ${localAffordability} local races with starting money`,
    );
    recommendations.push("Increase starting money or lower local entry fee");
  }

  // Check work earnings vs race costs
  const workSessionsForLocal = Math.ceil(
    ECONOMIC_BALANCE.entryFees.local / ECONOMIC_BALANCE.earnings.workPerSession,
  );

  if (workSessionsForLocal > 2) {
    issues.push(`Takes ${workSessionsForLocal} work sessions for 1 local race`);
    recommendations.push("Increase work pay or lower entry fees");
  }

  // Check prize money is worth it
  const localPrize1st = calculateExpectedPrize(
    ECONOMIC_BALANCE.entryFees.local,
    50,
    1,
  );

  if (localPrize1st < ECONOMIC_BALANCE.entryFees.local * 2) {
    issues.push(
      `Local race 1st place prize (${localPrize1st}) less than 2x entry fee`,
    );
    recommendations.push("Increase prize pool percentage");
  }

  return {
    sustainable: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Get entry fee for a race tier.
 */
export function getEntryFee(
  tier: keyof typeof ECONOMIC_BALANCE.entryFees,
): number {
  return ECONOMIC_BALANCE.entryFees[tier];
}

/**
 * Get work earning amount.
 */
export function getWorkEarnings(): number {
  return ECONOMIC_BALANCE.earnings.workPerSession;
}
