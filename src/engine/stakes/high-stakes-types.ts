/**
 * High-Stakes Race Types (Sprint 24)
 * 
 * Defines championship races, qualification systems, and high-pressure scenarios.
 */

export type StakeLevel = "casual" | "competitive" | "championship" | "qualifying" | "historic";

export type ChampionshipTier = 
  | "local"
  | "regional" 
  | "state"
  | "national"
  | "international"
  | "olympic";

export type QualificationStatus = 
  | "not_qualified"
  | "attempting"
  | "qualified"
  | "failed";

/**
 * Represents a high-stakes race with consequences.
 */
export interface HighStakesRace {
  id: string;
  name: string;
  locationId: string;
  
  /** What makes this race special */
  stakeLevel: StakeLevel;
  championship?: ChampionshipDetails;
  qualification?: QualificationDetails;
  
  /** Entry requirements */
  requirements: {
    minRating?: number;
    minLevel?: number;
    qualificationNeeded?: boolean;
    storyChapterRequired?: number;
  };
  
  /** What's at stake */
  consequences: {
    victory: RaceConsequence[];
    defeat: RaceConsequence[];
    dnf: RaceConsequence[];
  };
  
  /** Race pressure modifiers */
  pressureLevel: number; // 0-100, affects mental state
  mentalDemand: number; // Additional willpower requirement
  
  /** Narrative elements */
  preRaceNarrative: string[];
  midRaceNarrative: string[];
  postVictoryNarrative: string[];
  postDefeatNarrative: string[];
  
  /** Special rules or conditions */
  specialRules?: string[];
}

/**
 * Championship race details.
 */
export interface ChampionshipDetails {
  tier: ChampionshipTier;
  title: string; // e.g., "Local 5K Champion"
  year: number;
  fieldSize: number; // Number of competitors
  eliteCompetition: boolean;
  
  /** What you get for winning */
  rewards: {
    title?: string;
    rating?: number;
    prize?: number; // Money
    unlock?: string[]; // Location IDs or features
    reputation?: number;
  };
  
  /** Special championship mechanics */
  eliminationFormat?: boolean;
  qualifyingRounds?: number;
  topNAdvance?: number;
}

/**
 * Qualification details for major races.
 */
export interface QualificationDetails {
  targetRace: string;
  targetTime?: number; // Seconds - must finish under this
  targetPlace?: number; // Position - must place top N
  description: string;
  
  /** What happens if you qualify */
  onQualify: {
    unlocks: string[];
    rating: number;
    reputation: number;
    narrative: string;
  };
  
  /** What happens if you fail */
  onFail: {
    cooldownDays: number; // How long until you can retry
    narrative: string;
  };
}

/**
 * Consequences of race outcomes.
 */
export interface RaceConsequence {
  type: "rating" | "reputation" | "unlock" | "money" | "story" | "relationship" | "mental";
  value: number | string | boolean;
  description: string;
}

/**
 * Mental pressure system for high-stakes races.
 */
export interface PressureState {
  currentPressure: number; // 0-100
  sources: PressureSource[];
  effects: PressureEffect[];
}

export interface PressureSource {
  source: "championship" | "qualification" | "rival" | "spectators" | "media" | "personal";
  intensity: number; // 0-100
  description: string;
}

export interface PressureEffect {
  threshold: number; // Pressure level that triggers this
  effect: "focus_bonus" | "focus_penalty" | "pace_variance" | "decision_difficulty" | "clutch_moment";
  magnitude: number;
  description: string;
}

/**
 * Race field - competitors in the race.
 */
export interface RaceField {
  totalCompetitors: number;
  eliteRunners: EliteRunner[];
  averageRating: number;
  recordHolder?: {
    name: string;
    time: number;
    year: number;
  };
}

export interface EliteRunner {
  name: string;
  rating: number;
  specialty: "speed" | "stamina" | "tactical" | "clutch";
  personality: "aggressive" | "conservative" | "unpredictable" | "steady";
  backstory: string;
  isRival?: boolean;
}

/**
 * Track state for high-stakes races.
 */
export interface HighStakesState {
  activeChampionships: Record<string, ChampionshipProgress>;
  qualificationStatus: Record<string, QualificationStatus>;
  championshipsWon: ChampionshipRecord[];
  qualificationHistory: QualificationAttempt[];
  pressure: PressureState;
}

export interface ChampionshipProgress {
  championshipId: string;
  round: number;
  qualified: boolean;
  position?: number;
  timeTrialed?: number;
}

export interface ChampionshipRecord {
  championshipId: string;
  tier: ChampionshipTier;
  title: string;
  dayWon: number;
  time: number;
  margin: number; // Seconds ahead of 2nd place
}

export interface QualificationAttempt {
  targetRace: string;
  dayAttempted: number;
  result: "qualified" | "failed";
  time?: number;
  place?: number;
  margin?: number; // How close/far from qualifying
}

export const DEFAULT_HIGH_STAKES_STATE: HighStakesState = {
  activeChampionships: {},
  qualificationStatus: {},
  championshipsWon: [],
  qualificationHistory: [],
  pressure: {
    currentPressure: 0,
    sources: [],
    effects: [],
  },
};

/**
 * Pressure thresholds and effects.
 */
export const PRESSURE_EFFECTS: PressureEffect[] = [
  {
    threshold: 20,
    effect: "focus_bonus",
    magnitude: 5,
    description: "Light pressure sharpens your focus",
  },
  {
    threshold: 40,
    effect: "pace_variance",
    magnitude: 3,
    description: "Moderate pressure makes pacing harder",
  },
  {
    threshold: 60,
    effect: "focus_penalty",
    magnitude: -10,
    description: "High pressure affects decision making",
  },
  {
    threshold: 80,
    effect: "clutch_moment",
    magnitude: 0,
    description: "Extreme pressure - sink or swim",
  },
];
