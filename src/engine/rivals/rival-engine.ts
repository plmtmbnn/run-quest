/**
 * Rival Engine
 *
 * Handles rival selection, dialog generation, and relationship progression.
 */

import {
  createDefaultRelationship,
  RIVAL_ROSTER,
  type Rival,
  type RivalContext,
  type RivalRelationship,
} from "./rival-types";

export type { Rival, RivalContext, RivalRelationship };

// ---------------------------------------------------------------------------
// Rival selection
// ---------------------------------------------------------------------------

interface SelectionOptions {
  playerSkill: number;
  raceDistance: number;
  previousRivals: Record<string, RivalRelationship>;
}

/**
 * Select up to 3 rivals for a race based on player skill, distance, and history.
 * Prioritizes rivals with existing relationships over new ones.
 */
export function selectRivalsForRace(options: SelectionOptions): Rival[] {
  const { playerSkill, raceDistance, previousRivals } = options;

  // Build a pool of candidates
  const candidates = RIVAL_ROSTER.map((rival) => {
    const relationship = previousRivals[rival.id];
    // Score: higher priority for existing relationships, close skill match
    let score = 0;

    if (relationship) {
      // Prioritize rivals with existing relationships
      score += Math.min(40, relationship.relationshipLevel * 0.5);
      score += relationship.totalEncounters * 2;
    }

    // Skill match: closer to player skill = better match
    const skillDiff = Math.abs(rival.skillLevel - playerSkill);
    if (skillDiff < 10) score += 30;
    else if (skillDiff < 20) score += 20;
    else score += 10;

    // Distance suitability: higher skill rivals more likely in longer races
    if (raceDistance >= 15) {
      if (rival.skillLevel > 70) score += 10;
    } else if (raceDistance >= 10) {
      if (rival.skillLevel > 50 && rival.skillLevel < 80) score += 10;
    } else {
      if (rival.skillLevel < 60) score += 10;
    }

    return { rival, score };
  });

  // Sort by score descending and pick top 1-3
  candidates.sort((a, b) => b.score - a.score);

  // Pick 2-3 rivals
  const count = Math.min(3, Math.max(2, candidates.length));
  return candidates.slice(0, count).map((c) => c.rival);
}

// ---------------------------------------------------------------------------
// Dialog generation
// ---------------------------------------------------------------------------

type DialogIntensity = "normal" | "emphasized";

/**
 * Generate a rival dialog for a specific context
 */
export function generateRivalDialog(
  rival: Rival,
  context: RivalContext,
  options?: {
    playerPosition?: number;
    km?: number;
    relationshipLevel?: number;
  },
): { text: string; intensity: DialogIntensity } {
  const phrases = getPhrasesForContext(rival, context);
  if (phrases.length === 0) {
    return { text: "...", intensity: "normal" };
  }

  // Pick a phrase based on relationship level
  const index = pickPhraseIndex(
    phrases.length,
    options?.relationshipLevel ?? 0,
  );
  const text = phrases[index];

  // Determine intensity
  let intensity: DialogIntensity = "normal";
  if (context === "overtake_player" || context === "overtaken_by_player") {
    intensity = "emphasized";
  }

  // Extract the text - handle both string and LocalizedText types
  const textString = typeof text === "string" ? text : text.en || text.id || "";

  return { text: textString, intensity };
}

/**
 * Get the appropriate phrase array for a context
 */
function getPhrasesForContext(
  rival: Rival,
  context: RivalContext,
): { en: string; id: string }[] {
  switch (context) {
    case "pre_race":
      return rival.catchphrases.preRace;
    case "overtake_player":
    case "overtaken_by_player":
      return rival.catchphrases.duringRace;
    case "post_race":
      return rival.catchphrases.postRaceWin.concat(
        rival.catchphrases.postRaceLose,
      );
    default:
      return [];
  }
}

/**
 * Pick a phrase index, weighted by relationship level
 */
function pickPhraseIndex(length: number, relationshipLevel: number): number {
  if (length <= 1) return 0;

  // Higher relationship = later phrases (more familiar/intense)
  const normalizedLevel = Math.min(100, relationshipLevel) / 100;
  const bias = Math.floor(normalizedLevel * (length - 1));

  // Add some randomness around the bias
  const spread = 1;
  const randomOffset = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
  return Math.max(0, Math.min(length - 1, bias + randomOffset));
}

// ---------------------------------------------------------------------------
// Relationship updates
// ---------------------------------------------------------------------------

/**
 * Update a rival relationship after a race
 */
export function updateRivalRelationship(
  existing: RivalRelationship | undefined,
  playerFinishedAhead: boolean,
  margin: number,
): RivalRelationship {
  const rel = existing || createDefaultRelationship();

  // Base relationship change
  let relationshipChange = 0;

  if (playerFinishedAhead) {
    rel.wins += 1;
    relationshipChange += 15; // Beating a rival
  } else {
    rel.losses += 1;
    relationshipChange += 5; // Respect for losing
  }

  // Close finish bonus
  if (margin < 5) {
    relationshipChange += 10;
  }

  // Racing against same rival
  if (rel.totalEncounters > 0) {
    relationshipChange += 10; // Per encounter
  }

  rel.totalEncounters += 1;
  rel.lastEncounter = new Date().toISOString();
  rel.relationshipLevel = Math.min(
    100,
    Math.max(0, rel.relationshipLevel + relationshipChange),
  );

  // Track margins
  if (margin < rel.closestMargin && margin > 0) {
    rel.closestMargin = margin;
  }
  if (playerFinishedAhead && margin > rel.biggestWin) {
    rel.biggestWin = margin;
  }
  if (!playerFinishedAhead && margin > rel.biggestLoss) {
    rel.biggestLoss = margin;
  }

  return rel;
}

/**
 * Get the rivalry status label based on relationship level
 */
export function getRivalryStatus(
  level: number,
): "neutral" | "friendly" | "rivalry" | "nemesis" {
  if (level >= 80) return "friendly";
  if (level >= 40) return "nemesis";
  if (level >= 20) return "rivalry";
  return "neutral";
}

/**
 * Get the title for a rivalry milestone based on level
 */
export function getRivalMilestoneText(
  level: number,
  lang: "en" | "id",
): string | null {
  const milestones = [
    {
      threshold: 20,
      en: "Rival acknowledges you by name",
      id: "Rival mengenalimu dengan nama",
    },
    {
      threshold: 40,
      en: "Rivalry intensifies! Trash talk heats up!",
      id: "Persaingan meningkat! Ejekan memanas!",
    },
    {
      threshold: 60,
      en: "Rival shows respect after race",
      id: "Rival menunjukkan rasa hormat setelah race",
    },
    {
      threshold: 80,
      en: "Rival becomes friendly, offers training tips",
      id: "Rival menjadi ramah, memberi tips latihan",
    },
    {
      threshold: 100,
      en: "Rival becomes training partner! Special session unlocked!",
      id: "Rival menjadi rekan latihan! Sesi khusus terbuka!",
    },
  ];

  for (const milestone of milestones) {
    if (level >= milestone.threshold) {
      return milestone[lang];
    }
  }

  return null;
}

/**
 * Determine if the player finished ahead of a specific rival
 */
export function didPlayerBeatRival(
  outcome: string,
  rivalAccumulatedTime: number,
  playerFinishTime: number,
  rivalIsDNF: boolean,
): boolean {
  if (outcome === "dnf" || outcome === "dns") return false;
  return rivalIsDNF || playerFinishTime < rivalAccumulatedTime;
}
