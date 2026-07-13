import type { SimulationState } from "@/types/engine";
import type { DramaticEvent, RaceContext } from "./event-types";

/**
 * Database of dramatic race events
 * These events create tension, emotion, and memorable moments during races
 */
export const DRAMATIC_EVENTS: DramaticEvent[] = [
  // === RIVAL ENCOUNTERS ===
  {
    id: "rival_spotted_ahead",
    type: "rival_encounter",
    trigger: (state, context) =>
      context.hasRival &&
      context.rivalAhead === true &&
      state.distanceCovered > 5 &&
      state.distanceCovered < context.raceDistance * 0.7,
    title: {
      en: "Rival Spotted!",
      id: "Rival Terlihat!",
    },
    description: {
      en: "You see your rival ahead, moving strong. They haven't noticed you yet.",
      id: "Anda melihat rival Anda di depan, bergerak kuat. Mereka belum menyadari Anda.",
    },
    emotionalTone: "tense",
    effects: {
      focus: 15,
      confidence: 10,
    },
    priority: 8,
  },
  {
    id: "rival_duel",
    type: "rival_encounter",
    trigger: (state, context) =>
      context.hasRival &&
      state.distanceCovered > context.raceDistance * 0.5 &&
      state.distanceCovered < context.raceDistance * 0.8 &&
      state.energy > 30,
    title: {
      en: "Side by Side!",
      id: "Berdampingan!",
    },
    description: {
      en: "Your rival pulls up beside you. You're matching pace. This is it—the defining moment!",
      id: "Rival Anda menyusul Anda. Anda menyamakan kecepatan. Ini dia—momen menentukan!",
    },
    emotionalTone: "tense",
    choices: [
      {
        id: "surge_now",
        text: {
          en: "Surge ahead now!",
          id: "Melesat sekarang!",
        },
        effect: {
          energy: -15,
          confidence: 20,
          momentum: 30,
        },
        outcome: {
          en: "You push hard and create separation!",
          id: "Anda mendorong keras dan menciptakan jarak!",
        },
        risk: "high",
      },
      {
        id: "match_pace",
        text: {
          en: "Match their pace, stay patient",
          id: "Samakan kecepatan mereka, sabar",
        },
        effect: {
          focus: 10,
          paceStability: 15,
        },
        outcome: {
          en: "You stay composed, waiting for your moment.",
          id: "Anda tetap tenang, menunggu momen Anda.",
        },
        risk: "low",
      },
    ],
    priority: 9,
  },
  {
    id: "rival_passed_me",
    type: "rival_encounter",
    trigger: (state, context) =>
      context.hasRival &&
      context.rivalAhead === false &&
      state.distanceCovered > context.raceDistance * 0.4 &&
      state.confidence > 40,
    title: {
      en: "They Just Passed You!",
      id: "Mereka Baru Saja Melewati Anda!",
    },
    description: {
      en: "Your rival surges past you with authority. How do you respond?",
      id: "Rival Anda melewati Anda dengan percaya diri. Bagaimana Anda merespons?",
    },
    emotionalTone: "challenging",
    choices: [
      {
        id: "chase_immediately",
        text: {
          en: "Chase them down immediately!",
          id: "Kejar mereka segera!",
        },
        effect: {
          energy: -20,
          confidence: -10,
          momentum: 10,
        },
        outcome: {
          en: "You react emotionally, burning energy to stay close.",
          id: "Anda bereaksi emosional, membakar energi untuk tetap dekat.",
        },
        risk: "high",
      },
      {
        id: "trust_plan",
        text: {
          en: "Trust your plan, stay calm",
          id: "Percaya rencana Anda, tetap tenang",
        },
        effect: {
          focus: 15,
          confidence: 10,
        },
        outcome: {
          en: "You let them go for now. Your race is still ahead.",
          id: "Anda biarkan mereka pergi untuk saat ini. Balapan Anda masih di depan.",
        },
        risk: "low",
      },
    ],
    priority: 9,
  },

  // === WEATHER DRAMA ===
  {
    id: "sudden_rain",
    type: "weather_shift",
    trigger: (state, context) =>
      context.weather === "rain" &&
      state.distanceCovered > 5 &&
      state.distanceCovered < context.raceDistance * 0.6,
    title: {
      en: "Sudden Downpour!",
      id: "Hujan Deras Tiba-tiba!",
    },
    description: {
      en: "The skies open up! Rain pelts your face. The course is getting slippery.",
      id: "Langit terbuka! Hujan memukul wajah Anda. Jalur menjadi licin.",
    },
    emotionalTone: "challenging",
    effects: {
      confidence: -10,
      paceStability: -15,
    },
    priority: 7,
  },
  {
    id: "scorching_heat",
    type: "weather_shift",
    trigger: (state, context) =>
      (context.weather === "hot" || context.weather === "sunny") &&
      state.distanceCovered > 10 &&
      state.hydration < 60,
    title: {
      en: "Heat Wave!",
      id: "Gelombang Panas!",
    },
    description: {
      en: "The sun is brutal. Every step feels heavier. Your body is screaming for water.",
      id: "Matahari sangat brutal. Setiap langkah terasa lebih berat. Tubuh Anda menjerit minta air.",
    },
    emotionalTone: "challenging",
    effects: {
      hydration: -15,
      energy: -10,
    },
    priority: 8,
  },

  // === MENTAL BATTLES ===
  {
    id: "doubt_creeping",
    type: "mental_battle",
    trigger: (state) =>
      state.distanceCovered > state.totalDistance * 0.4 &&
      state.distanceCovered < state.totalDistance * 0.7 &&
      state.energy < 50 &&
      state.mentalFatigue > 40,
    title: {
      en: "Doubt Creeps In",
      id: "Keraguan Merayap Masuk",
    },
    description: {
      en: "Your mind starts whispering: 'You can't do this. It's too hard. Just stop.' Do you listen?",
      id: "Pikiran Anda mulai berbisik: 'Anda tidak bisa melakukan ini. Terlalu sulit. Berhenti saja.' Apakah Anda mendengarkan?",
    },
    emotionalTone: "challenging",
    choices: [
      {
        id: "fight_doubt",
        text: {
          en: "FIGHT IT! I will not quit!",
          id: "LAWAN! Saya tidak akan berhenti!",
        },
        effect: {
          confidence: 20,
          focus: 15,
          mentalFatigue: -10,
        },
        outcome: {
          en: "You silence the doubt. Your will is stronger than pain.",
          id: "Anda membungkam keraguan. Kemauan Anda lebih kuat dari rasa sakit.",
        },
        risk: "low",
      },
      {
        id: "slow_down",
        text: {
          en: "Maybe I should slow down...",
          id: "Mungkin saya harus melambat...",
        },
        effect: {
          confidence: -15,
          momentum: -20,
          energy: 10,
        },
        outcome: {
          en: "You ease off the pace, giving in to the doubt.",
          id: "Anda mengurangi kecepatan, menyerah pada keraguan.",
        },
        risk: "medium",
      },
    ],
    priority: 8,
  },
  {
    id: "breakthrough_moment",
    type: "mental_battle",
    trigger: (state) =>
      state.distanceCovered > state.totalDistance * 0.6 &&
      state.distanceCovered < state.totalDistance * 0.8 &&
      state.confidence > 70 &&
      state.momentum > 60,
    title: {
      en: "Everything Clicks!",
      id: "Semuanya Klik!",
    },
    description: {
      en: "Suddenly, it all comes together. The pain fades. You feel unstoppable. This is what you trained for!",
      id: "Tiba-tiba, semuanya menyatu. Rasa sakit memudar. Anda merasa tak terhentikan. Ini untuk apa Anda berlatih!",
    },
    emotionalTone: "triumphant",
    effects: {
      energy: 20,
      confidence: 25,
      momentum: 30,
      focus: 20,
    },
    priority: 9,
  },

  // === PHYSICAL CRISES ===
  {
    id: "side_stitch",
    type: "physical_crisis",
    trigger: (state) =>
      state.distanceCovered > 3 &&
      state.distanceCovered < 15 &&
      state.energy < 70 &&
      state.muscleFatigue > 30,
    title: {
      en: "Sharp Side Stitch!",
      id: "Nyeri Samping Tajam!",
    },
    description: {
      en: "A stabbing pain in your side! It hurts to breathe. You need to manage this quickly.",
      id: "Rasa sakit menusuk di sisi Anda! Sakit untuk bernapas. Anda perlu mengelola ini dengan cepat.",
    },
    emotionalTone: "challenging",
    choices: [
      {
        id: "push_through_pain",
        text: {
          en: "Push through it!",
          id: "Dorong terus!",
        },
        effect: {
          energy: -15,
          muscleFatigue: 20,
          confidence: -10,
        },
        outcome: {
          en: "The pain persists, draining your energy.",
          id: "Rasa sakit bertahan, menguras energi Anda.",
        },
        risk: "high",
      },
      {
        id: "ease_breathing",
        text: {
          en: "Ease pace, control breathing",
          id: "Kurangi kecepatan, kontrol pernapasan",
        },
        effect: {
          energy: 5,
          focus: 10,
          momentum: -10,
        },
        outcome: {
          en: "The stitch gradually subsides. Smart decision.",
          id: "Nyeri secara bertahap mereda. Keputusan cerdas.",
        },
        risk: "low",
      },
    ],
    priority: 7,
  },
  {
    id: "cramp_warning",
    type: "physical_crisis",
    trigger: (state) =>
      state.distanceCovered > state.totalDistance * 0.5 &&
      state.hydration < 40 &&
      state.muscleFatigue > 60,
    title: {
      en: "Cramp Warning!",
      id: "Peringatan Kram!",
    },
    description: {
      en: "Your calf is tightening. You can feel a cramp coming. If it fully locks up, your race is over.",
      id: "Betis Anda mengencang. Anda bisa merasakan kram datang. Jika benar-benar terkunci, balapan Anda selesai.",
    },
    emotionalTone: "tense",
    choices: [
      {
        id: "ignore_it",
        text: {
          en: "Ignore it, keep pace!",
          id: "Abaikan, pertahankan kecepatan!",
        },
        effect: {
          muscleFatigue: 25,
          energy: -20,
        },
        outcome: {
          en: "Risky choice. The cramp is getting worse...",
          id: "Pilihan berisiko. Kram semakin buruk...",
        },
        risk: "high",
      },
      {
        id: "back_off",
        text: {
          en: "Back off pace, hydrate",
          id: "Kurangi kecepatan, hidrasi",
        },
        effect: {
          hydration: 20,
          energy: 10,
          momentum: -15,
        },
        outcome: {
          en: "The cramp threat passes. You avoided disaster.",
          id: "Ancaman kram berlalu. Anda menghindari bencana.",
        },
        risk: "low",
      },
    ],
    priority: 9,
  },

  // === CROWD MOMENTS ===
  {
    id: "home_crowd_roar",
    type: "crowd_moment",
    trigger: (state, context) =>
      (context.pastRacesAtLocation || 0) > 0 &&
      state.distanceCovered > state.totalDistance * 0.7 &&
      state.confidence > 50,
    title: {
      en: "Home Crowd Erupts!",
      id: "Penonton Lokal Meledak!",
    },
    description: {
      en: "The home crowd recognizes you! They're on their feet, chanting your name! Their energy is electric!",
      id: "Penonton lokal mengenali Anda! Mereka berdiri, menyanyikan nama Anda! Energi mereka elektrik!",
    },
    emotionalTone: "inspiring",
    effects: {
      confidence: 25,
      energy: 15,
      focus: 20,
    },
    priority: 8,
  },
  {
    id: "hostile_crowd",
    type: "crowd_moment",
    trigger: (state, context) =>
      context.hasRival && state.distanceCovered > 10 && state.confidence < 60,
    title: {
      en: "Crowd Wants the Rival",
      id: "Penonton Ingin Rival",
    },
    description: {
      en: "The crowd is cheering for your rival. You're the underdog here. Can you prove them wrong?",
      id: "Penonton bersorak untuk rival Anda. Anda adalah underdog di sini. Bisakah Anda membuktikan mereka salah?",
    },
    emotionalTone: "challenging",
    effects: {
      confidence: -10,
      focus: 15,
    },
    priority: 6,
  },

  // === FINAL STRETCH DRAMA ===
  {
    id: "final_km_everything",
    type: "mental_battle",
    trigger: (state) =>
      state.distanceCovered >= state.totalDistance - 1 &&
      state.distanceCovered < state.totalDistance - 0.5 &&
      state.energy > 15,
    title: {
      en: "This Is Everything!",
      id: "Ini Adalah Segalanya!",
    },
    description: {
      en: "Final kilometer. Everything you've trained for comes down to this. Leave NOTHING behind!",
      id: "Kilometer terakhir. Semua yang Anda latih bermuara pada ini. Tidak ada yang tersisa!",
    },
    emotionalTone: "inspiring",
    effects: {
      confidence: 30,
      focus: 25,
    },
    priority: 10,
  },
  {
    id: "final_200m_sprint",
    type: "mental_battle",
    trigger: (state) =>
      state.distanceCovered >= state.totalDistance - 0.2 && state.energy > 10,
    title: {
      en: "SPRINT FOR THE LINE!",
      id: "SPRINT KE GARIS!",
    },
    description: {
      en: "200 meters! You can see the finish! DIG DEEP! LEAVE IT ALL OUT THERE!",
      id: "200 meter! Anda bisa melihat finish! GALI DALAM! BERIKAN SEMUA!",
    },
    emotionalTone: "triumphant",
    effects: {
      momentum: 50,
      confidence: 35,
    },
    priority: 10,
  },

  // === COMEBACK MOMENTS ===
  {
    id: "refuse_to_quit",
    type: "mental_battle",
    trigger: (state) =>
      state.distanceCovered > state.totalDistance * 0.7 &&
      state.energy < 25 &&
      state.confidence < 40,
    title: {
      en: "I Will NOT Quit!",
      id: "Saya TIDAK AKAN Berhenti!",
    },
    description: {
      en: "Everything hurts. You're exhausted. But something inside refuses to give up. This is where champions are made!",
      id: "Semuanya sakit. Anda kelelahan. Tapi sesuatu di dalam menolak menyerah. Ini di mana juara dibuat!",
    },
    emotionalTone: "inspiring",
    choices: [
      {
        id: "warrior_mode",
        text: {
          en: "ACTIVATE WARRIOR MODE!",
          id: "AKTIFKAN MODE PEJUANG!",
        },
        effect: {
          confidence: 40,
          focus: 30,
          energy: 15,
          mentalFatigue: -20,
        },
        outcome: {
          en: "Pure will takes over! You ARE a warrior!",
          id: "Kemauan murni mengambil alih! Anda ADALAH pejuang!",
        },
        risk: "low",
      },
      {
        id: "just_survive",
        text: {
          en: "Just survive to the finish...",
          id: "Hanya bertahan sampai finish...",
        },
        effect: {
          momentum: -20,
          confidence: -10,
        },
        outcome: {
          en: "You're in survival mode now.",
          id: "Anda dalam mode bertahan sekarang.",
        },
        risk: "low",
      },
    ],
    priority: 9,
  },

  // More events can be added here...
];

/**
 * Get highest priority dramatic event that matches conditions
 */
export function getNextDramaticEvent(
  state: SimulationState,
  context: RaceContext,
  shownEvents: Set<string>,
  lastEventKm: number,
): DramaticEvent | null {
  // Minimum 3km between dramatic events
  if (state.distanceCovered - lastEventKm < 3) {
    return null;
  }

  // Filter events that match conditions and haven't been shown
  const matchingEvents = DRAMATIC_EVENTS.filter(
    (event) => !shownEvents.has(event.id) && event.trigger(state, context),
  );

  if (matchingEvents.length === 0) {
    return null;
  }

  // Sort by priority (highest first)
  matchingEvents.sort((a, b) => b.priority - a.priority);

  return matchingEvents[0];
}
