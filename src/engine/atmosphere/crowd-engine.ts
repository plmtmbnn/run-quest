import type { SimulationState } from "@/types/engine";

export interface CrowdReaction {
  intensity: "low" | "medium" | "high" | "intense";
  commentary: {
    en: string;
    id: string;
  };
}

export class CrowdEngine {
  public generateReaction(
    state: SimulationState,
    hasRivalClose = false,
  ): CrowdReaction | null {
    const activeOpponents = state.opponents?.filter((o) => !o.isDNF) || [];
    if (activeOpponents.length === 0) return null;

    const isPlayerLeading = activeOpponents.every(
      (o) => state.accumulatedTime < o.accumulatedTime,
    );
    const isPlayerBehind = activeOpponents.some(
      (o) => state.accumulatedTime > o.accumulatedTime,
    );
    const isFinalKm =
      state.distanceCovered + 1 >= Math.ceil(state.totalDistance);

    if (hasRivalClose) {
      return {
        intensity: "intense",
        commentary: {
          en: "The crowd gasps as the gap narrows! A fierce duel is unfolding!",
          id: "Penonton tersentak saat jarak menyempit! Duel sengit sedang terjadi!",
        },
      };
    }

    if (isFinalKm) {
      return {
        intensity: "high",
        commentary: {
          en: "Deafening cheers from the grandstand! The finish line is in sight!",
          id: "Sorakan memekakkan telinga dari tribun! Garis finis sudah terlihat!",
        },
      };
    }

    // Home crowd section simulation (every 4km)
    const isHomeCrowdSection = Math.floor(state.distanceCovered) % 4 === 0;

    if (isHomeCrowdSection && isPlayerLeading) {
      return {
        intensity: "high",
        commentary: {
          en: "The home crowd is going WILD as you command the lead!",
          id: "Penonton tuan rumah bersorak liar saat Anda memimpin balapan!",
        },
      };
    }

    if (isPlayerBehind) {
      return {
        intensity: "medium",
        commentary: {
          en: "Fans line the road, chanting your name, urging you to catch up!",
          id: "Penggemar memadati jalan, meneriakkan nama Anda, mendesak Anda untuk mengejar!",
        },
      };
    }

    return {
      intensity: "low",
      commentary: {
        en: "Spectators clap rhythmically as the runners pass by.",
        id: "Penonton bertepuk tangan berirama saat para pelari melintas.",
      },
    };
  }
}
