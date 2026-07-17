/**
 * Championship Database (Sprint 24)
 *
 * Predefined high-stakes championship races and qualifying events.
 */

import type {
  ChampionshipTier,
  EliteRunner,
  HighStakesRace,
  RaceField,
} from "./high-stakes-types";

/**
 * Elite runner archetypes for championships.
 */
export const ELITE_RUNNERS: Record<string, EliteRunner> = {
  sarah_chen: {
    name: "Sarah Chen",
    rating: 2100,
    specialty: "speed",
    personality: "aggressive",
    backstory:
      "Former track star transitioning to road racing. Explosive speed but questionable stamina.",
  },
  marcus_steel: {
    name: "Marcus Steel",
    rating: 2200,
    specialty: "stamina",
    personality: "steady",
    backstory: "Ultra marathon veteran. Relentless pacer who never fades.",
  },
  elena_torres: {
    name: "Elena Torres",
    rating: 2300,
    specialty: "tactical",
    personality: "unpredictable",
    backstory: "Tactical genius. Studies every competitor. Always has a plan.",
  },
  james_peterson: {
    name: "James Peterson",
    rating: 2400,
    specialty: "clutch",
    personality: "conservative",
    backstory:
      "Olympic Trials veteran. Thrives under pressure. Always peaks for big races.",
  },
  kenji_tanaka: {
    name: "Kenji Tanaka",
    rating: 2500,
    specialty: "speed",
    personality: "aggressive",
    backstory:
      "World record holder. Fearless front-runner. Will he blow up or break away?",
  },
};

/**
 * Championship race definitions.
 */
export const CHAMPIONSHIPS: Record<string, HighStakesRace> = {
  local_5k_championship: {
    id: "local_5k_championship",
    name: "Springfield 5K Championship",
    locationId: "local_5k_park",
    stakeLevel: "championship",
    championship: {
      tier: "local",
      title: "Local 5K Champion",
      year: 2026,
      fieldSize: 50,
      eliteCompetition: false,
      rewards: {
        title: "Local Champion",
        rating: 50,
        prize: 200,
        reputation: 10,
        unlock: ["regional_10k_hills"],
      },
    },
    requirements: {
      minLevel: 3,
    },
    consequences: {
      victory: [
        {
          type: "rating",
          value: 50,
          description: "Local victory boosts your reputation",
        },
        {
          type: "unlock",
          value: "regional_10k_hills",
          description: "Regional races now available",
        },
        {
          type: "story",
          value: "local_champion",
          description: "You're now recognized in the local running community",
        },
      ],
      defeat: [
        {
          type: "rating",
          value: 10,
          description: "Participation recognized",
        },
      ],
      dnf: [
        {
          type: "mental",
          value: -20,
          description: "DNF at local race hurts confidence",
        },
      ],
    },
    pressureLevel: 30,
    mentalDemand: 10,
    preRaceNarrative: [
      "This is your home turf. Everyone you know is watching. Time to prove yourself.",
      "The local newspaper has you as a favorite. Don't disappoint.",
      "You've run this park a hundred times. Today it means everything.",
    ],
    midRaceNarrative: [
      "You recognize faces in the crowd - neighbors, friends, doubters.",
      "This is for everyone who believed in you. Push harder.",
      "The championship is yours to take. Or lose.",
    ],
    postVictoryNarrative: [
      "Local hero! The small crowd erupts. This is your moment.",
      "You're no longer just another runner. You're the champion.",
    ],
    postDefeatNarrative: [
      "Second place stings, but you proved you belong.",
      "Not today. But you'll be back. The park remembers.",
    ],
  },

  regional_10k_championship: {
    id: "regional_10k_championship",
    name: "Metro Valley 10K Championship",
    locationId: "regional_10k_hills",
    stakeLevel: "championship",
    championship: {
      tier: "regional",
      title: "Regional 10K Champion",
      year: 2026,
      fieldSize: 150,
      eliteCompetition: true,
      rewards: {
        title: "Regional Champion",
        rating: 100,
        prize: 500,
        reputation: 25,
        unlock: ["state_half_coastal"],
      },
    },
    requirements: {
      minLevel: 8,
      minRating: 1600,
    },
    consequences: {
      victory: [
        {
          type: "rating",
          value: 100,
          description: "Regional dominance recognized",
        },
        {
          type: "unlock",
          value: "state_half_coastal",
          description: "State-level races unlocked",
        },
      ],
      defeat: [
        {
          type: "rating",
          value: 20,
          description: "Competitive showing",
        },
      ],
      dnf: [
        {
          type: "mental",
          value: -30,
          description: "The hills broke you today",
        },
      ],
    },
    pressureLevel: 50,
    mentalDemand: 20,
    preRaceNarrative: [
      "Serious competition today. Regional champions from neighboring cities are here.",
      "The hills will decide this. Your training will be tested.",
      "This is no longer local. This is the real deal.",
    ],
    midRaceNarrative: [
      "Heartbreak Hill looms. This is where champions are made.",
      "Elite runners surround you. Hold your position!",
      "Your legs scream but you see weakness in others. Attack!",
    ],
    postVictoryNarrative: [
      "REGIONAL CHAMPION! The hills couldn't stop you. Nobody could.",
      "The elevation profile tried to break you. You broke it instead.",
    ],
    postDefeatNarrative: [
      "The hills won today. But you learned where you stand.",
      "Outclassed, but not outworked. You'll be back stronger.",
    ],
  },

  state_half_championship: {
    id: "state_half_championship",
    name: "California Half Marathon Championship",
    locationId: "state_half_coastal",
    stakeLevel: "championship",
    championship: {
      tier: "state",
      title: "State Half Marathon Champion",
      year: 2026,
      fieldSize: 300,
      eliteCompetition: true,
      rewards: {
        title: "State Champion",
        rating: 200,
        prize: 2000,
        reputation: 50,
        unlock: ["national_marathon_city"],
      },
    },
    requirements: {
      minLevel: 15,
      minRating: 1900,
      storyChapterRequired: 3,
    },
    consequences: {
      victory: [
        {
          type: "rating",
          value: 200,
          description: "State champion - elite status",
        },
        {
          type: "unlock",
          value: "national_marathon_city",
          description: "National races now accessible",
        },
        {
          type: "story",
          value: "state_champion",
          description: "Your name in the state record books",
        },
      ],
      defeat: [
        {
          type: "rating",
          value: 40,
          description: "Competitive at state level",
        },
      ],
      dnf: [
        {
          type: "reputation",
          value: -20,
          description: "State-level DNF impacts reputation",
        },
      ],
    },
    pressureLevel: 70,
    mentalDemand: 35,
    preRaceNarrative: [
      "State championship. The coastal fog hides hundreds of California's best.",
      "You've dreamed of this. State champion. It's within reach.",
      "The Pacific witnesses history today. Will you be part of it?",
    ],
    midRaceNarrative: [
      "Lighthouse Point. Halfway. The real race begins now.",
      "State record pace. The crowd senses something special.",
      "This is your moment. The coast, the crowd, the championship.",
    ],
    postVictoryNarrative: [
      "STATE CHAMPION! The Pacific roars its approval. You're in the record books.",
      "Dreams don't prepare you for this feeling. You're a state champion.",
    ],
    postDefeatNarrative: [
      "So close. The beauty of the coast can't mask the disappointment.",
      "You ran among the state's best. That counts for something.",
    ],
    specialRules: [
      "Must maintain top 3 position at 15K mark to have chance at victory",
      "Coastal winds can change race dynamics dramatically",
    ],
  },

  national_marathon_championship: {
    id: "national_marathon_championship",
    name: "US Marathon Championship",
    locationId: "national_marathon_city",
    stakeLevel: "championship",
    championship: {
      tier: "national",
      title: "National Marathon Champion",
      year: 2026,
      fieldSize: 500,
      eliteCompetition: true,
      rewards: {
        title: "National Champion",
        rating: 350,
        prize: 10000,
        reputation: 100,
        unlock: ["olympic_trials"],
      },
      qualifyingRounds: 0,
      topNAdvance: 3,
    },
    requirements: {
      minLevel: 22,
      minRating: 2200,
      storyChapterRequired: 4,
    },
    consequences: {
      victory: [
        {
          type: "rating",
          value: 350,
          description: "National Champion - elite tier",
        },
        {
          type: "unlock",
          value: "olympic_trials",
          description: "Olympic Trials invitation earned",
        },
        {
          type: "story",
          value: "national_champion",
          description: "National media coverage",
        },
      ],
      defeat: [
        {
          type: "rating",
          value: 60,
          description: "National-level competitor",
        },
      ],
      dnf: [
        {
          type: "reputation",
          value: -50,
          description: "National stage DNF hurts badly",
        },
      ],
    },
    pressureLevel: 85,
    mentalDemand: 50,
    preRaceNarrative: [
      "National TV cameras. The entire running world is watching.",
      "This is it. US Marathon Championship. The big stage.",
      "Sponsors, media, legends - all here. And so are you.",
    ],
    midRaceNarrative: [
      "Monument Square. Mile 20. The wall awaits. Champions push through.",
      "Helicopter overhead. This moment is being broadcast nationwide.",
      "The field is shredded. Only the strongest remain. Are you strong enough?",
    ],
    postVictoryNarrative: [
      "NATIONAL CHAMPION! The crowd erupts. You're a household name now.",
      "Olympic Trials await. You've earned your place among the legends.",
    ],
    postDefeatNarrative: [
      "Defeated on the national stage. It's a different level up here.",
      "The wall broke you at Monument Square. But you were there. You competed.",
    ],
    specialRules: [
      "Top 3 qualify for Olympic Trials automatically",
      "National media coverage adds immense pressure",
      "The 20-mile wall at Monument Square is legendary",
    ],
  },

  olympic_trials: {
    id: "olympic_trials",
    name: "Olympic Marathon Trials",
    locationId: "olympic_trials",
    stakeLevel: "historic",
    championship: {
      tier: "olympic",
      title: "Olympic Team Member",
      year: 2026,
      fieldSize: 200,
      eliteCompetition: true,
      rewards: {
        title: "Olympian",
        rating: 500,
        prize: 25000,
        reputation: 200,
      },
      topNAdvance: 3,
    },
    requirements: {
      minLevel: 28,
      minRating: 2400,
      storyChapterRequired: 5,
      qualificationNeeded: true,
    },
    consequences: {
      victory: [
        {
          type: "rating",
          value: 500,
          description: "Olympic Team - immortality",
        },
        {
          type: "story",
          value: "olympian",
          description: "Your name in Olympic history forever",
        },
      ],
      defeat: [
        {
          type: "rating",
          value: 100,
          description: "Olympic Trials competitor",
        },
        {
          type: "mental",
          value: -50,
          description: "So close to the dream",
        },
      ],
      dnf: [
        {
          type: "reputation",
          value: -100,
          description: "Olympic Trials DNF - career-defining failure",
        },
        {
          type: "mental",
          value: -100,
          description: "The weight of failure on the biggest stage",
        },
      ],
    },
    pressureLevel: 100,
    mentalDemand: 75,
    preRaceNarrative: [
      "Olympic Trials. Top 3 go to the Olympics. Everyone else goes home.",
      "The weight of a lifetime of sacrifice hangs in the humid Atlanta air.",
      "This is it. Everything you've trained for comes down to 26.2 miles.",
    ],
    midRaceNarrative: [
      "Judgment Mile. This is where Olympic dreams live or die.",
      "The pace is inhuman. Olympic pace. Can you hold it?",
      "The stadium looms. Cross that line in top 3 and your life changes forever.",
    ],
    postVictoryNarrative: [
      "TOP 3. YOU'RE GOING TO THE OLYMPICS. Everything you sacrificed was worth it.",
      "Olympian. The word echoes in your mind. You're an Olympian.",
      "Your name will be remembered forever. Olympic Team member.",
    ],
    postDefeatNarrative: [
      "4th place. One spot away. The cruelest position. Olympic dreams end here.",
      "You gave everything. It wasn't enough. The Olympic dream dies today.",
      "You competed at the highest level and came up short. But you were there.",
    ],
    specialRules: [
      "ONLY TOP 3 MAKE THE OLYMPIC TEAM",
      "One of the highest pressure environments in all of sports",
      "Judgment Mile (Mile 30) historically decides the race",
      "DNF at Olympic Trials can end careers",
    ],
  },
};

/**
 * Generate race field for a championship.
 */
export function generateChampionshipField(
  championshipId: string,
  seed: number,
): RaceField {
  const championship = CHAMPIONSHIPS[championshipId];
  if (!championship.championship) {
    return {
      totalCompetitors: 50,
      eliteRunners: [],
      averageRating: 1500,
    };
  }

  const { tier, fieldSize } = championship.championship;

  // Select elite runners based on tier
  const elitePool = Object.values(ELITE_RUNNERS);
  const numElites =
    tier === "olympic"
      ? 5
      : tier === "national"
        ? 4
        : tier === "state"
          ? 3
          : tier === "regional"
            ? 2
            : 1;

  const eliteRunners: EliteRunner[] = [];
  for (let i = 0; i < numElites && i < elitePool.length; i++) {
    const index = ((seed + i) * 9301 + 49297) % elitePool.length;
    eliteRunners.push(elitePool[index]);
  }

  // Calculate average rating
  const baseRating =
    tier === "olympic"
      ? 2400
      : tier === "national"
        ? 2100
        : tier === "state"
          ? 1900
          : tier === "regional"
            ? 1700
            : 1500;

  return {
    totalCompetitors: fieldSize,
    eliteRunners,
    averageRating: baseRating,
  };
}
