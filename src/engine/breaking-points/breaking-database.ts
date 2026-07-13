import type { SimulationState } from "@/types/engine";
import type { BreakingPoint } from "./breaking-types";

/**
 * Database of breaking points
 * Authentic physical/mental crisis moments during races
 */
export const BREAKING_POINTS: BreakingPoint[] = [
  // === THE WALL ===
  {
    id: "the_wall_warning",
    type: "the_wall",
    severity: "warning",
    trigger: (state) =>
      state.distanceCovered > 28 &&
      state.distanceCovered < 32 &&
      state.energy < 35 &&
      state.totalDistance >= 35, // Marathon+ only
    warningMessage: {
      en: "Your body is starting to feel heavy. The Wall might be coming...",
      id: "Tubuh Anda mulai terasa berat. Tembok mungkin datang...",
    },
    onsetMessage: {
      en: "WARNING: Early signs of The Wall approaching",
      id: "PERINGATAN: Tanda-tanda awal Tembok mendekat",
    },
    symptoms: {
      en: "Your legs feel increasingly heavy. Each step requires more conscious effort.",
      id: "Kaki Anda semakin terasa berat. Setiap langkah membutuhkan lebih banyak usaha sadar.",
    },
    effects: {
      pace: 5,
      energy: -5,
      confidence: -10,
    },
    recoveryOptions: [
      {
        id: "fuel_now",
        action: {
          en: "Take energy gel immediately",
          id: "Ambil gel energi segera",
        },
        effects: {
          energy: 15,
          pace: -5,
        },
        recoveryChance: 0.8,
        risk: "low",
      },
      {
        id: "slow_down",
        action: {
          en: "Reduce pace to conserve",
          id: "Kurangi kecepatan untuk menghemat",
        },
        effects: {
          pace: 10,
          energy: 10,
          momentum: -15,
        },
        recoveryChance: 0.7,
        risk: "low",
      },
      {
        id: "push_through",
        action: {
          en: "Push through, ignore it",
          id: "Dorong terus, abaikan",
        },
        effects: {
          energy: -15,
          pace: 15,
          muscleFatigue: 20,
        },
        recoveryChance: 0.2,
        risk: "high",
      },
    ],
    priority: 9,
  },
  {
    id: "the_wall_full",
    type: "the_wall",
    severity: "critical",
    trigger: (state) =>
      state.distanceCovered > 30 &&
      state.energy < 20 &&
      state.muscleFatigue > 75 &&
      state.totalDistance >= 35,
    onsetMessage: {
      en: "THE WALL! You've hit it HARD!",
      id: "TEMBOK! Anda menabraknya KERAS!",
    },
    symptoms: {
      en: "Your legs feel like LEAD. Every step is torture. Your brain is screaming to STOP. This is The Wall.",
      id: "Kaki Anda terasa seperti TIMAH. Setiap langkah adalah siksaan. Otak Anda berteriak untuk BERHENTI. Ini adalah Tembok.",
    },
    effects: {
      pace: 30,
      energy: -10,
      confidence: -25,
      muscleFatigue: 20,
      momentum: -30,
    },
    recoveryOptions: [
      {
        id: "survival_mode",
        action: {
          en: "Survival mode - walk if needed",
          id: "Mode bertahan - jalan jika perlu",
        },
        effects: {
          pace: 40,
          energy: 15,
          muscleFatigue: -10,
        },
        recoveryChance: 0.9,
        risk: "low",
      },
      {
        id: "mental_push",
        action: {
          en: "Pure mental willpower - refuse to stop",
          id: "Kemauan mental murni - menolak berhenti",
        },
        effects: {
          confidence: 30,
          pace: 10,
          energy: -5,
          mentalFatigue: -20,
        },
        recoveryChance: 0.5,
        risk: "medium",
      },
    ],
    priority: 10,
  },

  // === CRAMPS ===
  {
    id: "cramp_warning",
    type: "cramp",
    severity: "warning",
    trigger: (state) =>
      state.distanceCovered > state.totalDistance * 0.5 &&
      state.hydration < 40 &&
      state.muscleFatigue > 60,
    warningMessage: {
      en: "Your calf is tightening. Cramp warning!",
      id: "Betis Anda mengencang. Peringatan kram!",
    },
    onsetMessage: {
      en: "CRAMP THREAT - Your muscles are dangerously tight",
      id: "ANCAMAN KRAM - Otot Anda sangat kencang",
    },
    symptoms: {
      en: "Sharp tightness in your right calf. If this fully locks up, your race is over.",
      id: "Kencang tajam di betis kanan Anda. Jika ini sepenuhnya terkunci, balapan Anda selesai.",
    },
    effects: {
      pace: 8,
      confidence: -15,
    },
    recoveryOptions: [
      {
        id: "hydrate_slow",
        action: {
          en: "Hydrate and slow pace",
          id: "Hidrasi dan perlambat kecepatan",
        },
        effects: {
          hydration: 20,
          pace: 10,
          muscleFatigue: -15,
        },
        recoveryChance: 0.85,
        risk: "low",
      },
      {
        id: "stretch_quick",
        action: {
          en: "Quick stretch while moving",
          id: "Peregangan cepat sambil bergerak",
        },
        effects: {
          muscleFatigue: -10,
          pace: 5,
        },
        recoveryChance: 0.6,
        risk: "medium",
      },
      {
        id: "ignore_cramp",
        action: {
          en: "Ignore it, maintain pace",
          id: "Abaikan, pertahankan kecepatan",
        },
        effects: {
          muscleFatigue: 25,
          pace: 20,
        },
        recoveryChance: 0.15,
        risk: "high",
      },
    ],
    priority: 8,
  },
  {
    id: "cramp_full",
    type: "cramp",
    severity: "critical",
    trigger: (state) =>
      state.hydration < 30 &&
      state.muscleFatigue > 80 &&
      state.distanceCovered > state.totalDistance * 0.6,
    onsetMessage: {
      en: "FULL CRAMP! Your calf just LOCKED UP!",
      id: "KRAM PENUH! Betis Anda baru saja TERKUNCI!",
    },
    symptoms: {
      en: "EXCRUCIATING pain! Your calf is seized. You can barely walk. This is AGONY.",
      id: "Rasa sakit MENYIKSA! Betis Anda tersita. Anda hampir tidak bisa berjalan. Ini SIKSAAN.",
    },
    effects: {
      pace: 50,
      energy: -20,
      confidence: -30,
      momentum: -40,
    },
    recoveryOptions: [
      {
        id: "stop_stretch",
        action: {
          en: "STOP and stretch it out (lose time)",
          id: "BERHENTI dan regangkan (kehilangan waktu)",
        },
        effects: {
          muscleFatigue: -40,
          pace: 60,
          confidence: -10,
        },
        recoveryChance: 0.95,
        risk: "low",
      },
      {
        id: "massage_move",
        action: {
          en: "Massage while hobbling forward",
          id: "Pijat sambil tertatih maju",
        },
        effects: {
          muscleFatigue: -20,
          pace: 40,
        },
        recoveryChance: 0.6,
        risk: "medium",
      },
    ],
    priority: 10,
  },

  // === BONK (Energy Depletion) ===
  {
    id: "bonk",
    type: "bonk",
    severity: "critical",
    trigger: (state) =>
      state.energy < 10 && state.distanceCovered > state.totalDistance * 0.4,
    onsetMessage: {
      en: "BONK! You're out of fuel!",
      id: "BONK! Anda kehabisan bahan bakar!",
    },
    symptoms: {
      en: "Empty. Completely empty. Your body has no fuel left. Everything is shutting down.",
      id: "Kosong. Benar-benar kosong. Tubuh Anda tidak ada bahan bakar tersisa. Semuanya mati.",
    },
    effects: {
      pace: 40,
      confidence: -35,
      momentum: -50,
      mentalFatigue: 30,
    },
    recoveryOptions: [
      {
        id: "emergency_fuel",
        action: {
          en: "Emergency gel + water NOW",
          id: "Gel darurat + air SEKARANG",
        },
        effects: {
          energy: 25,
          hydration: 15,
          pace: -20,
        },
        recoveryChance: 0.8,
        risk: "low",
      },
      {
        id: "walk_recover",
        action: {
          en: "Walk to partially recover",
          id: "Jalan untuk pulih sebagian",
        },
        effects: {
          energy: 15,
          pace: 50,
          momentum: -20,
        },
        recoveryChance: 0.7,
        risk: "low",
      },
    ],
    priority: 10,
  },

  // === MENTAL BREAK ===
  {
    id: "mental_break",
    type: "mental_break",
    severity: "critical",
    trigger: (state) =>
      state.mentalFatigue > 85 &&
      state.confidence < 30 &&
      state.distanceCovered > state.totalDistance * 0.6,
    onsetMessage: {
      en: "Mental breakdown! You want to QUIT!",
      id: "Runtuh mental! Anda ingin BERHENTI!",
    },
    symptoms: {
      en: "Your mind is broken. All you want is for this to END. Every fiber of your being is screaming STOP.",
      id: "Pikiran Anda hancur. Yang Anda inginkan adalah ini BERAKHIR. Setiap serat diri Anda berteriak BERHENTI.",
    },
    effects: {
      pace: 35,
      confidence: -30,
      momentum: -45,
    },
    recoveryOptions: [
      {
        id: "remember_why",
        action: {
          en: "Remember WHY you're here",
          id: "Ingat MENGAPA Anda di sini",
        },
        effects: {
          confidence: 35,
          mentalFatigue: -30,
          pace: -15,
        },
        recoveryChance: 0.7,
        risk: "low",
      },
      {
        id: "just_finish",
        action: {
          en: "Just... finish... somehow...",
          id: "Hanya... selesai... entah bagaimana...",
        },
        effects: {
          pace: 20,
          momentum: -10,
        },
        recoveryChance: 0.9,
        risk: "low",
      },
    ],
    priority: 9,
  },

  // === SIDE STITCH ===
  {
    id: "stitch",
    type: "stitch",
    severity: "onset",
    trigger: (state) =>
      state.distanceCovered > 3 &&
      state.distanceCovered < 15 &&
      state.energy < 70 &&
      state.muscleFatigue > 35,
    onsetMessage: {
      en: "Sharp side stitch!",
      id: "Nyeri samping tajam!",
    },
    symptoms: {
      en: "Stabbing pain in your right side. It HURTS to breathe deeply.",
      id: "Rasa sakit menusuk di sisi kanan Anda. SAKIT untuk bernapas dalam-dalam.",
    },
    effects: {
      pace: 10,
      confidence: -10,
      energy: -5,
    },
    recoveryOptions: [
      {
        id: "slow_breathe",
        action: {
          en: "Slow down, control breathing",
          id: "Perlambat, kontrol pernapasan",
        },
        effects: {
          pace: 8,
          energy: 10,
          confidence: 10,
        },
        recoveryChance: 0.9,
        risk: "low",
      },
      {
        id: "push_through_stitch",
        action: {
          en: "Push through the pain",
          id: "Dorong melalui rasa sakit",
        },
        effects: {
          energy: -15,
          pace: 15,
          confidence: -10,
        },
        recoveryChance: 0.3,
        risk: "high",
      },
    ],
    priority: 6,
  },
];

/**
 * Get breaking point that matches conditions
 */
export function getBreakingPoint(
  state: SimulationState,
  shownBreakingPoints: Set<string>,
): BreakingPoint | null {
  // Filter breaking points that match conditions and haven't been shown
  const matchingPoints = BREAKING_POINTS.filter(
    (bp) => !shownBreakingPoints.has(bp.id) && bp.trigger(state),
  );

  if (matchingPoints.length === 0) {
    return null;
  }

  // Sort by priority (highest first)
  matchingPoints.sort((a, b) => b.priority - a.priority);

  return matchingPoints[0];
}
