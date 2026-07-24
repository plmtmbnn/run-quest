/**
 * Ghost Runner Pool Configuration
 * Sprint 33 - Feature 5: Expand Ghost Rival Pool (10+ runners)
 */

export interface GhostRunner {
  name: string;
  skillMultiplier: number; // 0.85 = 85% of baseline, 1.15 = 115%
  consistency: number; // 0.65-0.95 (how reliable they are)
  nationality?: string;
}

/**
 * Pool of 15 ghost runners with varied skill levels
 */
export const GHOST_RUNNER_POOL: GhostRunner[] = [
  // Elite Runners (Top 10%) - Skill 1.10-1.15
  { name: "Marcus Rivera", skillMultiplier: 1.15, consistency: 0.95, nationality: "MX" },
  { name: "Ellie Park", skillMultiplier: 1.12, consistency: 0.92, nationality: "KR" },
  { name: "Kenji Nakamura", skillMultiplier: 1.10, consistency: 0.90, nationality: "JP" },
  
  // Strong Runners (Top 25%) - Skill 1.03-1.07
  { name: "Sarah Chen", skillMultiplier: 1.07, consistency: 0.88, nationality: "CN" },
  { name: "Alex Santos", skillMultiplier: 1.05, consistency: 0.85, nationality: "BR" },
  { name: "Maria Gonzalez", skillMultiplier: 1.03, consistency: 0.87, nationality: "ES" },
  
  // Mid-Pack Runners (50%) - Skill 0.96-1.00
  { name: "Jordan Thompson", skillMultiplier: 1.00, consistency: 0.80, nationality: "US" },
  { name: "Casey Williams", skillMultiplier: 0.98, consistency: 0.82, nationality: "GB" },
  { name: "Taylor Anderson", skillMultiplier: 0.97, consistency: 0.85, nationality: "AU" },
  { name: "Riley Martinez", skillMultiplier: 0.96, consistency: 0.78, nationality: "AR" },
  
  // Back-of-Pack (Bottom 25%) - Skill 0.85-0.92
  { name: "Jamie Lee", skillMultiplier: 0.92, consistency: 0.75, nationality: "CA" },
  { name: "Morgan Davis", skillMultiplier: 0.90, consistency: 0.72, nationality: "NZ" },
  { name: "Sam Rodriguez", skillMultiplier: 0.88, consistency: 0.70, nationality: "CL" },
  { name: "Avery Kim", skillMultiplier: 0.86, consistency: 0.68, nationality: "KR" },
  { name: "Dakota Singh", skillMultiplier: 0.85, consistency: 0.65, nationality: "IN" },
];

/**
 * Generate a race field of ghost opponents
 * @param count Number of opponents to generate (default 12)
 * @param playerSkillLevel Optional player skill level to balance field around
 * @returns Array of ghost runners with race-day variance
 */
export function generateRaceField(
  count: number = 12,
  playerSkillLevel: number = 1.0
): Array<GhostRunner & { raceMultiplier: number }> {
  // Shuffle and select subset
  const shuffled = [...GHOST_RUNNER_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, GHOST_RUNNER_POOL.length));
  
  // Add race-day variance (±5% based on consistency)
  return selected.map(ghost => {
    const varianceRange = (1 - ghost.consistency) * 0.1; // Lower consistency = more variance
    const variance = (Math.random() - 0.5) * varianceRange;
    const raceMultiplier = ghost.skillMultiplier * (1 + variance);
    
    return {
      ...ghost,
      raceMultiplier: Math.max(0.7, Math.min(1.2, raceMultiplier)), // Clamp between 70%-120%
    };
  });
}

/**
 * Generate ghost finishing time based on base time and skill multiplier
 * @param baseTime Player's finishing time in seconds
 * @param skillMultiplier Ghost's skill multiplier
 * @returns Finishing time in seconds
 */
export function calculateGhostTime(
  baseTime: number,
  skillMultiplier: number
): number {
  // Higher multiplier = faster time (inverse relationship)
  // 1.15 multiplier should finish ~13% faster than baseline
  const timeMultiplier = 2 - skillMultiplier; // 1.15 -> 0.85x time
  return Math.round(baseTime * timeMultiplier);
}
