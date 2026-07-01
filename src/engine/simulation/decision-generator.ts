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

  // If segment analysis exists, generate timeline based on segment parameters
  const analysis = scenario.analysis;
  if (analysis?.segments && analysis.segments.length > 0) {
    const timeline: Record<number, string> = {};
    let accumulatedDistance = 0;

    for (const segment of analysis.segments) {
      const startKm = Math.ceil(accumulatedDistance);
      accumulatedDistance += segment.distance;
      const endKm = Math.min(
        Math.ceil(distance),
        Math.floor(accumulatedDistance),
      );

      for (let km = startKm + 1; km <= endKm; km++) {
        // Deterministic probability check per kilometer in this segment
        const baseProb =
          0.3 * (segment.eventWeight ?? 1.0) * ((segment.difficulty ?? 2) / 3);
        const randVal = random.next();

        if (randVal < baseProb) {
          const pool = Object.values(DECISION_DATABASE);
          const weightedPool = pool
            .map((card) => {
              let weight = 10;
              if (card.rarity === "rare") {
                weight = 1;
              } else if (card.rarity === "uncommon") {
                weight = 5;
              }

              // Segment context
              if (segment.type === "climb") {
                if (card.id === "steep_climb") weight *= 10;
                if (card.id === "stitch" || card.id === "heavy_legs")
                  weight *= 3;
              } else if (segment.type === "descent") {
                if (card.id === "steep_climb") weight = 0;
              } else if (segment.type === "flat") {
                if (card.id === "steep_climb") weight = 0;
              }

              // Weather context
              const activeWeather = segment.weather;
              if (card.id === "heat_wave") {
                if (activeWeather === "hot" || activeWeather === "sunny") {
                  weight *= 4;
                } else if (
                  activeWeather === "cold" ||
                  activeWeather === "rain"
                ) {
                  weight = 0;
                }
              }

              if (card.id === "strong_headwind" && activeWeather === "storm") {
                weight *= 3;
              }

              return { card, weight };
            })
            .filter((item) => item.weight > 0);

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
      }
    }
    return timeline;
  }

  // Fallback: Uniform distribution across kilometers
  const numDecisions = getNumDecisionsForDistance(distance, random);
  const totalKms = Math.ceil(distance);

  const availableKms: number[] = [];
  for (let i = 1; i <= totalKms; i++) {
    availableKms.push(i);
  }

  for (let i = availableKms.length - 1; i > 0; i--) {
    const j = Math.floor(random.nextRange(0, i + 1));
    const temp = availableKms[i];
    availableKms[i] = availableKms[j];
    availableKms[j] = temp;
  }

  const selectedKms = availableKms.slice(0, numDecisions).sort((a, b) => a - b);
  const timeline: Record<number, string> = {};

  for (const km of selectedKms) {
    const pool = Object.values(DECISION_DATABASE);
    const weightedPool = pool
      .map((card) => {
        let weight = 10;

        if (card.rarity === "rare") {
          weight = 1;
        } else if (card.rarity === "uncommon") {
          weight = 5;
        }

        if (card.id === "heat_wave") {
          if (
            scenario.environment.weather === "hot" ||
            scenario.environment.weather === "sunny"
          ) {
            weight *= 4;
          } else if (
            scenario.environment.weather === "cold" ||
            scenario.environment.weather === "rain"
          ) {
            weight = 0;
          }
        }

        if (card.id === "strong_headwind") {
          if (scenario.environment.weather === "storm") {
            weight *= 3;
          }
        }

        if (card.id === "steep_climb") {
          if (scenario.race.surface === "trail") {
            weight *= 4;
          }
          if (scenario.race.elevation === "hilly") {
            weight *= 3;
          } else if (scenario.race.elevation === "flat") {
            weight = 0;
          }
        }

        return { card, weight };
      })
      .filter((item) => item.weight > 0);

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
