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
