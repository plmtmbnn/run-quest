/**
 * Seeded pseudo-random number generator using the Mulberry32 algorithm.
 * Provides deterministic randomness given a numeric seed.
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generates a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    this.seed += 0x6d2b79f5;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a pseudo-random float between min (inclusive) and max (exclusive).
   */
  nextRange(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Picks a random element from an array.
   */
  pick<T>(array: readonly T[]): T {
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * Picks an item from an array with weighted probabilities.
   */
  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const randomValue = this.next() * totalWeight;

    let currentSum = 0;
    for (let i = 0; i < items.length; i++) {
      currentSum += weights[i];
      if (randomValue <= currentSum) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }
}
