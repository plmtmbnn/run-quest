import type { ActiveBreakingPoint } from "@/engine/breaking-points/breaking-types";
import type { RunnerProfile } from "@/runner/runner-types";

export type { ActiveBreakingPoint };

export type Shoe = "daily_trainer" | "carbon_racer" | "lightweight" | "trail";

export type Nutrition = "water" | "electrolyte" | "energy_gel" | "caffeine";

export type Gear = "cap" | "sunglasses" | "arm_sleeves" | "hydration_vest";

export type Warmup = "none" | "dynamic" | "full";

export type PacingPlan =
  | "negative_split"
  | "steady"
  | "aggressive"
  | "conservative"
  | "jog"
  | "cruise"
  | "push"
  | "sprint";

export type Mindset = "calm" | "confident" | "fearless";

export interface Preparation {
  shoes: Shoe;
  nutrition: Nutrition[];
  gear: Gear[];
  warmup: Warmup;
  pacing: PacingPlan;
  mindset: Mindset;
  warmupBonus?: "perfect" | "good" | "normal";
}

export type Weather =
  | "sunny"
  | "cloudy"
  | "rain"
  | "storm"
  | "hot"
  | "cold"
  | "fog";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export type Surface = "road" | "track" | "trail";

export type Elevation = "flat" | "rolling" | "hilly";

export interface LocalizedText {
  en: string;
  id: string;
}

export interface Wind {
  direction: "north" | "south" | "east" | "west";
  speed: number; // in km/h
}

export interface Environment {
  weather: Weather;
  temperature: number; // in celsius
  humidity: number; // 0 to 100
  wind: Wind;
  timeOfDay: TimeOfDay;
}

export interface EnvironmentModifiers {
  paceModifier: number;
  fatigueModifier: number;
  hydrationModifier: number;
  focusModifier: number;
  confidenceModifier: number;
}

export interface Checkpoint {
  km: number;
  eventPool: string[];
}

export interface Race {
  title: LocalizedText;
  description: LocalizedText;
  distance: number; // in km
  surface: Surface;
  elevation: Elevation;
  checkpoints: Checkpoint[];
}

export interface Objective {
  targetTime: number; // in seconds
  bonusCondition?: string;
}

export interface StorySeed {
  mood: "optimistic" | "tense" | "survival" | "competitive";
}

export interface Scenario {
  id: string;
  date: string; // ISODate string
  environment: Environment;
  race: Race;
  objective: Objective;
  storySeed: StorySeed;
  analysis?: RaceAnalysis;
}

export type DailyChallenge = Scenario;

export interface RaceEntry {
  id: string;
  scenarioId: string;
  title: LocalizedText;
  category:
    | "road"
    | "trail"
    | "track"
    | "ultra"
    | "community"
    | "event"
    | "virtual";
  surface: Surface;
  distance: number;
  difficulty: number; // 1 to 5 stars
  estimatedDuration: number; // in seconds
  reward: number;
  tags: string[];
  featured: boolean;
  availability: "available" | "locked" | "completed";
  scenario: Scenario;
}

export interface DailyTheme {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  weatherOverride?: Weather;
  elevationOverride?: Elevation;
  rewardMultiplier: number;
}

export interface DailyRaceBoard {
  id: string;
  publishedAt: string;
  title: LocalizedText;
  entries: RaceEntry[];
  entryPolicy: {
    maxEntries: number;
  };
  theme?: DailyTheme;
}

export interface Player {
  id: string;
}

export interface SimulationInput {
  player: Player;
  challenge: DailyChallenge;
  preparation: Preparation;
  seed: number;
  runnerProfile?: RunnerProfile;
}

export interface Effect {
  stamina: number; // change to stamina/energy
  hydration: number; // change to hydration
  morale: number; // change to morale/focus
  pace: number; // change to pace (seconds/km)
}

export interface RaceEvent {
  km: number;
  title: LocalizedText;
  description: LocalizedText;
  effect: Effect;
}

export interface Story {
  headline: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
  lessons: LocalizedText[];
}

export type Outcome = "gold" | "silver" | "bronze" | "finish" | "dnf" | "dns";

export type Grade = "S" | "A" | "B" | "C" | "D" | "F";

export interface SimulationResult {
  finishTime: number; // in seconds
  score: number;
  grade: Grade;
  events: RaceEvent[];
  outcome: Outcome;
  story: Story;
  stateLog: SimulationState[];
}

export interface SimulationState {
  distanceCovered: number;
  totalDistance: number; // Total race distance in km (Sprint 20)
  energy: number; // 0 to 100
  hydration: number; // 0 to 100
  focus: number; // 0 to 100
  fatigue: number; // 0 to 100
  confidence: number; // 0 to 100
  accumulatedTime: number; // in seconds
  eventsResolved: RaceEvent[];
  // Sprint 13.1 Expanded Runner Attributes
  muscleFatigue: number; // 0 to 100
  mentalFatigue: number; // 0 to 100
  momentum: number; // 0 to 100
  paceStability: number; // 0 to 100
  riskLevel: number; // 0 to 100
  // Sprint 13 Interactive Decision Engine additions
  decisionTimeline?: Record<number, string>; // Maps KM -> DecisionCard ID
  decisionHistory?: ChoiceBehavior[]; // Tracks historical choice behaviors
  pendingDecision?: DecisionCard; // Track currently active decision waiting to be resolved
  randomSeedState?: number; // Stores the seed state for the random generator
  specialEventKm?: number; // Scheduled km for rare event
  specialEventId?: string; // Rare event ID
  delayedEffects?: {
    km: number;
    stamina: number;
    hydration: number;
    morale: number;
    pace: number;
  }[];
  accumulatedStateLog?: Omit<SimulationState, "accumulatedStateLog">[]; // Complete history of state logs
  opponents?: OpponentState[];
  currentPacing?: PacingPlan;
  // Soul update properties
  runnersHighTicks?: number;
  isRunnersHighActive?: boolean;
  runnersHighCooldown?: number;
  hasTriggeredWall?: boolean;
  hasTriggeredCramp?: boolean;
  activeBreakingPoint?: ActiveBreakingPoint | null;
  shownBreakingPoints?: string[];
}

export interface OpponentState {
  id: string;
  name: string;
  archetype: "frontrunner" | "splitter" | "steady";
  distanceCovered: number;
  accumulatedTime: number;
  energy: number;
  hydration: number;
  isDNF: boolean;
  paceSeconds: number;
  isNemesis?: boolean;
}

export type DecisionCategory =
  | "environment"
  | "physical"
  | "tactical"
  | "mental"
  | "unexpected";

export type ChoiceBehavior = "aggressive" | "balanced" | "conservative";

export interface DecisionChoice {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  effects: Effect; // maps stamina, hydration, morale (focus), pace
  behavior: ChoiceBehavior;
}

export interface DecisionCard {
  id: string;
  title: LocalizedText;
  category: DecisionCategory;
  description: LocalizedText;
  rarity: "common" | "uncommon" | "rare";
  choices: DecisionChoice[];
}

export interface DecisionPrompt {
  km: number;
  decisionCard: DecisionCard;
  timeoutSeconds: number;
}

export type SimulationStepResult =
  | { type: "decision"; state: SimulationState; prompt: DecisionPrompt }
  | {
      type: "breaking_point";
      state: SimulationState;
      breakingPoint: ActiveBreakingPoint;
    }
  | { type: "step"; state: SimulationState }
  | { type: "finished"; result: SimulationResult };

export interface RaceSegment {
  id: string;
  type: "flat" | "rolling" | "climb" | "descent" | "sprint";
  distance: number; // in km
  elevation: Elevation;
  weather: Weather;
  terrain: Surface;
  difficulty: number; // 1 to 5
  eventWeight: number;
}

export interface WeatherTimeline {
  id: string;
  checkpoints: number[]; // km checkpoints
  temperature: number[];
  humidity: number[];
  wind: Wind[];
  rain: boolean[];
  visibility: number[];
}

export interface CoachBriefing {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  recommendations: LocalizedText[];
  warnings: LocalizedText[];
}

export interface RaceAnalysis {
  id: string;
  raceId: string;
  weather: WeatherTimeline;
  elevation: Elevation;
  segments: RaceSegment[];
  hazards: LocalizedText[];
  briefing: CoachBriefing;
  knownConditions: string[];
  hiddenConditions: string[];
}

export interface Forecast {
  temperature: number;
  weather: Weather;
  humidity: number;
  windProbability: number;
  rainProbability: number;
  confidence: number;
}

export interface HiddenCondition {
  id: string;
  category: string;
  visibility: "hidden" | "revealed";
  revealTrigger: string;
}

export interface CoachPreview {
  title: LocalizedText;
  summary: LocalizedText;
  recommendation: LocalizedText;
}

export interface TomorrowPreview {
  id: string;
  raceId: string;
  category: RaceEntry["category"];
  distance: number;
  surface: Surface;
  difficulty: number;
  forecast: Forecast;
  knownConditions: string[];
  hiddenConditions: HiddenCondition[];
  coachPreview: CoachPreview;
}
