export type FlowLevel = "building" | "flowing" | "zone";

export interface FlowState {
  score: number; // 0 to 100
  level: FlowLevel;
  isInTheZone: boolean;
  consecutiveOptimalPaceKm: number;
}
