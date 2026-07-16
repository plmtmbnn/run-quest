/**
 * Stakes Engine (Sprint 24)
 * 
 * Manages high-stakes races, pressure systems, and championship progression.
 */

import type { GameState } from "../timeline/time-types";
import type {
  HighStakesRace,
  HighStakesState,
  PressureState,
  PressureSource,
  ChampionshipProgress,
  QualificationAttempt,
  ChampionshipRecord,
} from "./high-stakes-types";
import { PRESSURE_EFFECTS } from "./high-stakes-types";
import { CHAMPIONSHIPS, generateChampionshipField } from "./championship-database";

/**
 * Calculate current pressure level based on race stakes.
 */
export function calculatePressure(
  race: HighStakesRace,
  gameState: GameState,
  stakesState: HighStakesState,
): PressureState {
  const sources: PressureSource[] = [];

  // Base championship pressure
  if (race.championship) {
    sources.push({
      source: "championship",
      intensity: race.pressureLevel,
      description: `${race.championship.title} - everything on the line`,
    });
  }

  // Qualification pressure
  if (race.qualification) {
    sources.push({
      source: "qualification",
      intensity: 70,
      description: `Must qualify for ${race.qualification.targetRace}`,
    });
  }

  // Media/spectator pressure for high-tier events
  if (race.championship?.tier === "national" || race.championship?.tier === "olympic") {
    sources.push({
      source: "media",
      intensity: 40,
      description: "National TV coverage and media scrutiny",
    });
  }

  // Personal stakes (derived from game state)
  const attempts = stakesState.qualificationHistory.filter(
    (attempt) => attempt.result === "failed"
  ).length;
  
  if (attempts > 0) {
    sources.push({
      source: "personal",
      intensity: 20 + attempts * 10,
      description: `Previous failures weigh on you`,
    });
  }

  // Calculate total pressure
  const totalPressure = Math.min(
    100,
    sources.reduce((sum, s) => sum + s.intensity, 0)
  );

  // Determine active effects
  const effects = PRESSURE_EFFECTS.filter((e) => totalPressure >= e.threshold);

  return {
    currentPressure: totalPressure,
    sources,
    effects,
  };
}

/**
 * Check if player meets requirements for a high-stakes race.
 */
export function meetsRaceRequirements(
  race: HighStakesRace,
  gameState: GameState,
  stakesState: HighStakesState,
): { meets: boolean; missing: string[] } {
  const missing: string[] = [];
  const req = race.requirements;

  // Check level
  if (req.minLevel) {
    const runningSkill = gameState.skills.running ?? 0;
    if (runningSkill < req.minLevel) {
      missing.push(`Running skill ${req.minLevel} required (current: ${runningSkill})`);
    }
  }

  // Check rating
  if (req.minRating) {
    const rating = gameState.flags.rating ?? 0;
    if (typeof rating === "number" && rating < req.minRating) {
      missing.push(`Rating ${req.minRating} required (current: ${rating})`);
    }
  }

  // Check story chapter
  if (req.storyChapterRequired) {
    const chapter = gameState.flags.storyChapter ?? 0;
    if (typeof chapter === "number" && chapter < req.storyChapterRequired) {
      missing.push(`Story Chapter ${req.storyChapterRequired} required`);
    }
  }

  // Check qualification status
  if (req.qualificationNeeded && race.qualification) {
    const status = stakesState.qualificationStatus[race.qualification.targetRace];
    if (status !== "qualified") {
      missing.push("Must qualify first");
    }
  }

  return {
    meets: missing.length === 0,
    missing,
  };
}

/**
 * Start a championship race.
 */
export function startChampionship(
  stakesState: HighStakesState,
  championshipId: string,
): HighStakesState {
  const progress: ChampionshipProgress = {
    championshipId,
    round: 1,
    qualified: false,
  };

  return {
    ...stakesState,
    activeChampionships: {
      ...stakesState.activeChampionships,
      [championshipId]: progress,
    },
  };
}

/**
 * Complete a championship race.
 */
export function completeChampionship(
  stakesState: HighStakesState,
  gameState: GameState,
  championshipId: string,
  position: number,
  time: number,
  margin: number,
): {
  stakesState: HighStakesState;
  gameState: GameState;
  victory: boolean;
  rewards: string[];
} {
  const championship = CHAMPIONSHIPS[championshipId];
  const victory = position === 1;
  const rewards: string[] = [];

  let updatedStakesState = { ...stakesState };
  let updatedGameState = { ...gameState };

  // Record championship win
  if (victory && championship.championship) {
    const record: ChampionshipRecord = {
      championshipId,
      tier: championship.championship.tier,
      title: championship.championship.title,
      dayWon: gameState.dayIndex,
      time,
      margin,
    };

    updatedStakesState = {
      ...updatedStakesState,
      championshipsWon: [...updatedStakesState.championshipsWon, record],
    };

    // Apply rewards
    const raceRewards = championship.championship.rewards;
    
    if (raceRewards.rating) {
      const currentRating = (gameState.flags.rating as number) ?? 1500;
      updatedGameState = {
        ...updatedGameState,
        flags: {
          ...updatedGameState.flags,
          rating: currentRating + raceRewards.rating,
        },
      };
      rewards.push(`+${raceRewards.rating} rating`);
    }

    if (raceRewards.prize) {
      updatedGameState = {
        ...updatedGameState,
        resources: {
          ...updatedGameState.resources,
          money: updatedGameState.resources.money + raceRewards.prize,
        },
      };
      rewards.push(`$${raceRewards.prize} prize money`);
    }

    if (raceRewards.title) {
      updatedGameState = {
        ...updatedGameState,
        flags: {
          ...updatedGameState.flags,
          [`title_${championshipId}`]: raceRewards.title,
        },
      };
      rewards.push(`Title: ${raceRewards.title}`);
    }

    if (raceRewards.unlock) {
      for (const unlock of raceRewards.unlock) {
        updatedGameState = {
          ...updatedGameState,
          flags: {
            ...updatedGameState.flags,
            [`unlocked_${unlock}`]: true,
          },
        };
        rewards.push(`Unlocked: ${unlock}`);
      }
    }
  }

  // Clean up active championship
  const { [championshipId]: _, ...remainingChampionships } =
    updatedStakesState.activeChampionships;

  updatedStakesState = {
    ...updatedStakesState,
    activeChampionships: remainingChampionships,
  };

  return {
    stakesState: updatedStakesState,
    gameState: updatedGameState,
    victory,
    rewards,
  };
}

/**
 * Attempt qualification for a race.
 */
export function attemptQualification(
  stakesState: HighStakesState,
  gameState: GameState,
  qualificationId: string,
  time: number,
  place: number,
): {
  stakesState: HighStakesState;
  gameState: GameState;
  qualified: boolean;
  margin: number;
  rewards: string[];
} {
  const race = Object.values(CHAMPIONSHIPS).find(
    (r) => r.qualification?.targetRace === qualificationId
  );

  if (!race?.qualification) {
    return {
      stakesState,
      gameState,
      qualified: false,
      margin: 0,
      rewards: [],
    };
  }

  const { targetTime, targetPlace, onQualify, onFail } = race.qualification;

  // Check qualification criteria
  const timeQualified = targetTime ? time <= targetTime : true;
  const placeQualified = targetPlace ? place <= targetPlace : true;
  const qualified = timeQualified && placeQualified;

  // Calculate margin
  const margin = targetTime ? targetTime - time : 0;

  // Record attempt
  const attempt: QualificationAttempt = {
    targetRace: qualificationId,
    dayAttempted: gameState.dayIndex,
    result: qualified ? "qualified" : "failed",
    time,
    place,
    margin,
  };

  let updatedStakesState: HighStakesState = {
    ...stakesState,
    qualificationHistory: [...stakesState.qualificationHistory, attempt],
    qualificationStatus: {
      ...stakesState.qualificationStatus,
      [qualificationId]: qualified ? "qualified" : "failed",
    },
  };

  let updatedGameState = gameState;
  const rewards: string[] = [];

  // Apply consequences
  if (qualified) {
    // Apply qualification rewards
    if (onQualify.rating) {
      const currentRating = (gameState.flags.rating as number) ?? 1500;
      updatedGameState = {
        ...updatedGameState,
        flags: {
          ...updatedGameState.flags,
          rating: currentRating + onQualify.rating,
        },
      };
      rewards.push(`+${onQualify.rating} rating`);
    }

    // Unlock target race
    for (const unlock of onQualify.unlocks) {
      updatedGameState = {
        ...updatedGameState,
        flags: {
          ...updatedGameState.flags,
          [`unlocked_${unlock}`]: true,
        },
      };
      rewards.push(`Unlocked: ${unlock}`);
    }

    rewards.push(onQualify.narrative);
  } else {
    // Set cooldown
    updatedGameState = {
      ...updatedGameState,
      flags: {
        ...updatedGameState.flags,
        [`qualification_cooldown_${qualificationId}`]:
          gameState.dayIndex + onFail.cooldownDays,
      },
    };
  }

  return {
    stakesState: updatedStakesState,
    gameState: updatedGameState,
    qualified,
    margin,
    rewards,
  };
}

/**
 * Get pressure modifier for performance (affects race simulation).
 */
export function getPressureModifier(pressure: PressureState): {
  focusModifier: number;
  paceVariance: number;
  description: string;
} {
  let focusModifier = 0;
  let paceVariance = 0;
  const descriptions: string[] = [];

  for (const effect of pressure.effects) {
    if (effect.effect === "focus_bonus") {
      focusModifier += effect.magnitude;
      descriptions.push(effect.description);
    } else if (effect.effect === "focus_penalty") {
      focusModifier += effect.magnitude; // Already negative
      descriptions.push(effect.description);
    } else if (effect.effect === "pace_variance") {
      paceVariance += effect.magnitude;
      descriptions.push(effect.description);
    }
  }

  return {
    focusModifier,
    paceVariance,
    description: descriptions.join("; "),
  };
}

/**
 * Get available championships for player.
 */
export function getAvailableChampionships(
  gameState: GameState,
  stakesState: HighStakesState,
): HighStakesRace[] {
  return Object.values(CHAMPIONSHIPS).filter((race) => {
    const { meets } = meetsRaceRequirements(race, gameState, stakesState);
    return meets;
  });
}

/**
 * Get championship history summary.
 */
export function getChampionshipSummary(stakesState: HighStakesState): {
  totalWins: number;
  byTier: Record<string, number>;
  titles: string[];
} {
  const totalWins = stakesState.championshipsWon.length;
  const byTier: Record<string, number> = {};
  const titles: string[] = [];

  for (const record of stakesState.championshipsWon) {
    byTier[record.tier] = (byTier[record.tier] ?? 0) + 1;
    titles.push(record.title);
  }

  return { totalWins, byTier, titles };
}

// Re-export types and data
export { CHAMPIONSHIPS, generateChampionshipField };
export type { HighStakesRace, HighStakesState, PressureState };
