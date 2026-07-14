import type { StoryChapter } from "./story-types";

/**
 * All 5 career story chapters
 */
export const STORY_CHAPTERS: StoryChapter[] = [
  // Chapter 1: First Steps
  {
    id: "chapter_1_first_steps",
    number: 1,
    title: { en: "First Steps", id: "Langkah Pertama" },
    subtitle: { en: "The Beginning", id: "Awal Perjalanan" },
    theme: "origins",
    synopsis: {
      en: "You're just starting out. Nobody knows your name. But you have a dream and the determination to make it real.",
      id: "Kamu baru memulai. Tak ada yang tahu namamu. Tapi kamu punya mimpi dan tekad untuk mewujudkannya.",
    },
    unlockRequirements: {
      minLevel: 1,
    },
    storyBeats: [
      {
        id: "ch1_start",
        trigger: "chapter_start",
        cinematicType: "text",
        title: { en: "A New Journey", id: "Perjalanan Baru" },
        content: {
          en: "Every champion starts somewhere. Today, you lace up your shoes and take the first step toward greatness.",
          id: "Setiap juara memulai dari suatu tempat. Hari ini, kamu mengikat tali sepatumu dan mengambil langkah pertama menuju kehebatan.",
        },
        emotionalTone: "inspiring",
        skipable: true,
      },
      {
        id: "ch1_mid",
        trigger: "mid_chapter",
        cinematicType: "dialogue",
        title: { en: "Coach's Advice", id: "Nasihat Pelatih" },
        content: {
          en: "You're doing well, but this is just the beginning. Keep training, stay consistent, and you'll see results.",
          id: "Kamu melakukannya dengan baik, tapi ini baru permulaan. Terus berlatih, tetap konsisten, dan kamu akan melihat hasilnya.",
        },
        characterAppearances: ["coach"],
        emotionalTone: "inspiring",
        skipable: true,
      },
      {
        id: "ch1_pre_final",
        trigger: "pre_final",
        cinematicType: "text",
        title: { en: "Championship Opportunity", id: "Kesempatan Kejuaraan" },
        content: {
          en: "The Local 5K Championship is your chance to prove yourself. Win this, and people will start to notice.",
          id: "Kejuaraan 5K Lokal adalah kesempatanmu untuk membuktikan diri. Menangkan ini, dan orang akan mulai memperhatikan.",
        },
        emotionalTone: "tense",
        skipable: false,
      },
    ],
    finalRace: {
      id: "ch1_final_local_5k",
      title: { en: "Local 5K Championship", id: "Kejuaraan 5K Lokal" },
      description: {
        en: "Your first real test. Win this race to begin your journey.",
        id: "Ujian pertamamu yang sebenarnya. Menangkan lomba ini untuk memulai perjalananmu.",
      },
      distance: 5,
      location: "Local Track",
      stakes: {
        en: "Prove you belong in competitive running",
        id: "Buktikan kamu pantas di lari kompetitif",
      },
      rivalLineup: ["alex"],
      difficulty: "easy",
      requiredToComplete: true,
      retryable: true,
      unlockMessage: {
        en: "🏆 Championship race unlocked! Prove yourself in the Local 5K.",
        id: "🏆 Lomba kejuaraan terbuka! Buktikan dirimu di 5K Lokal.",
      },
    },
    rewards: {
      xp: 500,
      coins: 200,
      unlocks: [
        {
          type: "location",
          id: "regional_circuit",
          name: { en: "Regional Circuit", id: "Sirkuit Regional" },
          description: {
            en: "Access to regional races and tougher competition",
            id: "Akses ke lomba regional dan kompetisi lebih keras",
          },
        },
      ],
      title: { en: "Local Champion", id: "Juara Lokal" },
    },
    estimatedRaces: 5,
    icon: "🏃",
  },

  // Chapter 2: Rising Star
  {
    id: "chapter_2_rising_star",
    number: 2,
    title: { en: "Rising Star", id: "Bintang Terbit" },
    subtitle: { en: "Making a Name", id: "Membuat Nama" },
    theme: "growth",
    synopsis: {
      en: "You've proven you can win locally. Now it's time to face real rivals on the regional stage.",
      id: "Kamu sudah membuktikan bisa menang lokal. Sekarang saatnya menghadapi rival nyata di panggung regional.",
    },
    unlockRequirements: {
      minLevel: 6,
      previousChapterComplete: 1,
    },
    storyBeats: [
      {
        id: "ch2_start",
        trigger: "chapter_start",
        cinematicType: "montage",
        title: { en: "New Competition", id: "Kompetisi Baru" },
        content: {
          en: "Regional races are different. The runners are faster, the competition fiercer. You'll need to step up your game.",
          id: "Lomba regional berbeda. Pelarinya lebih cepat, kompetisinya lebih sengit. Kamu perlu meningkatkan permainanmu.",
        },
        emotionalTone: "tense",
        skipable: true,
      },
      {
        id: "ch2_rival_intro",
        trigger: "mid_chapter",
        cinematicType: "dialogue",
        title: { en: "A Worthy Opponent", id: "Lawan yang Layak" },
        content: {
          en: "Marcus Chen steps onto the track. His reputation precedes him. This won't be easy.",
          id: "Marcus Chen melangkah ke trek. Reputasinya mendahuluinya. Ini tidak akan mudah.",
        },
        characterAppearances: ["marcus"],
        emotionalTone: "tense",
        skipable: true,
      },
      {
        id: "ch2_pre_final",
        trigger: "pre_final",
        cinematicType: "dialogue",
        title: { en: "Regional Finals", id: "Final Regional" },
        content: {
          en: "Coach: 'You've come far. The Regional 10K is yours to win. Show them what you're made of.'",
          id: "Pelatih: 'Kamu sudah jauh. 10K Regional adalah milikmu untuk dimenangkan. Tunjukkan apa yang kamu punya.'",
        },
        characterAppearances: ["coach"],
        emotionalTone: "inspiring",
        skipable: false,
      },
    ],
    finalRace: {
      id: "ch2_final_regional_10k",
      title: { en: "Regional 10K Championship", id: "Kejuaraan 10K Regional" },
      description: {
        en: "Face the region's best runners in a grueling 10K race.",
        id: "Hadapi pelari terbaik region di lomba 10K yang melelahkan.",
      },
      distance: 10,
      location: "Regional Stadium",
      stakes: {
        en: "Become known as a serious competitor",
        id: "Dikenal sebagai kompetitor serius",
      },
      rivalLineup: ["marcus", "elena"],
      difficulty: "medium",
      requiredToComplete: true,
      retryable: true,
      unlockMessage: {
        en: "🏆 Regional Championship unlocked! Time to face Marcus Chen.",
        id: "🏆 Kejuaraan Regional terbuka! Waktunya menghadapi Marcus Chen.",
      },
    },
    rewards: {
      xp: 1000,
      coins: 500,
      unlocks: [
        {
          type: "rival",
          id: "marcus",
          name: { en: "Marcus Chen", id: "Marcus Chen" },
          description: {
            en: "A tactical runner who never gives up",
            id: "Pelari taktis yang tak pernah menyerah",
          },
        },
        {
          type: "rival",
          id: "elena",
          name: { en: "Elena Rodriguez", id: "Elena Rodriguez" },
          description: {
            en: "Speed specialist with explosive power",
            id: "Spesialis kecepatan dengan tenaga eksplosif",
          },
        },
        {
          type: "training",
          id: "interval_training",
          name: { en: "Interval Training", id: "Latihan Interval" },
          description: {
            en: "Advanced speed development",
            id: "Pengembangan kecepatan lanjutan",
          },
        },
      ],
      title: { en: "Regional Star", id: "Bintang Regional" },
    },
    estimatedRaces: 8,
    icon: "⭐",
  },

  // Chapter 3: Trials
  {
    id: "chapter_3_trials",
    number: 3,
    title: { en: "Trials", id: "Ujian" },
    subtitle: { en: "Through Adversity", id: "Melewati Kesulitan" },
    theme: "trials",
    synopsis: {
      en: "Success brings pressure. An injury scare and self-doubt threaten to derail your career. Can you overcome?",
      id: "Kesuksesan membawa tekanan. Cedera dan keraguan diri 
mengancam karirmu. Bisakah kamu mengatasinya?",
    },
    unlockRequirements: {
      minLevel: 13,
      previousChapterComplete: 2,
    },
    storyBeats: [],
    finalRace: {
      id: "ch3_final_state_half",
      title: {
        en: "State Half-Marathon Championship",
        id: "Kejuaraan Half-Marathon Negara Bagian",
      },
      description: {
        en: "Your longest race yet. Prove you've overcome adversity.",
        id: "Lomba terpanjangmu sejauh ini. Buktikan kamu telah mengatasi kesulitan.",
      },
      distance: 21.1,
      location: "State Capitol",
      stakes: {
        en: "Prove resilience and mental strength",
        id: "Buktikan ketahanan dan kekuatan mental",
      },
      rivalLineup: ["marcus", "elena", "sarah"],
      difficulty: "hard",
      requiredToComplete: true,
      retryable: true,
    },
    rewards: {
      xp: 2000,
      coins: 1000,
      unlocks: [],
      title: { en: "Resilient Runner", id: "Pelari Tangguh" },
    },
    estimatedRaces: 10,
    icon: "💪",
  },

  // Chapters 4 and 5 placeholder
  {
    id: "chapter_4_glory",
    number: 4,
    title: { en: "Glory", id: "Kejayaan" },
    subtitle: { en: "Championship Hunt", id: "Perburuan Juara" },
    theme: "glory",
    synopsis: {
      en: "The national stage awaits.",
      id: "Panggung nasional menanti.",
    },
    unlockRequirements: {
      minLevel: 19,
      previousChapterComplete: 3,
    },
    storyBeats: [],
    finalRace: {
      id: "ch4_final",
      title: { en: "National Championship", id: "Kejuaraan Nasional" },
      description: { en: "National stage", id: "Panggung nasional" },
      distance: 42.195,
      location: "National Stadium",
      stakes: { en: "Glory", id: "Kejayaan" },
      rivalLineup: ["kenji"],
      difficulty: "extreme",
      requiredToComplete: true,
      retryable: true,
    },
    rewards: {
      xp: 5000,
      coins: 3000,
      unlocks: [],
    },
    estimatedRaces: 12,
    icon: "🏆",
  },

  {
    id: "chapter_5_legacy",
    number: 5,
    title: { en: "Legacy", id: "Warisan" },
    subtitle: { en: "History Awaits", id: "Sejarah Menanti" },
    theme: "legacy",
    synopsis: {
      en: "Olympic Trials await.",
      id: "Olympic Trials menanti.",
    },
    unlockRequirements: {
      minLevel: 26,
      previousChapterComplete: 4,
    },
    storyBeats: [],
    finalRace: {
      id: "ch5_final",
      title: { en: "Olympic Trials", id: "Olympic Trials" },
      description: { en: "The ultimate test", id: "Ujian tertinggi" },
      distance: 42.195,
      location: "Olympic Stadium",
      stakes: { en: "Immortality", id: "Keabadian" },
      rivalLineup: ["kenji"],
      difficulty: "extreme",
      requiredToComplete: false,
      retryable: true,
    },
    rewards: {
      xp: 10000,
      coins: 5000,
      unlocks: [],
    },
    estimatedRaces: 15,
    icon: "🏅",
  },
];

export function getChapterByNumber(chapterNumber: number): StoryChapter | undefined {
  return STORY_CHAPTERS.find((ch) => ch.number === chapterNumber);
}

export function getChapterById(chapterId: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find((ch) => ch.id === chapterId);
}
