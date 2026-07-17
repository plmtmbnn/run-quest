/**
 * Season Types (Sprint 24)
 *
 * Defines racing seasons, qualification windows, and seasonal progression.
 */

export type SeasonPhase =
  | "preseason"
  | "early"
  | "mid"
  | "late"
  | "championship"
  | "offseason";

export type SeasonTier = "local" | "regional" | "national" | "international";

/**
 * Represents a racing season (e.g., Spring Marathon Season).
 */
export interface Season {
  id: string;
  name: string;
  tier: SeasonTier;

  /** Season timing (in days from year start) */
  startDay: number;
  endDay: number;

  /** Phases within the season */
  phases: SeasonPhaseDefinition[];

  /** Season objectives */
  primaryGoal: string;
  secondaryGoals: string[];

  /** Available races during season */
  races: string[]; // Race IDs
  championship?: string; // Championship race ID

  /** Qualification system */
  qualificationSystem?: QualificationSystem;

  /** Season rewards */
  rewards: {
    completion: SeasonReward;
    championship: SeasonReward;
    allGoals: SeasonReward;
  };
}

export interface SeasonPhaseDefinition {
  phase: SeasonPhase;
  startDay: number;
  endDay: number;
  label: string;
  description: string;
  focus: string; // e.g., "Build base fitness", "Peak performance"
}

export interface QualificationSystem {
  method: "time_standard" | "points" | "placement" | "ranking";
  requirements: {
    timeStandard?: number; // Must run faster than this
    pointsNeeded?: number;
    topNPlaces?: number;
    minRanking?: number;
  };
  qualificationWindow: {
    startDay: number;
    endDay: number;
  };
  description: string;
}

export interface SeasonReward {
  rating?: number;
  money?: number;
  unlocks?: string[];
  title?: string;
  reputation?: number;
}

/**
 * Season points system for multi-race qualification.
 */
export interface PointsSystem {
  raceResults: {
    place: number;
    points: number;
  }[];
  bonuses: {
    personalBest: number;
    courseRecord: number;
    dominantVictory: number; // Win by large margin
  };
}

/**
 * Track player's progress through a season.
 */
export interface SeasonProgress {
  seasonId: string;
  enrolled: boolean;
  currentPhase: SeasonPhase;

  /** Races completed this season */
  racesCompleted: string[];

  /** Goals completed */
  goalsCompleted: string[];

  /** Qualification progress */
  qualified: boolean;
  qualificationAttempts: number;
  points?: number; // For points-based systems
  bestTime?: number; // For time-based systems

  /** Season statistics */
  victories: number;
  podiums: number; // Top 3 finishes
  personalBests: number;
}

/**
 * State tracking for all seasons.
 */
export interface SeasonState {
  currentSeasonId?: string;
  activeSeasons: Record<string, SeasonProgress>;
  completedSeasons: string[];
  seasonHistory: SeasonHistoryRecord[];
}

export interface SeasonHistoryRecord {
  seasonId: string;
  tier: SeasonTier;
  year: number;
  goalsCompleted: number;
  totalGoals: number;
  championshipPosition?: number;
  qualified: boolean;
  rating: number;
}

export const DEFAULT_SEASON_STATE: SeasonState = {
  activeSeasons: {},
  completedSeasons: [],
  seasonHistory: [],
};

/**
 * Standard points system for placement.
 */
export const STANDARD_POINTS: PointsSystem = {
  raceResults: [
    { place: 1, points: 100 },
    { place: 2, points: 80 },
    { place: 3, points: 60 },
    { place: 4, points: 50 },
    { place: 5, points: 45 },
    { place: 6, points: 40 },
    { place: 7, points: 36 },
    { place: 8, points: 32 },
    { place: 9, points: 29 },
    { place: 10, points: 26 },
  ],
  bonuses: {
    personalBest: 10,
    courseRecord: 25,
    dominantVictory: 20,
  },
};
