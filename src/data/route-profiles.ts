import type { RouteProfile, RouteProfileType } from "@/types/route-profile";

/**
 * Comprehensive library of route profiles for all races in Run Quest.
 * Each route is carefully designed to reflect real-world terrain characteristics
 * and provide unique strategic challenges.
 */

// ═══════════════════════════════════════════════════════
// WORLD MARATHON MAJORS - Iconic International Routes
// ═══════════════════════════════════════════════════════

export const BOSTON_MARATHON: RouteProfile = {
  id: "boston_marathon",
  name: "Boston Marathon - Heartbreak Hill",
  surface: "road",
  profileType: "hilly",
  elevationPoints: [
    { distance: 0, elevation: 0.45 },      // Hopkinton start
    { distance: 0.1, elevation: 0.38 },    // Early downhill
    { distance: 0.25, elevation: 0.35 },   // Ashland descent
    { distance: 0.4, elevation: 0.4 },     // Framingham rolling
    { distance: 0.52, elevation: 0.48 },   // Wellesley climb
    { distance: 0.65, elevation: 0.72 },   // HEARTBREAK HILL!
    { distance: 0.75, elevation: 0.55 },   // Post-heartbreak recovery
    { distance: 0.85, elevation: 0.5 },    // Cleveland Circle
    { distance: 1.0, elevation: 0.48 },    // Boylston Street finish
  ],
  characteristics: {
    maxGrade: 8.5,
    totalElevationGain: 140,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "urban",
    landmarks: ["Hopkinton Green", "Wellesley College", "Heartbreak Hill", "Citgo Sign", "Boylston Street"],
  },
};

export const BERLIN_MARATHON: RouteProfile = {
  id: "berlin_marathon",
  name: "Berlin Marathon - Speed Course",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },
    { distance: 0.2, elevation: 0.50 },
    { distance: 0.4, elevation: 0.49 },
    { distance: 0.6, elevation: 0.51 },
    { distance: 0.8, elevation: 0.50 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 2.0,
    totalElevationGain: 25,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
    landmarks: ["Brandenburg Gate", "Tiergarten", "Charlottenburg", "Victory Column"],
  },
};

export const LONDON_MARATHON: RouteProfile = {
  id: "london_marathon",
  name: "London Marathon - Thames Path",
  surface: "road",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.50 },      // Greenwich Park
    { distance: 0.15, elevation: 0.45 },   // Cutty Sark descent
    { distance: 0.3, elevation: 0.52 },    // Tower Bridge approach
    { distance: 0.5, elevation: 0.48 },    // Thames embankment
    { distance: 0.7, elevation: 0.50 },    // Westminster
    { distance: 0.85, elevation: 0.53 },   // Embankment rise
    { distance: 1.0, elevation: 0.50 },    // The Mall finish
  ],
  characteristics: {
    maxGrade: 4.5,
    totalElevationGain: 45,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "urban",
    landmarks: ["Greenwich Park", "Tower Bridge", "Big Ben", "London Eye", "Buckingham Palace"],
  },
};

export const NYC_MARATHON: RouteProfile = {
  id: "nyc_marathon",
  name: "New York City Marathon - Five Boroughs",
  surface: "road",
  profileType: "hilly",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },      // Staten Island
    { distance: 0.1, elevation: 0.55 },    // Verrazano Bridge climb
    { distance: 0.15, elevation: 0.42 },   // Brooklyn descent
    { distance: 0.4, elevation: 0.50 },    // Brooklyn streets
    { distance: 0.5, elevation: 0.58 },    // Pulaski Bridge
    { distance: 0.6, elevation: 0.52 },    // Queens
    { distance: 0.7, elevation: 0.62 },    // Queensboro Bridge
    { distance: 0.8, elevation: 0.48 },    // First Avenue
    { distance: 0.9, elevation: 0.55 },    // Bronx hills
    { distance: 1.0, elevation: 0.50 },    // Central Park finish
  ],
  characteristics: {
    maxGrade: 7.0,
    totalElevationGain: 180,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "urban",
    landmarks: ["Verrazano Bridge", "Brooklyn", "Queensboro Bridge", "First Avenue", "Central Park"],
  },
};

export const TOKYO_MARATHON: RouteProfile = {
  id: "tokyo_marathon",
  name: "Tokyo Marathon - Urban Flat",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.49 },
    { distance: 0.25, elevation: 0.51 },
    { distance: 0.5, elevation: 0.50 },
    { distance: 0.75, elevation: 0.52 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 2.5,
    totalElevationGain: 30,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
    landmarks: ["Tokyo Station", "Imperial Palace", "Asakusa", "Ginza", "Tokyo Tower"],
  },
};

export const CHICAGO_MARATHON: RouteProfile = {
  id: "chicago_marathon",
  name: "Chicago Marathon - Lakefront",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.50 },
    { distance: 0.3, elevation: 0.49 },
    { distance: 0.6, elevation: 0.51 },
    { distance: 0.9, elevation: 0.50 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 1.5,
    totalElevationGain: 20,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
    landmarks: ["Grant Park", "Lincoln Park", "Chinatown", "Michigan Avenue"],
  },
};

// ═══════════════════════════════════════════════════════
// INDONESIAN SIGNATURE RACES - Local Terrain
// ═══════════════════════════════════════════════════════

export const BROMO_ULTRA: RouteProfile = {
  id: "bromo_ultra",
  name: "Bromo Ultra - Volcanic Challenge",
  surface: "trail",
  profileType: "volcanic",
  elevationPoints: [
    { distance: 0, elevation: 0.30 },      // Sea of Sand start
    { distance: 0.1, elevation: 0.45 },    // Gradual climb
    { distance: 0.2, elevation: 0.62 },    // Steep volcanic slope
    { distance: 0.3, elevation: 0.85 },    // Crater rim approach
    { distance: 0.4, elevation: 0.90 },    // Summit ridge
    { distance: 0.5, elevation: 0.75 },    // Technical descent
    { distance: 0.6, elevation: 0.65 },    // Mid-valley
    { distance: 0.7, elevation: 0.80 },    // Second peak
    { distance: 0.85, elevation: 0.70 },   // Final descent
    { distance: 1.0, elevation: 0.50 },    // Finish lowlands
  ],
  characteristics: {
    maxGrade: 18.0,
    totalElevationGain: 1800,
    technicalDifficulty: 5,
  },
  environment: {
    biome: "volcanic",
    landmarks: ["Sea of Sand", "Bromo Crater", "Tengger Caldera", "Batok Peak"],
  },
};

export const RINJANI_SKYRACE: RouteProfile = {
  id: "rinjani_skyrace",
  name: "Mount Rinjani Skyrace - Crater Lake",
  surface: "trail",
  profileType: "mountainous",
  elevationPoints: [
    { distance: 0, elevation: 0.25 },      // Base camp
    { distance: 0.15, elevation: 0.50 },   // Forest climb
    { distance: 0.3, elevation: 0.70 },    // Alpine zone
    { distance: 0.45, elevation: 0.88 },   // Near summit
    { distance: 0.5, elevation: 0.92 },    // Summit peak
    { distance: 0.6, elevation: 0.75 },    // Crater descent
    { distance: 0.75, elevation: 0.60 },   // Lake shore
    { distance: 0.9, elevation: 0.45 },    // Final descent
    { distance: 1.0, elevation: 0.28 },    // Village finish
  ],
  characteristics: {
    maxGrade: 22.0,
    totalElevationGain: 2400,
    technicalDifficulty: 5,
  },
  environment: {
    biome: "mountain",
    landmarks: ["Segara Anak Lake", "Barujari Cone", "Summit Ridge", "Hot Springs"],
  },
};

export const BANDUNG_HILLS: RouteProfile = {
  id: "bandung_hills",
  name: "Bandung City Hills",
  surface: "road",
  profileType: "hilly",
  elevationPoints: [
    { distance: 0, elevation: 0.45 },
    { distance: 0.2, elevation: 0.58 },
    { distance: 0.4, elevation: 0.50 },
    { distance: 0.6, elevation: 0.65 },
    { distance: 0.8, elevation: 0.55 },
    { distance: 1.0, elevation: 0.48 },
  ],
  characteristics: {
    maxGrade: 9.0,
    totalElevationGain: 280,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "urban",
    landmarks: ["Gedung Sate", "Dago", "Lembang Hills", "Tea Plantations"],
  },
};

export const TAHURA_FOREST: RouteProfile = {
  id: "tahura_forest",
  name: "Tahura Pine Forest Trail",
  surface: "trail",
  profileType: "forest",
  elevationPoints: [
    { distance: 0, elevation: 0.42 },
    { distance: 0.2, elevation: 0.55 },
    { distance: 0.4, elevation: 0.62 },
    { distance: 0.6, elevation: 0.58 },
    { distance: 0.8, elevation: 0.65 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 12.0,
    totalElevationGain: 450,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "forest",
    landmarks: ["Pine Forest", "Curug Omas", "Bamboo Grove", "Ranger Station"],
  },
};

export const BALI_COASTAL: RouteProfile = {
  id: "bali_coastal",
  name: "Bali Coastal Run",
  surface: "road",
  profileType: "coastal",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },      // Beach level
    { distance: 0.2, elevation: 0.52 },    // Gentle rise
    { distance: 0.4, elevation: 0.50 },    // Coastal flat
    { distance: 0.6, elevation: 0.55 },    // Cliff path
    { distance: 0.8, elevation: 0.51 },    // Descent
    { distance: 1.0, elevation: 0.49 },    // Beach finish
  ],
  characteristics: {
    maxGrade: 5.0,
    totalElevationGain: 85,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "coastal",
    landmarks: ["Sanur Beach", "Serangan", "Nusa Dua Cliffs", "Temple Views"],
  },
};

export const ARJUNO_ULTRA: RouteProfile = {
  id: "arjuno_ultra",
  name: "Arjuno-Welirang Ultra",
  surface: "trail",
  profileType: "mountainous",
  elevationPoints: [
    { distance: 0, elevation: 0.28 },
    { distance: 0.15, elevation: 0.48 },
    { distance: 0.3, elevation: 0.68 },
    { distance: 0.45, elevation: 0.85 },
    { distance: 0.5, elevation: 0.90 },
    { distance: 0.6, elevation: 0.78 },
    { distance: 0.75, elevation: 0.82 },
    { distance: 0.85, elevation: 0.65 },
    { distance: 1.0, elevation: 0.35 },
  ],
  characteristics: {
    maxGrade: 20.0,
    totalElevationGain: 2200,
    technicalDifficulty: 5,
  },
  environment: {
    biome: "mountain",
    landmarks: ["Twin Peaks", "Alpine Meadows", "Sulfur Springs", "Cloud Forest"],
  },
};

// ═══════════════════════════════════════════════════════
// GENERIC TEMPLATE ROUTES - Reusable Profiles
// ═══════════════════════════════════════════════════════

export const GENERIC_FLAT_CITY: RouteProfile = {
  id: "generic_flat_city",
  name: "City Flat Course",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.49 },
    { distance: 0.25, elevation: 0.50 },
    { distance: 0.5, elevation: 0.51 },
    { distance: 0.75, elevation: 0.50 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 2.0,
    totalElevationGain: 15,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
  },
};

export const GENERIC_ROLLING_HILLS: RouteProfile = {
  id: "generic_rolling_hills",
  name: "Rolling Hills Course",
  surface: "road",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.45 },
    { distance: 0.2, elevation: 0.55 },
    { distance: 0.4, elevation: 0.48 },
    { distance: 0.6, elevation: 0.58 },
    { distance: 0.8, elevation: 0.50 },
    { distance: 1.0, elevation: 0.52 },
  ],
  characteristics: {
    maxGrade: 6.0,
    totalElevationGain: 120,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "urban",
  },
};

export const GENERIC_MOUNTAIN_TRAIL: RouteProfile = {
  id: "generic_mountain_trail",
  name: "Mountain Trail Course",
  surface: "trail",
  profileType: "mountainous",
  elevationPoints: [
    { distance: 0, elevation: 0.30 },
    { distance: 0.2, elevation: 0.50 },
    { distance: 0.4, elevation: 0.70 },
    { distance: 0.6, elevation: 0.85 },
    { distance: 0.8, elevation: 0.65 },
    { distance: 1.0, elevation: 0.40 },
  ],
  characteristics: {
    maxGrade: 15.0,
    totalElevationGain: 800,
    technicalDifficulty: 4,
  },
  environment: {
    biome: "mountain",
  },
};

export const GENERIC_FOREST_TRAIL: RouteProfile = {
  id: "generic_forest_trail",
  name: "Forest Trail Course",
  surface: "trail",
  profileType: "forest",
  elevationPoints: [
    { distance: 0, elevation: 0.40 },
    { distance: 0.25, elevation: 0.52 },
    { distance: 0.5, elevation: 0.60 },
    { distance: 0.75, elevation: 0.55 },
    { distance: 1.0, elevation: 0.45 },
  ],
  characteristics: {
    maxGrade: 10.0,
    totalElevationGain: 350,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "forest",
  },
};

export const GENERIC_TRACK: RouteProfile = {
  id: "generic_track",
  name: "Athletic Track",
  surface: "track",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.50 },
    { distance: 0.5, elevation: 0.50 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 0.5,
    totalElevationGain: 5,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
  },
};

export const GENERIC_COASTAL: RouteProfile = {
  id: "generic_coastal",
  name: "Coastal Route",
  surface: "road",
  profileType: "coastal",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },
    { distance: 0.3, elevation: 0.52 },
    { distance: 0.6, elevation: 0.50 },
    { distance: 0.9, elevation: 0.53 },
    { distance: 1.0, elevation: 0.49 },
  ],
  characteristics: {
    maxGrade: 4.0,
    totalElevationGain: 60,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "coastal",
  },
};

export const GENERIC_DESERT: RouteProfile = {
  id: "generic_desert",
  name: "Desert Trail",
  surface: "trail",
  profileType: "desert",
  elevationPoints: [
    { distance: 0, elevation: 0.45 },
    { distance: 0.2, elevation: 0.52 },
    { distance: 0.5, elevation: 0.58 },
    { distance: 0.8, elevation: 0.50 },
    { distance: 1.0, elevation: 0.47 },
  ],
  characteristics: {
    maxGrade: 8.0,
    totalElevationGain: 200,
    technicalDifficulty: 3,
  },
  environment: {
    biome: "desert",
  },
};

export const GENERIC_PLANTATION: RouteProfile = {
  id: "generic_plantation",
  name: "Plantation Trail",
  surface: "trail",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.42 },
    { distance: 0.25, elevation: 0.50 },
    { distance: 0.5, elevation: 0.55 },
    { distance: 0.75, elevation: 0.48 },
    { distance: 1.0, elevation: 0.45 },
  ],
  characteristics: {
    maxGrade: 7.0,
    totalElevationGain: 180,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "plantation",
  },
};

// ═══════════════════════════════════════════════════════
// UNIQUE RACE PROFILES - Sprint 40 Additions
// ═══════════════════════════════════════════════════════

export const JAKARTA_CITY_FLAT: RouteProfile = {
  id: "jakarta_city_flat",
  name: "Jakarta City Circuit",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.50 },
    { distance: 0.2, elevation: 0.51 },
    { distance: 0.4, elevation: 0.49 },
    { distance: 0.6, elevation: 0.50 },
    { distance: 0.8, elevation: 0.52 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 2.0,
    totalElevationGain: 20,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "urban",
    landmarks: ["Monas", "Bundaran HI", "Sudirman", "Thamrin"],
  },
};

export const BOROBUDUR_HERITAGE: RouteProfile = {
  id: "borobudur_heritage",
  name: "Borobudur Heritage Trail",
  surface: "road",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.45 },
    { distance: 0.15, elevation: 0.52 },
    { distance: 0.35, elevation: 0.58 },
    { distance: 0.6, elevation: 0.50 },
    { distance: 0.8, elevation: 0.48 },
    { distance: 1.0, elevation: 0.46 },
  ],
  characteristics: {
    maxGrade: 6.5,
    totalElevationGain: 160,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "tropical",
    landmarks: ["Borobudur Temple", "Mendut Temple", "Rice Paddies", "Elo River"],
  },
};

export const PRAMBANAN_TEMPLES: RouteProfile = {
  id: "prambanan_temples",
  name: "Prambanan Temple Circuit",
  surface: "road",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },
    { distance: 0.25, elevation: 0.53 },
    { distance: 0.5, elevation: 0.56 },
    { distance: 0.75, elevation: 0.51 },
    { distance: 1.0, elevation: 0.49 },
  ],
  characteristics: {
    maxGrade: 5.5,
    totalElevationGain: 140,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "tropical",
    landmarks: ["Prambanan Temple", "Sewu Temple", "Ratu Boko", "Village Roads"],
  },
};

export const DIENG_PLATEAU: RouteProfile = {
  id: "dieng_plateau",
  name: "Dieng Plateau Highland",
  surface: "road",
  profileType: "hilly",
  elevationPoints: [
    { distance: 0, elevation: 0.65 },
    { distance: 0.2, elevation: 0.72 },
    { distance: 0.4, elevation: 0.68 },
    { distance: 0.6, elevation: 0.75 },
    { distance: 0.8, elevation: 0.70 },
    { distance: 1.0, elevation: 0.67 },
  ],
  characteristics: {
    maxGrade: 9.0,
    totalElevationGain: 250,
    technicalDifficulty: 4,
  },
  environment: {
    biome: "mountain",
    landmarks: ["Telaga Warna", "Arjuna Temple", "Sikidang Crater", "Potato Fields"],
  },
};

export const KOMODO_ISLAND: RouteProfile = {
  id: "komodo_island",
  name: "Komodo Island Adventure",
  surface: "trail",
  profileType: "hilly",
  elevationPoints: [
    { distance: 0, elevation: 0.40 },
    { distance: 0.2, elevation: 0.55 },
    { distance: 0.4, elevation: 0.68 },
    { distance: 0.6, elevation: 0.58 },
    { distance: 0.8, elevation: 0.52 },
    { distance: 1.0, elevation: 0.45 },
  ],
  characteristics: {
    maxGrade: 12.0,
    totalElevationGain: 320,
    technicalDifficulty: 4,
  },
  environment: {
    biome: "tropical",
    landmarks: ["Pink Beach", "Padar Viewpoint", "Savanna Hills", "Dragon Habitat"],
  },
};

export const TOBA_LAKESIDE: RouteProfile = {
  id: "toba_lakeside",
  name: "Lake Toba Scenic Route",
  surface: "road",
  profileType: "rolling",
  elevationPoints: [
    { distance: 0, elevation: 0.52 },
    { distance: 0.25, elevation: 0.48 },
    { distance: 0.5, elevation: 0.50 },
    { distance: 0.75, elevation: 0.46 },
    { distance: 1.0, elevation: 0.51 },
  ],
  characteristics: {
    maxGrade: 4.5,
    totalElevationGain: 110,
    technicalDifficulty: 2,
  },
  environment: {
    biome: "tropical",
    landmarks: ["Lake Toba", "Samosir Island", "Batak Villages", "Waterfront"],
  },
};

export const WAKATOBI_COASTAL: RouteProfile = {
  id: "wakatobi_coastal",
  name: "Wakatobi Coral Coast",
  surface: "road",
  profileType: "flat",
  elevationPoints: [
    { distance: 0, elevation: 0.48 },
    { distance: 0.3, elevation: 0.50 },
    { distance: 0.6, elevation: 0.49 },
    { distance: 0.9, elevation: 0.51 },
    { distance: 1.0, elevation: 0.50 },
  ],
  characteristics: {
    maxGrade: 3.0,
    totalElevationGain: 35,
    technicalDifficulty: 1,
  },
  environment: {
    biome: "coastal",
    landmarks: ["Coral Beaches", "Mangrove Forests", "Fishing Villages", "Marine Park"],
  },
};

// ═══════════════════════════════════════════════════════
// ROUTE PROFILE REGISTRY
// ═══════════════════════════════════════════════════════

export const ROUTE_PROFILES: Record<string, RouteProfile> = {
  // World Majors
  boston_marathon: BOSTON_MARATHON,
  berlin_marathon: BERLIN_MARATHON,
  london_marathon: LONDON_MARATHON,
  nyc_marathon: NYC_MARATHON,
  tokyo_marathon: TOKYO_MARATHON,
  chicago_marathon: CHICAGO_MARATHON,
  
  // Indonesian Signature
  bromo_ultra: BROMO_ULTRA,
  rinjani_skyrace: RINJANI_SKYRACE,
  bandung_hills: BANDUNG_HILLS,
  tahura_forest: TAHURA_FOREST,
  bali_coastal: BALI_COASTAL,
  arjuno_ultra: ARJUNO_ULTRA,
  
  // Unique Race Profiles
  jakarta_city_flat: JAKARTA_CITY_FLAT,
  borobudur_heritage: BOROBUDUR_HERITAGE,
  prambanan_temples: PRAMBANAN_TEMPLES,
  dieng_plateau: DIENG_PLATEAU,
  komodo_island: KOMODO_ISLAND,
  toba_lakeside: TOBA_LAKESIDE,
  wakatobi_coastal: WAKATOBI_COASTAL,
  
  // Generic Templates
  generic_flat_city: GENERIC_FLAT_CITY,
  generic_rolling_hills: GENERIC_ROLLING_HILLS,
  generic_mountain_trail: GENERIC_MOUNTAIN_TRAIL,
  generic_forest_trail: GENERIC_FOREST_TRAIL,
  generic_track: GENERIC_TRACK,
  generic_coastal: GENERIC_COASTAL,
  generic_desert: GENERIC_DESERT,
  generic_plantation: GENERIC_PLANTATION,
};

/**
 * Get a route profile by ID with fallback to generic profiles based on surface
 */
export function getRouteProfile(
  routeProfileId: string | undefined,
  surface: "road" | "trail" | "track"
): RouteProfile {
  if (routeProfileId && ROUTE_PROFILES[routeProfileId]) {
    return ROUTE_PROFILES[routeProfileId];
  }
  
  // Fallback to appropriate generic profile
  if (surface === "track") return GENERIC_TRACK;
  if (surface === "trail") return GENERIC_FOREST_TRAIL;
  return GENERIC_FLAT_CITY;
}
