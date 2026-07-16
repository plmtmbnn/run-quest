/**
 * Atmospheric Details Types (Sprint 24)
 * 
 * Environmental storytelling, sensory details, and immersive moments.
 */

export type AtmosphericLayer = 
  | "environment"
  | "crowd"
  | "internal"
  | "competitor"
  | "narrative";

export type MomentIntensity = "subtle" | "moderate" | "dramatic" | "epic";

/**
 * An atmospheric moment during a race.
 */
export interface AtmosphericMoment {
  id: string;
  layer: AtmosphericLayer;
  intensity: MomentIntensity;
  
  /** When this moment can occur */
  triggers: MomentTrigger[];
  
  /** The atmospheric text/description */
  description: string;
  
  /** Optional sensory details */
  sensory?: {
    visual?: string;
    audio?: string;
    physical?: string;
    emotional?: string;
  };
  
  /** Gameplay impact (if any) */
  impact?: {
    mental?: number;
    motivation?: number;
    focus?: number;
  };
}

export interface MomentTrigger {
  condition: "distance" | "pace" | "position" | "energy" | "random" | "breaking_point";
  value?: number | string;
  probability?: number; // For random triggers
}

/**
 * Environmental atmosphere for different conditions.
 */
export interface EnvironmentalAtmosphere {
  timeOfDay: "dawn" | "morning" | "midday" | "afternoon" | "evening" | "night";
  weather: string; // From weather system
  season: "spring" | "summer" | "fall" | "winter";
  
  /** Atmospheric descriptions */
  skyDescription: string;
  temperatureFeeling: string;
  windDescription: string;
  
  /** Sensory details */
  sounds: string[];
  sights: string[];
  feelings: string[];
}

/**
 * Crowd atmosphere and reactions.
 */
export interface CrowdAtmosphere {
  size: "sparse" | "moderate" | "large" | "massive";
  energy: number; // 0-100
  
  /** Location-specific crowd behaviors */
  behaviors: CrowdBehavior[];
  
  /** Dynamic reactions to race events */
  reactions: {
    leadChange: string[];
    finalKick: string[];
    struggle: string[];
    victory: string[];
  };
}

export interface CrowdBehavior {
  location: string; // e.g., "halfway point", "final mile"
  description: string;
  energyBonus: number; // Mental boost from crowd
}

/**
 * Internal monologue and runner thoughts.
 */
export interface InternalMonologue {
  context: "struggling" | "flowing" | "deciding" | "suffering" | "triumphant";
  thoughts: string[];
  doubts?: string[];
  motivations?: string[];
}

/**
 * Competitor interactions and dynamics.
 */
export interface CompetitorMoment {
  type: "surging" | "fading" | "battling" | "drafting" | "breaking_away";
  description: string;
  competitorName?: string;
  tacticalImplication: string;
}

/**
 * Story beats that can occur during races.
 */
export interface NarrativeBeat {
  id: string;
  title: string;
  trigger: MomentTrigger;
  setup: string;
  climax: string;
  resolution: string;
  significance: "personal" | "competitive" | "historic" | "transformative";
}

/**
 * Track atmospheric state during a race.
 */
export interface AtmosphericState {
  currentMoments: AtmosphericMoment[];
  environmentalAtmosphere: EnvironmentalAtmosphere;
  crowdAtmosphere: CrowdAtmosphere;
  narrativeBeats: NarrativeBeat[];
  immersionLevel: number; // 0-100, affects how detailed descriptions are
}

/**
 * Configuration for atmospheric detail generation.
 */
export interface AtmosphericConfig {
  detailLevel: "minimal" | "standard" | "rich" | "cinematic";
  frequencyMod: number; // How often moments appear (0.5-2.0)
  focusLayers: AtmosphericLayer[]; // Which layers to emphasize
  narrativeMode: boolean; // Enable story beats
}

export const DEFAULT_ATMOSPHERIC_CONFIG: AtmosphericConfig = {
  detailLevel: "standard",
  frequencyMod: 1.0,
  focusLayers: ["environment", "crowd", "internal", "competitor"],
  narrativeMode: true,
};
