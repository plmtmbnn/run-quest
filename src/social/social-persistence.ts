import { getTierAndDivision } from "./ranking-engine";
import type {
  Club,
  ClubState,
  Competitor,
  RivalActivity,
} from "./ranking-types";
import { getDefaultRivals, type RivalAIData } from "./rival-engine";

export interface SocialStateData {
  region: string | null;
  regionalCompetitors: Competitor[];
  globalLeaderboard: Competitor[];
  clubId: string | null;
  weeklyProgressKm: number;
  weeklyContributedKm: number;
  clubMembers: { name: string; contributionKm: number; level: number }[];
  rivalActivities: RivalActivity[];
  rivalAIData: RivalAIData[];
  lastSimulationDate: string | null;
}

export const CLUBS: Club[] = [
  {
    id: "aero_striders",
    name: "Aero Striders",
    description: {
      en: "Focuses on speed work, pacing precision, and track efficiency. Best for track and flat road runners.",
      id: "Berfokus pada latihan kecepatan, presisi ritme, dan efisiensi lintasan. Terbaik untuk pelari lintasan dan jalan datar.",
    },
    bonusDesc: {
      en: "Provides a passive +5 boost to Speed attribute.",
      id: "Memberikan peningkatan pasif +5 untuk atribut Kecepatan.",
    },
    emblem: "⚡",
    colorClass: "from-amber-500 to-orange-600",
    weeklyGoalKm: 150,
  },
  {
    id: "apex_trails",
    name: "Apex Trails",
    description: {
      en: "Dedicated to altitude climbing, rugged terrains, and wilderness endurance. Ideal for trail blazers.",
      id: "Didedikasikan untuk pendakian ketinggian, medan kasar, dan daya tahan alam liar. Ideal untuk perintis jalan.",
    },
    bonusDesc: {
      en: "Provides a passive +5 boost to Stamina attribute.",
      id: "Memberikan peningkatan pasif +5 untuk atribut Stamina.",
    },
    emblem: "⛰️",
    colorClass: "from-emerald-500 to-teal-600",
    weeklyGoalKm: 180,
  },
  {
    id: "grit_syndicate",
    name: "Grit Syndicate",
    description: {
      en: "Focuses on mental toughness, overcoming fatigue limits, and ultra endurance runs.",
      id: "Berfokus pada ketangguhan mental, mengatasi batas kelelahan, dan lari ultra maraton.",
    },
    bonusDesc: {
      en: "Provides a passive +5 boost to Willpower attribute.",
      id: "Memberikan peningkatan pasif +5 untuk atribut Kemauan.",
    },
    emblem: "🔥",
    colorClass: "from-indigo-500 to-purple-600",
    weeklyGoalKm: 200,
  },
];

const SOCIAL_STORAGE_KEY = "runquest.social";

export function seedRegionalCompetitors(region: string): Competitor[] {
  const archetypes: ("frontrunner" | "splitter" | "steady")[] = [
    "frontrunner",
    "splitter",
    "steady",
  ];
  const list: Competitor[] = [];
  const names = [
    "Siti A.",
    "Ahmad H.",
    "Budi S.",
    "Rian D.",
    "Dewi K.",
    "Putu E.",
    "Linh N.",
    "Minh T.",
    "Somchai P.",
    "Ananda S.",
  ];

  for (let i = 0; i < 10; i++) {
    const rp = 150 + i * 180 + Math.floor(Math.random() * 50);
    const { tier, division } = getTierAndDivision(rp);
    list.push({
      id: `reg_comp_${i}`,
      name: names[i] || `Runner ${i + 1}`,
      region,
      rp,
      tier,
      division,
      archetype: archetypes[i % archetypes.length],
      level: 2 + Math.floor(rp / 300),
    });
  }
  return list;
}

export function seedGlobalCompetitors(): Competitor[] {
  const archetypes: ("frontrunner" | "splitter" | "steady")[] = [
    "frontrunner",
    "splitter",
    "steady",
  ];
  const list: Competitor[] = [];
  const names = [
    "Speedy McFast",
    "Vaporfly Pro",
    "Sub2Hour Hopeful",
    "Trail Runner X",
    "Pace Master",
    "Kenyan Wind",
    "Elite Strider",
    "Marathon Legend",
    "Grit Champion",
    "Cadence King",
    "Endurance Machine",
    "Oxygen Lord",
    "Splits Artist",
    "Ultramarathoner",
    "Lactic Acid Defier",
  ];

  for (let i = 0; i < 15; i++) {
    const rp = 2000 + i * 110 + Math.floor(Math.random() * 30);
    const { tier, division } = getTierAndDivision(rp);
    list.push({
      id: `global_comp_${i}`,
      name: names[i],
      region: "Global",
      rp,
      tier,
      division,
      archetype: archetypes[i % 3],
      level: 15 + Math.floor(rp / 200),
    });
  }
  return list;
}

export function seedClubMembers(): {
  name: string;
  contributionKm: number;
  level: number;
}[] {
  return [
    { name: "Cadence Walker", contributionKm: 12, level: 4 },
    { name: "Hill Champion", contributionKm: 24, level: 7 },
    { name: "Steady Jogger", contributionKm: 8, level: 3 },
    { name: "Aero Glide", contributionKm: 18, level: 5 },
    { name: "Oxygen Burner", contributionKm: 15, level: 6 },
  ];
}

export function seedRivalActivities(): RivalActivity[] {
  return [
    {
      id: "act_1",
      rivalId: "marcus_rivera",
      rivalName: "Marcus 'The Machine' Rivera",
      timestamp: "5h ago",
      action: {
        en: "completed a grueling 15km mountain trail run and improved his stamina.",
        id: "menyelesaikan lari lintas alam pegunungan 15 km yang melelahkan dan meningkatkan staminanya.",
      },
      attributeImproved: "stamina",
    },
    {
      id: "act_2",
      rivalId: "ellie_park",
      rivalName: "Ellie 'Lightning' Park",
      timestamp: "12h ago",
      action: {
        en: "performed speed interval drills at the local athletics track.",
        id: "melakukan latihan selang kecepatan di lintasan atletik lokal.",
      },
      attributeImproved: "speed",
    },
    {
      id: "act_3",
      rivalId: "kenji_nakamura",
      rivalName: "Kenji 'Silent Storm' Nakamura",
      timestamp: "1d ago",
      action: {
        en: "spent the afternoon analyzing negative split race footage and improving pacing willpower.",
        id: "menghabiskan sore hari menganalisis rekaman balapan pembagian negatif dan meningkatkan kemauan pacing.",
      },
      attributeImproved: "willpower",
    },
  ];
}

export const DEFAULT_SOCIAL_STATE: SocialStateData = {
  region: null,
  regionalCompetitors: [],
  globalLeaderboard: seedGlobalCompetitors(),
  clubId: null,
  weeklyProgressKm: 77, // Starts with some simulated initial value
  weeklyContributedKm: 0,
  clubMembers: seedClubMembers(),
  rivalActivities: seedRivalActivities(),
  rivalAIData: getDefaultRivals(),
  lastSimulationDate: null,
};

/**
 * Loads social state from local storage.
 */
export function loadSocialState(): SocialStateData {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SocialStateData;
        // Ensure lists aren't empty if loaded incorrectly
        if (
          !parsed.globalLeaderboard ||
          parsed.globalLeaderboard.length === 0
        ) {
          parsed.globalLeaderboard = seedGlobalCompetitors();
        }
        if (!parsed.rivalActivities || parsed.rivalActivities.length === 0) {
          parsed.rivalActivities = seedRivalActivities();
        }
        if (!parsed.clubMembers || parsed.clubMembers.length === 0) {
          parsed.clubMembers = seedClubMembers();
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load social state:", error);
  }
  return { ...DEFAULT_SOCIAL_STATE };
}

/**
 * Saves social state to local storage.
 */
export function saveSocialState(state: SocialStateData): void {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (error) {
    console.error("Failed to save social state:", error);
  }
}
