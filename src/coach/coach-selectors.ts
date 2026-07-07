// coach-selectors.ts
// Derived queries over coach state.
//
// All functions are pure reads — they never mutate state.
// These are the intended access points for UI components and other domains.

import {
  getLatestWeeklyReview,
  getUnlockedDiscoveries,
  getVisibleTendencies,
  getWeeklyReviews,
  loadCoachMemory,
} from "./coach-memory";
import type {
  CoachFeedbackMessage,
  KnowledgeDiscovery,
  PostRaceFeedback,
  PostTrainingFeedback,
  RunnerTendency,
  WeeklyReview,
} from "./coach-types";

// ---------------------------------------------------------------------------
// Race feedback selectors
// ---------------------------------------------------------------------------

/**
 * Returns the post-race feedback for a specific date.
 * Returns null if no feedback exists for that date.
 */
export const getRaceFeedbackForDate = (
  date: string,
): PostRaceFeedback | null => {
  const memory = loadCoachMemory();
  return memory.raceFeedbackHistory[date] ?? null;
};

/**
 * Returns the most recent post-race feedback.
 * Returns null if no race has been completed.
 */
export const getLatestRaceFeedback = (): PostRaceFeedback | null => {
  const memory = loadCoachMemory();
  const dates = Object.keys(memory.raceFeedbackHistory).sort();
  if (dates.length === 0) return null;
  return memory.raceFeedbackHistory[dates[dates.length - 1]];
};

/**
 * Returns all race feedback messages for the latest race, flattened.
 * Includes primary, secondary, and recommendation.
 */
export const getLatestRaceMessages = (): CoachFeedbackMessage[] => {
  const feedback = getLatestRaceFeedback();
  if (!feedback) return [];

  const messages: CoachFeedbackMessage[] = [
    feedback.primary,
    ...feedback.secondary,
  ];
  if (feedback.recommendation) {
    messages.push(feedback.recommendation);
  }
  return messages;
};

// ---------------------------------------------------------------------------
// Training feedback selectors
// ---------------------------------------------------------------------------

/**
 * Returns the post-training feedback for a specific date.
 */
export const getTrainingFeedbackForDate = (
  date: string,
): PostTrainingFeedback | null => {
  const memory = loadCoachMemory();
  return memory.trainingFeedbackHistory[date] ?? null;
};

/**
 * Returns the most recent post-training feedback.
 */
export const getLatestTrainingFeedback = (): PostTrainingFeedback | null => {
  const memory = loadCoachMemory();
  const dates = Object.keys(memory.trainingFeedbackHistory).sort();
  if (dates.length === 0) return null;
  return memory.trainingFeedbackHistory[dates[dates.length - 1]];
};

// ---------------------------------------------------------------------------
// Weekly review selectors
// ---------------------------------------------------------------------------

/**
 * Returns the most recent weekly review. Null if none generated yet.
 */
export const selectLatestWeeklyReview = (): WeeklyReview | null => {
  return getLatestWeeklyReview();
};

/**
 * Returns all weekly reviews, sorted ascending by week number.
 */
export const selectAllWeeklyReviews = (): WeeklyReview[] => {
  return getWeeklyReviews();
};

// ---------------------------------------------------------------------------
// Knowledge discovery selectors
// ---------------------------------------------------------------------------

/**
 * Returns all unlocked knowledge discoveries.
 */
export const selectUnlockedDiscoveries = (): KnowledgeDiscovery[] => {
  return getUnlockedDiscoveries();
};

/**
 * Returns the count of unlocked knowledge discoveries.
 */
export const selectDiscoveryCount = (): number => {
  return getUnlockedDiscoveries().length;
};

/**
 * Returns whether a specific knowledge discovery has been unlocked.
 */
export const isDiscoveryUnlocked = (id: string): boolean => {
  return getUnlockedDiscoveries().some((d) => d.id === id);
};

// ---------------------------------------------------------------------------
// Tendency selectors
// ---------------------------------------------------------------------------

/**
 * Returns all visible runner tendencies.
 */
export const selectVisibleTendencies = (): RunnerTendency[] => {
  return getVisibleTendencies();
};

/**
 * Returns visible tendencies split by valence.
 */
export const selectTendenciesByValence = (): {
  positive: RunnerTendency[];
  negative: RunnerTendency[];
  neutral: RunnerTendency[];
} => {
  const visible = getVisibleTendencies();
  return {
    positive: visible.filter((t) => t.valence === "positive"),
    negative: visible.filter((t) => t.valence === "negative"),
    neutral: visible.filter((t) => t.valence === "neutral"),
  };
};

/**
 * Returns the most recently updated visible tendency, or null.
 */
export const selectMostRecentTendency = (): RunnerTendency | null => {
  const visible = getVisibleTendencies();
  if (visible.length === 0) return null;
  return visible.sort(
    (a, b) =>
      new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
  )[0];
};

// ---------------------------------------------------------------------------
// Coach memory meta-selectors
// ---------------------------------------------------------------------------

/**
 * Returns the number of race feedback records stored.
 */
export const selectTotalRacesFeedbackCount = (): number => {
  const memory = loadCoachMemory();
  return Object.keys(memory.raceFeedbackHistory).length;
};

/**
 * Returns the total number of training feedback records stored.
 */
export const selectTotalTrainingFeedbackCount = (): number => {
  const memory = loadCoachMemory();
  return Object.keys(memory.trainingFeedbackHistory).length;
};

/**
 * Returns whether the coach has enough data to generate meaningful insights.
 * Defined as: at least 1 race or 3 training sessions recorded.
 */
export const selectCoachHasData = (): boolean => {
  return (
    selectTotalRacesFeedbackCount() >= 1 ||
    selectTotalTrainingFeedbackCount() >= 3
  );
};
