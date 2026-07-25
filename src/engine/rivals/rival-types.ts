/**
 * Rival Types & Character Definitions
 * 
 * Defines the rival data model, 6 unique rival characters,
 * and relationship tracking types.
 */

import type { LocalizedText } from "@/types/engine";

// ---------------------------------------------------------------------------
// Sub-types
// ---------------------------------------------------------------------------

export type RivalPersonality =
  | "aggressive"
  | "patient"
  | "consistent"
  | "wild_card"
  | "tactical";

export type RivalStartPace = "fast" | "moderate" | "slow";
export type RivalMidRaceBehavior = "surge" | "steady" | "fade";
export type RivalKickStrength = "weak" | "moderate" | "strong";

export type RivalContext =
  | "pre_race"
  | "overtake_player"
  | "overtaken_by_player"
  | "post_race";

export type RivalStatus = "neutral" | "friendly" | "rivalry" | "nemesis";

// ---------------------------------------------------------------------------
// Main rival interface
// ---------------------------------------------------------------------------

export interface Rival {
  id: string;
  name: string;
  nickName: string;
  personality: RivalPersonality;
  backstory: LocalizedText;
  avatar: string; // emoji
  runningStyle: {
    startPace: RivalStartPace;
    midRaceBehavior: RivalMidRaceBehavior;
    kickStrength: RivalKickStrength;
  };
  skillLevel: number; // 30-90, determines base pace
  catchphrases: {
    preRace: LocalizedText[];
    duringRace: LocalizedText[];
    postRaceWin: LocalizedText[];
    postRaceLose: LocalizedText[];
  };
}

/** Relationship data stored per-rival on the runner profile */
export interface RivalRelationship {
  wins: number;
  losses: number;
  lastEncounter: string | null;
  relationshipLevel: number;  // 0-100
  totalEncounters: number;
  closestMargin: number;
  biggestWin: number;
  biggestLoss: number;
}

// ---------------------------------------------------------------------------
// The 6 rival characters
// ---------------------------------------------------------------------------

export const RIVAL_ROSTER: Rival[] = [
  {
    id: "diego_bull",
    name: "Diego",
    nickName: "The Bull",
    personality: "aggressive",
    backstory: {
      en: "A former professional runner who peaked early and now makes a living crushing rookies' dreams in local races. Runs with pure aggression, going out fast to break spirits.",
      id: "Mantan pelari profesional yang mencapai puncak lebih awal dan sekarang mencari nafkah dengan menghancurkan mimpi pendatang baru. Berlari dengan agresi murni, start cepat untuk menghancurkan semangat lawan.",
    },
    avatar: "🐂",
    runningStyle: {
      startPace: "fast",
      midRaceBehavior: "fade",
      kickStrength: "weak",
    },
    skillLevel: 75,
    catchphrases: {
      preRace: [
        { en: "Not bad, rookie... but you'll crack at 30k!", id: "Tidak buruk, pemula... tapi kau akan hancur di 30k!" },
        { en: "I've been doing this since before you knew what running shoes were.", id: "Aku sudah melakukan ini sejak kau belum tahu apa itu sepatu lari." },
        { en: "Try to keep up. I won't wait for slowpokes.", id: "Coba ikuti. Aku tidak akan menunggu yang lambat." },
      ],
      duringRace: [
        { en: "Is that all you've got? I'm just warming up!", id: "Hanya itu kemampuanmu? Aku baru pemanasan!" },
        { en: "You're fading! I can hear your breathing from here.", id: "Kamu mulai lelah! Aku bisa dengar napasmu dari sini." },
        { en: "Come on, push harder! Don't embarrass yourself.", id: "Ayo, dorong lebih keras! Jangan mempermalukan dirimu." },
      ],
      postRaceWin: [
        { en: "Told you. Another rookie put in their place.", id: "Sudah kubilang. Pendatang baru lainnya diberi pelajaran." },
        { en: "Go back to training. You're not ready for this level.", id: "Kembali latihan. Kamu belum siap untuk level ini." },
      ],
      postRaceLose: [
        { en: "Lucky day... You won't beat me twice.", id: "Hari keberuntungan... Kau tak akan kalahkanku dua kali." },
        { en: "Fine. You earned it. But I'll be back.", id: "Baik. Kau pantas mendapatkannya. Tapi aku akan kembali." },
      ],
    },
  },
  {
    id: "maya_shadow",
    name: "Maya",
    nickName: "The Shadow",
    personality: "patient",
    backstory: {
      en: "A tactician who never leads until the final kilometer. Maya studies opponents' weaknesses and strikes with surgical precision when they're most vulnerable.",
      id: "Seorang ahli taktik yang tidak pernah memimpin hingga kilometer terakhir. Maya mempelajari kelemahan lawan dan menyerang dengan presisi bedah saat mereka paling rentan.",
    },
    avatar: "🌙",
    runningStyle: {
      startPace: "slow",
      midRaceBehavior: "steady",
      kickStrength: "strong",
    },
    skillLevel: 78,
    catchphrases: {
      preRace: [
        { en: "You've been running scared all race... and it hasn't even started yet.", id: "Kau sudah ketakutan sepanjang race... dan bahkan belum dimulai." },
        { en: "I like watching you burn out. It's educational.", id: "Aku suka melihatmu kehabisan energi. Sangat mendidik." },
        { en: "Don't worry about me. I'll catch up when it matters.", id: "Jangan khawatirkan aku. Aku akan menyusul saat itu penting." },
      ],
      duringRace: [
        { en: "Enjoy the lead while it lasts. I'm right behind you.", id: "Nikmati pimpinan selama masih bertahan. Aku tepat di belakangmu." },
        { en: "I can see your form breaking down. Another 2km?", id: "Aku bisa lihat posturmu mulai hancur. 2km lagi?", },
        { en: "You're pushing too hard. But please, continue.", id: "Kau memaksakan diri terlalu keras. Tapi silakan lanjutkan." },
      ],
      postRaceWin: [
        { en: "Patience always wins over panic. Remember that.", id: "Kesabaran selalu menang atas kepanikan. Ingat itu." },
        { en: "You were strong. Just not strong enough.", id: "Kau kuat. Hanya saja tidak cukup kuat." },
      ],
      postRaceLose: [
        { en: "Impressive. You actually had a plan. Most people don't.", id: "Mengesankan. Kau benar-benar punya rencana. Kebanyakan orang tidak." },
        { en: "I underestimated you. Won't happen again.", id: "Aku meremehkanmu. Tidak akan terulang lagi." },
      ],
    },
  },
  {
    id: "kaito_oldman",
    name: "Kaito",
    nickName: "Old Man",
    personality: "tactical",
    backstory: {
      en: "A veteran marathoner in his 40s who has seen every racing strategy imaginable. Kaito runs with wisdom, conserving energy and reading the race like a chess board.",
      id: "Seorang pelari marathon veteran berusia 40-an yang telah melihat setiap strategi balapan yang bisa dibayangkan. Kaito berlari dengan kebijaksanaan, menghemat energi dan membaca race seperti papan catur.",
    },
    avatar: "🧓",
    runningStyle: {
      startPace: "moderate",
      midRaceBehavior: "steady",
      kickStrength: "moderate",
    },
    skillLevel: 82,
    catchphrases: {
      preRace: [
        { en: "Youth is wasted on the young. Watch and learn.", id: "Masa muda terbuang pada yang muda. Lihat dan belajar." },
        { en: "I've seen a thousand runners like you. Only a handful finish strong.", id: "Aku sudah melihat seribu pelari sepertimu. Hanya segelintir yang finish kuat." },
        { en: "Pacing isn't about speed. It's about knowing yourself.", id: "Pacing bukan tentang kecepatan. Ini tentang mengenal dirimu sendiri." },
      ],
      duringRace: [
        { en: "Breathe. Steady. The race is won in the last 5k, not the first.", id: "Bernapas. Tenang. Race dimenangkan di 5k terakhir, bukan pertama." },
        { en: "You're wasting energy on surges you can't sustain.", id: "Kau membuang energi untuk akselerasi yang tak bisa kau pertahankan." },
        { en: "I've run this distance a hundred times. Trust me, slow down.", id: "Aku sudah lari jarak ini seratus kali. Percayalah, pelan-pelan." },
      ],
      postRaceWin: [
        { en: "Experience beats youth. Every single time.", id: "Pengalaman mengalahkan masa muda. Setiap saat." },
        { en: "You have talent. But talent without wisdom is just speed.", id: "Kau punya bakat. Tapi bakat tanpa kebijaksanaan hanyalah kecepatan." },
      ],
      postRaceLose: [
        { en: "Well done, young one. The student becomes the teacher.", id: "Bagus, anak muda. Murid menjadi guru." },
        { en: "You're learning. That's the most important thing.", id: "Kau belajar. Itu yang terpenting." },
      ],
    },
  },
  {
    id: "sasha_rocket",
    name: "Sasha",
    nickName: "Rocket",
    personality: "wild_card",
    backstory: {
      en: "An unpredictable runner who thrives on chaos. Sasha alternates between blistering surges and inexplicable slowdowns, making her impossible to strategize against.",
      id: "Pelari tak terduga yang berkembang dalam kekacauan. Sasha bergantian antara akselerasi luar biasa dan perlambatan yang tak bisa dijelaskan, membuatnya mustahil untuk diantisipasi.",
    },
    avatar: "🚀",
    runningStyle: {
      startPace: "fast",
      midRaceBehavior: "surge",
      kickStrength: "strong",
    },
    skillLevel: 70,
    catchphrases: {
      preRace: [
        { en: "Rules are for amateurs. I run by feel.", id: "Aturan untuk amatir. Aku lari berdasarkan perasaan." },
        { en: "Watch this... or don't. I'm unpredictable.", id: "Lihat ini... atau jangan. Aku tidak bisa diprediksi." },
        { en: "Boring races are for boring people. Let's make this interesting!", id: "Race yang membosankan untuk orang membosankan. Ayo buat ini menarik!" },
      ],
      duringRace: [
        { en: "BOOM! Did you see that?! I'm on fire!", id: "LEDAKAN! Kau lihat itu?! Aku terbakar!" },
        { en: "Too fast? Too slow? Who knows! Not me!", id: "Terlalu cepat? Terlalu lambat? Siapa tahu! Bukan aku!" },
        { en: "This is fun! Why aren't you having fun?!", id: "Ini menyenangkan! Kenapa kau tidak bersenang-senang?!" },
      ],
      postRaceWin: [
        { en: "THAT WAS AMAZING! Let's do it again!", id: "ITU LUAR BIASA! Ayo lakukan lagi!" },
        { en: "I don't even know how I won. But I'll take it!", id: "Aku bahkan tidak tahu bagaimana aku menang. Tapi aku terima!" },
      ],
      postRaceLose: [
        { en: "Whoa, you're good! That was a blast, rival!", id: "Wah, kau hebat! Itu sangat menyenangkan, rival!" },
        { en: "Okay okay okay... rematch tomorrow?", id: "Oke oke oke... rematch besok?" },
      ],
    },
  },
  {
    id: "chen_engine",
    name: "Chen",
    nickName: "The Engine",
    personality: "consistent",
    backstory: {
      en: "A military veteran who brings extreme discipline to his running. Chen's pace is so consistent you could set a watch to it. He never surges, never fades, never panics.",
      id: "Seorang veteran militer yang membawa disiplin ekstrem dalam larinya. Pace Chen sangat konsisten sehingga Anda bisa menyetel jam tangan dengannya. Dia tidak pernah akselerasi, tidak pernah melambat, tidak pernah panik.",
    },
    avatar: "⚙️",
    runningStyle: {
      startPace: "moderate",
      midRaceBehavior: "steady",
      kickStrength: "moderate",
    },
    skillLevel: 80,
    catchphrases: {
      preRace: [
        { en: "I don't sprint. I don't jog. I just... endure.", id: "Aku tidak lari cepat. Aku tidak joging. Aku hanya... bertahan." },
        { en: "Discipline beats motivation. Every kilometer.", id: "Disiplin mengalahkan motivasi. Setiap kilometer." },
        { en: "There is no secret. Just put one foot in front of the other.", id: "Tidak ada rahasia. Letakkan satu kaki di depan kaki lainnya." },
      ],
      duringRace: [
        { en: "*steady breathing* ... *steady breathing*", id: "*napas stabil* ... *napas stabil*" },
        { en: "I will be at this pace when you crash. See you soon.", id: "Aku akan tetap di pace ini saat kau jatuh. Sampai jumpa." },
        { en: "Consistency is the only thing that works long term.", id: "Konsistensi adalah satu-satunya yang berhasil jangka panjang." },
      ],
      postRaceWin: [
        { en: "Expected. My pace was within 2% variance the entire race.", id: "Sudah diduga. Pace-ku dalam varian 2% sepanjang race." },
        { en: "You have potential, but you lack discipline.", id: "Kau punya potensi, tapi kau kurang disiplin." },
      ],
      postRaceLose: [
        { en: "Good race. Your execution was... acceptable.", id: "Race bagus. Eksekusimu... bisa diterima." },
        { en: "I will analyze your strategy and improve.", id: "Aku akan menganalisis strategimu dan berkembang." },
      ],
    },
  },
  {
    id: "zara_queen",
    name: "Zara",
    nickName: "Queen",
    personality: "tactical",
    backstory: {
      en: "A world-class analyst who treats races like chess matches. Zara reads every runner's body language and adjusts her strategy accordingly. She's never beaten by the same tactic twice.",
      id: "Seorang analis kelas dunia yang memperlakukan race seperti pertandingan catur. Zara membaca bahasa tubuh setiap pelari dan menyesuaikan strateginya. Dia tidak pernah dikalahkan oleh taktik yang sama dua kali.",
    },
    avatar: "👑",
    runningStyle: {
      startPace: "moderate",
      midRaceBehavior: "surge",
      kickStrength: "strong",
    },
    skillLevel: 85,
    catchphrases: {
      preRace: [
        { en: "Every runner has a tell. You just showed yours.", id: "Setiap pelari memiliki ciri. Kau baru saja menunjukkan cirimu." },
        { en: "I've already predicted your pacing strategy. It's predictable.", id: "Aku sudah memprediksi strategi pace-mu. Sangat bisa ditebak." },
        { en: "You're nervous. I can see it in your shoulders.", id: "Kau gugup. Aku bisa melihatnya di bahumu." },
      ],
      duringRace: [
        { en: "You're trying to negative split. I can tell by your first km.", id: "Kau mencoba negative split. Aku bisa tahu dari km pertamamu." },
        { en: "Your form breaks down at km 8. I've been waiting for it.", id: "Posturmu hancur di km 8. Aku sudah menunggunya." },
        { en: "You're predictable. That's your weakness.", id: "Kau bisa diprediksi. Itu kelemahanmu." },
      ],
      postRaceWin: [
        { en: "As expected. Your pattern was obvious from the start.", id: "Seperti yang diduga. Polamu jelas dari awal." },
        { en: "Study harder. Train smarter. Then challenge me again.", id: "Belajar lebih keras. Latih lebih cerdas. Lalu tantang aku lagi." },
      ],
      postRaceLose: [
        { en: "You adapted mid-race. I'm impressed. Truly.", id: "Kau beradaptasi di tengah race. Aku terkesan. Sungguh." },
        { en: "You broke my prediction model. I need to recalibrate.", id: "Kau menghancurkan model prediksiku. Aku perlu kalibrasi ulang." },
      ],
    },
  },
];

/**
 * Get a rival by their ID
 */
export function getRivalById(id: string): Rival | undefined {
  return RIVAL_ROSTER.find((r) => r.id === id);
}

/**
 * Create a default RivalRelationship entry
 */
export function createDefaultRelationship(): RivalRelationship {
  return {
    wins: 0,
    losses: 0,
    lastEncounter: null,
    relationshipLevel: 0,
    totalEncounters: 0,
    closestMargin: Infinity,
    biggestWin: 0,
    biggestLoss: 0,
  };
}