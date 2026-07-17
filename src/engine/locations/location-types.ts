/**
 * Location Types (Sprint 24)
 *
 * Defines location characteristics, atmosphere, and personality.
 */

export type LocationTier =
  | "local"
  | "regional"
  | "national"
  | "international"
  | "legendary";

export type LocationTerrain =
  | "flat_road"
  | "hilly_road"
  | "mountain_trail"
  | "coastal_path"
  | "urban_streets"
  | "forest_trail"
  | "desert_highway"
  | "alpine_pass";

export type WeatherCondition =
  | "perfect"
  | "hot"
  | "cold"
  | "rainy"
  | "windy"
  | "stormy"
  | "snowy"
  | "foggy";

export type LocationAtmosphere =
  | "intimate"
  | "energetic"
  | "challenging"
  | "prestigious"
  | "hostile"
  | "inspiring"
  | "meditative"
  | "electric";

/**
 * A race location with personality and story.
 */
export interface Location {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;

  /** Location tier determines prestige and difficulty */
  tier: LocationTier;

  /** Physical characteristics */
  terrain: LocationTerrain;
  elevation: number; // meters
  elevationGain?: number; // for courses with significant climbing

  /** Typical weather patterns (can be overridden per race) */
  typicalWeather: WeatherCondition[];

  /** Atmosphere and personality */
  atmosphere: LocationAtmosphere;
  description: string;

  /** Story and lore */
  lore: string[];
  famousRunners?: string[];
  courseRecords?: {
    distance: number;
    time: number; // seconds
    holder: string;
    year: number;
  }[];

  /** Gameplay modifiers */
  difficultyModifier: number; // 0.8-1.5 (easier to harder)
  crowdSupport: number; // 0-1 (affects mental state)

  /** Visual identity */
  colors: {
    primary: string;
    secondary: string;
  };
  landmark?: string;

  /** Unlock requirements */
  unlockRequirements?: {
    minLevel?: number;
    minRating?: number;
    storyChapter?: number;
  };
}

/**
 * Weather impact on performance.
 */
export interface WeatherImpact {
  condition: WeatherCondition;
  label: string;
  description: string;
  speedModifier: number; // 0.8-1.2
  staminaModifier: number;
  mentalImpact: number; // -10 to +10
  icon: string;
}

/**
 * Location personality traits that influence narrative.
 */
export interface LocationPersonality {
  locationId: string;

  /** Pre-race flavor text variations */
  arrivalTexts: string[];

  /** During-race atmosphere descriptions */
  raceAtmosphere: string[];

  /** Post-race reflections */
  victoryTexts: string[];
  defeatTexts: string[];

  /** Location-specific events */
  specialEvents?: {
    name: string;
    description: string;
    probability: number; // 0-1
    effect: string;
  }[];

  /** Memorable moments */
  landmarks: {
    distance: number; // km into race
    name: string;
    description: string;
  }[];
}

/**
 * Track player's relationship with locations.
 */
export interface LocationHistory {
  locationId: string;
  timesRaced: number;
  bestTime?: number;
  lastRaceDate: number; // dayIndex
  victories: number;
  defeats: number;
  personalBests: number;
  memorableMoments: {
    dayIndex: number;
    description: string;
    significance: "triumph" | "breakthrough" | "disaster" | "rivalry";
  }[];
}

/**
 * State tracking for all locations.
 */
export interface LocationState {
  discovered: string[]; // location IDs
  unlocked: string[];
  history: Record<string, LocationHistory>;
  favoriteLocation?: string;
}

export const DEFAULT_LOCATION_STATE: LocationState = {
  discovered: ["local_5k_park"],
  unlocked: ["local_5k_park"],
  history: {},
};
