import type { ActiveBreakingPoint, SimulationState } from "@/types/engine";

export type BodyZoneId =
  | "head"
  | "lungs"
  | "core"
  | "quads"
  | "calves"
  | "feet";
export type StressLevel = "normal" | "fatigued" | "stressed" | "critical";

export interface ZoneStressInfo {
  zoneId: BodyZoneId;
  label: string;
  percentage: number;
  level: StressLevel;
  hasInjury: boolean;
  injuryMessage?: string;
}

export interface BodyStressState {
  head: ZoneStressInfo;
  lungs: ZoneStressInfo;
  core: ZoneStressInfo;
  quads: ZoneStressInfo;
  calves: ZoneStressInfo;
  feet: ZoneStressInfo;
}

export function getStressLevel(percentage: number): StressLevel {
  const val = Math.max(0, Math.min(100, Math.round(percentage)));
  if (val < 30) return "normal";
  if (val < 60) return "fatigued";
  if (val < 85) return "stressed";
  return "critical";
}

export function calculateBodyStress(
  state: SimulationState,
  isClimbSegment: boolean = false,
  isSprintPace: boolean = false,
  shoePenalty: boolean = false,
): BodyStressState {
  const mentalFatigue = state.mentalFatigue ?? 0;
  const muscleFatigue = state.muscleFatigue ?? 0;
  const focus = state.focus ?? 100;
  const hydration = state.hydration ?? 100;
  const energy = state.energy ?? 100;
  const fatigue = state.fatigue ?? 0;
  const riskLevel = state.riskLevel ?? 20;
  const distanceCovered = state.distanceCovered ?? 0;
  const totalDistance = state.totalDistance ?? 10;

  // 1. Head (Mental fatigue + Focus drop)
  const headVal = Math.min(
    100,
    Math.max(0, mentalFatigue * 0.6 + (100 - focus) * 0.4),
  );
  // 2. Lungs (Dehydration + Energy depletion)
  const lungsVal = Math.min(
    100,
    Math.max(0, (100 - hydration) * 0.5 + (100 - energy) * 0.5),
  );
  // 3. Core (Overall fatigue + Risk level)
  const coreVal = Math.min(100, Math.max(0, fatigue * 0.7 + riskLevel * 0.3));
  // 4. Quads (Muscle fatigue + Climb segment strain)
  const quadsVal = Math.min(
    100,
    Math.max(0, muscleFatigue * 0.85 + (isClimbSegment ? 15 : 0)),
  );
  // 5. Calves (Muscle fatigue + Sprint pace strain)
  const calvesVal = Math.min(
    100,
    Math.max(0, muscleFatigue * 0.75 + (isSprintPace ? 20 : 0)),
  );
  // 6. Feet (Distance progress % + Shoe durability penalty)
  const feetVal = Math.min(
    100,
    Math.max(
      0,
      (distanceCovered / Math.max(1, totalDistance)) * 45 +
        (shoePenalty ? 25 : 10),
    ),
  );

  // Check active breaking points for injury mapping
  const activeBp: ActiveBreakingPoint | null =
    state.activeBreakingPoint ?? null;

  const injuredZones: Partial<Record<BodyZoneId, string>> = {};
  if (activeBp && !activeBp.resolved) {
    const bpId = activeBp.breakingPoint.id.toLowerCase();
    const title = activeBp.breakingPoint.onsetMessage.en;

    if (bpId.includes("cramp") || bpId.includes("tightness")) {
      injuredZones.calves = title;
      injuredZones.quads = title;
    } else if (bpId.includes("stitch") || bpId.includes("dehydration")) {
      injuredZones.lungs = title;
    } else if (bpId.includes("mental") || bpId.includes("dizziness")) {
      injuredZones.head = title;
    } else if (bpId.includes("foot") || bpId.includes("blister")) {
      injuredZones.feet = title;
    } else {
      injuredZones.core = title;
    }
  }

  const createZoneInfo = (
    zoneId: BodyZoneId,
    label: string,
    val: number,
  ): ZoneStressInfo => {
    const percentage = Math.round(val);
    const hasInjury = !!injuredZones[zoneId];
    return {
      zoneId,
      label,
      percentage,
      level: hasInjury ? "critical" : getStressLevel(percentage),
      hasInjury,
      injuryMessage: injuredZones[zoneId],
    };
  };

  return {
    head: createZoneInfo("head", "Head & Focus", headVal),
    lungs: createZoneInfo("lungs", "Lungs & Chest", lungsVal),
    core: createZoneInfo("core", "Core & Back", coreVal),
    quads: createZoneInfo("quads", "Quads & Thighs", quadsVal),
    calves: createZoneInfo("calves", "Calves & Shins", calvesVal),
    feet: createZoneInfo("feet", "Feet & Ankles", feetVal),
  };
}
