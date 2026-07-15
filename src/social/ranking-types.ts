export type RankTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Elite";

export type RankDivision = 5 | 4 | 3 | 2 | 1;

export interface Competitor {
  id: string;
  name: string;
  region: string;
  rp: number;
  tier: RankTier;
  division: RankDivision | null;
  archetype: "frontrunner" | "splitter" | "steady";
  level: number;
  lastRunDistance?: number;
}

export interface Club {
  id: string;
  name: string;
  description: { en: string; id: string };
  bonusDesc: { en: string; id: string };
  emblem: string;
  colorClass: string;
  weeklyGoalKm: number;
}

export interface ClubState {
  joinedClubId: string | null;
  weeklyProgressKm: number;
  weeklyContributedKm: number;
  members: { name: string; contributionKm: number; level: number }[];
}

export interface RivalActivity {
  id: string;
  rivalId: string;
  rivalName: string;
  timestamp: string; // ISO or relative
  action: { en: string; id: string };
  attributeImproved?: string;
}
