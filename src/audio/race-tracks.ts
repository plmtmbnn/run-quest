/**
 * Race Music Track Definitions
 *
 * This module defines the adaptive music system for races.
 * Uses Web Audio API for procedural generation (no external audio files required).
 * Music adapts to race phases: start, mid_race, final_kick, crisis, victory.
 */

import type { PacingPlan } from "@/types/engine";

export type RacePhase =
  | "start"
  | "mid_race"
  | "final_kick"
  | "crisis"
  | "victory";

export type RaceMusicPhase = RacePhase | "none";

/**
 * Music track definition for procedural generation
 */
export interface RaceMusicTrack {
  id: string;
  name: string;
  phase: RacePhase;
  bpm: number;
  /**
   * Synth parameters for Web Audio API generation
   */
  synthParams: {
    baseFrequency: number; // Base frequency in Hz
    rhythmPattern: "steady" | "accelerating" | "intense" | "minimal";
    intensity: number; // 0-1 intensity level
    waveType: "sine" | "square" | "sawtooth" | "triangle";
    harmonicComplexity: number; // 1-5, higher = more harmonics
  };
  /**
   * Layer definitions for richer sound
   */
  layers?: {
    bass?: {
      frequency: number;
      waveType: "sine" | "square" | "sawtooth" | "triangle";
      volume: number;
    };
    melody?: {
      frequencies: number[];
      waveType: "sine" | "square" | "sawtooth" | "triangle";
      volume: number;
      pattern: number[]; // Pattern of notes (indices into frequencies)
    };
    drums?: {
      kickPattern: number[]; // 1 = play, 0 = rest
      snarePattern: number[];
      bpmMultiplier: number;
    };
  };
}

/**
 * Race stats for adaptive music decisions
 */
export interface RaceMusicStats {
  currentKm: number;
  totalDistance: number;
  energy: number;
  focus: number;
  confidence: number;
  momentum: number;
  riskLevel: number;
  pace: number;
  pacingPlan: PacingPlan;
  isPaused: boolean;
}

/**
 * Music track definitions for different race phases
 */
export const RACE_TRACKS: Record<RacePhase, RaceMusicTrack> = {
  start: {
    id: "start",
    name: "Calm Start",
    phase: "start",
    bpm: 90,
    synthParams: {
      baseFrequency: 220, // A3
      rhythmPattern: "steady",
      intensity: 0.3,
      waveType: "sine",
      harmonicComplexity: 2,
    },
    layers: {
      bass: {
        frequency: 110, // A2
        waveType: "sine",
        volume: 0.2,
      },
      melody: {
        frequencies: [261.63, 329.63, 392.0, 440.0], // C4, E4, G4, A4
        waveType: "sine",
        volume: 0.15,
        pattern: [0, 1, 2, 3, 2, 1, 0, 1],
      },
      drums: {
        kickPattern: [1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0],
        bpmMultiplier: 1,
      },
    },
  },

  mid_race: {
    id: "mid_race",
    name: "Steady Rhythm",
    phase: "mid_race",
    bpm: 110,
    synthParams: {
      baseFrequency: 261.63, // C4
      rhythmPattern: "steady",
      intensity: 0.5,
      waveType: "sawtooth",
      harmonicComplexity: 3,
    },
    layers: {
      bass: {
        frequency: 130.81, // C3
        waveType: "square",
        volume: 0.25,
      },
      melody: {
        frequencies: [329.63, 392.0, 440.0, 523.25], // E4, G4, A4, C5
        waveType: "triangle",
        volume: 0.2,
        pattern: [0, 1, 2, 3, 2, 1, 0, 2],
      },
      drums: {
        kickPattern: [1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0],
        bpmMultiplier: 1,
      },
    },
  },

  final_kick: {
    id: "final_kick",
    name: "High Intensity",
    phase: "final_kick",
    bpm: 140,
    synthParams: {
      baseFrequency: 329.63, // E4
      rhythmPattern: "accelerating",
      intensity: 0.8,
      waveType: "sawtooth",
      harmonicComplexity: 4,
    },
    layers: {
      bass: {
        frequency: 164.81, // E3
        waveType: "square",
        volume: 0.3,
      },
      melody: {
        frequencies: [392.0, 440.0, 523.25, 659.25], // G4, A4, C5, E5
        waveType: "sawtooth",
        volume: 0.25,
        pattern: [0, 1, 2, 3, 2, 1, 0, 3],
      },
      drums: {
        kickPattern: [1, 0, 1, 0],
        snarePattern: [0, 1, 0, 1],
        bpmMultiplier: 1.5,
      },
    },
  },

  crisis: {
    id: "crisis",
    name: "Desperation",
    phase: "crisis",
    bpm: 80,
    synthParams: {
      baseFrequency: 196.0, // G3
      rhythmPattern: "minimal",
      intensity: 0.4,
      waveType: "sine",
      harmonicComplexity: 1,
    },
    layers: {
      bass: {
        frequency: 98, // G2
        waveType: "sine",
        volume: 0.15,
      },
      // No melody or drums in crisis - just heartbeat-like bass
      drums: {
        kickPattern: [1, 0, 0, 0],
        snarePattern: [0, 0, 0, 0],
        bpmMultiplier: 0.5,
      },
    },
  },

  victory: {
    id: "victory",
    name: "Triumphant",
    phase: "victory",
    bpm: 120,
    synthParams: {
      baseFrequency: 392.0, // G4
      rhythmPattern: "intense",
      intensity: 0.7,
      waveType: "sawtooth",
      harmonicComplexity: 5,
    },
    layers: {
      bass: {
        frequency: 196.0, // G3
        waveType: "square",
        volume: 0.3,
      },
      melody: {
        frequencies: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
        waveType: "sine",
        volume: 0.3,
        pattern: [0, 1, 2, 3, 2, 1, 0, 3],
      },
      drums: {
        kickPattern: [1, 0, 0, 0],
        snarePattern: [0, 0, 1, 0],
        bpmMultiplier: 1,
      },
    },
  },
};

/**
 * Determine the current race phase based on progress and stats
 */
export function getRacePhase(stats: RaceMusicStats): RaceMusicPhase {
  const {
    currentKm,
    totalDistance,
    energy,
    focus,
    confidence,
    momentum,
    riskLevel,
  } = stats;

  // Calculate progress percentage
  const progress = currentKm / totalDistance;

  // Crisis mode: low energy, low focus, high risk
  if (energy < 20 || (focus < 30 && riskLevel > 70)) {
    return "crisis";
  }

  // Victory phase (race just finished)
  if (currentKm >= totalDistance) {
    return "victory";
  }

  // Final kick phase: last 20% of race
  if (progress > 0.8) {
    return "final_kick";
  }

  // Start phase: first 20% of race
  if (progress < 0.2) {
    return "start";
  }

  // Mid race phase
  return "mid_race";
}

/**
 * Get the appropriate music track for the current phase
 */
export function getTrackForPhase(phase: RaceMusicPhase): RaceMusicTrack | null {
  if (phase === "none") return null;
  return RACE_TRACKS[phase];
}

/**
 * Sound effect types for race atmosphere
 */
export type RaceSoundEffect =
  | "heartbeat"
  | "crowd_ambient"
  | "crowd_cheer"
  | "wind_whoosh"
  | "bell_chime"
  | "footsteps";

/**
 * Configuration for sound effects based on race conditions
 */
export interface SoundEffectConfig {
  type: RaceSoundEffect;
  enabled: boolean;
  volume: number; // 0-1
  frequency: number; // How often to play (in seconds)
  conditions?: {
    minEnergy?: number;
    maxEnergy?: number;
    minProgress?: number;
    maxProgress?: number;
  };
}

/**
 * Sound effect configurations
 */
export const SOUND_EFFECTS: Record<RaceSoundEffect, SoundEffectConfig> = {
  heartbeat: {
    type: "heartbeat",
    enabled: true,
    volume: 0.2,
    frequency: 0.8,
    conditions: {
      maxEnergy: 25,
    },
  },
  crowd_ambient: {
    type: "crowd_ambient",
    enabled: true,
    volume: 0.15,
    frequency: 5,
    conditions: {
      minProgress: 0.1,
    },
  },
  crowd_cheer: {
    type: "crowd_cheer",
    enabled: true,
    volume: 0.25,
    frequency: 15,
    conditions: {
      minProgress: 0.7,
    },
  },
  wind_whoosh: {
    type: "wind_whoosh",
    enabled: true,
    volume: 0.1,
    frequency: 10,
    conditions: {
      minProgress: 0.5,
    },
  },
  bell_chime: {
    type: "bell_chime",
    enabled: true,
    volume: 0.2,
    frequency: 300, // Only at 5km milestones
    conditions: {
      // Will be triggered manually at 5km intervals
    },
  },
  footsteps: {
    type: "footsteps",
    enabled: true,
    volume: 0.1,
    frequency: 0.5,
    conditions: {},
  },
};

/**
 * Check if a sound effect should be active based on current stats
 */
export function shouldPlaySoundEffect(
  effectType: RaceSoundEffect,
  stats: RaceMusicStats,
): boolean {
  const config = SOUND_EFFECTS[effectType];
  if (!config.enabled) return false;

  const { currentKm, totalDistance, energy } = stats;
  const progress = currentKm / totalDistance;
  const { conditions } = config;

  if (conditions?.minEnergy !== undefined && energy < conditions.minEnergy) {
    return false;
  }
  if (conditions?.maxEnergy !== undefined && energy > conditions.maxEnergy) {
    return false;
  }
  if (
    conditions?.minProgress !== undefined &&
    progress < conditions.minProgress
  ) {
    return false;
  }
  if (
    conditions?.maxProgress !== undefined &&
    progress > conditions.maxProgress
  ) {
    return false;
  }

  return true;
}
