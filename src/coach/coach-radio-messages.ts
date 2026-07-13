import type { SimulationState } from "@/types/engine";
import type { CoachRadioMessage } from "./coach-radio-types";

/**
 * Database of contextual coach radio messages
 * Triggers based on race conditions and provides real-time guidance
 */
export const COACH_RADIO_MESSAGES: CoachRadioMessage[] = [
  // === RACE START MESSAGES ===
  {
    id: "start_perfect_conditions",
    condition: (state) =>
      state.distanceCovered >= 0 &&
      state.distanceCovered < 1 &&
      state.energy > 90 &&
      state.confidence > 80,
    message: {
      en: "Perfect conditions! You're ready for this. Stick to the plan!",
      id: "Kondisi sempurna! Anda siap untuk ini. Patuhi rencana!",
    },
    tone: "encouraging",
    priority: 6,
  },
  {
    id: "start_nervous",
    condition: (state) =>
      state.distanceCovered >= 0 &&
      state.distanceCovered < 1 &&
      state.confidence < 60,
    message: {
      en: "Shake off those nerves. You've trained for this. Trust yourself!",
      id: "Hilangkan gugup itu. Anda telah berlatih untuk ini. Percaya pada diri sendiri!",
    },
    tone: "encouraging",
    priority: 7,
  },

  // === PACE MANAGEMENT ===
  {
    id: "pace_too_fast",
    condition: (state) =>
      state.distanceCovered > 2 &&
      state.distanceCovered < state.totalDistance * 0.5 &&
      state.energy < 70 &&
      state.muscleFatigue > 30,
    message: {
      en: "You're going out too hot! Ease back a bit or you'll pay later!",
      id: "Anda terlalu cepat! Kurangi sedikit atau Anda akan membayarnya nanti!",
    },
    tone: "warning",
    priority: 9,
  },
  {
    id: "pace_perfect",
    condition: (state) =>
      state.distanceCovered > 3 &&
      state.distanceCovered < state.totalDistance * 0.6 &&
      state.energy > 60 &&
      state.energy < 80 &&
      state.paceStability > 75,
    message: {
      en: "Perfect pace! Keep this rhythm—you're running smart!",
      id: "Kecepatan sempurna! Pertahankan irama ini—Anda berlari cerdas!",
    },
    tone: "proud",
    priority: 5,
  },
  {
    id: "pace_too_slow",
    condition: (state) =>
      state.distanceCovered > 3 &&
      state.distanceCovered < state.totalDistance * 0.7 &&
      state.energy > 85 &&
      state.momentum < 40,
    message: {
      en: "You've got more in the tank. Pick it up a little!",
      id: "Anda masih punya tenaga. Percepat sedikit!",
    },
    tone: "tactical",
    priority: 6,
  },

  // === ENERGY MANAGEMENT ===
  {
    id: "energy_low_warning",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.4 &&
      state.distanceCovered < state.totalDistance * 0.8 &&
      state.energy < 40,
    message: {
      en: "Energy is dropping fast! Fuel up if you have it!",
      id: "Energi turun cepat! Isi bahan bakar jika Anda punya!",
    },
    tone: "warning",
    priority: 10,
  },
  {
    id: "energy_critical",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.6 && state.energy < 25,
    message: {
      en: "You're running on fumes! Dig deep—mental toughness now!",
      id: "Anda kehabisan tenaga! Gali dalam—ketangguhan mental sekarang!",
    },
    tone: "concerned",
    priority: 10,
  },

  // === HYDRATION ===
  {
    id: "hydration_warning",
    condition: (state) =>
      state.distanceCovered > 5 && state.hydration < 50 && state.hydration > 30,
    message: {
      en: "Hydration is getting low. Drink at the next station!",
      id: "Hidrasi semakin rendah. Minum di stasiun berikutnya!",
    },
    tone: "warning",
    priority: 7,
  },
  {
    id: "hydration_critical",
    condition: (state) => state.hydration < 30,
    message: {
      en: "CRITICAL: You need water NOW! Don't wait!",
      id: "KRITIS: Anda butuh air SEKARANG! Jangan tunggu!",
    },
    tone: "warning",
    priority: 10,
  },

  // === HALFWAY POINT ===
  {
    id: "halfway_strong",
    condition: (state) =>
      Math.abs(state.distanceCovered - state.totalDistance / 2) < 0.5 &&
      state.energy > 60 &&
      state.confidence > 70,
    message: {
      en: "Halfway there and you're looking strong! This is YOUR race!",
      id: "Setengah jalan dan Anda terlihat kuat! Ini balapan ANDA!",
    },
    tone: "excited",
    priority: 7,
  },
  {
    id: "halfway_struggling",
    condition: (state) =>
      Math.abs(state.distanceCovered - state.totalDistance / 2) < 0.5 &&
      state.energy < 50,
    message: {
      en: "Halfway done. Tough stretch, but you've got this. Stay focused!",
      id: "Setengah selesai. Bagian sulit, tapi Anda bisa. Tetap fokus!",
    },
    tone: "encouraging",
    priority: 7,
  },

  // === FOCUS & MENTAL STATE ===
  {
    id: "focus_dropping",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.3 &&
      state.focus < 50 &&
      state.mentalFatigue > 50,
    message: {
      en: "Stay locked in! Don't let your mind wander. Focus on form!",
      id: "Tetap fokus! Jangan biarkan pikiran Anda mengembara. Fokus pada bentuk!",
    },
    tone: "tactical",
    priority: 7,
  },
  {
    id: "confidence_boost",
    condition: (state) =>
      state.distanceCovered > 5 &&
      state.confidence < 50 &&
      state.paceStability > 70,
    message: {
      en: "Your pace is solid! Believe in yourself—you're doing great!",
      id: "Kecepatan Anda solid! Percaya pada diri sendiri—Anda melakukannya dengan hebat!",
    },
    tone: "encouraging",
    priority: 6,
  },

  // === RIVAL ENCOUNTERS ===
  {
    id: "rival_ahead",
    condition: (state) =>
      state.distanceCovered > 5 &&
      state.distanceCovered < state.totalDistance * 0.8,
    message: {
      en: "I see them ahead! Stay patient—remember the plan!",
      id: "Saya melihat mereka di depan! Sabar—ingat rencananya!",
    },
    tone: "tactical",
    priority: 8,
  },
  {
    id: "rival_close",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.7 &&
      state.confidence > 75,
    message: {
      en: "They're within striking distance! Get ready to make your move!",
      id: "Mereka dalam jarak menyerang! Bersiaplah untuk membuat gerakan Anda!",
    },
    tone: "excited",
    priority: 9,
  },

  // === FINAL STRETCH ===
  {
    id: "final_km_push",
    condition: (state) =>
      state.distanceCovered >= state.totalDistance - 1 &&
      state.distanceCovered < state.totalDistance - 0.5 &&
      state.energy > 20,
    message: {
      en: "Final kilometer! This is what we trained for! GIVE IT EVERYTHING!",
      id: "Kilometer terakhir! Ini untuk apa kita latihan! BERIKAN SEMUANYA!",
    },
    tone: "excited",
    priority: 10,
  },
  {
    id: "final_km_survival",
    condition: (state) =>
      state.distanceCovered >= state.totalDistance - 1 &&
      state.distanceCovered < state.totalDistance - 0.5 &&
      state.energy < 20,
    message: {
      en: "Last kilometer! You're exhausted but SO CLOSE! Don't stop now!",
      id: "Kilometer terakhir! Anda kelelahan tapi SANGAT DEKAT! Jangan berhenti sekarang!",
    },
    tone: "encouraging",
    priority: 10,
  },
  {
    id: "final_sprint",
    condition: (state) =>
      state.distanceCovered >= state.totalDistance - 0.5 && state.energy > 15,
    message: {
      en: "SPRINT! Empty the tank! Leave NOTHING behind!",
      id: "SPRINT! Kosongkan tangki! Tidak ada yang tersisa!",
    },
    tone: "excited",
    priority: 10,
  },
  {
    id: "final_meters_survival",
    condition: (state) =>
      state.distanceCovered >= state.totalDistance - 0.3 && state.energy < 15,
    message: {
      en: "So close! Dig deeper than you ever have! FINISH LINE!",
      id: "Sangat dekat! Gali lebih dalam dari sebelumnya! GARIS FINISH!",
    },
    tone: "excited",
    priority: 10,
  },

  // === WEATHER CONDITIONS ===
  {
    id: "weather_hot",
    condition: (state) =>
      state.distanceCovered > 3 && state.hydration < 60 && state.energy < 70,
    message: {
      en: "This heat is brutal! Stay hydrated and don't panic!",
      id: "Panas ini brutal! Tetap terhidrasi dan jangan panik!",
    },
    tone: "warning",
    priority: 6,
  },
  {
    id: "weather_rain",
    condition: (state) => state.distanceCovered > 2,
    message: {
      en: "Conditions are tough, but you're tougher! Adapt and push through!",
      id: "Kondisi sulit, tapi Anda lebih tangguh! Beradaptasi dan terus maju!",
    },
    tone: "encouraging",
    priority: 5,
  },

  // === MILESTONE ENCOURAGEMENT ===
  {
    id: "quarter_done",
    condition: (state) =>
      Math.abs(state.distanceCovered - state.totalDistance * 0.25) < 0.5 &&
      state.energy > 70,
    message: {
      en: "Quarter of the way there! Feeling good, looking strong!",
      id: "Seperempat jalan sudah! Merasa baik, terlihat kuat!",
    },
    tone: "proud",
    priority: 5,
  },
  {
    id: "three_quarter",
    condition: (state) =>
      Math.abs(state.distanceCovered - state.totalDistance * 0.75) < 0.5,
    message: {
      en: "Three-quarters done! The finish line is calling your name!",
      id: "Tiga perempat selesai! Garis finish memanggil nama Anda!",
    },
    tone: "excited",
    priority: 7,
  },

  // === FORM CHECK ===
  {
    id: "form_check",
    condition: (state) =>
      state.distanceCovered > 10 &&
      state.distanceCovered % 5 < 0.5 &&
      state.muscleFatigue > 40,
    message: {
      en: "Check your form! Shoulders relaxed, core engaged. You've got this!",
      id: "Periksa bentuk Anda! Bahu rileks, inti terlibat. Anda bisa!",
    },
    tone: "tactical",
    priority: 5,
  },

  // === MOMENTUM ===
  {
    id: "momentum_building",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.5 &&
      state.momentum > 70 &&
      state.energy > 50,
    message: {
      en: "You've found your rhythm! Ride this momentum home!",
      id: "Anda telah menemukan irama Anda! Tunggangi momentum ini sampai rumah!",
    },
    tone: "excited",
    priority: 6,
  },
  {
    id: "momentum_lost",
    condition: (state) =>
      state.distanceCovered > 5 &&
      state.momentum < 30 &&
      state.paceStability < 60,
    message: {
      en: "Get your rhythm back! Focus on steady breathing and form!",
      id: "Dapatkan kembali irama Anda! Fokus pada pernapasan dan bentuk yang stabil!",
    },
    tone: "tactical",
    priority: 7,
  },

  // === BREAKTHROUGH MOMENTS ===
  {
    id: "second_wind",
    condition: (state) =>
      state.distanceCovered > state.totalDistance * 0.6 &&
      state.energy > 60 &&
      state.confidence > 80,
    message: {
      en: "You're getting a second wind! This is when champions are made!",
      id: "Anda mendapat angin kedua! Ini saat juara dibuat!",
    },
    tone: "excited",
    priority: 8,
  },
  {
    id: "the_wall",
    condition: (state) =>
      state.distanceCovered > 30 &&
      state.energy < 30 &&
      state.muscleFatigue > 70,
    message: {
      en: "This is the wall. Push through! Mental strength is everything now!",
      id: "Ini adalah dinding. Terobos! Kekuatan mental adalah segalanya sekarang!",
    },
    tone: "encouraging",
    priority: 10,
  },
];

/**
 * Get highest priority message that matches current conditions
 */
export function getCoachRadioMessage(
  state: SimulationState,
  lastMessageKm: number,
): CoachRadioMessage | null {
  // Minimum 2km between messages to avoid spam
  if (state.distanceCovered - lastMessageKm < 2) {
    return null;
  }

  // Filter messages that match conditions
  const matchingMessages = COACH_RADIO_MESSAGES.filter((msg) =>
    msg.condition(state),
  );

  if (matchingMessages.length === 0) {
    return null;
  }

  // Sort by priority (highest first)
  matchingMessages.sort((a, b) => b.priority - a.priority);

  // Return highest priority message
  return matchingMessages[0];
}
