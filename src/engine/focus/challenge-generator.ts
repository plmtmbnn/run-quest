import type {
  Difficulty,
  Distance,
  RaceChallenge,
} from "@/store/focus-progression-store";

/**
 * Generate dynamic race challenges based on player progression
 */
export function generateChallengesForDistance(
  distance: Distance,
  difficulty: Difficulty,
  playerStats: {
    totalRaces: number;
    bestFinish: number;
    personalBest: number | null;
  },
): RaceChallenge[] {
  const challenges: RaceChallenge[] = [];

  // Time-based challenges
  const timeTargets = getTimeTargets(distance, difficulty);
  timeTargets.forEach((target, index) => {
    challenges.push({
      id: `${distance}k_time_${index}`,
      type: "time",
      distance,
      difficulty: target.stars as 1 | 2 | 3 | 4 | 5,
      description: target.description,
      targetValue: target.seconds,
      reward: target.reward,
      completed: false,
    });
  });

  // Position-based challenges
  const positionTargets = getPositionTargets(distance, difficulty);
  positionTargets.forEach((target, index) => {
    challenges.push({
      id: `${distance}k_position_${index}`,
      type: "position",
      distance,
      difficulty: target.stars as 1 | 2 | 3 | 4 | 5,
      description: target.description,
      targetValue: target.position,
      reward: target.reward,
      completed: false,
    });
  });

  // Advanced challenges (negative split, perfect pacing)
  if (playerStats.totalRaces >= 3) {
    challenges.push({
      id: `${distance}k_negative_split`,
      type: "negative-split",
      distance,
      difficulty: 4,
      description: "Finish with a negative split (2nd half faster than 1st)",
      targetValue: 0, // Not used for negative split
      reward: { type: "achievement", value: "negative_split_master" },
      completed: false,
    });
  }

  if (playerStats.totalRaces >= 5) {
    challenges.push({
      id: `${distance}k_perfect_pacing`,
      type: "perfect-pacing",
      distance,
      difficulty: 5,
      description: "Maintain <5% pace deviation entire race",
      targetValue: 5, // 5% max deviation
      reward: { type: "achievement", value: "pace_perfection" },
      completed: false,
    });
  }

  return challenges;
}

function getTimeTargets(distance: Distance, difficulty: Difficulty) {
  const targets = {
    5: {
      recreational: [
        {
          seconds: 25 * 60,
          stars: 1,
          description: "Break 25:00 in 5K",
          reward: { type: "achievement" as const, value: "sub25" },
        },
        {
          seconds: 22 * 60,
          stars: 2,
          description: "Break 22:00 in 5K",
          reward: { type: "achievement" as const, value: "sub22" },
        },
        {
          seconds: 20 * 60,
          stars: 3,
          description: "Break 20:00 in 5K",
          reward: { type: "unlock-distance" as const, value: "10" },
        },
      ],
      competitive: [
        {
          seconds: 20 * 60,
          stars: 2,
          description: "Break 20:00 in 5K",
          reward: { type: "achievement" as const, value: "sub20" },
        },
        {
          seconds: 18 * 60,
          stars: 3,
          description: "Break 18:00 in 5K",
          reward: { type: "achievement" as const, value: "sub18" },
        },
        {
          seconds: 17 * 60,
          stars: 4,
          description: "Break 17:00 in 5K",
          reward: { type: "unlock-difficulty" as const, value: "elite" },
        },
      ],
      elite: [
        {
          seconds: 17 * 60,
          stars: 3,
          description: "Break 17:00 in 5K",
          reward: { type: "achievement" as const, value: "sub17" },
        },
        {
          seconds: 16 * 60,
          stars: 4,
          description: "Break 16:00 in 5K",
          reward: { type: "achievement" as const, value: "sub16" },
        },
        {
          seconds: 15 * 60,
          stars: 5,
          description: "Break 15:00 in 5K",
          reward: { type: "unlock-difficulty" as const, value: "professional" },
        },
      ],
      professional: [
        {
          seconds: 15 * 60,
          stars: 4,
          description: "Break 15:00 in 5K",
          reward: { type: "achievement" as const, value: "sub15" },
        },
        {
          seconds: 14 * 60,
          stars: 5,
          description: "Break 14:00 in 5K",
          reward: { type: "achievement" as const, value: "elite_runner" },
        },
      ],
    },
    10: {
      recreational: [
        {
          seconds: 50 * 60,
          stars: 2,
          description: "Break 50:00 in 10K",
          reward: { type: "achievement" as const, value: "sub50_10k" },
        },
        {
          seconds: 45 * 60,
          stars: 3,
          description: "Break 45:00 in 10K",
          reward: { type: "unlock-distance" as const, value: "21.1" },
        },
      ],
      competitive: [
        {
          seconds: 45 * 60,
          stars: 2,
          description: "Break 45:00 in 10K",
          reward: { type: "achievement" as const, value: "sub45_10k" },
        },
        {
          seconds: 40 * 60,
          stars: 3,
          description: "Break 40:00 in 10K",
          reward: { type: "achievement" as const, value: "sub40_10k" },
        },
        {
          seconds: 37 * 60,
          stars: 4,
          description: "Break 37:00 in 10K",
          reward: { type: "unlock-difficulty" as const, value: "elite" },
        },
      ],
      elite: [
        {
          seconds: 37 * 60,
          stars: 3,
          description: "Break 37:00 in 10K",
          reward: { type: "achievement" as const, value: "sub37_10k" },
        },
        {
          seconds: 35 * 60,
          stars: 4,
          description: "Break 35:00 in 10K",
          reward: { type: "achievement" as const, value: "sub35_10k" },
        },
        {
          seconds: 32 * 60,
          stars: 5,
          description: "Break 32:00 in 10K",
          reward: { type: "unlock-difficulty" as const, value: "professional" },
        },
      ],
      professional: [
        {
          seconds: 32 * 60,
          stars: 4,
          description: "Break 32:00 in 10K",
          reward: { type: "achievement" as const, value: "sub32_10k" },
        },
        {
          seconds: 30 * 60,
          stars: 5,
          description: "Break 30:00 in 10K",
          reward: { type: "achievement" as const, value: "elite_10k" },
        },
      ],
    },
    21.1: {
      recreational: [
        {
          seconds: 120 * 60,
          stars: 2,
          description: "Break 2:00:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub2_half" },
        },
        {
          seconds: 105 * 60,
          stars: 3,
          description: "Break 1:45:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub145_half" },
        },
        {
          seconds: 90 * 60,
          stars: 4,
          description: "Break 1:30:00 in Half Marathon",
          reward: { type: "unlock-distance" as const, value: "42.2" },
        },
      ],
      competitive: [
        {
          seconds: 90 * 60,
          stars: 2,
          description: "Break 1:30:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub130_half" },
        },
        {
          seconds: 80 * 60,
          stars: 3,
          description: "Break 1:20:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub120_half" },
        },
        {
          seconds: 75 * 60,
          stars: 4,
          description: "Break 1:15:00 in Half Marathon",
          reward: { type: "unlock-difficulty" as const, value: "elite" },
        },
      ],
      elite: [
        {
          seconds: 75 * 60,
          stars: 3,
          description: "Break 1:15:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub115_half" },
        },
        {
          seconds: 70 * 60,
          stars: 4,
          description: "Break 1:10:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub110_half" },
        },
        {
          seconds: 65 * 60,
          stars: 5,
          description: "Break 1:05:00 in Half Marathon",
          reward: { type: "unlock-difficulty" as const, value: "professional" },
        },
      ],
      professional: [
        {
          seconds: 65 * 60,
          stars: 4,
          description: "Break 1:05:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "sub105_half" },
        },
        {
          seconds: 60 * 60,
          stars: 5,
          description: "Break 1:00:00 in Half Marathon",
          reward: { type: "achievement" as const, value: "elite_half" },
        },
      ],
    },
    42.2: {
      recreational: [
        {
          seconds: 270 * 60,
          stars: 2,
          description: "Break 4:30:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub430_marathon" },
        },
        {
          seconds: 240 * 60,
          stars: 3,
          description: "Break 4:00:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub4_marathon" },
        },
        {
          seconds: 210 * 60,
          stars: 4,
          description: "Break 3:30:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub330_marathon" },
        },
      ],
      competitive: [
        {
          seconds: 210 * 60,
          stars: 2,
          description: "Break 3:30:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub330_marathon" },
        },
        {
          seconds: 180 * 60,
          stars: 3,
          description: "Break 3:00:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub3_marathon" },
        },
        {
          seconds: 165 * 60,
          stars: 4,
          description: "Break 2:45:00 in Marathon",
          reward: { type: "unlock-difficulty" as const, value: "elite" },
        },
      ],
      elite: [
        {
          seconds: 165 * 60,
          stars: 3,
          description: "Break 2:45:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub245_marathon" },
        },
        {
          seconds: 150 * 60,
          stars: 4,
          description: "Break 2:30:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub230_marathon" },
        },
        {
          seconds: 135 * 60,
          stars: 5,
          description: "Break 2:15:00 in Marathon",
          reward: { type: "unlock-difficulty" as const, value: "professional" },
        },
      ],
      professional: [
        {
          seconds: 135 * 60,
          stars: 4,
          description: "Break 2:15:00 in Marathon",
          reward: { type: "achievement" as const, value: "sub215_marathon" },
        },
        {
          seconds: 125 * 60,
          stars: 5,
          description: "Break 2:05:00 in Marathon",
          reward: { type: "achievement" as const, value: "elite_marathoner" },
        },
      ],
    },
  };

  return targets[distance][difficulty] || [];
}

function getPositionTargets(distance: Distance, difficulty: Difficulty) {
  const baseTargets = [
    {
      position: 1,
      stars: 5,
      description: "Win the race (1st place)",
      reward: { type: "achievement" as const, value: "champion" },
    },
    {
      position: 3,
      stars: 3,
      description: "Finish on the podium (Top 3)",
      reward: { type: "achievement" as const, value: "podium_finisher" },
    },
    {
      position: 10,
      stars: 2,
      description: "Top 10 finish",
      reward: { type: "achievement" as const, value: "top_ten" },
    },
  ];

  // Adjust difficulty based on mode
  const difficultyMultiplier = {
    recreational: 1.2,
    competitive: 1.0,
    elite: 0.8,
    professional: 0.6,
  }[difficulty];

  return baseTargets.map((target) => ({
    ...target,
    stars: Math.min(5, Math.ceil(target.stars * difficultyMultiplier)) as
      | 1
      | 2
      | 3
      | 4
      | 5,
  }));
}

/**
 * Check if a challenge is completed based on race result
 */
export function checkChallengeCompletion(
  challenge: RaceChallenge,
  result: {
    time: number;
    position: number;
    splits: number[];
  },
): boolean {
  switch (challenge.type) {
    case "time":
      return result.time <= challenge.targetValue;

    case "position":
      return result.position <= challenge.targetValue;

    case "negative-split": {
      // Check if second half is faster than first half
      const totalDistance = challenge.distance;
      const halfDistance = totalDistance / 2;
      let firstHalfTime = 0;
      let secondHalfTime = 0;
      let distanceCovered = 0;

      for (let i = 0; i < result.splits.length; i++) {
        distanceCovered += 1; // Assuming 1km splits
        if (distanceCovered <= halfDistance) {
          firstHalfTime += result.splits[i];
        } else {
          secondHalfTime += result.splits[i];
        }
      }

      return secondHalfTime < firstHalfTime;
    }

    case "perfect-pacing": {
      // Check pace deviation
      const avgPace = result.time / challenge.distance;
      const splitPaces = result.splits.map((split) => split / 1); // 1km splits
      const maxDeviation = Math.max(
        ...splitPaces.map((pace) =>
          Math.abs(((pace - avgPace) / avgPace) * 100),
        ),
      );

      return maxDeviation <= challenge.targetValue;
    }

    case "endurance":
      // For future endurance challenges
      return false;

    default:
      return false;
  }
}

/**
 * Get difficulty-based AI field strength
 */
export function getAIFieldStrength(difficulty: Difficulty): {
  avgSkill: number;
  variance: number;
  topRunnersCount: number;
} {
  const strengthMap = {
    recreational: {
      avgSkill: 0.4, // Easy opponents
      variance: 0.3,
      topRunnersCount: 2, // Only 2-3 very strong runners
    },
    competitive: {
      avgSkill: 0.6, // Medium opponents
      variance: 0.25,
      topRunnersCount: 5,
    },
    elite: {
      avgSkill: 0.75, // Hard opponents
      variance: 0.2,
      topRunnersCount: 8,
    },
    professional: {
      avgSkill: 0.9, // Very hard opponents
      variance: 0.15,
      topRunnersCount: 15,
    },
  };

  return strengthMap[difficulty];
}
