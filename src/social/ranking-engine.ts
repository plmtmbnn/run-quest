import type { RankDivision, RankTier } from "./ranking-types";

/**
 * Deterministically maps rank points (RP) to a Tier and Division.
 *
 * - Bronze: 0 - 499 RP (Divisions V to I)
 * - Silver: 500 - 999 RP (Divisions V to I)
 * - Gold: 1000 - 1499 RP (Divisions V to I)
 * - Platinum: 1500 - 1999 RP (Divisions V to I)
 * - Diamond: 2000 - 2499 RP (Divisions V to I)
 * - Elite: 2500+ RP (No divisions)
 */
export function getTierAndDivision(rp: number): {
  tier: RankTier;
  division: RankDivision | null;
} {
  const boundedRp = Math.max(0, rp);
  if (boundedRp >= 2500) {
    return { tier: "Elite", division: null };
  }

  const tierIndex = Math.floor(boundedRp / 500);
  const tiers: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const tier = tiers[tierIndex] || "Bronze";

  const remainingRp = boundedRp % 500;
  const divIndex = Math.floor(remainingRp / 100); // 0 to 4
  const division = (5 - divIndex) as RankDivision; // 5 = lowest, 1 = highest

  return { tier, division };
}

/**
 * Calculates Rank Point (RP) changes and the reasons for it.
 */
export function calculateRankPointsChange(
  outcome: "gold" | "silver" | "bronze" | "finish" | "dnf" | "dns",
  isPerfect: boolean,
  didBeatNemesis: boolean,
  didBeatGhost: boolean,
  underTargetTime: boolean,
): { rpChange: number; breakdown: { reason: string; change: number }[] } {
  const breakdown: { reason: string; change: number }[] = [];

  // Base outcome calculation
  let baseChange = 0;
  switch (outcome) {
    case "gold":
      baseChange = 100;
      break;
    case "silver":
      baseChange = 60;
      break;
    case "bronze":
      baseChange = 30;
      break;
    case "finish":
      baseChange = 10;
      break;
    case "dnf":
      baseChange = -20;
      break;
    case "dns":
      baseChange = 0;
      break;
  }

  if (baseChange !== 0) {
    breakdown.push({
      reason:
        outcome === "dnf"
          ? "Race DNF penalty"
          : `Outcome: ${outcome.toUpperCase()}`,
      change: baseChange,
    });
  }

  // Milestones and bonuses (only if finished)
  if (outcome !== "dnf" && outcome !== "dns") {
    if (isPerfect) {
      breakdown.push({ reason: "Perfect Run (S Grade)", change: 40 });
    }
    if (didBeatNemesis) {
      breakdown.push({ reason: "Defeated Active Rival", change: 30 });
    }
    if (didBeatGhost) {
      breakdown.push({ reason: "Beat Personal Best Ghost", change: 25 });
    }
    if (underTargetTime) {
      breakdown.push({ reason: "Finished under target time", change: 15 });
    }
  }

  const totalRpChange = breakdown.reduce((sum, item) => sum + item.change, 0);

  return {
    rpChange: totalRpChange,
    breakdown,
  };
}

/**
 * Applies RP changes with major tier demotion protection.
 */
export function applyRpChangeWithProtection(
  currentRp: number,
  rpChange: number,
): number {
  const nextRp = Math.max(0, currentRp + rpChange);

  // Demotion boundaries: 500, 1000, 1500, 2000, 2500
  const boundaries = [500, 1000, 1500, 2000, 2500];

  let floor = 0;
  for (const boundary of boundaries) {
    if (currentRp >= boundary) {
      floor = boundary;
    }
  }

  // Demotion protection: if dropping below the major boundary, clamp to that floor
  if (nextRp < floor && currentRp >= floor) {
    return floor;
  }

  return nextRp;
}
