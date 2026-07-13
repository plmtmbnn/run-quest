import type { Milestone } from "./milestone-types";

/**
 * Database of career milestones
 * Celebrates player achievements and progression
 */
export const MILESTONES: Milestone[] = [
  // === FIRST STEPS ===
  {
    id: "first_victory",
    name: {
      en: "First Victory",
      id: "Kemenangan Pertama",
    },
    description: {
      en: "Win your first race",
      id: "Menangkan balapan pertama Anda",
    },
    celebrationText: {
      en: "You did it! Your first victory! This is just the beginning.",
      id: "Anda melakukannya! Kemenangan pertama Anda! Ini baru permulaan.",
    },
    category: "wins",
    icon: "🏁",
    rarity: "common",
    trigger: (profile) =>
      profile.totalRuns > 0 && (profile as any).totalWins >= 1,
    rewards: {
      xp: 50,
      coins: 100,
    },
  },
  {
    id: "first_race",
    name: {
      en: "First Race",
      id: "Balapan Pertama",
    },
    description: {
      en: "Complete your first race",
      id: "Selesaikan balapan pertama Anda",
    },
    celebrationText: {
      en: "Welcome to the world of competitive running!",
      id: "Selamat datang di dunia lari kompetitif!",
    },
    category: "special",
    icon: "👟",
    rarity: "common",
    trigger: (profile) => profile.totalRuns >= 1,
    rewards: {
      xp: 25,
      coins: 50,
    },
  },

  // === DISTANCE MILESTONES ===
  {
    id: "distance_50k",
    name: {
      en: "50km Career Distance",
      id: "Jarak Karir 50km",
    },
    description: {
      en: "Run a total of 50 kilometers in your career",
      id: "Berlari total 50 kilometer dalam karir Anda",
    },
    celebrationText: {
      en: "50 kilometers down! You're building real endurance.",
      id: "50 kilometer selesai! Anda membangun daya tahan nyata.",
    },
    category: "distance",
    icon: "📏",
    rarity: "common",
    trigger: (profile) => profile.totalDistance >= 50,
    rewards: {
      xp: 100,
      coins: 150,
    },
  },
  {
    id: "distance_100k",
    name: {
      en: "100km Career Distance",
      id: "Jarak Karir 100km",
    },
    description: {
      en: "Run a total of 100 kilometers in your career",
      id: "Berlari total 100 kilometer dalam karir Anda",
    },
    celebrationText: {
      en: "100 kilometers! You're no longer a beginner.",
      id: "100 kilometer! Anda bukan pemula lagi.",
    },
    category: "distance",
    icon: "🎯",
    rarity: "rare",
    trigger: (profile) => profile.totalDistance >= 100,
    rewards: {
      xp: 200,
      coins: 300,
    },
  },
  {
    id: "distance_marathon",
    name: {
      en: "Marathon Distance",
      id: "Jarak Marathon",
    },
    description: {
      en: "Complete a race of 42.195km or more",
      id: "Selesaikan balapan 42.195km atau lebih",
    },
    celebrationText: {
      en: "You conquered the marathon! An achievement few can claim.",
      id: "Anda menaklukkan marathon! Pencapaian yang sedikit bisa diklaim.",
    },
    category: "distance",
    icon: "🏃‍♂️",
    rarity: "epic",
    trigger: (profile, context) => (context?.raceDistance || 0) >= 42,
    rewards: {
      xp: 500,
      coins: 1000,
    },
  },

  // === SPEED MILESTONES ===
  {
    id: "sub_20_5k",
    name: {
      en: "Sub-20 Minute 5K",
      id: "5K di Bawah 20 Menit",
    },
    description: {
      en: "Complete a 5K race in under 20 minutes",
      id: "Selesaikan balapan 5K di bawah 20 menit",
    },
    celebrationText: {
      en: "Sub-20! You're getting FAST! That's elite club territory.",
      id: "Di bawah 20! Anda semakin CEPAT! Itu wilayah klub elit.",
    },
    category: "speed",
    icon: "⚡",
    rarity: "epic",
    trigger: (profile, context) =>
      (context?.raceDistance || 0) >= 4.9 &&
      (context?.raceDistance || 0) <= 5.1 &&
      (context?.raceTime || Infinity) < 1200, // 20 minutes
    rewards: {
      xp: 300,
      coins: 500,
    },
  },
  {
    id: "sub_40_10k",
    name: {
      en: "Sub-40 Minute 10K",
      id: "10K di Bawah 40 Menit",
    },
    description: {
      en: "Complete a 10K race in under 40 minutes",
      id: "Selesaikan balapan 10K di bawah 40 menit",
    },
    celebrationText: {
      en: "Sub-40 10K! You're in the fast lane now!",
      id: "10K di bawah 40! Anda di jalur cepat sekarang!",
    },
    category: "speed",
    icon: "🔥",
    rarity: "epic",
    trigger: (profile, context) =>
      (context?.raceDistance || 0) >= 9.9 &&
      (context?.raceDistance || 0) <= 10.1 &&
      (context?.raceTime || Infinity) < 2400, // 40 minutes
    rewards: {
      xp: 400,
      coins: 750,
    },
  },

  // === WIN MILESTONES ===
  {
    id: "win_5",
    name: {
      en: "5 Victories",
      id: "5 Kemenangan",
    },
    description: {
      en: "Win 5 races",
      id: "Menangkan 5 balapan",
    },
    celebrationText: {
      en: "5 wins! You're developing a winning habit.",
      id: "5 kemenangan! Anda mengembangkan kebiasaan menang.",
    },
    category: "wins",
    icon: "🏆",
    rarity: "common",
    trigger: (profile) => (profile as any).totalWins >= 5,
    rewards: {
      xp: 150,
      coins: 250,
    },
  },
  {
    id: "win_10",
    name: {
      en: "10 Victories",
      id: "10 Kemenangan",
    },
    description: {
      en: "Win 10 races",
      id: "Menangkan 10 balapan",
    },
    celebrationText: {
      en: "10 victories! You're a proven competitor.",
      id: "10 kemenangan! Anda pesaing yang terbukti.",
    },
    category: "wins",
    icon: "🥇",
    rarity: "rare",
    trigger: (profile) => (profile as any).totalWins >= 10,
    rewards: {
      xp: 300,
      coins: 500,
    },
  },

  // === STREAK MILESTONES ===
  {
    id: "streak_3",
    name: {
      en: "3-Day Streak",
      id: "Streak 3 Hari",
    },
    description: {
      en: "Complete races on 3 consecutive days",
      id: "Selesaikan balapan pada 3 hari berturut-turut",
    },
    celebrationText: {
      en: "3 days in a row! Consistency is key to improvement.",
      id: "3 hari berturut-turut! Konsistensi adalah kunci peningkatan.",
    },
    category: "streak",
    icon: "🔥",
    rarity: "common",
    trigger: (profile) => (profile as any).currentStreak >= 3,
    rewards: {
      xp: 75,
      coins: 100,
    },
  },
  {
    id: "streak_7",
    name: {
      en: "7-Day Streak",
      id: "Streak 7 Hari",
    },
    description: {
      en: "Complete races on 7 consecutive days",
      id: "Selesaikan balapan pada 7 hari berturut-turut",
    },
    celebrationText: {
      en: "A full week! Your dedication is showing results.",
      id: "Satu minggu penuh! Dedikasi Anda menunjukkan hasil.",
    },
    category: "streak",
    icon: "⭐",
    rarity: "rare",
    trigger: (profile) => (profile as any).currentStreak >= 7,
    rewards: {
      xp: 250,
      coins: 400,
    },
  },
  {
    id: "streak_30",
    name: {
      en: "30-Day Streak",
      id: "Streak 30 Hari",
    },
    description: {
      en: "Complete races on 30 consecutive days",
      id: "Selesaikan balapan pada 30 hari berturut-turut",
    },
    celebrationText: {
      en: "ONE MONTH STRAIGHT! You're a machine!",
      id: "SATU BULAN BERTURUT! Anda mesin!",
    },
    category: "streak",
    icon: "💪",
    rarity: "legendary",
    trigger: (profile) => (profile as any).currentStreak >= 30,
    rewards: {
      xp: 1000,
      coins: 2000,
    },
  },

  // === LEVEL MILESTONES ===
  {
    id: "level_5",
    name: {
      en: "Level 5",
      id: "Level 5",
    },
    description: {
      en: "Reach level 5",
      id: "Capai level 5",
    },
    celebrationText: {
      en: "Level 5! You're moving up in the ranks.",
      id: "Level 5! Anda naik peringkat.",
    },
    category: "level",
    icon: "📈",
    rarity: "common",
    trigger: (profile) => profile.level >= 5,
    rewards: {
      xp: 0,
      coins: 200,
    },
  },
  {
    id: "level_10",
    name: {
      en: "Level 10",
      id: "Level 10",
    },
    description: {
      en: "Reach level 10",
      id: "Capai level 10",
    },
    celebrationText: {
      en: "Level 10! You're an established runner now.",
      id: "Level 10! Anda pelari mapan sekarang.",
    },
    category: "level",
    icon: "🎖️",
    rarity: "rare",
    trigger: (profile) => profile.level >= 10,
    rewards: {
      xp: 0,
      coins: 500,
    },
  },
  {
    id: "level_20",
    name: {
      en: "Level 20",
      id: "Level 20",
    },
    description: {
      en: "Reach level 20",
      id: "Capai level 20",
    },
    celebrationText: {
      en: "Level 20! You're among the elite now.",
      id: "Level 20! Anda di antara elit sekarang.",
    },
    category: "level",
    icon: "👑",
    rarity: "epic",
    trigger: (profile) => profile.level >= 20,
    rewards: {
      xp: 0,
      coins: 1000,
    },
  },

  // === RIVALRY MILESTONES ===
  {
    id: "defeat_marcus",
    name: {
      en: "Machine Breaker",
      id: "Pemecah Mesin",
    },
    description: {
      en: "Defeat Marcus 'The Machine' Rivera",
      id: "Kalahkan Marcus 'The Machine' Rivera",
    },
    celebrationText: {
      en: "You broke The Machine! Marcus won't forget this.",
      id: "Anda mematahkan The Machine! Marcus tidak akan lupa ini.",
    },
    category: "rivalry",
    icon: "⚙️",
    rarity: "rare",
    trigger: (profile, context) =>
      context?.rivalDefeated === "marcus_rivera" && context?.isVictory === true,
    rewards: {
      xp: 200,
      coins: 400,
    },
  },
  {
    id: "defeat_all_rivals",
    name: {
      en: "Rival Conqueror",
      id: "Penakluk Rival",
    },
    description: {
      en: "Defeat all 6 named rivals at least once",
      id: "Kalahkan semua 6 rival bernama setidaknya sekali",
    },
    celebrationText: {
      en: "You've beaten them all! Every rival knows your name now.",
      id: "Anda telah mengalahkan mereka semua! Setiap rival tahu nama Anda sekarang.",
    },
    category: "rivalry",
    icon: "🎭",
    rarity: "epic",
    trigger: (profile) => {
      const rivalRels = (profile as any).rivalRelationships || {};
      const rivalIds = [
        "marcus_rivera",
        "ellie_park",
        "kenji_nakamura",
        "sarah_chen",
        "alex_santos",
        "maria_gonzalez",
      ];
      return rivalIds.every((id) => (rivalRels[id]?.wins || 0) > 0);
    },
    rewards: {
      xp: 500,
      coins: 1000,
    },
  },

  // === SPECIAL MILESTONES ===
  {
    id: "perfect_race",
    name: {
      en: "Perfect Execution",
      id: "Eksekusi Sempurna",
    },
    description: {
      en: "Complete a race with Grade A",
      id: "Selesaikan balapan dengan Grade A",
    },
    celebrationText: {
      en: "PERFECT! Everything clicked today. That's what perfection looks like.",
      id: "SEMPURNA! Semuanya cocok hari ini. Itulah seperti apa kesempurnaan.",
    },
    category: "special",
    icon: "💯",
    rarity: "rare",
    trigger: (profile, context) => context?.isPerfectRace === true,
    rewards: {
      xp: 300,
      coins: 500,
    },
  },
  {
    id: "races_10",
    name: {
      en: "10 Races Complete",
      id: "10 Balapan Selesai",
    },
    description: {
      en: "Complete 10 total races",
      id: "Selesaikan 10 total balapan",
    },
    celebrationText: {
      en: "10 races done! You're building real experience.",
      id: "10 balapan selesai! Anda membangun pengalaman nyata.",
    },
    category: "special",
    icon: "📊",
    rarity: "common",
    trigger: (profile) => profile.totalRuns >= 10,
    rewards: {
      xp: 200,
      coins: 300,
    },
  },
  {
    id: "races_50",
    name: {
      en: "50 Races Complete",
      id: "50 Balapan Selesai",
    },
    description: {
      en: "Complete 50 total races",
      id: "Selesaikan 50 total balapan",
    },
    celebrationText: {
      en: "50 races! You're a veteran of the sport.",
      id: "50 balapan! Anda veteran olahraga.",
    },
    category: "special",
    icon: "🌟",
    rarity: "epic",
    trigger: (profile) => profile.totalRuns >= 50,
    rewards: {
      xp: 750,
      coins: 1500,
    },
  },
  {
    id: "training_week",
    name: {
      en: "Perfect Training Week",
      id: "Minggu Latihan Sempurna",
    },
    description: {
      en: "Train every day for 7 consecutive days",
      id: "Latihan setiap hari selama 7 hari berturut-turut",
    },
    celebrationText: {
      en: "7 straight days of training! Your dedication is exceptional.",
      id: "7 hari berturut-turut latihan! Dedikasi Anda luar biasa.",
    },
    category: "training",
    icon: "💪",
    rarity: "rare",
    trigger: (profile) => profile.totalTrainingDays >= 7,
    rewards: {
      xp: 200,
      coins: 300,
    },
  },
];

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Get milestones by category
 */
export function getMilestonesByCategory(
  category: Milestone["category"],
): Milestone[] {
  return MILESTONES.filter((m) => m.category === category);
}

/**
 * Get all milestones
 */
export function getAllMilestones(): Milestone[] {
  return [...MILESTONES];
}
