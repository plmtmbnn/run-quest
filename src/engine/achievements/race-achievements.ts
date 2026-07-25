import type { RaceEvent, SimulationState } from "@/types/engine";

export interface RaceAchievement {
  id: string;
  title: { en: string; id: string };
  description: { en: string; id: string };
  icon: string; // emoji
  /** Return true when the achievement is earned. Only fires if not already earned (deduped externally). */
  condition: (
    snapshot: Omit<SimulationState, "accumulatedStateLog">,
    prevSnapshot: Omit<SimulationState, "accumulatedStateLog"> | null,
    context: AchievementContext,
  ) => boolean;
}

export interface AchievementContext {
  km: number;
  totalDistance: number;
  playerPosition: number;
  prevPlayerPosition: number;
  totalRunners: number;
  /** True only on the first occurrence per race (managed externally via earnedAchievements Set). */
  isFirstTime: boolean;
  events: RaceEvent[];
  recentConsumption?: { item: string; km: number; energyAtTime: number };
  /** Split times per km — for negative split calculation */
  kmPaces: number[];
}

export const ACHIEVEMENTS: RaceAchievement[] = [
  // ─── Pace & Performance ────────────────────────────────────────────────────
  {
    id: "fastest_km",
    title: { en: "Fastest Kilometer!", id: "Kilometer Tercepat!" },
    description: {
      en: "You posted your best km pace in the race so far.",
      id: "Kamu mencatat pace kilometer terbaik dalam lomba ini.",
    },
    icon: "🏅",
    condition: (snapshot, prevSnapshot, ctx) => {
      if (!prevSnapshot || ctx.kmPaces.length < 2) return false;
      const currentPace = ctx.kmPaces[ctx.kmPaces.length - 1];
      const prevBest = Math.min(...ctx.kmPaces.slice(0, -1));
      return currentPace > 0 && currentPace < prevBest;
    },
  },
  {
    id: "negative_split",
    title: { en: "Negative Split!", id: "Split Negatif!" },
    description: {
      en: "Your second half is faster than your first half.",
      id: "Separuh kedua lebih cepat dari separuh pertama.",
    },
    icon: "📈",
    condition: (_, __, ctx) => {
      const half = Math.floor(ctx.totalDistance / 2);
      if (ctx.km < ctx.totalDistance - 1 || ctx.kmPaces.length < ctx.totalDistance) return false;
      const firstHalf = ctx.kmPaces.slice(0, half);
      const secondHalf = ctx.kmPaces.slice(half);
      if (!firstHalf.length || !secondHalf.length) return false;
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      return avgSecond < avgFirst;
    },
  },
  {
    id: "perfect_stability",
    title: { en: "Smooth Operator!", id: "Operator Mulus!" },
    description: {
      en: "Pace stability above 90% for 5+ consecutive kilometers.",
      id: "Stabilitas pace di atas 90% selama 5+ km berturut-turut.",
    },
    icon: "🎯",
    condition: (snapshot) => {
      return (snapshot.paceStability ?? 0) > 90;
    },
  },

  // ─── Position & Rivalry ────────────────────────────────────────────────────
  {
    id: "overtake_leader",
    title: { en: "Took the Lead!", id: "Merebut Posisi Terdepan!" },
    description: {
      en: "You overtook the race leader.",
      id: "Kamu menyalip pemimpin lomba.",
    },
    icon: "👑",
    condition: (_, __, ctx) => {
      return ctx.playerPosition === 1 && ctx.prevPlayerPosition > 1 && ctx.totalRunners > 1;
    },
  },
  {
    id: "comeback_kid",
    title: { en: "Comeback Kid!", id: "Si Raja Kebangkitan!" },
    description: {
      en: "You went from last place to the top 3!",
      id: "Kamu melaju dari posisi terakhir ke 3 besar!",
    },
    icon: "🔥",
    condition: (_, __, ctx) => {
      return ctx.prevPlayerPosition >= ctx.totalRunners && ctx.playerPosition <= 3 && ctx.totalRunners >= 4;
    },
  },

  // ─── Race Milestones ───────────────────────────────────────────────────────
  {
    id: "halfway",
    title: { en: "Halfway There!", id: "Setengah Jalan!" },
    description: {
      en: "You reached the halfway point of the race.",
      id: "Kamu mencapai setengah jarak lomba.",
    },
    icon: "⏱️",
    condition: (_, __, ctx) => {
      return ctx.km === Math.ceil(ctx.totalDistance / 2);
    },
  },
  {
    id: "century_km",
    title: { en: "Double Digits!", id: "Dua Digit!" },
    description: {
      en: "You hit the 10km mark!",
      id: "Kamu melewati km ke-10!",
    },
    icon: "💯",
    condition: (_, __, ctx) => {
      return ctx.km === 10 && ctx.totalDistance >= 10;
    },
  },

  // ─── Energy / Survival ────────────────────────────────────────────────────
  {
    id: "energy_crisis",
    title: { en: "Running on Empty!", id: "Habis Energi!" },
    description: {
      en: "Energy dropped below 15% — digging deep!",
      id: "Energi turun di bawah 15% — berjuang keras!",
    },
    icon: "⚡",
    condition: (snapshot) => {
      return snapshot.energy < 15 && snapshot.energy > 0;
    },
  },
  {
    id: "clutch_gel",
    title: { en: "Clutch Consumption!", id: "Konsumsi Krusial!" },
    description: {
      en: "You used a consumable when energy was critically low.",
      id: "Kamu menggunakan konsumsi saat energi sangat rendah.",
    },
    icon: "🧪",
    condition: (snapshot, _, ctx) => {
      if (!ctx.recentConsumption) return false;
      return ctx.recentConsumption.km === ctx.km && ctx.recentConsumption.energyAtTime < 20;
    },
  },
  {
    id: "dnf_escape",
    title: { en: "Dodged a Bullet!", id: "Hampir DNF!" },
    description: {
      en: "You finished the race with less than 5% energy left.",
      id: "Kamu menyelesaikan lomba dengan energi di bawah 5%.",
    },
    icon: "💀",
    condition: (snapshot, _, ctx) => {
      return ctx.km >= ctx.totalDistance && snapshot.energy < 5 && snapshot.energy > 0;
    },
  },

  // ─── Target ───────────────────────────────────────────────────────────────
  {
    id: "sub_pace_target",
    title: { en: "On Target!", id: "Tepat Sasaran!" },
    description: {
      en: "Your current pace is consistent — holding the target.",
      id: "Pace kamu konsisten — sesuai target.",
    },
    icon: "🎯",
    condition: (_, __, ctx) => {
      if (ctx.kmPaces.length < 3) return false;
      const recent = ctx.kmPaces.slice(-3);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      // Consistent if last 3 km paces are within 5% of their average
      return recent.every((p) => Math.abs(p - avg) / avg < 0.05);
    },
  },
];

/**
 * Checks the current snapshot against previous snapshot and context to determine
 * which achievements are newly earned. The caller is responsible for deduplication
 * via the `isFirstTime` flag / earnedAchievements Set.
 */
export function checkRaceAchievements(
  snapshot: Omit<SimulationState, "accumulatedStateLog">,
  prevSnapshot: Omit<SimulationState, "accumulatedStateLog"> | null,
  context: AchievementContext,
  earnedIds: Set<string>,
): RaceAchievement[] {
  const newlyEarned: RaceAchievement[] = [];

  // Only fire once-per-race achievements for specific IDs
  const oncePerRaceIds = new Set([
    "overtake_leader", "comeback_kid", "halfway", "century_km",
    "energy_crisis", "negative_split", "dnf_escape",
  ]);

  for (const ach of ACHIEVEMENTS) {
    // Skip once-per-race achievements that already fired
    if (oncePerRaceIds.has(ach.id) && earnedIds.has(ach.id)) continue;

    try {
      const ctx = { ...context, isFirstTime: !earnedIds.has(ach.id) };
      if (ach.condition(snapshot, prevSnapshot, ctx)) {
        newlyEarned.push(ach);
      }
    } catch {
      // ignore errors in individual conditions
    }
  }

  return newlyEarned;
}
