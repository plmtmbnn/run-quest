import type { RunnerProfile } from "@/runner/runner-types";
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
        en: "Championship race unlocked! Prove yourself in the Local 5K.",
        id: "Lomba kejuaraan terbuka! Buktikan dirimu di 5K Lokal.",
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
          en: "Coach: You've come far. The Regional 10K is yours to win. Show them what you're made of.",
          id: "Pelatih: Kamu sudah jauh. 10K Regional adalah milikmu untuk dimenangkan. Tunjukkan apa yang kamu punya.",
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
        en: "Regional Championship unlocked! Time to face Marcus Chen.",
        id: "Kejuaraan Regional terbuka! Waktunya menghadapi Marcus Chen.",
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
      id: "Kesuksesan membawa tekanan. Cedera dan keraguan diri mengancam karirmu. Bisakah kamu mengatasinya?",
    },
    unlockRequirements: {
      minLevel: 13,
      previousChapterComplete: 2,
    },
    storyBeats: [
      {
        id: "ch3_start",
        trigger: "chapter_start",
        cinematicType: "text",
        title: { en: "Warning Signs", id: "Tanda Peringatan" },
        content: {
          en: "Your knee has been bothering you. The doctor warns about overtraining. But the State Championship is coming...",
          id: "Lututmu mulai mengganggu. Dokter memperingatkan tentang overtraining. Tapi Kejuaraan Negara Bagian mendekat...",
        },
        emotionalTone: "tense",
        skipable: true,
      },
      {
        id: "ch3_doubt",
        trigger: "mid_chapter",
        cinematicType: "flashback",
        title: { en: "Moment of Doubt", id: "Momen Keraguan" },
        content: {
          en: "Maybe you're not cut out for this. Maybe you've reached your limit. But then you remember why you started...",
          id: "Mungkin kamu tidak cocok untuk ini. Mungkin kamu sudah mencapai batasmu. Tapi kemudian kamu ingat mengapa kamu memulai...",
        },
        emotionalTone: "reflective",
        skipable: true,
      },
      {
        id: "ch3_comeback",
        trigger: "pre_final",
        cinematicType: "dialogue",
        title: { en: "The Comeback", id: "Kembali Bangkit" },
        content: {
          en: "Coach: You've trained smart, recovered well. This is your moment. Show them you're stronger than ever.",
          id: "Pelatih: Kamu berlatih dengan cerdas, pulih dengan baik. Ini momentmu. Tunjukkan kamu lebih kuat dari sebelumnya.",
        },
        characterAppearances: ["coach"],
        emotionalTone: "inspiring",
        skipable: false,
      },
    ],
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
      unlockMessage: {
        en: "State Championship unlocked! Your toughest test yet.",
        id: "Kejuaraan Negara Bagian terbuka! Ujian terberatmu sejauh ini.",
      },
    },
    rewards: {
      xp: 2000,
      coins: 1000,
      unlocks: [
        {
          type: "training",
          id: "mental_training",
          name: { en: "Mental Training", id: "Latihan Mental" },
          description: {
            en: "Strengthen willpower and resilience",
            id: "Perkuat willpower dan ketahanan",
          },
        },
        {
          type: "feature",
          id: "recovery_system",
          name: { en: "Recovery System", id: "Sistem Pemulihan" },
          description: {
            en: "Manage injury risk and recovery",
            id: "Kelola risiko cedera dan pemulihan",
          },
        },
      ],
      title: { en: "Resilient Runner", id: "Pelari Tangguh" },
      specialItem: "recovery_bracelet",
    },
    estimatedRaces: 10,
    icon: "💪",
  },

  // Chapter 4: Glory
  {
    id: "chapter_4_glory",
    number: 4,
    title: { en: "Glory", id: "Kejayaan" },
    subtitle: { en: "Championship Hunt", id: "Perburuan Juara" },
    theme: "glory",
    synopsis: {
      en: "The national stage awaits. Face the country's elite runners in the marathon championship of your life.",
      id: "Panggung nasional menanti. Hadapi pelari elit negara di kejuaraan maraton hidupmu.",
    },
    unlockRequirements: {
      minLevel: 19,
      previousChapterComplete: 3,
      minTotalDistance: 200,
    },
    storyBeats: [
      {
        id: "ch4_start",
        trigger: "chapter_start",
        cinematicType: "montage",
        title: { en: "National Stage", id: "Panggung Nasional" },
        content: {
          en: "Your name is in the papers. Sponsors are calling. You're now competing with the nation's best.",
          id: "Namamu ada di koran. Sponsor menelepon. Kamu sekarang berkompetisi dengan yang terbaik di negara.",
        },
        emotionalTone: "triumphant",
        skipable: true,
      },
      {
        id: "ch4_ultimate_rival",
        trigger: "mid_chapter",
        cinematicType: "dialogue",
        title: { en: "Ultimate Challenge", id: "Tantangan Utama" },
        content: {
          en: "Kenji Tanaka. National record holder. The runner everyone fears. He's in your heat.",
          id: "Kenji Tanaka. Pemegang rekor nasional. Pelari yang semua orang takuti. Dia di heat-mu.",
        },
        characterAppearances: ["kenji"],
        emotionalTone: "tense",
        skipable: true,
      },
      {
        id: "ch4_pre_final",
        trigger: "pre_final",
        cinematicType: "dialogue",
        title: { en: "The Big Moment", id: "Momen Besar" },
        content: {
          en: "This is it. Everything you've trained for leads to this race. National Championship. Marathon. Go get it.",
          id: "Ini dia. Semua yang kamu latih menuju lomba ini. Kejuaraan Nasional. Maraton. Raihlah.",
        },
        characterAppearances: ["coach"],
        emotionalTone: "inspiring",
        skipable: false,
      },
    ],
    finalRace: {
      id: "ch4_final_national_marathon",
      title: {
        en: "National Marathon Championship",
        id: "Kejuaraan Maraton Nasional",
      },
      description: {
        en: "42.195 kilometers. The nation's best. Your shot at glory.",
        id: "42,195 kilometer. Yang terbaik di negara. Kesempatanmu untuk kejayaan.",
      },
      distance: 42.195,
      location: "National Stadium",
      stakes: {
        en: "Become a national champion",
        id: "Menjadi juara nasional",
      },
      rivalLineup: ["kenji", "marcus", "elena", "sarah"],
      difficulty: "extreme",
      requiredToComplete: true,
      retryable: true,
      unlockMessage: {
        en: "NATIONAL CHAMPIONSHIP! This is your moment!",
        id: "KEJUARAAN NASIONAL! Ini momentmu!",
      },
    },
    rewards: {
      xp: 5000,
      coins: 3000,
      unlocks: [
        {
          type: "rival",
          id: "kenji",
          name: { en: "Kenji Tanaka", id: "Kenji Tanaka" },
          description: {
            en: "National record holder and endurance legend",
            id: "Pemegang rekor nasional dan legenda ketahanan",
          },
        },
        {
          type: "training",
          id: "elite_program",
          name: { en: "Elite Training Program", id: "Program Latihan Elit" },
          description: {
            en: "World-class training methods",
            id: "Metode latihan kelas dunia",
          },
        },
        {
          type: "gear",
          id: "championship_gear",
          name: { en: "Championship Gear", id: "Perlengkapan Juara" },
          description: {
            en: "Elite equipment for champions",
            id: "Perlengkapan elit untuk juara",
          },
        },
      ],
      title: { en: "National Champion", id: "Juara Nasional" },
      specialItem: "championship_medal",
    },
    estimatedRaces: 12,
    icon: "🏆",
  },

  // Chapter 5: Legacy
  {
    id: "chapter_5_legacy",
    number: 5,
    title: { en: "Legacy", id: "Warisan" },
    subtitle: { en: "History Awaits", id: "Sejarah Menanti" },
    theme: "legacy",
    synopsis: {
      en: "You've conquered the nation. Now the world stage calls. The Olympic Trials. Your chance at immortality.",
      id: "Kamu telah menaklukkan negara. Sekarang panggung dunia memanggil. Olympic Trials. Kesempatanmu untuk keabadian.",
    },
    unlockRequirements: {
      minLevel: 26,
      previousChapterComplete: 4,
      minTotalDistance: 500,
      minTotalRaces: 50,
    },
    storyBeats: [
      {
        id: "ch5_start",
        trigger: "chapter_start",
        cinematicType: "montage",
        title: { en: "World Stage", id: "Panggung Dunia" },
        content: {
          en: "Olympic Trials. The pinnacle. Win this, and your name goes in the history books forever.",
          id: "Olympic Trials. Puncaknya. Menangkan ini, dan namamu masuk buku sejarah selamanya.",
        },
        emotionalTone: "triumphant",
        skipable: true,
      },
      {
        id: "ch5_reflection",
        trigger: "mid_chapter",
        cinematicType: "flashback",
        title: { en: "The Journey", id: "Perjalanan" },
        content: {
          en: "Remember when you were just a nobody with a dream? Look how far you've come. One more step.",
          id: "Ingat saat kamu hanya orang biasa dengan mimpi? Lihat seberapa jauh kamu telah datang. Satu langkah lagi.",
        },
        emotionalTone: "reflective",
        skipable: true,
      },
      {
        id: "ch5_pre_final",
        trigger: "pre_final",
        cinematicType: "dialogue",
        title: { en: "Final Words", id: "Kata Terakhir" },
        content: {
          en: "Coach: This is everything we've worked for. Go out there and run your race. Make history.",
          id: "Pelatih: Ini semua yang kita kerjakan. Keluarlah dan lari lomba-mu. Buat sejarah.",
        },
        characterAppearances: ["coach"],
        emotionalTone: "inspiring",
        skipable: false,
      },
    ],
    finalRace: {
      id: "ch5_final_olympic_trials",
      title: { en: "Olympic Trials Marathon", id: "Maraton Olympic Trials" },
      description: {
        en: "The ultimate test. Win this, and you make the Olympic team.",
        id: "Ujian tertinggi. Menangkan ini, dan kamu masuk tim Olimpiade.",
      },
      distance: 42.195,
      location: "Olympic Stadium",
      stakes: {
        en: "Secure your place in history",
        id: "Amankan tempatmu dalam sejarah",
      },
      rivalLineup: ["kenji", "marcus", "elena", "sarah", "victor"],
      difficulty: "extreme",
      requiredToComplete: false,
      retryable: true,
      unlockMessage: {
        en: "OLYMPIC TRIALS! The ultimate race awaits!",
        id: "OLYMPIC TRIALS! Lomba tertinggi menanti!",
      },
    },
    rewards: {
      xp: 10000,
      coins: 5000,
      unlocks: [
        {
          type: "story",
          id: "epilogue",
          name: { en: "Career Epilogue", id: "Epilog Karir" },
          description: {
            en: "The story of your legendary career",
            id: "Kisah karirmu yang legendaris",
          },
        },
      ],
      title: { en: "Legend", id: "Legenda" },
      specialItem: "olympic_trials_jersey",
    },
    estimatedRaces: 15,
    icon: "🏅",
  },
];

/**
 * Get chapter by number
 */
export function getChapterByNumber(chapterNumber: number): StoryChapter | undefined {
  return STORY_CHAPTERS.find((ch) => ch.number === chapterNumber);
}

/**
 * Get chapter by ID
 */
export function getChapterById(chapterId: string): StoryChapter | undefined {
  return STORY_CHAPTERS.find((ch) => ch.id === chapterId);
}

/**
 * Get all unlocked chapters for a profile
 */
export function getUnlockedChapters(profile: RunnerProfile): StoryChapter[] {
  return STORY_CHAPTERS.filter((chapter) => {
    return isChapterUnlocked(chapter, profile);
  });
}

/**
 * Check if a chapter is unlocked
 */
export function isChapterUnlocked(
  chapter: StoryChapter,
  profile: RunnerProfile,
): boolean {
  const req = chapter.unlockRequirements;

  // Level check
  if (profile.level < req.minLevel) {
    return false;
  }

  // Total races check
  if (req.minTotalRaces && profile.totalRuns < req.minTotalRaces) {
    return false;
  }

  // Total distance check
  if (req.minTotalDistance && profile.totalDistance < req.minTotalDistance) {
    return false;
  }

  // Custom condition check
  if (req.customCondition && !req.customCondition(profile)) {
    return false;
  }

  return true;
}
