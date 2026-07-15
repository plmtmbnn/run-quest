// coach-memory.ts
// Persistence of tendencies, observations, weekly reviews, and knowledge discoveries.
//
// All persistence uses localStorage, following the same pattern as runner-persistence.ts
// and training-store.ts. No React dependencies.

import type {
  CoachMemoryState,
  KnowledgeDiscovery,
  PostRaceFeedback,
  PostTrainingFeedback,
  RunnerTendency,
  WeeklyReview,
} from "./coach-types";
import { DEFAULT_COACH_MEMORY } from "./coach-types";

const COACH_MEMORY_KEY = "coachMemory";

// ---------------------------------------------------------------------------
// Load / Save
// ---------------------------------------------------------------------------

/**
 * Loads the coach memory from local storage.
 * Returns the default state if not found or corrupted.
 */
export const loadCoachMemory = (): CoachMemoryState => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return structuredClone(DEFAULT_COACH_MEMORY);
  }
  try {
    const stored = localStorage.getItem(COACH_MEMORY_KEY);
    if (stored) {
      return JSON.parse(stored) as CoachMemoryState;
    }
  } catch (error) {
    console.error("Failed to load coach memory:", error);
  }
  return structuredClone(DEFAULT_COACH_MEMORY);
};

/**
 * Saves the coach memory to local storage.
 */
export const saveCoachMemory = (state: CoachMemoryState): void => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(COACH_MEMORY_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save coach memory:", error);
  }
};

/**
 * Resets coach memory to the default state.
 */
export const resetCoachMemory = (): void => {
  saveCoachMemory(structuredClone(DEFAULT_COACH_MEMORY));
};

// ---------------------------------------------------------------------------
// Race & training feedback
// ---------------------------------------------------------------------------

/**
 * Stores a post-race feedback record keyed by date.
 */
export const recordRaceFeedback = (
  date: string,
  feedback: PostRaceFeedback,
): void => {
  const memory = loadCoachMemory();
  memory.raceFeedbackHistory[date] = feedback;
  memory.lastUpdatedAt = new Date().toISOString();
  saveCoachMemory(memory);
};

/**
 * Stores a post-training feedback record keyed by date.
 */
export const recordTrainingFeedback = (
  date: string,
  feedback: PostTrainingFeedback,
): void => {
  const memory = loadCoachMemory();
  memory.trainingFeedbackHistory[date] = feedback;
  memory.lastUpdatedAt = new Date().toISOString();
  saveCoachMemory(memory);
};

// ---------------------------------------------------------------------------
// Weekly reviews
// ---------------------------------------------------------------------------

/**
 * Stores a weekly review.
 */
export const saveWeeklyReview = (review: WeeklyReview): void => {
  const memory = loadCoachMemory();
  memory.weeklyReviews[review.weekNumber] = review;
  memory.lastUpdatedAt = new Date().toISOString();
  saveCoachMemory(memory);
};

/**
 * Retrieves all stored weekly reviews sorted by week number ascending.
 */
export const getWeeklyReviews = (): WeeklyReview[] => {
  const memory = loadCoachMemory();
  return Object.values(memory.weeklyReviews).sort(
    (a, b) => a.weekNumber - b.weekNumber,
  );
};

/**
 * Retrieves the most recent weekly review.
 */
export const getLatestWeeklyReview = (): WeeklyReview | null => {
  const reviews = getWeeklyReviews();
  return reviews[reviews.length - 1] ?? null;
};

// ---------------------------------------------------------------------------
// Knowledge discoveries
// ---------------------------------------------------------------------------

/**
 * The catalog of all knowledge discoveries in the game.
 * Defined here so the memory system has everything it needs.
 */
const KNOWLEDGE_CATALOG: Omit<KnowledgeDiscovery, "unlockedAt">[] = [
  {
    id: "heat_management",
    name: "Heat Management",
    description:
      "You have demonstrated the ability to complete races in hot conditions without compromising performance through dehydration or early exhaustion.",
    requiredEvidence: 3,
  },
  {
    id: "negative_split",
    name: "Negative Split",
    description:
      "You have consistently improved your pace in the second half of races, demonstrating disciplined early-race control.",
    requiredEvidence: 3,
  },
  {
    id: "efficient_hydration",
    name: "Efficient Hydration",
    description:
      "You have demonstrated consistent hydration discipline across multiple races, maintaining hydration levels throughout.",
    requiredEvidence: 4,
  },
  {
    id: "conservative_racing",
    name: "Conservative Racing",
    description:
      "You have learned to complete races safely using conservative decision-making, finishing with energy reserves.",
    requiredEvidence: 3,
  },
];

/**
 * Initializes knowledge discovery entries from the catalog if not already present.
 */
const ensureKnowledgeCatalog = (memory: CoachMemoryState): CoachMemoryState => {
  for (const item of KNOWLEDGE_CATALOG) {
    if (!memory.knowledgeDiscoveries[item.id]) {
      memory.knowledgeDiscoveries[item.id] = { ...item };
    }
    if (memory.evidenceCounts[item.id] === undefined) {
      memory.evidenceCounts[item.id] = 0;
    }
  }
  return memory;
};

/**
 * Increments evidence counts for the provided evidence IDs.
 * Unlocks knowledge discoveries when the required evidence count is reached.
 *
 * @returns Array of newly unlocked KnowledgeDiscovery objects (may be empty).
 */
export const updateKnowledgeEvidence = (
  evidenceIds: string[],
): KnowledgeDiscovery[] => {
  const memory = ensureKnowledgeCatalog(loadCoachMemory());
  const newlyUnlocked: KnowledgeDiscovery[] = [];

  for (const id of evidenceIds) {
    memory.evidenceCounts[id] = (memory.evidenceCounts[id] ?? 0) + 1;

    const discovery = memory.knowledgeDiscoveries[id];
    if (discovery && !discovery.unlockedAt) {
      if (memory.evidenceCounts[id] >= discovery.requiredEvidence) {
        discovery.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(discovery);
      }
    }
  }

  memory.lastUpdatedAt = new Date().toISOString();
  saveCoachMemory(memory);

  return newlyUnlocked;
};

/**
 * Returns all unlocked knowledge discoveries.
 */
export const getUnlockedDiscoveries = (): KnowledgeDiscovery[] => {
  const memory = ensureKnowledgeCatalog(loadCoachMemory());
  return Object.values(memory.knowledgeDiscoveries).filter(
    (d) => !!d.unlockedAt,
  );
};

// ---------------------------------------------------------------------------
// Runner tendencies
// ---------------------------------------------------------------------------

/**
 * The catalog of all tendencies the coach tracks silently.
 */
const TENDENCY_CATALOG: Omit<
  RunnerTendency,
  "evidenceCount" | "visible" | "lastUpdatedAt"
>[] = [
  {
    id: "attacks_early",
    label: "Frequently attacks too early",
    valence: "negative",
    requiredEvidence: 3,
  },
  {
    id: "races_conservatively",
    label: "Usually races conservatively",
    valence: "neutral",
    requiredEvidence: 3,
  },
  {
    id: "races_aggressively",
    label: "Tends toward aggressive race decisions",
    valence: "neutral",
    requiredEvidence: 3,
  },
  {
    id: "delays_hydration",
    label: "Often delays hydration",
    valence: "negative",
    requiredEvidence: 3,
  },
  {
    id: "excellent_hydration",
    label: "Excellent hydration discipline",
    valence: "positive",
    requiredEvidence: 4,
  },
  {
    id: "negative_splitter",
    label: "Consistently runs negative splits",
    valence: "positive",
    requiredEvidence: 3,
  },
  {
    id: "poor_recovery_habits",
    label: "Poor recovery habits between hard sessions",
    valence: "negative",
    requiredEvidence: 4,
  },
  {
    id: "good_recovery_habits",
    label: "Good recovery discipline when fatigued",
    valence: "positive",
    requiredEvidence: 3,
  },
];

/**
 * Initializes tendency entries from the catalog if not already present.
 */
const ensureTendencyCatalog = (memory: CoachMemoryState): CoachMemoryState => {
  for (const item of TENDENCY_CATALOG) {
    if (!memory.tendencies[item.id]) {
      memory.tendencies[item.id] = {
        ...item,
        evidenceCount: 0,
        visible: false,
        lastUpdatedAt: new Date().toISOString(),
      };
    }
  }
  return memory;
};

/**
 * Updates runner tendencies with the provided delta map.
 * Reveals tendencies once sufficient evidence has accumulated.
 *
 * @param deltas - Map of tendencyId → evidence delta.
 * @returns Array of newly visible tendencies.
 */
export const updateTendencies = (
  deltas: Record<string, number>,
): RunnerTendency[] => {
  const memory = ensureTendencyCatalog(loadCoachMemory());
  const newlyVisible: RunnerTendency[] = [];

  for (const [id, delta] of Object.entries(deltas)) {
    const tendency = memory.tendencies[id];
    if (!tendency) continue;

    tendency.evidenceCount = Math.max(0, tendency.evidenceCount + delta);
    tendency.lastUpdatedAt = new Date().toISOString();

    if (
      !tendency.visible &&
      tendency.evidenceCount >= tendency.requiredEvidence
    ) {
      tendency.visible = true;
      newlyVisible.push(tendency);
    }
  }

  memory.lastUpdatedAt = new Date().toISOString();
  saveCoachMemory(memory);

  return newlyVisible;
};

/**
 * Returns all tendencies that are currently visible to the player.
 */
export const getVisibleTendencies = (): RunnerTendency[] => {
  const memory = ensureTendencyCatalog(loadCoachMemory());
  return Object.values(memory.tendencies).filter((t) => t.visible);
};

/**
 * Returns all tendencies (for internal diagnostics only — do not surface in UI).
 */
export const getAllTendencies = (): RunnerTendency[] => {
  const memory = ensureTendencyCatalog(loadCoachMemory());
  return Object.values(memory.tendencies);
};
