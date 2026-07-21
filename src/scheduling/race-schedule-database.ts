import type { RaceSchedule } from "./race-calendar-types";
import { formatCurrency } from "../economy/currency-converter";
import { useSettingsStore } from "../store/settings-store";
import type { CurrencyCode } from "../economy/currency-config";
import { DEFAULT_CURRENCY } from "../economy/currency-config";

/**
 * Helper function to get current preferred currency safely
 */
function getPreferredCurrency(): CurrencyCode {
  try {
    const settings = useSettingsStore.getState().settings;
    const preferred = settings.preferredCurrency as CurrencyCode;
    // Validate that it's a valid CurrencyCode
    const validCurrencies: CurrencyCode[] = ["USD", "EUR", "JPY", "IDR"];
    return validCurrencies.includes(preferred) ? preferred : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Master schedule of all races in the game.
 * Note: This is a function to ensure currency formatting is always current
 */
export function getRaceSchedules(): RaceSchedule[] {
  const preferredCurrency = getPreferredCurrency();
  
  return [
  // ═══════════════════════════════════════════════════════
  // WEEKLY RACES - Reduced frequency and fee
  // ═══════════════════════════════════════════════════════
  // {
  //   id: "weekly_sunday_morning_run",
  //   raceId: "local_5k_park",
  //   name: "Sunday Morning Run Jakarta",
  //   locationId: "local_5k_park",
  //   tier: "local",
  //   description: "A low-stakes weekly community run to test your progress.",
  //   schedule: {
  //     frequency: "weekly",
  //     dayOfWeek: 0, // Sunday
  //   },
  //   registration: {
  //     opensDaysBefore: 6,
  //     closesDaysBefore: 1,
  //   },
  //   entry: {
  //     fee: 25,
  //   },
  //   maxEntrants: 50,
  //   icon: "🏃",
  //   color: "text-green-500",
  //   prizeInfo: `Winner takes ${formatCurrency(100, preferredCurrency)}`,
  // },

  // ═══════════════════════════════════════════════════════
  // MONTHLY RACES - State level championships
  // ═══════════════════════════════════════════════════════
  {
    id: "monthly_nusantara_10k",
    raceId: "regional_10k_hills",
    name: "Nusantara 10K Challenge",
    locationId: "regional_10k_hills",
    tier: "state",
    description: "Monthly state-tier race. Good stepping stone for major events.",
    schedule: {
      frequency: "monthly",
      dayOfMonth: 28, // 28th of each month
    },
    registration: {
      opensDaysBefore: 14,
      closesDaysBefore: 3,
    },
    entry: {
      fee: 25,
    },
    categories: [
      { id: "5k", name: "5K Challenge", distance: 5, fee: 15, prizeInfo: `Champion gets ${formatCurrency(150, preferredCurrency)}`, maxEntrants: 100 },
      { id: "10k", name: "10K Main Race", distance: 10, fee: 25, prizeInfo: `Champion gets ${formatCurrency(300, preferredCurrency)}`, maxEntrants: 100 },
    ],
    maxEntrants: 100,
    icon: "🏅",
    color: "text-blue-500",
    prizeInfo: `Champion gets ${formatCurrency(300, preferredCurrency)}`,
  },

  // ═══════════════════════════════════════════════════════
  // ANNUAL RACES - Indonesian Majors
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_pocari_sweat_run",
    raceId: "state_half_coastal",
    name: "Pocari Sweat Run Bandung",
    locationId: "state_half_coastal",
    tier: "national",
    description: "One of the most anticipated running events in Indonesia, held in Bandung.",
    schedule: {
      frequency: "annual",
      dayOfYear: 182, // July (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 200,
      prerequisites: {
        minLevel: 8,
        minRating: 1500,
      },
    },
    categories: [
      { id: "5k", name: "5K Fun Run", distance: 5, fee: 30, prizeInfo: `Champion gets ${formatCurrency(400, preferredCurrency)}`, maxEntrants: 1000 },
      { id: "10k", name: "10K Race", distance: 10, fee: 50, prizeInfo: `Champion gets ${formatCurrency(800, preferredCurrency)}`, maxEntrants: 1500 },
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 100, prizeInfo: `Champion gets ${formatCurrency(2000, preferredCurrency)}`, maxEntrants: 2000 },
    ],
    maxEntrants: 2000,
    icon: "💧",
    color: "text-blue-400",
    prizeInfo: `Champion gets ${formatCurrency(2000, preferredCurrency)}`,
  },
  {
    id: "annual_maybank_bali",
    raceId: "national_marathon_city",
    name: "Maybank Marathon Bali",
    locationId: "national_marathon_city",
    tier: "national",
    description: "Bali's premier international marathon. Beautiful scenery and intense heat.",
    schedule: {
      frequency: "annual",
      dayOfYear: 210, // August
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 250,
      prerequisites: {
        minLevel: 10,
        minRating: 1600,
      },
    },
    categories: [
      { id: "10k", name: "10K Sprint", distance: 10, fee: 60, prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency)}`, maxEntrants: 1000 },
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 120, prizeInfo: `Champion gets ${formatCurrency(2200, preferredCurrency)}`, maxEntrants: 2000 },
      { id: "fm", name: "Full Marathon", distance: 42.2, fee: 250, prizeInfo: `Champion gets ${formatCurrency(4500, preferredCurrency)}`, maxEntrants: 3000 },
    ],
    maxEntrants: 3000,
    icon: "🌴",
    color: "text-yellow-500",
    prizeInfo: `Champion gets ${formatCurrency(4500, preferredCurrency)}`,
  },
  {
    id: "annual_jakarta_marathon",
    raceId: "national_marathon_city",
    name: "Jakarta Marathon",
    locationId: "national_marathon_city",
    tier: "national",
    description: "The capital's biggest running festival. Fast, flat, and challenging humidity.",
    schedule: {
      frequency: "annual",
      dayOfYear: 259, // October (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 300,
      prerequisites: {
        minLevel: 12,
        minRating: 1700,
      },
    },
    categories: [
      { id: "5k", name: "5K Dash", distance: 5, fee: 35, prizeInfo: `Champion gets ${formatCurrency(500, preferredCurrency)}`, maxEntrants: 1500 },
      { id: "10k", name: "10K Challenge", distance: 10, fee: 65, prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency)}`, maxEntrants: 2000 },
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 140, prizeInfo: `Champion gets ${formatCurrency(2800, preferredCurrency)}`, maxEntrants: 3000 },
      { id: "fm", name: "Full Marathon", distance: 42.2, fee: 300, prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency)}`, maxEntrants: 5000 },
    ],
    maxEntrants: 5000,
    icon: "🏙️",
    color: "text-red-500",
    prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency)}`,
  },
  {
    id: "annual_borobudur_marathon",
    raceId: "regional_10k_hills",
    name: "Borobudur Marathon",
    locationId: "regional_10k_hills",
    tier: "national",
    description: "Run around the historic Borobudur temple in Magelang.",
    schedule: {
      frequency: "annual",
      dayOfYear: 287, // November (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 250,
      prerequisites: {
        minLevel: 10,
        minRating: 1600,
      },
    },
    maxEntrants: 2500,
    icon: "🛕",
    color: "text-orange-500",
    prizeInfo: `Champion gets ${formatCurrency(3000, preferredCurrency)}`,
  },
  {
    id: "annual_bfi_run",
    raceId: "local_5k_park",
    name: "BFI Run Tangerang",
    locationId: "local_5k_park",
    tier: "national",
    description: "A highly popular half and full marathon in Tangerang known for its excellent organization.",
    schedule: {
      frequency: "annual",
      dayOfYear: 147, // June (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 200,
      prerequisites: {
        minLevel: 8,
        minRating: 1500,
      },
    },
    maxEntrants: 2500,
    icon: "🏃",
    color: "text-blue-500",
    prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency)}`,
  },
  {
    id: "annual_2xu_compression_run",
    raceId: "local_5k_park",
    name: "2XU Compression Run Indonesia",
    locationId: "local_5k_park",
    tier: "national",
    description: "A premium half marathon race in Jakarta.",
    schedule: {
      frequency: "annual",
      dayOfYear: 294, // Late November (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 220,
      prerequisites: {
        minLevel: 8,
        minRating: 1500,
      },
    },
    maxEntrants: 3000,
    icon: "👕",
    color: "text-slate-800",
    prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency)}`,
  },

  // ═══════════════════════════════════════════════════════
  // INDONESIAN REGIONAL RACES
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_bromo_ultramarathon",
    raceId: "regional_10k_hills",
    name: "Bromo Ultramarathon",
    locationId: "regional_10k_hills",
    tier: "national",
    description: "Run across the stunning Bromo volcanic landscape in East Java.",
    schedule: {
      frequency: "annual",
      dayOfYear: 105, // Mid-April (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 350,
      prerequisites: {
        minLevel: 12,
        minRating: 1800,
      },
    },
    maxEntrants: 700,
    icon: "🌋",
    color: "text-orange-600",
    prizeInfo: `50K Champion gets ${formatCurrency(8000, preferredCurrency)}`,
  },
  {
    id: "annual_lombok_marathon",
    raceId: "state_half_coastal",
    name: "Lombok Marathon",
    locationId: "state_half_coastal",
    tier: "national",
    description: "Run with views of Mount Rinjani in beautiful Lombok.",
    schedule: {
      frequency: "annual",
      dayOfYear: 238, // August (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 200,
      prerequisites: {
        minLevel: 8,
        minRating: 1500,
      },
    },
    categories: [
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 80, prizeInfo: `Champion gets ${formatCurrency(2000, preferredCurrency)}`, maxEntrants: 1500 },
      { id: "fm", name: "Full Marathon", distance: 42.2, fee: 200, prizeInfo: `Champion gets ${formatCurrency(4000, preferredCurrency)}`, maxEntrants: 1000 },
    ],
    maxEntrants: 2500,
    icon: "🏝️",
    color: "text-teal-500",
    prizeInfo: `Champion gets ${formatCurrency(4000, preferredCurrency)}`,
  },
  {
    id: "annual_merapi_ultramarathon",
    raceId: "regional_10k_hills",
    name: "Merapi Ultramarathon",
    locationId: "regional_10k_hills",
    tier: "national",
    description: "Challenge the slopes of Mount Merapi in Yogyakarta.",
    schedule: {
      frequency: "annual",
      dayOfYear: 322, // November (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 280,
      prerequisites: {
        minLevel: 10,
        minRating: 1700,
      },
    },
    maxEntrants: 1200,
    icon: "⛰️",
    color: "text-red-600",
    prizeInfo: `50K Champion gets ${formatCurrency(6000, preferredCurrency)}`,
  },

  // ═══════════════════════════════════════════════════════
  // ASIAN MAJORS (Other Asian Countries)
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_singapore_marathon",
    raceId: "national_marathon_city",
    name: "Singapore Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major candidate. Flat, fast night race through the city.",
    schedule: {
      frequency: "annual",
      dayOfYear: 343, // Early December (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 450,
      prerequisites: {
        minLevel: 15,
        minRating: 2000,
      },
    },
    categories: [
      { id: "10k", name: "10K", distance: 10, fee: 100, prizeInfo: `Champion gets ${formatCurrency(1500, preferredCurrency)}`, maxEntrants: 5000 },
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 180, prizeInfo: `Champion gets ${formatCurrency(3500, preferredCurrency)}`, maxEntrants: 10000 },
      { id: "fm", name: "Full Marathon", distance: 42.2, fee: 450, prizeInfo: `Champion gets ${formatCurrency(10000, preferredCurrency)}`, maxEntrants: 15000 },
    ],
    maxEntrants: 30000,
    icon: "🦁",
    color: "text-red-500",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_kuala_lumpur_marathon",
    raceId: "national_marathon_city",
    name: "Kuala Lumpur Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: " Malaysia's premier marathon through the city streets.",
    schedule: {
      frequency: "annual",
      dayOfYear: 84, // Late March (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 380,
      prerequisites: {
        minLevel: 12,
        minRating: 1800,
      },
    },
    maxEntrants: 25000,
    icon: "🏛️",
    color: "text-blue-600",
    prizeInfo: `Champion gets ${formatCurrency(8000, preferredCurrency)}`,
  },
  {
    id: "annual_chiang_mai_marathon",
    raceId: "regional_10k_hills",
    name: "Chiang Mai Marathon",
    locationId: "regional_10k_hills",
    tier: "international",
    description: "Run through the ancient city of Chiang Mai in northern Thailand.",
    schedule: {
      frequency: "annual",
      dayOfYear: 357, // Late December (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 250,
      prerequisites: {
        minLevel: 8,
        minRating: 1500,
      },
    },
    categories: [
      { id: "10k", name: "10K", distance: 10, fee: 60, prizeInfo: `Champion gets ${formatCurrency(800, preferredCurrency)}`, maxEntrants: 3000 },
      { id: "hm", name: "Half Marathon", distance: 21.1, fee: 120, prizeInfo: `Champion gets ${formatCurrency(1800, preferredCurrency)}`, maxEntrants: 4000 },
      { id: "fm", name: "Full Marathon", distance: 42.2, fee: 250, prizeInfo: `Champion gets ${formatCurrency(4000, preferredCurrency)}`, maxEntrants: 3000 },
    ],
    maxEntrants: 10000,
    icon: "🛕",
    color: "text-purple-500",
    prizeInfo: `Champion gets ${formatCurrency(4000, preferredCurrency)}`,
  },

  // ═══════════════════════════════════════════════════════
  // TRAIL RUNNING EVENTS
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_utmb_jawa",
    raceId: "regional_10k_hills",
    name: "UTMB Java",
    locationId: "regional_10k_hills",
    tier: "international",
    description: "Ultra Trail Mount Borneo Java - the ultimate trail running challenge.",
    schedule: {
      frequency: "annual",
      dayOfYear: 196, // Mid-July (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 20,
        minRating: 2500,
        requiresQualification: true,
      },
    },
    maxEntrants: 800,
    icon: "🥾",
    color: "text-green-600",
    prizeInfo: `100 Mile Champion gets ${formatCurrency(50000, preferredCurrency)}`,
  },
  {
    id: "annual_bali_trail_marathon",
    raceId: "regional_10k_hills",
    name: "Bali Trail Marathon",
    locationId: "regional_10k_hills",
    tier: "national",
    description: "Technical trail run through Bali's rice terraces and volcanic paths.",
    schedule: {
      frequency: "annual",
      dayOfYear: 252, // Early September (Sunday)
    },
    registration: {
      opensDaysBefore: 60,
      closesDaysBefore: 14,
    },
    entry: {
      fee: 300,
      prerequisites: {
        minLevel: 10,
        minRating: 1700,
      },
    },
    categories: [
      { id: "hm", name: "21K Trail", distance: 21.1, fee: 120, prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency)}`, maxEntrants: 1000 },
      { id: "fm", name: "42K Trail", distance: 42.2, fee: 300, prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency)}`, maxEntrants: 500 },
    ],
    maxEntrants: 1500,
    icon: "🌾",
    color: "text-emerald-500",
    prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency)}`,
  },

  // ═══════════════════════════════════════════════════════
  // EUROPEAN MAJORS
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_london_marathon",
    raceId: "national_marathon_city",
    name: "London Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. The world's biggest fundraising event.",
    schedule: {
      frequency: "annual",
      dayOfYear: 98, // Early April (Sunday)
    },
    registration: {
      opensDaysBefore: 120,
      closesDaysBefore: 45,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 20,
        minRating: 2200,
        requiresQualification: true,
      },
    },
    maxEntrants: 42000,
    icon: "🇬🇧",
    color: "text-blue-700",
    prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_berlin_marathon",
    raceId: "national_marathon_city",
    name: "Berlin Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. Known for being one of the fastest courses.",
    schedule: {
      frequency: "annual",
      dayOfYear: 252, // Early September (Sunday)
    },
    registration: {
      opensDaysBefore: 120,
      closesDaysBefore: 45,
    },
    entry: {
      fee: 550,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
        requiresQualification: true,
      },
    },
    maxEntrants: 45000,
    icon: "🇩🇪",
    color: "text-yellow-600",
    prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_paris_marathon",
    raceId: "national_marathon_city",
    name: "Paris Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "Run through the City of Light's iconic landmarks.",
    schedule: {
      frequency: "annual",
      dayOfYear: 91, // Early April (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 500,
      prerequisites: {
        minLevel: 16,
        minRating: 2000,
      },
    },
    maxEntrants: 60000,
    icon: "🇫🇷",
    color: "text-indigo-600",
    prizeInfo: `International purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_rome_marathon",
    raceId: "national_marathon_city",
    name: "Rome Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "Run through 2000 years of history in the Eternal City.",
    schedule: {
      frequency: "annual",
      dayOfYear: 56, // Late February (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 480,
      prerequisites: {
        minLevel: 14,
        minRating: 1900,
      },
    },
    maxEntrants: 15000,
    icon: "🇮🇹",
    color: "text-red-600",
    prizeInfo: `International purse: ${formatCurrency(12000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_amsterdam_marathon",
    raceId: "national_marathon_city",
    name: "Amsterdam Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "A flat and fast course through the Dutch capital.",
    schedule: {
      frequency: "annual",
      dayOfYear: 280, // Early October (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 30,
    },
    entry: {
      fee: 450,
      prerequisites: {
        minLevel: 14,
        minRating: 1900,
      },
    },
    maxEntrants: 16000,
    icon: "🇳🇱",
    color: "text-orange-500",
    prizeInfo: `International purse: ${formatCurrency(10000, preferredCurrency)} to champion`,
  },

  // ═══════════════════════════════════════════════════════
  // ANNUAL RACES - Asian Majors
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_tokyo_marathon",
    raceId: "national_marathon_city",
    name: "Tokyo Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. The premier marathon in Asia.",
    schedule: {
      frequency: "annual",
      dayOfYear: 63, // March (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 500,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
        requiresQualification: true,
      },
    },
    maxEntrants: 30000,
    icon: "🌸",
    color: "text-pink-500",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_seoul_marathon",
    raceId: "national_marathon_city",
    name: "Seoul Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "One of the oldest and most prestigious marathons in Asia, known for its flat and fast course.",
    schedule: {
      frequency: "annual",
      dayOfYear: 77, // March (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 450,
      prerequisites: {
        minLevel: 15,
        minRating: 2000,
        requiresQualification: true,
      },
    },
    maxEntrants: 25000,
    icon: "🐯",
    color: "text-red-500",
    prizeInfo: `International purse: ${formatCurrency(12000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_osaka_marathon",
    raceId: "national_marathon_city",
    name: "Osaka Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "A vibrant and scenic marathon taking runners past Osaka's famous landmarks.",
    schedule: {
      frequency: "annual",
      dayOfYear: 49, // Late February (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 400,
      prerequisites: {
        minLevel: 15,
        minRating: 2000,
      },
    },
    maxEntrants: 20000,
    icon: "🏯",
    color: "text-blue-500",
    prizeInfo: `International purse: ${formatCurrency(10000, preferredCurrency)} to champion`,
  },

  // ═══════════════════════════════════════════════════════
  // ANNUAL RACES - European & World Majors
  // ═══════════════════════════════════════════════════════
  {
    id: "annual_boston_marathon",
    raceId: "national_marathon_city",
    name: "Boston Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. The world's oldest annual marathon.",
    schedule: {
      frequency: "annual",
      dayOfYear: 98, // April (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 22,
        minRating: 2200,
        requiresQualification: true,
      },
    },
    maxEntrants: 30000,
    icon: "🦄",
    color: "text-blue-600",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_london_marathon",
    raceId: "national_marathon_city",
    name: "London Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. Run through the historic streets of London.",
    schedule: {
      frequency: "annual",
      dayOfYear: 105, // Late April (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 20,
        minRating: 2150,
        requiresQualification: true,
      },
    },
    maxEntrants: 40000,
    icon: "💂",
    color: "text-red-600",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_berlin_marathon",
    raceId: "national_marathon_city",
    name: "Berlin Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. The fastest flat course where world records are broken.",
    schedule: {
      frequency: "annual",
      dayOfYear: 245, // September
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 550,
      prerequisites: {
        minLevel: 20,
        minRating: 2150,
        requiresQualification: true,
      },
    },
    maxEntrants: 40000,
    icon: "🐻",
    color: "text-amber-600",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_chicago_marathon",
    raceId: "national_marathon_city",
    name: "Chicago Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. A spectacular loop course known for its speed.",
    schedule: {
      frequency: "annual",
      dayOfYear: 273, // October (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 600,
      prerequisites: {
        minLevel: 21,
        minRating: 2150,
        requiresQualification: true,
      },
    },
    maxEntrants: 45000,
    icon: "🏙️",
    color: "text-sky-500",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_nyc_marathon",
    raceId: "national_marathon_city",
    name: "New York City Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "World Marathon Major. Run through the five boroughs of NYC.",
    schedule: {
      frequency: "annual",
      dayOfYear: 280, // November (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 650,
      prerequisites: {
        minLevel: 22,
        minRating: 2200,
        requiresQualification: true,
      },
    },
    maxEntrants: 50000,
    icon: "🗽",
    color: "text-emerald-500",
    prizeInfo: `World Major purse: ${formatCurrency(15000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_paris_marathon",
    raceId: "national_marathon_city",
    name: "Paris Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "Run through the beautiful city of love, starting at the Champs-Élysées.",
    schedule: {
      frequency: "annual",
      dayOfYear: 91, // April (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 550,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
      },
    },
    maxEntrants: 45000,
    icon: "🥐",
    color: "text-blue-700",
    prizeInfo: `International purse: ${formatCurrency(12000, preferredCurrency)} to champion`,
  },
  {
    id: "annual_sydney_marathon",
    raceId: "national_marathon_city",
    name: "Sydney Marathon",
    locationId: "national_marathon_city",
    tier: "international",
    description: "A spectacular course passing the Sydney Opera House and Harbour Bridge.",
    schedule: {
      frequency: "annual",
      dayOfYear: 252, // September (Sunday)
    },
    registration: {
      opensDaysBefore: 90,
      closesDaysBefore: 21,
    },
    entry: {
      fee: 550,
      prerequisites: {
        minLevel: 18,
        minRating: 2100,
      },
    },
    maxEntrants: 30000,
    icon: "🦘",
    color: "text-amber-500",
    prizeInfo: `International purse: ${formatCurrency(12000, preferredCurrency)} to champion`,
  },

  // ═══════════════════════════════════════════════════════
  // ONE-TIME EVENTS - Story-specific races
  // ═══════════════════════════════════════════════════════
  {
    id: "one_time_debut",
    raceId: "local_5k_park",
    name: "Sudirman Street First Run",
    locationId: "local_5k_park",
    tier: "local",
    description:
      "Your very first race down Sudirman Street. No pressure, just run. This is where every champion starts.",
    schedule: {
      frequency: "one_time",
      specificDays: [5], // Available on career day 5
    },
    registration: {
      opensDaysBefore: 0,
      closesDaysBefore: 0,
    },
    entry: {
      fee: 0, // Free first race
    },
    icon: "🌟",
    color: "text-yellow-500",
    prizeInfo: "No prize pool - this is about participation",
  },
  {
    id: "one_time_chapter_complete",
    raceId: "local_5k_park",
    name: "Ancol Seaside Championship",
    locationId: "local_5k_park",
    tier: "regional",
    description:
      "The end of your first story chapter by the Ancol seaside. Win this to prove you've grown beyond a local runner.",
    schedule: {
      frequency: "one_time",
      specificDays: [50], // Day 50
    },
    registration: {
      opensDaysBefore: 14,
      closesDaysBefore: 3,
    },
    entry: {
      fee: 80,
      prerequisites: {
        storyChapter: 1,
      },
    },
    maxEntrants: 30,
    icon: "📖",
    color: "text-indigo-500",
    prizeInfo: "Story milestone - unlocks next chapter",
  },
  ];
}

/**
 * Lazy-loaded race schedules with current currency
 * This ensures currency is always up-to-date
 */
let cachedRaceSchedules: RaceSchedule[] | null = null;
let lastCurrency: string | null = null;

export function RACE_SCHEDULES_GETTER(): RaceSchedule[] {
  const currentCurrency = getPreferredCurrency();
  
  // Regenerate if currency changed or first time
  if (!cachedRaceSchedules || lastCurrency !== currentCurrency) {
    cachedRaceSchedules = getRaceSchedules();
    lastCurrency = currentCurrency;
  }
  
  return cachedRaceSchedules;
}

// Backward-compatible export as a getter property
export const RACE_SCHEDULES = new Proxy([] as RaceSchedule[], {
  get(target, prop) {
    const schedules = RACE_SCHEDULES_GETTER();
    if (prop === 'length') return schedules.length;
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return schedules[Number(prop)];
    }
    return (schedules as any)[prop];
  },
  has(target, prop) {
    return prop in RACE_SCHEDULES_GETTER();
  },
  ownKeys() {
    return Reflect.ownKeys(RACE_SCHEDULES_GETTER());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(RACE_SCHEDULES_GETTER(), prop);
  }
});

/**
 * Get the default daily races (always available).
 */
export function getDefaultDailyRaces(): RaceSchedule[] {
  return RACE_SCHEDULES_GETTER().filter((s) => s.schedule.frequency === "daily");
}

/**
 * Get races by tier.
 */
export function getRacesByTier(tier: string): RaceSchedule[] {
  return RACE_SCHEDULES_GETTER().filter((s) => s.tier === tier);
}

/**
 * Get the next big race (championship or national+) for player targets.
 */
export function getNextBigRace(
  currentDayIndex: number,
): RaceSchedule | undefined {
  return RACE_SCHEDULES_GETTER().filter(
    (s) =>
      s.schedule.frequency !== "daily" && s.schedule.frequency !== "weekly",
  ).sort((a, b) => {
    // Find next occurrence and compare
    return a.registration.opensDaysBefore - b.registration.opensDaysBefore;
  })[0];
}

/**
 * Check if a race schedule is a championship (state or higher).
 */
export function isChampionship(schedule: RaceSchedule): boolean {
  return ["state", "national", "international"].includes(schedule.tier);
}

/**
 * Get entry fee range description for display.
 */
export function getRaceScheduleSummary(): {
  daily: number;
  weekly: number;
  monthly: number;
  seasonal: number;
  annual: number;
  oneTime: number;
  total: number;
} {
  const counts = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    seasonal: 0,
    annual: 0,
    oneTime: 0,
  };

  for (const s of RACE_SCHEDULES_GETTER()) {
    const freq = s.schedule.frequency;
    if (freq === "one_time") {
      counts.oneTime++;
    } else {
      counts[freq]++;
    }
  }

  return {
    ...counts,
    total: RACE_SCHEDULES_GETTER().length,
  };
}
