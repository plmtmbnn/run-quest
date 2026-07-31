/**
 * Race Entrants Engine
 * Dynamically calculates registered runners for race occurrences
 */

import type { CategoryId, RaceOccurrence, RaceTier } from "./race-calendar-types";

interface FieldSizeConfig {
  min: number;
  max: number;
  typical: number;
}

const FIELD_SIZE_BY_TIER: Record<RaceTier, FieldSizeConfig> = {
  local: { min: 20, max: 100, typical: 50 },
  regional: { min: 50, max: 300, typical: 150 },
  state: { min: 100, max: 500, typical: 250 },
  national: { min: 200, max: 1500, typical: 800 },
  international: { min: 500, max: 5000, typical: 2500 },
};

/**
 * Calculate number of entrants for a race based on days until race
 * 
 * @param race - The race occurrence
 * @param currentDayIndex - Current game day
 * @param raceDayIndex - Day the race occurs
 * @returns Number of registered entrants
 */
/**
 * Get maximum field size for a race or category
 */
export function getMaxEntrantsForRace(race: RaceOccurrence, categoryId?: CategoryId): number {
  if (categoryId && race.categories && race.categories.length > 0) {
    const cat = race.categories.find(c => c.id === categoryId);
    if (cat?.maxEntrants) {
      return cat.maxEntrants;
    }
  }

  if (race.maxEntrants) {
    return race.maxEntrants;
  }

  if (race.categories && race.categories.length > 0) {
    const catId = categoryId || race.selectedCategoryId;
    const selectedCategory = race.categories.find(
      c => c.id === catId
    ) || race.categories[0];
    
    if (selectedCategory?.maxEntrants) {
      return selectedCategory.maxEntrants;
    }
  }

  const config = FIELD_SIZE_BY_TIER[race.tier];
  return config?.typical ?? 50;
}

/**
 * Calculate number of entrants for a race based on days until race
 * 
 * @param race - The race occurrence
 * @param currentDayIndex - Current game day
 * @param raceDayIndex - Day the race occurs
 * @param categoryId - Optional category ID for category-specific calculation
 * @returns Number of registered entrants
 */
export function calculateDynamicEntrants(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number,
  categoryId?: CategoryId
): number {
  const daysUntilRace = raceDayIndex - currentDayIndex;
  
  // Get max field size for this race or specific category
  const maxEntrants = getMaxEntrantsForRace(race, categoryId);
  
  // If race has passed, return max
  if (daysUntilRace <= 0) return maxEntrants;
  
  // Calculate base entrants from timeline
  const baseEntrants = calculateBaseEntrantsByTimeline(
    daysUntilRace,
    maxEntrants,
    race.tier
  );
  
  // Add seeded variance for consistency per category/race
  const seedKey = `${race.scheduleId}_${raceDayIndex}_${categoryId || race.selectedCategoryId || "default"}`;
  const variance = getSeededVariance(seedKey);
  const finalEntrants = Math.floor(baseEntrants * (1 + variance));
  
  // Always ensure between 1 and maxEntrants
  return Math.max(1, Math.min(maxEntrants, finalEntrants));
}

/**
 * Calculate entrants based on registration timeline curve
 */
function calculateBaseEntrantsByTimeline(
  daysUntilRace: number,
  maxEntrants: number,
  tier: RaceTier
): number {
  // Early bird period (30+ days out)
  if (daysUntilRace > 30) {
    const earlyBirdRate = tier === "international" ? 0.15 : 0.05;
    return Math.floor(maxEntrants * earlyBirdRate);
  }
  
  // Registration curve (0-30 days)
  const timeProgress = 1 - (daysUntilRace / 30); // 0 → 1 as race approaches
  const baseFillRate = Math.pow(timeProgress, 1.5); // Exponential curve
  
  // Last-minute rush (final 7 days for international, 3 days for others)
  const rushThreshold = tier === "international" ? 7 : 3;
  let fillRate = baseFillRate;
  
  if (daysUntilRace <= rushThreshold) {
    const rushProgress = (rushThreshold - daysUntilRace) / rushThreshold;
    const rushBonus = rushProgress * 0.15; // Up to +15% in final rush
    fillRate = Math.min(1, baseFillRate + rushBonus);
  }
  
  return Math.floor(maxEntrants * fillRate);
}

/**
 * Generate consistent variance for a race (±10%)
 * Uses seed string for consistency across views
 */
function getSeededVariance(seedKey: string): number {
  // Simple hash function for seeding
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = ((hash << 5) - hash) + seedKey.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert hash to -0.1 to +0.1 range
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0 to 1
  return (normalized - 0.5) * 0.2; // -0.1 to +0.1
}

/**
 * Get entrant count with "X registered" format
 * 
 * @param race - Race occurrence
 * @param currentDayIndex - Current game day
 * @param raceDayIndex - Race day
 * @param categoryId - Optional category ID
 * @returns Formatted string like "47 / 150"
 */
export function getEntrantsDisplay(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number,
  categoryId?: CategoryId
): string {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex, categoryId);
  const max = getMaxEntrantsForRace(race, categoryId);
  return `${current} / ${max}`;
}

/**
 * Check if a race is full (100% capacity or marked isFull)
 */
export function isRaceFull(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number,
  categoryId?: CategoryId
): boolean {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex, categoryId);
  const max = getMaxEntrantsForRace(race, categoryId);
  return current >= max || Boolean(race.isFull);
}

/**
 * Check if a race is nearly full (80% to 99% capacity)
 */
export function isRaceNearlyFull(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number,
  categoryId?: CategoryId
): boolean {
  if (isRaceFull(race, currentDayIndex, raceDayIndex, categoryId)) return false;
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex, categoryId);
  const max = getMaxEntrantsForRace(race, categoryId);
  const fillRate = current / max;
  return fillRate >= 0.8 && fillRate < 1.0;
}

/**
 * Get fill rate percentage (0-100)
 */
export function getFillRatePercentage(
  race: RaceOccurrence,
  currentDayIndex: number,
  raceDayIndex: number,
  categoryId?: CategoryId
): number {
  const current = calculateDynamicEntrants(race, currentDayIndex, raceDayIndex, categoryId);
  const max = getMaxEntrantsForRace(race, categoryId);
  if (max === 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
}
