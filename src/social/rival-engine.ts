/**
 * Rival AI Progression Engine
 *
 * Simulates rival training cycles, adaptive difficulty scaling, and
 * generates realistic activity feeds. Rivals respond to player growth
 * — the better the player performs, the harder rivals train.
 */

import type { RunnerProfile } from "@/runner/runner-types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RivalAIData {
  id: string;
  name: string;
  baseRp: number;
  currentRp: number;
  archetype: "frontrunner" | "splitter" | "steady";
  trainingFocus: "speed" | "stamina" | "willpower" | "balanced";
  recentRpChanges: number[]; // Last 5 RP changes (positive = gained, negative = lost)
  totalTrainingCycles: number;
  lastActivityDate: string | null; // ISO date
}

export interface RivalTrainingResult {
  rpChange: number;
  distance: number;
  focus: string;
  description: { en: string; id: string };
  attributeImproved?: string;
}

export interface RivalProgressionConfig {
  /** Base chance (0-1) a rival trains on any given day */
  baseTrainingChance: number;
  /** How much the player's level difference affects rival intensity */
  levelInfluenceFactor: number;
  /** Maximum RP a rival can gain from a single training cycle */
  maxRpGainPerCycle: number;
  /** Minimum RP a rival can lose from a rest/off day */
  maxRpLossPerRest: number;
}

const DEFAULT_CONFIG: RivalProgressionConfig = {
  baseTrainingChance: 0.65,
  levelInfluenceFactor: 0.15,
  maxRpGainPerCycle: 35,
  maxRpLossPerRest: 10,
};

// ─── Archetype modifiers ─────────────────────────────────────────────────────

const ARCHETYPE_TRAINING_BIAS: Record<
  string,
  { focus: string; distanceRange: [number, number]; intensityRange: [number, number] }
> = {
  frontrunner: {
    focus: "speed",
    distanceRange: [5, 12],
    intensityRange: [0.7, 1.0],
  },
  splitter: {
    focus: "balanced",
    distanceRange: [8, 18],
    intensityRange: [0.5, 0.8],
  },
  steady: {
    focus: "stamina",
    distanceRange: [10, 25],
    intensityRange: [0.4, 0.7],
  },
};

// ─── Core functions ──────────────────────────────────────────────────────────

/**
 * Generates a seeded pseudo-random number (0-1) using a simple mulberry32.
 * Ensures deterministic results for the same seed value.
 */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Calculates an adaptive difficulty multiplier based on the player's
 * level relative to the rival's "expected" level (derived from baseRp).
 *
 * When the player is ahead: rivals train harder (multiplier > 1)
 * When the player is behind: rivals ease up (multiplier < 1)
 */
export function getAdaptiveDifficultyMultiplier(
  playerRp: number,
  rivalCurrentRp: number,
  rivalBaseRp: number,
): number {
  const rpDelta = playerRp - rivalCurrentRp;

  // If player is far ahead, rivals get a boost to catch up
  if (rpDelta > 200) return 1.4;
  if (rpDelta > 100) return 1.2;
  if (rpDelta > 50) return 1.1;

  // If player is far behind, rivals coast a bit
  if (rpDelta < -200) return 0.7;
  if (rpDelta < -100) return 0.85;
  if (rpDelta < -50) return 0.95;

  // Close match — normal difficulty
  return 1.0;
}

/**
 * Simulates a single training cycle for a rival.
 * Returns the RP change and an activity description for the feed.
 */
export function simulateRivalTraining(
  rival: RivalAIData,
  playerProfile: RunnerProfile,
  daySeed: number,
  config: RivalProgressionConfig = DEFAULT_CONFIG,
): RivalTrainingResult | null {
  const rand = seededRandom(daySeed + rival.id.charCodeAt(0) * 1000);

  // Does the rival train today?
  const adjustedChance =
    config.baseTrainingChance *
    getAdaptiveDifficultyMultiplier(
      playerProfile.rankPoints || 0,
      rival.currentRp,
      rival.baseRp,
    );

  if (rand() > adjustedChance) {
    // Rest day — slight RP decay
    const rpLoss = Math.floor(rand() * config.maxRpLossPerRest);
    return {
      rpChange: -rpLoss,
      distance: 0,
      focus: "rest",
      description: {
        en: "took a rest day to recover and prevent injuries.",
        id: "mengambil hari istirahat untuk pemulihan dan mencegah cedera.",
      },
    };
  }

  // Determine training parameters based on archetype
  const bias = ARCHETYPE_TRAINING_BIAS[rival.archetype] || ARCHETYPE_TRAINING_BIAS.steady;
  const distance =
    bias.distanceRange[0] +
    rand() * (bias.distanceRange[1] - bias.distanceRange[0]);
  const intensity =
    bias.intensityRange[0] +
    rand() * (bias.intensityRange[1] - bias.intensityRange[0]);

  // RP gain formula: base gain scaled by distance, intensity, and adaptive multiplier
  const adaptiveMult = getAdaptiveDifficultyMultiplier(
    playerProfile.rankPoints || 0,
    rival.currentRp,
    rival.baseRp,
  );

  const baseGain = distance * intensity * 1.5;
  const randomVariance = 0.8 + rand() * 0.4; // 0.8 - 1.2
  const rpGain = Math.min(
    Math.floor(baseGain * randomVariance * adaptiveMult),
    config.maxRpGainPerCycle,
  );

  // Determine training focus (with archetype bias)
  const focusRoll = rand();
  let focus: string;
  if (focusRoll < 0.6) {
    focus = bias.focus;
  } else if (focusRoll < 0.8) {
    focus = "willpower";
  } else {
    focus = ["speed", "stamina", "willpower"][Math.floor(rand() * 3)];
  }

  // Generate description
  const description = generateTrainingDescription(
    rival.name,
    Math.round(distance),
    focus,
    intensity,
  );

  return {
    rpChange: rpGain,
    distance: Math.round(distance),
    focus,
    description,
    attributeImproved: focus === "rest" ? undefined : focus,
  };
}

/**
 * Generates a human-readable training description.
 */
function generateTrainingDescription(
  name: string,
  distance: number,
  focus: string,
  _intensity: number,
): { en: string; id: string } {
  const templates: Record<
    string,
    Array<{ en: string; id: string }>
  > = {
    speed: [
      {
        en: `${name} sprinted intervals at the track, pushing their Speed to new limits.`,
        id: `${name} melakukan lari interval cepat di trek, mendorong Kecepatan ke batas baru.`,
      },
      {
        en: `${name} crushed a ${distance}km tempo run with rapid cadence drills.`,
        id: `${name} menyelesaikan lari tempo ${distance}km dengan latihan irama cepat.`,
      },
      {
        en: `${name} worked on explosive starts and acceleration over ${distance}km.`,
        id: `${name} berlatih start eksplosif dan akselerasi sejauh ${distance}km.`,
      },
    ],
    stamina: [
      {
        en: `${name} completed a grueling ${distance}km long run at a steady pace.`,
        id: `${name} menyelesaikan lari jarak jauh ${distance}km yang melelahkan dengan ritme stabil.`,
      },
      {
        en: `${name} tackled hill repeats over ${distance}km to build raw endurance.`,
        id: `${name} menaklukkan pengulangan bukit sejauh ${distance}km untuk membangun daya tahan.`,
      },
      {
        en: `${name} went on a ${distance}km trail run through rugged terrain.`,
        id: `${name} berlari lintas alam ${distance}km melalui medan yang berat.`,
      },
    ],
    willpower: [
      {
        en: `${name} practiced mindfulness and negative-split pacing over ${distance}km.`,
        id: `${name} melatih kesadaran dan ritme pembagian negatif sejauh ${distance}km.`,
      },
      {
        en: `${name} endured a high-intensity ${distance}km session in adverse conditions.`,
        id: `${name} menjalani sesi intensitas tinggi ${distance}km dalam kondisi buruk.`,
      },
      {
        en: `${name} focused on mental toughness drills during a ${distance}km run.`,
        id: `${name} berfokus pada latihan ketangguhan mental selama lari ${distance}km.`,
      },
    ],
    balanced: [
      {
        en: `${name} mixed speed and endurance work in a versatile ${distance}km training block.`,
        id: `${name} menggabungkan latihan kecepatan dan daya tahan dalam blok latihan ${distance}km yang serbaguna.`,
      },
      {
        en: `${name} followed a structured ${distance}km session targeting all energy systems.`,
        id: `${name} mengikuti sesi ${distance}km terstruktur yang menargetkan semua sistem energi.`,
      },
    ],
  };

  const pool = templates[focus] || templates.balanced;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Initializes a RivalAIData from a base definition.
 */
export function createRivalAIData(
  id: string,
  name: string,
  baseRp: number,
  archetype: "frontrunner" | "splitter" | "steady",
): RivalAIData {
  const trainingFocusMap: Record<string, "speed" | "stamina" | "willpower" | "balanced"> = {
    frontrunner: "speed",
    splitter: "balanced",
    steady: "stamina",
  };

  return {
    id,
    name,
    baseRp,
    currentRp: baseRp,
    archetype,
    trainingFocus: trainingFocusMap[archetype] || "balanced",
    recentRpChanges: [],
    totalTrainingCycles: 0,
    lastActivityDate: null,
  };
}

/**
 * Returns the default set of rivals used across the social system.
 */
export function getDefaultRivals(): RivalAIData[] {
  return [
    createRivalAIData("marcus_rivera", "Marcus 'The Machine' Rivera", 1350, "frontrunner"),
    createRivalAIData("ellie_park", "Ellie 'Lightning' Park", 890, "frontrunner"),
    createRivalAIData("kenji_nakamura", "Kenji 'Silent Storm' Nakamura", 1100, "splitter"),
    createRivalAIData("sarah_chen", "Sarah 'Ironheart' Chen", 1450, "steady"),
    createRivalAIData("alex_santos", "Alex 'The Natural' Santos", 980, "splitter"),
    createRivalAIData("maria_gonzalez", "Maria 'Momentum' Gonzalez", 1200, "steady"),
  ];
}

/**
 * Runs a full day of rival progression for all rivals.
 * Returns an array of training results (only non-null ones) and updated rival data.
 */
export function simulateRivalsDay(
  rivals: RivalAIData[],
  playerProfile: RunnerProfile,
  daySeed: number,
): {
  updatedRivals: RivalAIData[];
  activities: Array<{
    rivalId: string;
    rivalName: string;
    result: RivalTrainingResult;
  }>;
} {
  const activities: Array<{
    rivalId: string;
    rivalName: string;
    result: RivalTrainingResult;
  }> = [];

  const updatedRivals = rivals.map((rival, index) => {
    const result = simulateRivalTraining(rival, playerProfile, daySeed + index * 7);

    if (result) {
      const newRp = Math.max(0, rival.currentRp + result.rpChange);

      // Track recent changes (keep last 5)
      const recent = [...rival.recentRpChanges, result.rpChange].slice(-5);

      if (result.rpChange !== 0) {
        activities.push({
          rivalId: rival.id,
          rivalName: rival.name,
          result,
        });
      }

      return {
        ...rival,
        currentRp: newRp,
        recentRpChanges: recent,
        totalTrainingCycles: rival.totalTrainingCycles + (result.rpChange > 0 ? 1 : 0),
        lastActivityDate: new Date().toISOString(),
      };
    }

    return rival;
  });

  return { updatedRivals, activities };
}
