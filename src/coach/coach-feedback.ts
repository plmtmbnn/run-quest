// coach-feedback.ts
// Structured feedback assembly — resolves CoachInsights into human-readable messages.
//
// This file is the ONLY place where coach text is produced.
// All strings live here; the engine layer never touches display text.
// Future: replace resolveMessage() with an LLM call without touching any other file.

import type {
  CoachFeedbackMessage,
  CoachInsight,
  PostRaceFeedback,
  PostTrainingFeedback,
  RaceTelemetry,
  TrainingTelemetry,
} from "./coach-types";

// ---------------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------------

/**
 * Message template registry.
 * Each key maps to a template string where {param} tokens are interpolated.
 * Templates are keyed by CoachInsight.messageKey.
 */
const MESSAGE_TEMPLATES: Record<string, string> = {
  // Pacing
  "pacing.negative_split":
    "You ran the second half {diff} seconds per kilometre faster than the first — a well-controlled effort.",
  "pacing.positive_split":
    "Your pace slowed by an average of {diff} seconds per kilometre in the second half.",
  "pacing.early_attack":
    "You attacked too early considering today's temperature of {temperature}°C.",
  "pacing.erratic":
    "Your pacing became inconsistent during the race, with a variability of {variability} seconds per kilometre.",

  // Hydration
  "hydration.delayed":
    "You delayed hydration until kilometre {km}, by which point dehydration had already begun affecting performance.",
  "hydration.good":
    "Your hydration management was effective. Hydration never dropped below {lowestHydration}%.",

  // Fatigue & risk
  "fatigue.low_final_energy":
    "You finished with only {finalEnergy}% energy remaining, indicating you pushed close to your limit.",
  "fatigue.reserves_with_goal":
    "You achieved your target while finishing with {finalEnergy}% energy — you may have had more to give.",
  "risk.sustained_high":
    "You spent {km} kilometres in a high-risk effort zone. Sustained high-risk running accelerates fatigue accumulation.",

  // Environment
  "environment.hot_managed":
    "You managed to complete the race despite {temperature}°C conditions. Heat adaptation takes time.",
  "environment.hot_struggled":
    "The {temperature}°C heat significantly impacted your performance. Adjusting pace earlier may help in similar conditions.",

  // Decision making
  "decision.dominant_aggressive":
    "You made {count} aggressive decisions during the race. Aggressive decisions increase short-term momentum but raise fatigue risk.",
  "decision.dominant_conservative":
    "You made {count} conservative decisions during the race. Conservative choices preserve energy but may limit pace.",

  // Outcome
  "outcome.dnf":
    "The race ended early due to {cause}. Understanding what led to this point is more valuable than the result itself.",

  // Recovery recommendation
  "recommend.recovery":
    "Your fatigue level reached {finalFatigue}%. I strongly recommend a recovery session or full rest tomorrow.",

  // Training
  "training.consecutive_hard":
    "You completed {days} demanding sessions in consecutive days. Recovery is now essential before the next hard effort.",
  "training.hard_with_high_fatigue":
    "You entered a hard session carrying {fatigue}% fatigue. High-intensity work under accumulated fatigue reduces adaptation quality.",
  "training.recovery_effective":
    "Today's session reduced fatigue by {reduced}%. The recovery stimulus was appropriate.",
  "training.high_stress_needs_recovery":
    "The {activity} generated a strong training stimulus. Recovery in the next 24-48 hours will determine how much adaptation occurs.",
  "training.rest_day":
    "With {fatigueBefore}% fatigue entering today, a rest day was a sound decision. Recovery converts stress into adaptation.",
  "training.hard_before_race":
    "A {activity} the day before a race is high risk. Pre-race sessions should focus on maintaining readiness, not generating stress.",
  "training.weekly_imbalance":
    "This week included {hardSessions} hard sessions against only {recoveryDays} recovery days. Consider rebalancing next week.",
};

// ---------------------------------------------------------------------------
// Template interpolation
// ---------------------------------------------------------------------------

/**
 * Interpolates named parameters into a message template.
 * Tokens in the form {paramName} are replaced with the corresponding value.
 * Unknown tokens are left as-is.
 */
function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a CoachInsight into a display-ready CoachFeedbackMessage.
 * Falls back to a safe generic message if the template key is not found.
 */
export function resolveInsight(insight: CoachInsight): CoachFeedbackMessage {
  const template =
    MESSAGE_TEMPLATES[insight.messageKey] ??
    "An observation was recorded for this session.";
  const message = interpolate(template, insight.params);

  return {
    id: insight.id,
    category: insight.category,
    confidence: insight.confidence,
    message,
    priority: insight.priority,
  };
}

// ---------------------------------------------------------------------------
// Post-race feedback assembly
// ---------------------------------------------------------------------------

/**
 * Assembles a complete PostRaceFeedback from evaluated insights.
 * Selects primary, up to 3 secondary, and an optional recovery recommendation.
 *
 * @param insights - Sorted (priority descending) race insights from coach-engine.
 */
export function assemblePostRaceFeedback(
  insights: CoachInsight[],
  _telemetry: RaceTelemetry,
): PostRaceFeedback {
  // Separate recovery recommendation from observational insights
  const recommendInsight = insights.find((i) => i.id === "recommend_recovery");
  const observational = insights.filter((i) => i.id !== "recommend_recovery");

  const [primaryInsight, ...rest] = observational;

  // Fallback primary if no observational insight matched
  const fallbackPrimary: CoachInsight = {
    id: "general_observation",
    category: "pacing",
    confidence: "low",
    messageKey: "general.varied_conditions",
    params: {},
    priority: 0,
  };

  const primary = resolveInsight(primaryInsight ?? fallbackPrimary);
  const secondary = rest.slice(0, 3).map(resolveInsight);
  const recommendation = recommendInsight
    ? resolveInsight(recommendInsight)
    : undefined;

  return { type: "race", primary, secondary, recommendation };
}

// ---------------------------------------------------------------------------
// Post-training feedback assembly
// ---------------------------------------------------------------------------

/**
 * Assembles a complete PostTrainingFeedback from evaluated insights.
 */
export function assemblePostTrainingFeedback(
  insights: CoachInsight[],
  _telemetry: TrainingTelemetry,
): PostTrainingFeedback {
  const [primaryInsight, ...rest] = insights;

  const fallbackPrimary: CoachInsight = {
    id: "training_general",
    category: "fatigue",
    confidence: "low",
    messageKey: "training.high_stress_needs_recovery",
    params: { activity: _telemetry.activity },
    priority: 0,
  };

  const primary = resolveInsight(primaryInsight ?? fallbackPrimary);
  const secondary = rest.slice(0, 2).map(resolveInsight);

  return { type: "training", primary, secondary };
}

// ---------------------------------------------------------------------------
// Confidence language helpers
// ---------------------------------------------------------------------------

/**
 * Returns a hedging prefix appropriate to the confidence level.
 * Used by display components to prefix recommendations.
 */
export function confidencePrefix(
  confidence: CoachInsight["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "I strongly recommend";
    case "medium":
      return "You may benefit from";
    case "low":
      return "Consider";
  }
}
