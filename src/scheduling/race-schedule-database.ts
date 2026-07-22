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
    const validCurrencies: CurrencyCode[] = ["USD", "EUR", "JPY", "IDR"];
    return validCurrencies.includes(preferred) ? preferred : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

/**
 * Master schedule of all races in the game.
 * Enhanced with rich running culture, soul-filled road & trail events,
 * and comprehensive race categories (5K, 10K, HM, FM for road; 8K, 10K, 20K, 50K, 100K for trail).
 */
export function getRaceSchedules(): RaceSchedule[] {
  const preferredCurrency = getPreferredCurrency();

  return [
    // ═══════════════════════════════════════════════════════
    // MONTHLY & COMMUNITY RACES - State Level Championships & Local Trails
    // ═══════════════════════════════════════════════════════
    {
      id: "monthly_nusantara_10k",
      raceId: "regional_10k_hills",
      name: "Nusantara City Challenge",
      locationId: "regional_10k_hills",
      tier: "state",
      description:
        "The heartbeat of regional road running. Pure asphalt grit, energetic local running clubs, and a fast circuit to hone your race cadence.",
      schedule: {
        frequency: "monthly",
        dayOfMonth: 28,
      },
      registration: {
        opensDaysBefore: 14,
        closesDaysBefore: 3,
      },
      entry: {
        fee: 25,
      },
      categories: [
        {
          id: "5k",
          name: "5K Speed Sprint",
          distance: 5,
          fee: 15,
          prizeInfo: `Champion gets ${formatCurrency(150, preferredCurrency, { compact: true })}`,
          maxEntrants: 150,
        },
        {
          id: "10k",
          name: "10K Main Race",
          distance: 10,
          fee: 25,
          prizeInfo: `Champion gets ${formatCurrency(300, preferredCurrency, { compact: true })}`,
          maxEntrants: 150,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 45,
          prizeInfo: `Champion gets ${formatCurrency(600, preferredCurrency, { compact: true })}`,
          maxEntrants: 100,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 75,
          prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency, { compact: true })}`,
          maxEntrants: 80,
        },
      ],
      maxEntrants: 480,
      icon: "🏅",
      color: "text-blue-500",
      prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency, { compact: true })}`,
    },
    {
      id: "monthly_tahura_trail",
      raceId: "regional_10k_hills",
      name: "Tahura Pine Forest Trail Run",
      locationId: "regional_10k_hills",
      tier: "state",
      description:
        "Breathe in the pine scent of Ir. H. Djuanda Forest Park in Bandung. Crisp morning mist, pine needle single-track, and muddy descents.",
      schedule: {
        frequency: "monthly",
        dayOfMonth: 14,
      },
      registration: {
        opensDaysBefore: 14,
        closesDaysBefore: 3,
      },
      entry: {
        fee: 30,
      },
      categories: [
        {
          id: "8k",
          name: "8K Pine Sprint",
          distance: 8,
          fee: 20,
          prizeInfo: `Champion gets ${formatCurrency(200, preferredCurrency, { compact: true })}`,
          maxEntrants: 100,
        },
        {
          id: "10k",
          name: "10K Forest Trail",
          distance: 10,
          fee: 30,
          prizeInfo: `Champion gets ${formatCurrency(350, preferredCurrency, { compact: true })}`,
          maxEntrants: 100,
        },
        {
          id: "20k",
          name: "20K Ridge Challenge",
          distance: 20,
          fee: 50,
          prizeInfo: `Champion gets ${formatCurrency(750, preferredCurrency, { compact: true })}`,
          maxEntrants: 80,
        },
      ],
      maxEntrants: 280,
      icon: "🌲",
      color: "text-emerald-600",
      prizeInfo: `Champion gets ${formatCurrency(750, preferredCurrency, { compact: true })}`,
    },
    {
      id: "monthly_ciwidey_tea_trail",
      raceId: "regional_10k_hills",
      name: "West Java Tea Hills Trail",
      locationId: "regional_10k_hills",
      tier: "state",
      description:
        "Run across emerald tea plantations in Ciwidey. Rolling green hills, chilly mountain breeze, and slippery clay tracks.",
      schedule: {
        frequency: "monthly",
        dayOfMonth: 21,
      },
      registration: {
        opensDaysBefore: 14,
        closesDaysBefore: 3,
      },
      entry: {
        fee: 35,
      },
      categories: [
        {
          id: "8k",
          name: "8K Plantation Trail",
          distance: 8,
          fee: 25,
          prizeInfo: `Champion gets ${formatCurrency(250, preferredCurrency, { compact: true })}`,
          maxEntrants: 100,
        },
        {
          id: "10k",
          name: "10K Hill Challenge",
          distance: 10,
          fee: 35,
          prizeInfo: `Champion gets ${formatCurrency(400, preferredCurrency, { compact: true })}`,
          maxEntrants: 100,
        },
        {
          id: "20k",
          name: "20K Tea Ridge Run",
          distance: 20,
          fee: 60,
          prizeInfo: `Champion gets ${formatCurrency(900, preferredCurrency, { compact: true })}`,
          maxEntrants: 80,
        },
        {
          id: "50k",
          name: "50K Highland Ultra",
          distance: 50,
          fee: 110,
          prizeInfo: `Champion gets ${formatCurrency(1800, preferredCurrency, { compact: true })}`,
          maxEntrants: 50,
        },
      ],
      maxEntrants: 330,
      icon: "🍃",
      color: "text-green-500",
      prizeInfo: `Champion gets ${formatCurrency(1800, preferredCurrency, { compact: true })}`,
    },

    // ═══════════════════════════════════════════════════════
    // INDONESIAN ROAD MAJORS (National Tier)
    // ═══════════════════════════════════════════════════════
    {
      id: "annual_pocari_sweat_run",
      raceId: "state_half_coastal",
      name: "Pocari Sweat Run Bandung",
      locationId: "state_half_coastal",
      tier: "national",
      description:
        "The blue-tinted pilgrimage of Indonesian road runners. Crisp morning air, loud crowd support along Gedung Sate, and electric finish line euphoria.",
      schedule: {
        frequency: "annual",
        dayOfYear: 182, // July
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
        {
          id: "5k",
          name: "5K Fun Sprint",
          distance: 5,
          fee: 35,
          prizeInfo: `Champion gets ${formatCurrency(500, preferredCurrency, { compact: true })}`,
          maxEntrants: 1000,
        },
        {
          id: "10k",
          name: "10K City Race",
          distance: 10,
          fee: 65,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 120,
          prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency, { compact: true })}`,
          maxEntrants: 2000,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 200,
          prizeInfo: `Champion gets ${formatCurrency(5000, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
      ],
      maxEntrants: 6000,
      icon: "💧",
      color: "text-blue-400",
      prizeInfo: `Champion gets ${formatCurrency(5000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_maybank_bali",
      raceId: "national_marathon_city",
      name: "Maybank Marathon Bali",
      locationId: "national_marathon_city",
      tier: "national",
      description:
        "World Athletics Elite Label marathon in Gianyar, Bali. Rolling hills, tropical humidity, and traditional Balinese gamelan troupes cheering you past paddy fields.",
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
        {
          id: "5k",
          name: "5K Island Dash",
          distance: 5,
          fee: 40,
          prizeInfo: `Champion gets ${formatCurrency(600, preferredCurrency, { compact: true })}`,
          maxEntrants: 1000,
        },
        {
          id: "10k",
          name: "10K Gianyar Sprint",
          distance: 10,
          fee: 70,
          prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(2800, preferredCurrency, { compact: true })}`,
          maxEntrants: 2500,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency, { compact: true })}`,
          maxEntrants: 3000,
        },
      ],
      maxEntrants: 8000,
      icon: "🌴",
      color: "text-amber-500",
      prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_jakarta_marathon",
      raceId: "national_marathon_city",
      name: "Jakarta Marathon",
      locationId: "national_marathon_city",
      tier: "national",
      description:
        "The capital's ultimate asphalt festival. Conquer Monas, Sudirman skyscrapers, and fierce tropical humidity alongside thousands of passionate city runners.",
      schedule: {
        frequency: "annual",
        dayOfYear: 259, // October
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
        {
          id: "5k",
          name: "5K Capital Dash",
          distance: 5,
          fee: 45,
          prizeInfo: `Champion gets ${formatCurrency(700, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
        {
          id: "10k",
          name: "10K Sudirman Challenge",
          distance: 10,
          fee: 75,
          prizeInfo: `Champion gets ${formatCurrency(1500, preferredCurrency, { compact: true })}`,
          maxEntrants: 2500,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 150,
          prizeInfo: `Champion gets ${formatCurrency(3200, preferredCurrency, { compact: true })}`,
          maxEntrants: 3500,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 300,
          prizeInfo: `Champion gets ${formatCurrency(7000, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
      ],
      maxEntrants: 12500,
      icon: "🏙️",
      color: "text-red-500",
      prizeInfo: `Champion gets ${formatCurrency(7000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_borobudur_marathon",
      raceId: "regional_10k_hills",
      name: "Borobudur Marathon",
      locationId: "regional_10k_hills",
      tier: "national",
      description:
        "Run through ancient Javanese heritage in Magelang. High heat, emotional village high-fives, and the magnificent silhouette of the 9th-century temple guiding your finish.",
      schedule: {
        frequency: "annual",
        dayOfYear: 287, // November
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
        {
          id: "5k",
          name: "5K Heritage Run",
          distance: 5,
          fee: 40,
          prizeInfo: `Champion gets ${formatCurrency(600, preferredCurrency, { compact: true })}`,
          maxEntrants: 1000,
        },
        {
          id: "10k",
          name: "10K Temple Challenge",
          distance: 10,
          fee: 70,
          prizeInfo: `Champion gets ${formatCurrency(1300, preferredCurrency, { compact: true })}`,
          maxEntrants: 2000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(3000, preferredCurrency, { compact: true })}`,
          maxEntrants: 2500,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(6500, preferredCurrency, { compact: true })}`,
          maxEntrants: 3000,
        },
      ],
      maxEntrants: 8500,
      icon: "🛕",
      color: "text-orange-500",
      prizeInfo: `Champion gets ${formatCurrency(6500, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_bfi_run",
      raceId: "local_5k_park",
      name: "BFI Run Tangerang",
      locationId: "local_5k_park",
      tier: "national",
      description:
        "Flawless organization, wide pristine boulevards of BSD City, and a relentless pace. The go-to race for setting personal bests in Indonesia.",
      schedule: {
        frequency: "annual",
        dayOfYear: 147, // June
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
        {
          id: "5k",
          name: "5K PB Chase",
          distance: 5,
          fee: 35,
          prizeInfo: `Champion gets ${formatCurrency(500, preferredCurrency, { compact: true })}`,
          maxEntrants: 1000,
        },
        {
          id: "10k",
          name: "10K Speed Run",
          distance: 10,
          fee: 65,
          prizeInfo: `Champion gets ${formatCurrency(1100, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 130,
          prizeInfo: `Champion gets ${formatCurrency(2600, preferredCurrency, { compact: true })}`,
          maxEntrants: 2000,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 200,
          prizeInfo: `Champion gets ${formatCurrency(5500, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
      ],
      maxEntrants: 6000,
      icon: "🏃",
      color: "text-blue-600",
      prizeInfo: `Champion gets ${formatCurrency(5500, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_2xu_compression_run",
      raceId: "local_5k_park",
      name: "2XU Compression Run Indonesia",
      locationId: "local_5k_park",
      tier: "national",
      description:
        "Predawn start down Sudirman avenue. High-cadence performance, sleek compression kits, and aggressive racing under Jakarta's streetlights.",
      schedule: {
        frequency: "annual",
        dayOfYear: 294, // November
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
      categories: [
        {
          id: "5k",
          name: "5K Night Sprint",
          distance: 5,
          fee: 40,
          prizeInfo: `Champion gets ${formatCurrency(500, preferredCurrency, { compact: true })}`,
          maxEntrants: 1000,
        },
        {
          id: "10k",
          name: "10K Performance Race",
          distance: 10,
          fee: 70,
          prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
        {
          id: "hm",
          name: "Half Marathon Main Race",
          distance: 21.1,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(3000, preferredCurrency, { compact: true })}`,
          maxEntrants: 2500,
        },
        {
          id: "fm",
          name: "Full Marathon Challenge",
          distance: 42.2,
          fee: 220,
          prizeInfo: `Champion gets ${formatCurrency(5800, preferredCurrency, { compact: true })}`,
          maxEntrants: 1500,
        },
      ],
      maxEntrants: 6500,
      icon: "⚡",
      color: "text-slate-800",
      prizeInfo: `Champion gets ${formatCurrency(5800, preferredCurrency, { compact: true })}`,
    },

    // ═══════════════════════════════════════════════════════
    // INDONESIAN TRAIL MAJORS & SKYRACES (National & International)
    // Common Trail Distances: 8K, 10K, 20K, 50K, 100K, 100M
    // ═══════════════════════════════════════════════════════
    {
      id: "annual_utmb_jawa",
      raceId: "regional_10k_hills",
      name: "UTMB Java / Mt. Arjuno Ultra",
      locationId: "regional_10k_hills",
      tier: "international",
      description:
        "The crown jewel of Indonesian trail running. Technical volcanic rock, vertical climbs through cloud forests, midnight single-track, and the soul-crushing ascent to Arjuno's summit.",
      schedule: {
        frequency: "annual",
        dayOfYear: 196, // July
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
      categories: [
        {
          id: "10k",
          name: "10K Alpine Trail",
          distance: 10,
          fee: 80,
          prizeInfo: `Champion gets ${formatCurrency(1500, preferredCurrency, { compact: true })}`,
          maxEntrants: 500,
        },
        {
          id: "20k",
          name: "20K Ridge Skyrace",
          distance: 20,
          fee: 150,
          prizeInfo: `Champion gets ${formatCurrency(3500, preferredCurrency, { compact: true })}`,
          maxEntrants: 500,
        },
        {
          id: "50k",
          name: "50K Mountain Ultra",
          distance: 50,
          fee: 300,
          prizeInfo: `Champion gets ${formatCurrency(9000, preferredCurrency, { compact: true })}`,
          maxEntrants: 400,
        },
        {
          id: "100k",
          name: "100K Extreme Trail Ultra",
          distance: 100,
          fee: 450,
          prizeInfo: `Champion gets ${formatCurrency(20000, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "100m",
          name: "100 Mile Summit Monster",
          distance: 160,
          fee: 600,
          prizeInfo: `Champion gets ${formatCurrency(50000, preferredCurrency, { compact: true })}`,
          maxEntrants: 200,
        },
      ],
      maxEntrants: 1900,
      icon: "🥾",
      color: "text-emerald-700",
      prizeInfo: `100M Champion gets ${formatCurrency(50000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_bromo_ultramarathon",
      raceId: "regional_10k_hills",
      name: "Bromo Tengger Semeru Ultra (BTS Ultra)",
      locationId: "regional_10k_hills",
      tier: "national",
      description:
        "Run across the eerie volcanic Sea of Sand, freezing alpine desert nights, and breathtaking sunrises over Mount Bromo's smoking crater rim. Pure wild trail magic.",
      schedule: {
        frequency: "annual",
        dayOfYear: 315, // November
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
      categories: [
        {
          id: "10k",
          name: "10K Sand Sea Sprint",
          distance: 10,
          fee: 60,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 400,
        },
        {
          id: "20k",
          name: "20K Crater Ridge Challenge",
          distance: 20,
          fee: 110,
          prizeInfo: `Champion gets ${formatCurrency(2200, preferredCurrency, { compact: true })}`,
          maxEntrants: 400,
        },
        {
          id: "50k",
          name: "50K Volcanic Ultra",
          distance: 50,
          fee: 220,
          prizeInfo: `Champion gets ${formatCurrency(5500, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "100k",
          name: "100K Tengger Caldera Conqueror",
          distance: 100,
          fee: 350,
          prizeInfo: `Champion gets ${formatCurrency(12000, preferredCurrency, { compact: true })}`,
          maxEntrants: 200,
        },
      ],
      maxEntrants: 1300,
      icon: "🌋",
      color: "text-orange-600",
      prizeInfo: `100K Champion gets ${formatCurrency(12000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_rinjani_skyrace",
      raceId: "regional_10k_hills",
      name: "Mount Rinjani Skyrace",
      locationId: "regional_10k_hills",
      tier: "international",
      description:
        "Brutal vertical elevation, slippery volcanic scree, and jaw-dropping views of Segara Anak crater lake. Only the fiercest trail souls survive the summit climb.",
      schedule: {
        frequency: "annual",
        dayOfYear: 140, // May
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
      categories: [
        {
          id: "8k",
          name: "8K Ridge Sprint",
          distance: 8,
          fee: 50,
          prizeInfo: `Champion gets ${formatCurrency(800, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "10k",
          name: "10K Crater Trail",
          distance: 10,
          fee: 75,
          prizeInfo: `Champion gets ${formatCurrency(1200, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "20k",
          name: "20K Volcanic Skyrace",
          distance: 20,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(3000, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "50k",
          name: "50K Summit Conquest",
          distance: 50,
          fee: 280,
          prizeInfo: `Champion gets ${formatCurrency(7500, preferredCurrency, { compact: true })}`,
          maxEntrants: 250,
        },
        {
          id: "100k",
          name: "100K Rinjani Ultra Monster",
          distance: 100,
          fee: 400,
          prizeInfo: `Champion gets ${formatCurrency(16000, preferredCurrency, { compact: true })}`,
          maxEntrants: 150,
        },
      ],
      maxEntrants: 1300,
      icon: "⛰️",
      color: "text-rose-600",
      prizeInfo: `100K Champion gets ${formatCurrency(16000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_gede_pangrango_trail",
      raceId: "regional_10k_hills",
      name: "Mount Gede Pangrango Trail Challenge",
      locationId: "regional_10k_hills",
      tier: "national",
      description:
        "Dense rainforest canopy, muddy technical roots, cold mountain streams, and steep mossy scrambles. Pure West Java jungle trail endurance.",
      schedule: {
        frequency: "annual",
        dayOfYear: 266, // September
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
        {
          id: "8k",
          name: "8K Jungle Sprint",
          distance: 8,
          fee: 40,
          prizeInfo: `Champion gets ${formatCurrency(500, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "10k",
          name: "10K Canopy Trail",
          distance: 10,
          fee: 60,
          prizeInfo: `Champion gets ${formatCurrency(900, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "20k",
          name: "20K Rainforest Ridge",
          distance: 20,
          fee: 110,
          prizeInfo: `Champion gets ${formatCurrency(2000, preferredCurrency, { compact: true })}`,
          maxEntrants: 250,
        },
        {
          id: "50k",
          name: "50K Summit Ultra Skyrace",
          distance: 50,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(6000, preferredCurrency, { compact: true })}`,
          maxEntrants: 150,
        },
      ],
      maxEntrants: 1000,
      icon: "🌿",
      color: "text-emerald-600",
      prizeInfo: `50K Champion gets ${formatCurrency(6000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_bali_trail_marathon",
      raceId: "regional_10k_hills",
      name: "Bali Trail Marathon Kintamani",
      locationId: "regional_10k_hills",
      tier: "national",
      description:
        "Technical single-track through Mt. Batur crater lava fields, ancient pine forests, and sacred Balinese village ridges. Soul-stirring mountain scenery.",
      schedule: {
        frequency: "annual",
        dayOfYear: 252, // September
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
        {
          id: "8k",
          name: "8K Rice Terrace Trail",
          distance: 8,
          fee: 45,
          prizeInfo: `Champion gets ${formatCurrency(600, preferredCurrency, { compact: true })}`,
          maxEntrants: 400,
        },
        {
          id: "10k",
          name: "10K Crater Trail",
          distance: 10,
          fee: 65,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 400,
        },
        {
          id: "20k",
          name: "20K Kintamani Ridge",
          distance: 20,
          fee: 120,
          prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency, { compact: true })}`,
          maxEntrants: 500,
        },
        {
          id: "50k",
          name: "50K Volcanic Lava Ultra",
          distance: 50,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(6500, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "100k",
          name: "100K Island Ultra Challenge",
          distance: 100,
          fee: 380,
          prizeInfo: `Champion gets ${formatCurrency(14000, preferredCurrency, { compact: true })}`,
          maxEntrants: 150,
        },
      ],
      maxEntrants: 1750,
      icon: "🌾",
      color: "text-emerald-500",
      prizeInfo: `100K Champion gets ${formatCurrency(14000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_merapi_ultramarathon",
      raceId: "regional_10k_hills",
      name: "Merapi Volcanic Skyrace",
      locationId: "regional_10k_hills",
      tier: "national",
      description:
        "Conquer the active slopes of Mount Merapi in Yogyakarta. Rough volcanic ash, riverbed boulder hops, and steep inclines test your ankles and mental grit.",
      schedule: {
        frequency: "annual",
        dayOfYear: 322, // November
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
      categories: [
        {
          id: "8k",
          name: "8K Lava Field Run",
          distance: 8,
          fee: 40,
          prizeInfo: `Champion gets ${formatCurrency(550, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "10k",
          name: "10K Ash Ridge",
          distance: 10,
          fee: 65,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "20k",
          name: "20K Volcanic Skyrace",
          distance: 20,
          fee: 125,
          prizeInfo: `Champion gets ${formatCurrency(2400, preferredCurrency, { compact: true })}`,
          maxEntrants: 300,
        },
        {
          id: "50k",
          name: "50K Fire Mountain Ultra",
          distance: 50,
          fee: 280,
          prizeInfo: `Champion gets ${formatCurrency(7000, preferredCurrency, { compact: true })}`,
          maxEntrants: 200,
        },
      ],
      maxEntrants: 1100,
      icon: "🌋",
      color: "text-red-600",
      prizeInfo: `50K Champion gets ${formatCurrency(7000, preferredCurrency, { compact: true })}`,
    },

    // ═══════════════════════════════════════════════════════
    // ASIAN MAJORS (International Tier)
    // ═══════════════════════════════════════════════════════
    {
      id: "annual_tokyo_marathon",
      raceId: "national_marathon_city",
      name: "Tokyo Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. World-class Japanese organization, buzzing crowds shouting 'Ganbatte!', and a fast course from Shinjuku through Ginza to Tokyo Station.",
      schedule: {
        frequency: "annual",
        dayOfYear: 63, // March
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
      categories: [
        {
          id: "5k",
          name: "5K Friendship Dash",
          distance: 5,
          fee: 60,
          prizeInfo: `Champion gets ${formatCurrency(800, preferredCurrency, { compact: true })}`,
          maxEntrants: 2000,
        },
        {
          id: "10k",
          name: "10K City Sprint",
          distance: 10,
          fee: 110,
          prizeInfo: `Champion gets ${formatCurrency(1800, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 220,
          prizeInfo: `Champion gets ${formatCurrency(4500, preferredCurrency, { compact: true })}`,
          maxEntrants: 8000,
        },
        {
          id: "fm",
          name: "Full Marathon World Major",
          distance: 42.2,
          fee: 500,
          prizeInfo: `World Major purse: ${formatCurrency(18000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 20000,
        },
      ],
      maxEntrants: 35000,
      icon: "🌸",
      color: "text-pink-500",
      prizeInfo: `World Major purse: ${formatCurrency(18000, preferredCurrency, { compact: true })} to champion`,
    },
    {
      id: "annual_singapore_marathon",
      raceId: "national_marathon_city",
      name: "Singapore Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Athletics Gold Label night race. High humidity, tropical warmth, and electric urban energy through Gardens by the Bay and Marina Bay Sands.",
      schedule: {
        frequency: "annual",
        dayOfYear: 343, // December
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
        {
          id: "5k",
          name: "5K Night Dash",
          distance: 5,
          fee: 50,
          prizeInfo: `Champion gets ${formatCurrency(700, preferredCurrency, { compact: true })}`,
          maxEntrants: 3000,
        },
        {
          id: "10k",
          name: "10K Marina Sprint",
          distance: 10,
          fee: 100,
          prizeInfo: `Champion gets ${formatCurrency(1500, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 180,
          prizeInfo: `Champion gets ${formatCurrency(3500, preferredCurrency, { compact: true })}`,
          maxEntrants: 10000,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 450,
          prizeInfo: `Champion gets ${formatCurrency(12000, preferredCurrency, { compact: true })}`,
          maxEntrants: 15000,
        },
      ],
      maxEntrants: 33000,
      icon: "🦁",
      color: "text-red-500",
      prizeInfo: `Champion gets ${formatCurrency(12000, preferredCurrency, { compact: true })}`,
    },
    {
      id: "annual_seoul_marathon",
      raceId: "national_marathon_city",
      name: "Seoul Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "One of Asia's oldest and most prestigious marathons. Fast, flat historical course crossing the Han River and finishing at Gwanghwamun Gate.",
      schedule: {
        frequency: "annual",
        dayOfYear: 77, // March
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
        {
          id: "5k",
          name: "5K Gwanghwamun Sprint",
          distance: 5,
          fee: 50,
          prizeInfo: `Champion gets ${formatCurrency(650, preferredCurrency, { compact: true })}`,
          maxEntrants: 2000,
        },
        {
          id: "10k",
          name: "10K Han River Run",
          distance: 10,
          fee: 90,
          prizeInfo: `Champion gets ${formatCurrency(1400, preferredCurrency, { compact: true })}`,
          maxEntrants: 4000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 170,
          prizeInfo: `Champion gets ${formatCurrency(3200, preferredCurrency, { compact: true })}`,
          maxEntrants: 7000,
        },
        {
          id: "fm",
          name: "Full Marathon",
          distance: 42.2,
          fee: 450,
          prizeInfo: `Champion gets ${formatCurrency(11000, preferredCurrency, { compact: true })}`,
          maxEntrants: 12000,
        },
      ],
      maxEntrants: 25000,
      icon: "🐯",
      color: "text-red-500",
      prizeInfo: `Champion gets ${formatCurrency(11000, preferredCurrency, { compact: true })}`,
    },

    // ═══════════════════════════════════════════════════════
    // EUROPEAN & WORLD MAJORS (International Tier)
    // ═══════════════════════════════════════════════════════
    {
      id: "annual_boston_marathon",
      raceId: "national_marathon_city",
      name: "Boston Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. The Holy Grail of road running. Point-to-point from Hopkinton, Scream Tunnel at Wellesley, Heartbreak Hill, and Boylston Street glory.",
      schedule: {
        frequency: "annual",
        dayOfYear: 98, // April
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
      categories: [
        {
          id: "5k",
          name: "5K Boston Dash",
          distance: 5,
          fee: 75,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 3000,
        },
        {
          id: "10k",
          name: "10K Charles River Sprint",
          distance: 10,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(5500, preferredCurrency, { compact: true })}`,
          maxEntrants: 7000,
        },
        {
          id: "fm",
          name: "Full Marathon Boston Qualifier",
          distance: 42.2,
          fee: 600,
          prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 20000,
        },
      ],
      maxEntrants: 35000,
      icon: "🦄",
      color: "text-blue-600",
      prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
    },
    {
      id: "annual_london_marathon",
      raceId: "national_marathon_city",
      name: "London Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. Greenwich start, Tower Bridge roar, Canary Wharf skyscrapers, and finishing in front of Buckingham Palace.",
      schedule: {
        frequency: "annual",
        dayOfYear: 112, // April
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
      categories: [
        {
          id: "5k",
          name: "5K Thames Dash",
          distance: 5,
          fee: 70,
          prizeInfo: `Champion gets ${formatCurrency(900, preferredCurrency, { compact: true })}`,
          maxEntrants: 3000,
        },
        {
          id: "10k",
          name: "10K London City Race",
          distance: 10,
          fee: 130,
          prizeInfo: `Champion gets ${formatCurrency(2200, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 240,
          prizeInfo: `Champion gets ${formatCurrency(5000, preferredCurrency, { compact: true })}`,
          maxEntrants: 8000,
        },
        {
          id: "fm",
          name: "Full Marathon World Major",
          distance: 42.2,
          fee: 600,
          prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 26000,
        },
      ],
      maxEntrants: 42000,
      icon: "🇬🇧",
      color: "text-blue-700",
      prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
    },
    {
      id: "annual_berlin_marathon",
      raceId: "national_marathon_city",
      name: "Berlin Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. The fastest course on Earth. Flat, smooth asphalt, classical music on every corner, and sprinting through Brandenburg Gate.",
      schedule: {
        frequency: "annual",
        dayOfYear: 266, // September
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
      categories: [
        {
          id: "5k",
          name: "5K Breakfast Run",
          distance: 5,
          fee: 65,
          prizeInfo: `Champion gets ${formatCurrency(800, preferredCurrency, { compact: true })}`,
          maxEntrants: 4000,
        },
        {
          id: "10k",
          name: "10K Berlin City Sprint",
          distance: 10,
          fee: 120,
          prizeInfo: `Champion gets ${formatCurrency(2000, preferredCurrency, { compact: true })}`,
          maxEntrants: 6000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 220,
          prizeInfo: `Champion gets ${formatCurrency(4800, preferredCurrency, { compact: true })}`,
          maxEntrants: 10000,
        },
        {
          id: "fm",
          name: "Full Marathon World Major",
          distance: 42.2,
          fee: 550,
          prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 25000,
        },
      ],
      maxEntrants: 45000,
      icon: "🇩🇪",
      color: "text-yellow-600",
      prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
    },
    {
      id: "annual_chicago_marathon",
      raceId: "national_marathon_city",
      name: "Chicago Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. 29 historic neighborhoods, flat breezy lakefront avenues, and millions of cheering spectators lining the windy city loop.",
      schedule: {
        frequency: "annual",
        dayOfYear: 280, // October
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
      categories: [
        {
          id: "5k",
          name: "5K International Dash",
          distance: 5,
          fee: 70,
          prizeInfo: `Champion gets ${formatCurrency(900, preferredCurrency, { compact: true })}`,
          maxEntrants: 4000,
        },
        {
          id: "10k",
          name: "10K Lakefront Sprint",
          distance: 10,
          fee: 130,
          prizeInfo: `Champion gets ${formatCurrency(2200, preferredCurrency, { compact: true })}`,
          maxEntrants: 6000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 230,
          prizeInfo: `Champion gets ${formatCurrency(5000, preferredCurrency, { compact: true })}`,
          maxEntrants: 10000,
        },
        {
          id: "fm",
          name: "Full Marathon World Major",
          distance: 42.2,
          fee: 600,
          prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 25000,
        },
      ],
      maxEntrants: 45000,
      icon: "🏙️",
      color: "text-sky-500",
      prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
    },
    {
      id: "annual_nyc_marathon",
      raceId: "national_marathon_city",
      name: "New York City Marathon",
      locationId: "national_marathon_city",
      tier: "international",
      description:
        "World Marathon Major. Verrazzano Bridge cannon start, 5 iconic NYC boroughs, 1st Avenue wall of sound, and Central Park's golden leaves finish.",
      schedule: {
        frequency: "annual",
        dayOfYear: 308, // November
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
      categories: [
        {
          id: "5k",
          name: "5K Dash to the Finish",
          distance: 5,
          fee: 75,
          prizeInfo: `Champion gets ${formatCurrency(1000, preferredCurrency, { compact: true })}`,
          maxEntrants: 5000,
        },
        {
          id: "10k",
          name: "10K Borough Challenge",
          distance: 10,
          fee: 140,
          prizeInfo: `Champion gets ${formatCurrency(2500, preferredCurrency, { compact: true })}`,
          maxEntrants: 8000,
        },
        {
          id: "hm",
          name: "Half Marathon",
          distance: 21.1,
          fee: 250,
          prizeInfo: `Champion gets ${formatCurrency(5500, preferredCurrency, { compact: true })}`,
          maxEntrants: 12000,
        },
        {
          id: "fm",
          name: "Full Marathon World Major",
          distance: 42.2,
          fee: 650,
          prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
          maxEntrants: 25000,
        },
      ],
      maxEntrants: 50000,
      icon: "🗽",
      color: "text-emerald-500",
      prizeInfo: `World Major purse: ${formatCurrency(25000, preferredCurrency, { compact: true })} to champion`,
    },

    // ═══════════════════════════════════════════════════════
    // ONE-TIME STORY EVENTS - Career Milestones
    // ═══════════════════════════════════════════════════════
    {
      id: "one_time_debut",
      raceId: "local_5k_park",
      name: "Sudirman Street First Run",
      locationId: "local_5k_park",
      tier: "local",
      description:
        "Your very first official race down Sudirman Street. Pure heart, butterflies in the stomach, and a community welcoming you to the sport. This is where every champion starts.",
      schedule: {
        frequency: "one_time",
        specificDays: [5],
      },
      registration: {
        opensDaysBefore: 0,
        closesDaysBefore: 0,
      },
      entry: {
        fee: 0,
      },
      categories: [
        {
          id: "5k",
          name: "5K Debut Run",
          distance: 5,
          fee: 0,
          prizeInfo: "Participation Medal & Career Entry",
          maxEntrants: 50,
        },
      ],
      icon: "🌟",
      color: "text-yellow-500",
      prizeInfo: "Participation Medal & Career Entry",
    },
    {
      id: "one_time_chapter_complete",
      raceId: "local_5k_park",
      name: "Ancol Seaside Championship",
      locationId: "local_5k_park",
      tier: "regional",
      description:
        "The climax of your first career chapter by the Ancol sea wall. Prove to yourself and your rivals that you are ready for national major marathons.",
      schedule: {
        frequency: "one_time",
        specificDays: [50],
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
      categories: [
        {
          id: "10k",
          name: "10K Championship Race",
          distance: 10,
          fee: 80,
          prizeInfo: "Trophy & Next Chapter Unlocked",
          maxEntrants: 30,
        },
      ],
      maxEntrants: 30,
      icon: "📖",
      color: "text-indigo-500",
      prizeInfo: "Story Milestone Trophy",
    },
  ];
}

/**
 * Lazy-loaded race schedules with current currency.
 * Ensures currency formatting is always up-to-date.
 */
let cachedRaceSchedules: RaceSchedule[] | null = null;
let lastCurrency: string | null = null;

export function RACE_SCHEDULES_GETTER(): RaceSchedule[] {
  const currentCurrency = getPreferredCurrency();

  if (!cachedRaceSchedules || lastCurrency !== currentCurrency) {
    cachedRaceSchedules = getRaceSchedules();
    lastCurrency = currentCurrency;
  }

  return cachedRaceSchedules;
}

export const RACE_SCHEDULES = new Proxy([] as RaceSchedule[], {
  get(target, prop) {
    const schedules = RACE_SCHEDULES_GETTER();
    if (prop === "length") return schedules.length;
    if (typeof prop === "string" && !Number.isNaN(Number(prop))) {
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
  },
});

export function getDefaultDailyRaces(): RaceSchedule[] {
  return RACE_SCHEDULES_GETTER().filter(
    (s) => s.schedule.frequency === "daily",
  );
}

export function getRacesByTier(tier: string): RaceSchedule[] {
  return RACE_SCHEDULES_GETTER().filter((s) => s.tier === tier);
}

export function getNextBigRace(
  currentDayIndex: number,
): RaceSchedule | undefined {
  return RACE_SCHEDULES_GETTER()
    .filter(
      (s) =>
        s.schedule.frequency !== "daily" && s.schedule.frequency !== "weekly",
    )
    .sort((a, b) => {
      return a.registration.opensDaysBefore - b.registration.opensDaysBefore;
    })[0];
}

export function isChampionship(schedule: RaceSchedule): boolean {
  return ["state", "national", "international"].includes(schedule.tier);
}

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
