export type Shoe = "daily_trainer" | "carbon_racer" | "lightweight" | "trail";

export type Nutrition = "water" | "electrolyte" | "energy_gel" | "none";

export type Gear = "cap" | "sunglasses" | "arm_sleeves" | "hydration_vest";

export type Warmup = "none" | "dynamic" | "full";

export type PacingPlan =
  | "negative_split"
  | "steady"
  | "aggressive"
  | "conservative";

export type Mindset = "calm" | "confident" | "fearless";

export interface Preparation {
  shoes: Shoe;
  nutrition: Nutrition;
  gear: Gear[];
  warmup: Warmup;
  pacing: PacingPlan;
  mindset: Mindset;
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

export interface DailyRaceBoard {
  id: string;
  publishedAt: string;
  title: LocalizedText;
  entries: RaceEntry[];
  entryPolicy: {
    maxEntries: number;
  };
}

export interface Player {
  id: string;
}

export interface SimulationInput {
  player: Player;
  challenge: DailyChallenge;
  preparation: Preparation;
  seed: number;
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


// Running simulation state at checkpoints
export interface SimulationState {
  distanceCovered: number;
  energy: number; // 0 to 100
  hydration: number; // 0 to 100
  focus: number; // 0 to 100
  fatigue: number; // 0 to 100
  confidence: number; // 0 to 100
  accumulatedTime: number; // in seconds
  eventsResolved: RaceEvent[];
}
