import type { DecisionCard } from "@/types/engine";

export const DECISION_DATABASE: Record<string, DecisionCard> = {
  strong_headwind: {
    id: "strong_headwind",
    category: "environment",
    rarity: "common",
    title: {
      en: "Strong Headwind",
      id: "Angin Sakal Kencang",
    },
    description: {
      en: "A powerful headwind is slowing the entire pack. What will you do?",
      id: "Angin kencang bertiup langsung menghalangi jalanmu. Apa yang akan kamu lakukan?",
    },
    choices: [
      {
        id: "headwind_slow",
        label: { en: "Slow Down", id: "Melambat" },
        description: {
          en: "Draft behind others to save energy, but lose position.",
          id: "Berlindung di belakang pelari lain untuk menghemat energi, tetapi kehilangan posisi.",
        },
        behavior: "conservative",
        effects: { stamina: 15, hydration: 0, morale: -5, pace: 15 },
      },
      {
        id: "headwind_maintain",
        label: { en: "Maintain Pace", id: "Pertahankan Ritme" },
        description: {
          en: "Keep your current pace, taking a balanced effort.",
          id: "Pertahankan kecepatan saat ini dengan usaha seimbang.",
        },
        behavior: "balanced",
        effects: { stamina: -5, hydration: -5, morale: 0, pace: 5 },
      },
      {
        id: "headwind_push",
        label: { en: "Push Hard", id: "Genjot Kecepatan" },
        description: {
          en: "Power through the wind to gain positions, but waste energy.",
          id: "Menembus angin untuk merebut posisi, tetapi menghabiskan banyak energi.",
        },
        behavior: "aggressive",
        effects: { stamina: -25, hydration: -10, morale: 15, pace: -15 },
      },
    ],
  },
  heat_wave: {
    id: "heat_wave",
    category: "environment",
    rarity: "uncommon",
    title: {
      en: "Sudden Heat Wave",
      id: "Gelombang Panas Mendadak",
    },
    description: {
      en: "The sun blazes intensely. Dehydration risk is high.",
      id: "Matahari bersinar sangat terik. Risiko dehidrasi sangat tinggi.",
    },
    choices: [
      {
        id: "heat_conserve",
        label: { en: "Reduce Effort", id: "Kurangi Usaha" },
        description: {
          en: "Slow down to prevent overheating and save hydration.",
          id: "Melambat untuk mencegah kepanasan dan menghemat hidrasi.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: 5, morale: -5, pace: 20 },
      },
      {
        id: "heat_pour_water",
        label: { en: "Pour Water on Head", id: "Siram Air ke Kepala" },
        description: {
          en: "Cool down immediately, losing a little water but boosting focus.",
          id: "Mendinginkan diri segera, kehilangan sedikit air tetapi meningkatkan fokus.",
        },
        behavior: "balanced",
        effects: { stamina: 0, hydration: -5, morale: 10, pace: 5 },
      },
      {
        id: "heat_ignore",
        label: { en: "Ignore and Push", id: "Abaikan dan Terobos" },
        description: {
          en: "Maintain target pace, risking massive hydration loss.",
          id: "Pertahankan target kecepatan, berisiko kehilangan hidrasi secara masif.",
        },
        behavior: "aggressive",
        effects: { stamina: -15, hydration: -25, morale: 5, pace: -5 },
      },
    ],
  },
  aid_station: {
    id: "aid_station",
    category: "tactical",
    rarity: "common",
    title: {
      en: "Aid Station",
      id: "Pos Bantuan / Hidrasi",
    },
    description: {
      en: "You are approaching a replenishment station. How do you handle it?",
      id: "Kamu mendekati pos hidrasi. Bagaimana kamu menghadapinya?",
    },
    choices: [
      {
        id: "aid_water",
        label: { en: "Grab Water", id: "Ambil Air" },
        description: {
          en: "Take a cup of water. Balanced recovery.",
          id: "Ambil secangkir air. Pemulihan seimbang.",
        },
        behavior: "balanced",
        effects: { stamina: 5, hydration: 20, morale: 5, pace: 4 },
      },
      {
        id: "aid_skip",
        label: { en: "Skip Station", id: "Lewati Pos" },
        description: {
          en: "Bypass the station to maintain momentum, risking dehydration later.",
          id: "Lewati pos untuk menjaga momentum, berisiko dehidrasi kemudian.",
        },
        behavior: "aggressive",
        effects: { stamina: -5, hydration: -10, morale: -5, pace: -5 },
      },
      {
        id: "aid_electrolyte",
        label: { en: "Take Electrolyte & Gel", id: "Ambil Elektrolit & Gel" },
        description: {
          en: "Full replenishment, but causes a longer delay.",
          id: "Pengisian penuh, tetapi menyebabkan penundaan lebih lama.",
        },
        behavior: "conservative",
        effects: { stamina: 20, hydration: 35, morale: 15, pace: 12 },
      },
    ],
  },
  steep_climb: {
    id: "steep_climb",
    category: "tactical",
    rarity: "common",
    title: {
      en: "Steep Climb",
      id: "Tanjakan Curam",
    },
    description: {
      en: "A daunting uphill slope lies ahead of you.",
      id: "Tanjakan yang menakutkan menantangmu di depan.",
    },
    choices: [
      {
        id: "climb_walk",
        label: { en: "Power Walk", id: "Jalan Cepat" },
        description: {
          en: "Conserve your legs and energy, accepting a slower pace.",
          id: "Hemat kaki dan energimu, terima kecepatan yang lebih lambat.",
        },
        behavior: "conservative",
        effects: { stamina: 10, hydration: -2, morale: -5, pace: 25 },
      },
      {
        id: "climb_steady",
        label: { en: "Steady Ascent", id: "Naik dengan Stabil" },
        description: {
          en: "Maintain effort level. Slow down slightly but stay strong.",
          id: "Pertahankan tingkat usaha. Melambat sedikit tetapi tetap kuat.",
        },
        behavior: "balanced",
        effects: { stamina: -10, hydration: -8, morale: 0, pace: 10 },
      },
      {
        id: "climb_attack",
        label: { en: "Attack the Hill", id: "Serang Tanjakan" },
        description: {
          en: "Sprint uphill to drop rivals, consuming high energy.",
          id: "Sprint menanjak untuk meninggalkan rival, menghabiskan energi tinggi.",
        },
        behavior: "aggressive",
        effects: { stamina: -30, hydration: -15, morale: 20, pace: -5 },
      },
    ],
  },
  cramp_warning: {
    id: "cramp_warning",
    category: "physical",
    rarity: "common",
    title: {
      en: "Muscle Cramp Warning",
      id: "Peringatan Kram Otot",
    },
    description: {
      en: "Your calves feel tight. A full cramp is looming.",
      id: "Betis Anda terasa kencang. Kram penuh membayangi.",
    },
    choices: [
      {
        id: "cramp_stretch",
        label: { en: "Stop and Stretch", id: "Berhenti dan Peregangan" },
        description: {
          en: "Lose significant time but eliminate cramp risk completely.",
          id: "Kehilangan waktu signifikan tetapi menghilangkan risiko kram sepenuhnya.",
        },
        behavior: "conservative",
        effects: { stamina: 15, hydration: 0, morale: 5, pace: 35 },
      },
      {
        id: "cramp_slow",
        label: { en: "Ease the Pace", id: "Kurangi Kecepatan" },
        description: {
          en: "Jog lightly to let the muscle settle. Moderately risky.",
          id: "Jogging ringan agar otot rileks. Sedikit berisiko.",
        },
        behavior: "balanced",
        effects: { stamina: 0, hydration: -2, morale: -5, pace: 15 },
      },
      {
        id: "cramp_push",
        label: { en: "Ignore the Pain", id: "Abaikan Rasa Sakit" },
        description: {
          en: "Push through the tightness, risking massive stamina drain.",
          id: "Terobos kekencangan otot, berisiko menguras stamina secara masif.",
        },
        behavior: "aggressive",
        effects: { stamina: -25, hydration: -10, morale: -15, pace: 0 },
      },
    ],
  },
  loss_of_focus: {
    id: "loss_of_focus",
    category: "mental",
    rarity: "common",
    title: {
      en: "Loss of Focus",
      id: "Hilang Fokus",
    },
    description: {
      en: "Your mind wanders and your running form starts to slip.",
      id: "Pikiranmu melayang dan postur larimu mulai kacau.",
    },
    choices: [
      {
        id: "focus_breathe",
        label: { en: "Deep Breathing", id: "Napas Dalam" },
        description: {
          en: "Focus on breath to regain composure, slowing down slightly.",
          id: "Fokus pada napas untuk memulihkan ketenangan, melambat sedikit.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: 0, morale: 15, pace: 6 },
      },
      {
        id: "focus_music",
        label: { en: "Find a Rhythm", id: "Cari Ritme" },
        description: {
          en: "Sync your steps to a steady tempo. Balanced response.",
          id: "Selaraskan langkahmu ke tempo yang stabil. Respons seimbang.",
        },
        behavior: "balanced",
        effects: { stamina: -2, hydration: -2, morale: 8, pace: 2 },
      },
      {
        id: "focus_charge",
        label: { en: "Slap Yourself & Charge", id: "Tampar Diri & Melaju" },
        description: {
          en: "Aggressive mental reboot. Push hard.",
          id: "Reboot mental secara agresif. Maju kencang.",
        },
        behavior: "aggressive",
        effects: { stamina: -10, hydration: -5, morale: 25, pace: -6 },
      },
    ],
  },
  self_doubt: {
    id: "self_doubt",
    category: "mental",
    rarity: "common",
    title: {
      en: "Self Doubt Creeps In",
      id: "Keraguan Diri Muncul",
    },
    description: {
      en: "You start questioning if you can finish this race.",
      id: "Kamu mulai mempertanyakan apakah kamu bisa menyelesaikan balapan ini.",
    },
    choices: [
      {
        id: "doubt_positive",
        label: { en: "Positive Self-Talk", id: "Bicara Positif pada Diri" },
        description: {
          en: "Recite mental mantras. Boosts morale and stability.",
          id: "Ucapkan mantra mental. Meningkatkan moral dan stabilitas.",
        },
        behavior: "balanced",
        effects: { stamina: 0, hydration: 0, morale: 20, pace: 4 },
      },
      {
        id: "doubt_group",
        label: { en: "Find a Pacer Group", id: "Cari Grup Pacer" },
        description: {
          en: "Follow other runners blindly to take off mental pressure.",
          id: "Ikuti pelari lain secara buta untuk meredakan tekanan mental.",
        },
        behavior: "conservative",
        effects: { stamina: 10, hydration: -2, morale: 10, pace: 10 },
      },
      {
        id: "doubt_rage",
        label: { en: "Channel Anger", id: "Salurkan Kemarahan" },
        description: {
          en: "Use frustration as fuel. Fast but exhausting.",
          id: "Gunakan kegusaran sebagai bahan bakar. Cepat tapi melelahkan.",
        },
        behavior: "aggressive",
        effects: { stamina: -20, hydration: -8, morale: 15, pace: -8 },
      },
    ],
  },
  loose_shoelace: {
    id: "loose_shoelace",
    category: "unexpected",
    rarity: "rare",
    title: {
      en: "Loose Shoelace",
      id: "Tali Sepatu Lepas",
    },
    description: {
      en: "Your shoelace comes undone. Running like this is dangerous.",
      id: "Tali sepatumu lepas. Berlari seperti ini sangat berbahaya.",
    },
    choices: [
      {
        id: "shoelace_tie",
        label: { en: "Stop and Tie", id: "Berhenti & Ikat" },
        description: {
          en: "Tie it properly. Safe but takes 15-20 seconds.",
          id: "Ikat dengan benar. Aman tetapi memakan waktu 15-20 detik.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: 0, morale: 5, pace: 20 },
      },
      {
        id: "shoelace_ignore",
        label: { en: "Ignore and Run", id: "Abaikan & Berlari" },
        description: {
          en: "Risk tripping, but maintain immediate pace.",
          id: "Berisiko tersandung, tetapi pertahankan kecepatan segera.",
        },
        behavior: "aggressive",
        effects: { stamina: -15, hydration: -5, morale: -10, pace: 0 },
      },
    ],
  },
  stray_dog: {
    id: "stray_dog",
    category: "unexpected",
    rarity: "rare",
    title: {
      en: "Stray Dog Chase",
      id: "Dikejar Anjing Liar",
    },
    description: {
      en: "An off-leash dog starts barking and running after you!",
      id: "Seekor anjing liar mulai menggonggong dan mengejarmu!",
    },
    choices: [
      {
        id: "dog_sprint",
        label: { en: "Sprint Away", id: "Lari Kencang" },
        description: {
          en: "Sprint to shake the dog off. Fast but burns energy.",
          id: "Berlari secepatnya untuk menghindari anjing. Cepat tapi menguras energi.",
        },
        behavior: "aggressive",
        effects: { stamina: -20, hydration: -10, morale: 10, pace: -40 },
      },
      {
        id: "dog_stop",
        label: { en: "Stop and Shout", id: "Berhenti & Teriak" },
        description: {
          en: "Stop running, turn, and shout firmly to scare it off. Safer but costs time.",
          id: "Berhenti berlari, berbalik, dan berteriak tegas untuk menakutinya. Lebih aman tetapi memakan waktu.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: 0, morale: -15, pace: 35 },
      },
    ],
  },
  cramp: {
    id: "cramp",
    category: "physical",
    rarity: "uncommon",
    title: {
      en: "Severe Side Stitch",
      id: "Kram Perut Mendadak",
    },
    description: {
      en: "A sharp pain flares up in your side, making breathing difficult.",
      id: "Rasa sakit tajam menusuk di perut samping, membuat bernapas menjadi sulit.",
    },
    choices: [
      {
        id: "cramp_stretch",
        label: { en: "Slow and Stretch", id: "Melambat & Peregangan" },
        description: {
          en: "Ease off and alter your breathing pattern to clear the stitch.",
          id: "Kurangi kecepatan dan ubah pola napas untuk meredakan kram.",
        },
        behavior: "conservative",
        effects: { stamina: 10, hydration: 0, morale: 5, pace: 30 },
      },
      {
        id: "cramp_push",
        label: { en: "Push Through It", id: "Terobos Saja" },
        description: {
          en: "Keep running hard despite the pain, risking a performance drop.",
          id: "Tetap berlari kencang mengabaikan rasa sakit, berisiko penurunan performa.",
        },
        behavior: "aggressive",
        effects: { stamina: -15, hydration: -10, morale: -20, pace: 5 },
      },
    ],
  },
  runners_high: {
    id: "runners_high",
    category: "physical",
    rarity: "rare",
    title: {
      en: "Runner's High",
      id: "Runner's High",
    },
    description: {
      en: "A rush of endorphins kicks in. You feel completely weightless and in control.",
      id: "Pelepasan endorfin dimulai. Kamu merasa sangat ringan dan memegang kendali.",
    },
    choices: [
      {
        id: "high_coast",
        label: { en: "Coast Comfortably", id: "Meluncur Nyaman" },
        description: {
          en: "Enjoy the effortless state to conserve energy and hydration.",
          id: "Nikmati sensasi tanpa beban ini untuk menghemat energi dan hidrasi.",
        },
        behavior: "conservative",
        effects: { stamina: 15, hydration: 5, morale: 20, pace: 0 },
      },
      {
        id: "high_push",
        label: { en: "Exploit the Flow", id: "Manfaatkan Aliran" },
        description: {
          en: "Increase your speed significantly while keeping stress low.",
          id: "Tingkatkan kecepatan secara signifikan dengan tingkat stres yang rendah.",
        },
        behavior: "aggressive",
        effects: { stamina: 0, hydration: -5, morale: 15, pace: -20 },
      },
    ],
  },
  steep_downhill: {
    id: "steep_downhill",
    category: "environment",
    rarity: "common",
    title: {
      en: "Steep Downhill",
      id: "Turunan Curam",
    },
    description: {
      en: "A steep downhill section lies ahead. How do you handle it?",
      id: "Bagian turunan curam ada di depan. Bagaimana kamu menghadapinya?",
    },
    choices: [
      {
        id: "downhill_attack",
        label: { en: "Attack the Descent", id: "Serang Turunan" },
        description: {
          en: "Lean forward and sprint downhill. Fast but impacts your leg joints.",
          id: "Condongkan badan dan berlari kencang. Cepat tetapi membebani sendi kaki.",
        },
        behavior: "aggressive",
        effects: { stamina: -10, hydration: -5, morale: 15, pace: -25 },
      },
      {
        id: "downhill_glide",
        label: { en: "Glide Down", id: "Meluncur Santai" },
        description: {
          en: "Let gravity carry you. Good speed boost, conserves energy.",
          id: "Biarkan gravitasi membawamu. Kecepatan bagus, menghemat energi.",
        },
        behavior: "balanced",
        effects: { stamina: 15, hydration: 0, morale: 10, pace: -5 },
      },
      {
        id: "downhill_save",
        label: { en: "Protect Your Knees", id: "Lindungi Lutut" },
        description: {
          en: "Slow down and run carefully to prevent muscle soreness later.",
          id: "Melambat dan berlari hati-hati untuk mencegah nyeri otot nantinya.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: 0, morale: -5, pace: 15 },
      },
    ],
  },
  the_wall: {
    id: "the_wall",
    category: "physical",
    rarity: "uncommon",
    title: {
      en: "Hitting The Wall",
      id: "Menabrak Dinding",
    },
    description: {
      en: "Your glycogen stores are empty. Your legs feel like lead.",
      id: "Persediaan glikogenmu habis. Kakimu terasa seberat timbal.",
    },
    choices: [
      {
        id: "wall_gel",
        label: { en: "Consume Energy Gel", id: "Konsumsi Gel Energi" },
        description: {
          en: "Consume a gel to refuel, restoring stamina but losing a bit of pace to digest.",
          id: "Konsumsi gel untuk mengisi bahan bakar, memulihkan stamina tetapi agak melambat untuk mencerna.",
        },
        behavior: "balanced",
        effects: { stamina: 25, hydration: 5, morale: 15, pace: 10 },
      },
      {
        id: "wall_dig",
        label: { en: "Dig Deep", id: "Gali Kekuatan Mental" },
        description: {
          en: "Push through using pure willpower, losing massive energy.",
          id: "Terobos menggunakan kekuatan tekad murni, kehilangan energi secara masif.",
        },
        behavior: "aggressive",
        effects: { stamina: -25, hydration: -15, morale: -10, pace: 0 },
      },
      {
        id: "wall_crawl",
        label: { en: "Conserve and Crawl", id: "Hemat & Merangkak" },
        description: {
          en: "Slow down significantly to prevent total collapse.",
          id: "Melambat secara signifikan untuk mencegah kelelahan total.",
        },
        behavior: "conservative",
        effects: { stamina: 5, hydration: -5, morale: -25, pace: 45 },
      },
    ],
  },
  crowd_cheer: {
    id: "crowd_cheer",
    category: "tactical",
    rarity: "common",
    title: {
      en: "Cheering Crowd",
      id: "Kerumunan Penonton",
    },
    description: {
      en: "A massive, roaring crowd lines the street, shouting encouragement.",
      id: "Kerumunan penonton yang bersorak memenuhi jalan, meneriakkan semangat.",
    },
    choices: [
      {
        id: "crowd_wave",
        label: { en: "Wave and Smile", id: "Melambai & Tersenyum" },
        description: {
          en: "Acknowledge the crowd. Boosts morale but uses a tiny bit of focus.",
          id: "Sapa penonton. Meningkatkan moral tetapi sedikit mengurangi fokus.",
        },
        behavior: "balanced",
        effects: { stamina: -2, hydration: -2, morale: 25, pace: -5 },
      },
      {
        id: "crowd_ignore",
        label: { en: "Maintain Focus", id: "Pertahankan Fokus" },
        description: {
          en: "Keep your head down and stay relaxed, conserving physical energy.",
          id: "Tetap menunduk dan rileks, menghemat energi fisik.",
        },
        behavior: "conservative",
        effects: { stamina: 10, hydration: 0, morale: 5, pace: 5 },
      },
    ],
  },
};
