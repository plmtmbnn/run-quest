import { DECISION_DATABASE } from "@/content/events/decision-database";
import type { Scenario } from "@/types/engine";
import { SeededRandom } from "@/utils/random/seeded-random";

/**
 * Returns the number of decision moments based on race distance.
 */
export function getNumDecisionsForDistance(
  distance: number,
  random: SeededRandom,
): number {
  if (distance <= 5) return Math.floor(random.nextRange(2, 4)); // 2-3
  if (distance <= 10) return Math.floor(random.nextRange(3, 6)); // 3-5
  if (distance <= 22) return Math.floor(random.nextRange(5, 8)); // 5-7
  if (distance <= 43) return Math.floor(random.nextRange(8, 13)); // 8-12
  return Math.floor(random.nextRange(10, 17)); // 10-16 for Ultra
}

/**
 * Generates a deterministic mapping of kilometer checkpoints to DecisionCard IDs.
 */
export function generateDecisionTimeline(
  distance: number,
  scenario: Scenario,
  seed: number,
): Record<number, string> {
  const random = new SeededRandom(seed);
  const numDecisions = getNumDecisionsForDistance(distance, random);
  const totalKms = Math.ceil(distance);

  // We want to distribute decisions across kilometers.
  // Avoid km 0 (before race) and don't place them after the final km.
  // We can pick unique kilometers between 1 and totalKms.
  const availableKms: number[] = [];
  for (let i = 1; i <= totalKms; i++) {
    availableKms.push(i);
  }

  // Shuffle available kilometers
  for (let i = availableKms.length - 1; i > 0; i--) {
    const j = Math.floor(random.nextRange(0, i + 1));
    const temp = availableKms[i];
    availableKms[i] = availableKms[j];
    availableKms[j] = temp;
  }

  // Take the first numDecisions kilometers and sort them
  const selectedKms = availableKms.slice(0, numDecisions).sort((a, b) => a - b);

  const timeline: Record<number, string> = {};

  for (const km of selectedKms) {
    // Select an appropriate decision card based on scenario conditions
    const pool = Object.values(DECISION_DATABASE);

    // Calculate weights for cards
    const weightedPool = pool
      .map((card) => {
        let weight = 10; // base weight

        // Rarity checks
        if (card.rarity === "rare") {
          weight = 1; // rare events are 10x less likely
        } else if (card.rarity === "uncommon") {
          weight = 5;
        }

        // Contextual adjustments
        if (card.id === "heat_wave") {
          if (
            scenario.environment.weather === "hot" ||
            scenario.environment.weather === "sunny"
          ) {
            weight *= 4; // much more common in hot/sunny weather
          } else if (
            scenario.environment.weather === "cold" ||
            scenario.environment.weather === "rain"
          ) {
            weight = 0; // cannot have heat wave in cold/rain
          }
        }

        if (card.id === "strong_headwind") {
          if (scenario.environment.weather === "storm") {
            weight *= 3;
          }
        }

        if (card.id === "steep_climb") {
          if (scenario.race.surface === "trail") {
            weight *= 4; // very common in trails
          }
          if (scenario.race.elevation === "hilly") {
            weight *= 3;
          } else if (scenario.race.elevation === "flat") {
            weight = 0; // no steep climbs on flat track/road
          }
        }

        return { card, weight };
      })
      .filter((item) => item.weight > 0);

    // Pick from weighted pool
    if (weightedPool.length > 0) {
      const totalWeight = weightedPool.reduce(
        (sum, item) => sum + item.weight,
        0,
      );
      let roll = random.nextRange(0, totalWeight);
      let selectedId = weightedPool[0].card.id;

      for (const item of weightedPool) {
        roll -= item.weight;
        if (roll <= 0) {
          selectedId = item.card.id;
          break;
        }
      }
      timeline[km] = selectedId;
    }
  }

  return timeline;
}
