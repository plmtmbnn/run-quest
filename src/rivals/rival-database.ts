import type { Rival } from "./rival-types";

/**
 * Database of named rivals with distinct personalities
 *
 * Each rival has:
 * - Unique personality and racing style
 * - Archetype that defines their strengths
 * - Pre/post race quotes in English and Indonesian
 * - Base stats for simulation
 */
export const RIVALS: Rival[] = [
  {
    id: "marcus_rivera",
    name: "Marcus 'The Machine' Rivera",
    archetype: "endurance",
    personality: "cocky",
    baseSpeed: 75,
    baseStamina: 90,
    baseWillpower: 80,
    preferredDistance: "marathon",
    preRaceQuotes: [
      {
        en: "Ready to watch me disappear into the distance again?",
        id: "Siap melihat saya menghilang ke kejauhan lagi?",
      },
      {
        en: "I never get tired. Can you say the same?",
        id: "Saya tidak pernah lelah. Bisakah Anda mengatakan hal yang sama?",
      },
      {
        en: "They call me The Machine for a reason. I don't break down.",
        id: "Mereka menyebut saya The Machine karena alasan. Saya tidak rusak.",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "Like I said—I'm a machine. Better luck next time.",
          id: "Seperti yang saya katakan—saya mesin. Semoga beruntung lain kali.",
        },
        {
          en: "You gave it your best. Unfortunately, my best is better.",
          id: "Anda memberikan yang terbaik. Sayangnya, yang terbaik saya lebih baik.",
        },
        {
          en: "Maybe next race you'll keep up... for a while.",
          id: "Mungkin balapan berikutnya Anda akan mengikuti... sebentar.",
        },
      ],
      defeat: [
        {
          en: "Okay, I'll admit it—you earned that one. See you next time.",
          id: "Oke, saya akui—Anda mendapatkannya. Sampai jumpa lain kali.",
        },
        {
          en: "Impressive. But machines learn. I'll be back stronger.",
          id: "Mengesankan. Tapi mesin belajar. Saya akan kembali lebih kuat.",
        },
        {
          en: "You got me today. Enjoy it while it lasts.",
          id: "Anda mendapat saya hari ini. Nikmati selagi bisa.",
        },
      ],
      close: [
        {
          en: "That was too close. We need a rematch—now.",
          id: "Itu terlalu dekat. Kita perlu main ulang—sekarang.",
        },
        {
          en: "Down to the wire. This rivalry is just getting started.",
          id: "Sampai detik terakhir. Persaingan ini baru saja dimulai.",
        },
      ],
    },
    backstory: {
      en: "Former cyclist who switched to running and brought his legendary endurance with him. Never seems to tire, no matter the distance.",
      id: "Mantan pesepeda yang beralih ke lari dan membawa daya tahan legendanya. Sepertinya tidak pernah lelah, berapa pun jaraknya.",
    },
  },
  {
    id: "ellie_park",
    name: "Ellie 'Lightning' Park",
    archetype: "speed",
    personality: "friendly",
    baseSpeed: 95,
    baseStamina: 70,
    baseWillpower: 75,
    preferredDistance: "5K",
    preRaceQuotes: [
      {
        en: "Hey! May the fastest runner win. Good luck out there!",
        id: "Hei! Semoga pelari tercepat menang. Semoga berhasil di luar sana!",
      },
      {
        en: "I love the speed. Let's make this one exciting!",
        id: "Saya suka kecepatan. Mari buat ini menarik!",
      },
      {
        en: "Race you to the finish? I promise to give you a head start... kidding!",
        id: "Balapan sampai garis finis? Saya janji beri Anda kepala mulai... bercanda!",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "Whew! That was fast! You really pushed me out there!",
          id: "Wah! Itu cepat! Anda benar-benar mendorong saya di luar sana!",
        },
        {
          en: "Great race! You're getting faster every time we meet.",
          id: "Balapan hebat! Anda semakin cepat setiap kali kita bertemu.",
        },
        {
          en: "Yes! But honestly, you almost had me there. Keep training!",
          id: "Ya! Tapi jujur, Anda hampir mendapat saya di sana. Terus latihan!",
        },
      ],
      defeat: [
        {
          en: "WOW! You were flying out there! That was incredible!",
          id: "WOW! Anda terbang di luar sana! Itu luar biasa!",
        },
        {
          en: "You beat Lightning today! I'm impressed. Really impressed.",
          id: "Anda mengalahkan Lightning hari ini! Saya terkesan. Sangat terkesan.",
        },
        {
          en: "That speed! I need to step up my game. Great run!",
          id: "Kecepatan itu! Saya perlu meningkatkan permainan saya. Lari hebat!",
        },
      ],
      close: [
        {
          en: "That was INSANE! We need to do that again!",
          id: "Itu GILA! Kita perlu melakukannya lagi!",
        },
        {
          en: "Photo finish! I love races like these!",
          id: "Foto finish! Saya suka balapan seperti ini!",
        },
      ],
    },
    backstory: {
      en: "Former track star with explosive speed. Dominates short distances but struggles in longer races. Always positive and encouraging.",
      id: "Mantan bintang lintasan dengan kecepatan eksplosif. Mendominasi jarak pendek tetapi berjuang dalam balapan yang lebih panjang. Selalu positif dan mendorong.",
    },
  },
  {
    id: "kenji_nakamura",
    name: "Kenji 'Silent Storm' Nakamura",
    archetype: "tactical",
    personality: "silent",
    baseSpeed: 80,
    baseStamina: 85,
    baseWillpower: 90,
    preferredDistance: "half",
    preRaceQuotes: [
      {
        en: "...",
        id: "...",
      },
      {
        en: "*nods respectfully*",
        id: "*mengangguk dengan hormat*",
      },
      {
        en: "Let's run.",
        id: "Mari berlari.",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "*bows slightly* Good effort.",
          id: "*membungkuk sedikit* Usaha bagus.",
        },
        {
          en: "Patience wins races.",
          id: "Kesabaran memenangkan balapan.",
        },
        {
          en: "*quiet nod of acknowledgment*",
          id: "*anggukan tenang pengakuan*",
        },
      ],
      defeat: [
        {
          en: "*respectful bow* You ran well.",
          id: "*membungkuk hormat* Anda berlari dengan baik.",
        },
        {
          en: "I underestimated you. Not again.",
          id: "Saya meremehkan Anda. Tidak lagi.",
        },
        {
          en: "*nods with respect* Strong race.",
          id: "*mengangguk dengan hormat* Balapan kuat.",
        },
      ],
      close: [
        {
          en: "Evenly matched. Interesting.",
          id: "Cocok sama. Menarik.",
        },
        {
          en: "*intense stare* Next time.",
          id: "*tatapan intens* Lain kali.",
        },
      ],
    },
    backstory: {
      en: "A tactical genius who rarely speaks. Studies his competitors and exploits weaknesses. Prefers perfect pacing over raw speed.",
      id: "Jenius taktis yang jarang berbicara. Mempelajari pesaingnya dan mengeksploitasi kelemahan. Lebih suka pacing sempurna daripada kecepatan mentah.",
    },
  },
  {
    id: "sarah_chen",
    name: "Sarah 'Ironheart' Chen",
    archetype: "mental",
    personality: "intense",
    baseSpeed: 80,
    baseStamina: 80,
    baseWillpower: 95,
    preferredDistance: "marathon",
    preRaceQuotes: [
      {
        en: "Pain is temporary. Victory is forever. Let's go.",
        id: "Rasa sakit sementara. Kemenangan selamanya. Ayo pergi.",
      },
      {
        en: "I don't quit. Ever. Remember that out there.",
        id: "Saya tidak berhenti. Pernah. Ingat itu di luar sana.",
      },
      {
        en: "Mental toughness beats physical talent. Every. Single. Time.",
        id: "Ketangguhan mental mengalahkan bakat fisik. Setiap. Waktu. Tunggal.",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "Willpower wins. Today proved it again.",
          id: "Kemauan menang. Hari ini membuktikannya lagi.",
        },
        {
          en: "You fought hard. But I fought harder. That's the difference.",
          id: "Anda bertarung keras. Tapi saya bertarung lebih keras. Itu perbedaannya.",
        },
        {
          en: "I knew you'd break. I never do.",
          id: "Saya tahu Anda akan patah. Saya tidak pernah.",
        },
      ],
      defeat: [
        {
          en: "You had the stronger will today. I respect that.",
          id: "Anda memiliki kemauan yang lebih kuat hari ini. Saya menghormati itu.",
        },
        {
          en: "Good. I needed a reminder that I'm not invincible. See you next time.",
          id: "Bagus. Saya butuh pengingat bahwa saya tidak tak terkalahkan. Sampai jumpa lain kali.",
        },
        {
          en: "You broke through your limits. Impressive.",
          id: "Anda menembus batas Anda. Mengesankan.",
        },
      ],
      close: [
        {
          en: "Neither of us quit. This is what racing is about.",
          id: "Tidak ada dari kita yang berhenti. Inilah tentang balapan.",
        },
        {
          en: "Iron sharpens iron. We made each other better today.",
          id: "Besi mengasah besi. Kami membuat satu sama lain lebih baik hari ini.",
        },
      ],
    },
    backstory: {
      en: "Overcame a career-threatening injury through sheer willpower. Known for never giving up, no matter how dire the situation.",
      id: "Mengatasi cedera mengancam karir melalui kemauan murni. Dikenal karena tidak pernah menyerah, tidak peduli seberapa parah situasinya.",
    },
  },
  {
    id: "alex_santos",
    name: "Alex 'The Natural' Santos",
    archetype: "versatile",
    personality: "respectful",
    baseSpeed: 85,
    baseStamina: 85,
    baseWillpower: 85,
    preferredDistance: "10K",
    preRaceQuotes: [
      {
        en: "Looking forward to a good race. May the best runner win.",
        id: "Menantikan balapan yang bagus. Semoga pelari terbaik menang.",
      },
      {
        en: "I respect your training. Let's see what we've both got today.",
        id: "Saya menghormati latihan Anda. Mari kita lihat apa yang kita miliki hari ini.",
      },
      {
        en: "Every race is a privilege. Let's make this one count.",
        id: "Setiap balapan adalah hak istimewa. Mari buat ini berarti.",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "That was a hard-fought race. You should be proud of your effort.",
          id: "Itu balapan yang diperjuangkan keras. Anda harus bangga dengan usaha Anda.",
        },
        {
          en: "Thank you for pushing me. I'm a better runner because of competitors like you.",
          id: "Terima kasih telah mendorong saya. Saya pelari yang lebih baik karena pesaing seperti Anda.",
        },
        {
          en: "I got lucky today. You're getting stronger—I can tell.",
          id: "Saya beruntung hari ini. Anda semakin kuat—saya bisa tahu.",
        },
      ],
      defeat: [
        {
          en: "Well done. You ran a smart, strong race. I learned from watching you.",
          id: "Bagus. Anda berlari balapan cerdas dan kuat. Saya belajar dari menonton Anda.",
        },
        {
          en: "You deserved that win. Your preparation showed. Congratulations.",
          id: "Anda pantas menang itu. Persiapan Anda terlihat. Selamat.",
        },
        {
          en: "I gave it everything, and you still beat me. That's true excellence.",
          id: "Saya memberikan segalanya, dan Anda masih mengalahkan saya. Itu keunggulan sejati.",
        },
      ],
      close: [
        {
          en: "What a finish! Both of us left it all out there. Respect.",
          id: "Finish apa! Kita berdua meninggalkan semuanya di luar sana. Hormat.",
        },
        {
          en: "Couldn't ask for a better competitor. That was pure racing.",
          id: "Tidak bisa meminta pesaing yang lebih baik. Itu balapan murni.",
        },
      ],
    },
    backstory: {
      en: "Born with natural talent and refined it through dedicated training. Balanced in all aspects, with no major weakness. Deeply respectful of the sport.",
      id: "Lahir dengan bakat alami dan menyempurnakannya melalui latihan yang berdedikasi. Seimbang dalam semua aspek, tanpa kelemahan besar. Sangat menghormati olahraga.",
    },
  },
  {
    id: "maria_gonzalez",
    name: "Maria 'Momentum' Gonzalez",
    archetype: "speed",
    personality: "cocky",
    baseSpeed: 90,
    baseStamina: 75,
    baseWillpower: 80,
    preferredDistance: "10K",
    preRaceQuotes: [
      {
        en: "Hope you've been training hard. I certainly have.",
        id: "Harap Anda telah berlatih keras. Saya tentu saja.",
      },
      {
        en: "I'm feeling unstoppable today. Just a friendly warning.",
        id: "Saya merasa tak terhentikan hari ini. Hanya peringatan ramah.",
      },
      {
        en: "Try to keep up with me—if you can.",
        id: "Coba ikuti saya—jika bisa.",
      },
    ],
    postRaceQuotes: {
      victory: [
        {
          en: "Told you I was feeling unstoppable. Better luck next race.",
          id: "Bilang kan saya merasa tak terhentikan. Semoga beruntung balapan berikutnya.",
        },
        {
          en: "Momentum is everything, and today I had it all.",
          id: "Momentum adalah segalanya, dan hari ini saya memiliki semuanya.",
        },
        {
          en: "Thanks for the warmup. Who's next?",
          id: "Terima kasih untuk pemanasan. Siapa berikutnya?",
        },
      ],
      defeat: [
        {
          en: "Okay, okay, you got me. I wasn't expecting that.",
          id: "Oke, oke, Anda mendapat saya. Saya tidak mengharapkan itu.",
        },
        {
          en: "Fine. You were the better runner today. THIS time.",
          id: "Baik. Anda pelari yang lebih baik hari ini. KALI ini.",
        },
        {
          en: "I underestimated you. Won't happen again.",
          id: "Saya meremehkan Anda. Tidak akan terjadi lagi.",
        },
      ],
      close: [
        {
          en: "That was way too close for comfort. Rematch soon?",
          id: "Itu terlalu dekat untuk kenyamanan. Main ulang segera?",
        },
        {
          en: "Neither of us backing down. I like your style.",
          id: "Tidak ada dari kita yang mundur. Saya suka gaya Anda.",
        },
      ],
    },
    backstory: {
      en: "A rising star with supreme confidence. Uses aggressive early pacing to break competitors' spirits. Sometimes overconfident.",
      id: "Bintang yang sedang naik daun dengan kepercayaan diri yang tinggi. Menggunakan pacing awal agresif untuk mematahkan semangat pesaing. Kadang terlalu percaya diri.",
    },
  },
];

/**
 * Get a rival by ID
 */
export function getRivalById(id: string): Rival | undefined {
  return RIVALS.find((rival) => rival.id === id);
}

/**
 * Get all rivals
 */
export function getAllRivals(): Rival[] {
  return [...RIVALS];
}

/**
 * Get rivals by archetype
 */
export function getRivalsByArchetype(archetype: Rival["archetype"]): Rival[] {
  return RIVALS.filter((rival) => rival.archetype === archetype);
}

/**
 * Get rivals by personality
 */
export function getRivalsByPersonality(
  personality: Rival["personality"],
): Rival[] {
  return RIVALS.filter((rival) => rival.personality === personality);
}
