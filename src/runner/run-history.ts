/**
 * Run History — Ring buffer of recent race results.
 *
 * Stores the last N runs in the RunnerProfile for trend analysis
 * and "vs last run" comparisons in the social stats tab.
 */

import type { RunnerProfile, RunRecord } from "./runner-types";

/** Maximum number of runs to retain in history */
export const MAX_RUN_HISTORY = 25;

/**
 * Saves a run result into the profile's run history ring buffer.
 * Oldest entries are dropped when the buffer exceeds MAX_RUN_HISTORY.
 */
export function saveRunToHistory(
  profile: RunnerProfile,
  record: RunRecord,
): RunnerProfile {
  const history = [...(profile.runHistory || [])];

  // Remove duplicate entry for the same challengeId (re-run)
  const existingIndex = history.findIndex(
    (r) => r.challengeId === record.challengeId,
  );
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  // Prepend newest run
  history.unshift(record);

  // Trim to max size
  if (history.length > MAX_RUN_HISTORY) {
    history.length = MAX_RUN_HISTORY;
  }

  return {
    ...profile,
    runHistory: history,
  };
}

/**
 * Gets the most recent run record, or null if none exist.
 */
export function getLatestRun(profile: RunnerProfile): RunRecord | null {
  return profile.runHistory?.[0] ?? null;
}

/**
 * Gets the run immediately before the latest one, or null.
 */
export function getPreviousRun(profile: RunnerProfile): RunRecord | null {
  return profile.runHistory?.[1] ?? null;
}

/**
 * Calculates the time delta (in seconds) between the latest two runs.
 * Positive = slower, Negative = faster, null = insufficient data.
 */
export function getTimeDeltaVsLastRun(
  profile: RunnerProfile,
): number | null {
  const latest = getLatestRun(profile);
  const previous = getPreviousRun(profile);
  if (!latest || !previous) return null;
  return latest.finishTime - previous.finishTime;
}

/**
 * Calculates the average finish time over the last N runs.
 * Returns null if there are no runs.
 */
export function getAverageFinishTime(
  profile: RunnerProfile,
  count: number = 5,
): number | null {
  const runs = (profile.runHistory || []).slice(0, count);
  if (runs.length === 0) return null;
  const total = runs.reduce((sum, r) => sum + r.finishTime, 0);
  return total / runs.length;
}

/**
 * Returns a trend direction based on the last N runs' times.
 *
 * - "improving" — times are generally decreasing (getting faster)
 * - "declining" — times are generally increasing (getting slower)
 * - "steady" — no clear trend
 * - null — insufficient data
 */
export function getTrend(
  profile: RunnerProfile,
  count: number = 5,
): "improving" | "declining" | "steady" | null {
  const runs = (profile.runHistory || []).slice(0, count);
  if (runs.length < 3) return null;

  let improving = 0;
  let declining = 0;

  for (let i = 1; i < runs.length; i++) {
    if (runs[i].finishTime < runs[i - 1].finishTime) {
      improving++;
    } else if (runs[i].finishTime > runs[i - 1].finishTime) {
      declining++;
    }
  }

  const threshold = Math.ceil((runs.length - 1) * 0.6);
  if (improving >= threshold) return "improving";
  if (declining >= threshold) return "declining";
  return "steady";
}

/**
 * Returns the best (lowest) finish time from the run history.
 */
export function getPersonalBestTime(profile: RunnerProfile): number | null {
  const runs = profile.runHistory || [];
  if (runs.length === 0) return null;
  return Math.min(...runs.map((r) => r.finishTime));
}

/**
 * Returns the number of consecutive "gold" finishes in the run history.
 */
export function getWinStreak(profile: RunnerProfile): number {
  const runs = profile.runHistory || [];
  let streak = 0;
  for (const run of runs) {
    if (run.outcome === "gold") streak++;
    else break;
  }
  return streak;
}
