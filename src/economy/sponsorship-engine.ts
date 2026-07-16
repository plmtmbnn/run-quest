/**
 * Sponsorship Engine (Sprint 26 - Task 2)
 * 
 * Manages sponsor availability, signing, and payouts.
 */

import type { GameState } from "../engine/timeline/time-types";
import type { Sponsor, SponsorshipState } from "./sponsorship-types";
import { SPONSORS, SPONSOR_TIER_ORDER, DEFAULT_SPONSORSHIP_STATE } from "./sponsorship-types";
import { MONTHS_PER_YEAR, DAYS_PER_MONTH } from "../engine/timeline/time-types";

/**
 * Check which sponsors are available for the player to sign.
 */
export function getAvailableSponsors(
  sponsorshipState: SponsorshipState,
  gameState: GameState,
): Sponsor[] {
  if (sponsorshipState.currentSponsor) {
    // If already sponsored, higher tier sponsors might be available
    const currentSponsor = SPONSORS[sponsorshipState.currentSponsor];
    if (!currentSponsor) return [];

    const currentTierIndex = SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier);
    const available: Sponsor[] = [];

    for (const [id, sponsor] of Object.entries(SPONSORS)) {
      const tierIndex = SPONSOR_TIER_ORDER.indexOf(sponsor.tier);
      if (tierIndex > currentTierIndex && meetsRequirements(sponsor, gameState)) {
        available.push(sponsor);
      }
    }

    return available;
  }

  // No current sponsor - check all available
  return Object.values(SPONSORS).filter((sponsor) =>
    meetsRequirements(sponsor, gameState),
  );
}

/**
 * Check if player meets sponsor requirements.
 */
function meetsRequirements(sponsor: Sponsor, gameState: GameState): boolean {
  const req = sponsor.requirements;
  const flags = gameState.flags;

  // Rating check
  if (req.minRating) {
    const rating = flags.rating as number ?? 0;
    if (rating < req.minRating) return false;
  }

  // Wins check (from flags)
  if (req.minWins) {
    const wins = flags.career_wins as number ?? 0;
    if (wins < req.minWins) return false;
  }

  // Level check (from skills)
  if (req.minLevel) {
    const level = gameState.skills.running ?? 0;
    if (level < req.minLevel) return false;
  }

  // Story chapters check
  if (req.chaptersRequired) {
    const chapter = flags.storyChapter as number ?? 0;
    if (chapter < req.chaptersRequired) return false;
  }

  // Previous sponsor check
  if (req.previousSponsor) {
    const prevSponsors = flags.previous_sponsors as string ?? "";
    if (!prevSponsors.includes(req.previousSponsor)) return false;
  }

  return true;
}

/**
 * Sign a sponsor contract.
 */
export function signSponsor(
  sponsorshipState: SponsorshipState,
  sponsorId: string,
  dayIndex: number,
): SponsorshipState {
  // If we had a previous sponsor, add to previous list
  const previousSponsors = sponsorshipState.currentSponsor
    ? `${(sponsorshipState as any).previousSponsors ?? ""}${sponsorshipState.currentSponsor},`
    : "";

  return {
    currentSponsor: sponsorId,
    sponsorsAvailable: [],
    lifetimeSponsorEarnings: sponsorshipState.lifetimeSponsorEarnings,
    monthlyStipendLastClaimed: sponsorshipState.monthlyStipendLastClaimed,
    signedAtDay: dayIndex,
  };
}

/**
 * Calculate training bonus from current sponsor.
 */
export function getTrainingBonus(sponsorshipState: SponsorshipState): number {
  if (!sponsorshipState.currentSponsor) return 0;
  const sponsor = SPONSORS[sponsorshipState.currentSponsor];
  return sponsor?.benefits.trainingBonus ?? 0;
}

/**
 * Calculate race completion bonus from current sponsor.
 */
export function getRaceBonus(sponsorshipState: SponsorshipState): number {
  if (!sponsorshipState.currentSponsor) return 0;
  const sponsor = SPONSORS[sponsorshipState.currentSponsor];
  return sponsor?.benefits.raceCompletionBonus ?? 0;
}

/**
 * Calculate win bonus from current sponsor.
 */
export function getWinBonus(sponsorshipState: SponsorshipState): number {
  if (!sponsorshipState.currentSponsor) return 0;
  const sponsor = SPONSORS[sponsorshipState.currentSponsor];
  return sponsor?.benefits.winBonus ?? 0;
}

/**
 * Check if monthly stipend is available, and if so claim it.
 */
export function claimMonthlyStipend(
  sponsorshipState: SponsorshipState,
  currentDayIndex: number,
): { sponsorshipState: SponsorshipState; amount: number } {
  if (!sponsorshipState.currentSponsor) {
    return { sponsorshipState, amount: 0 };
  }

  const sponsor = SPONSORS[sponsorshipState.currentSponsor];
  const daysSinceLastClaim = currentDayIndex - sponsorshipState.monthlyStipendLastClaimed;

  // Stipend is paid monthly (28 days)
  if (daysSinceLastClaim < DAYS_PER_MONTH) {
    return { sponsorshipState, amount: 0 };
  }

  return {
    sponsorshipState: {
      ...sponsorshipState,
      monthlyStipendLastClaimed: currentDayIndex,
      lifetimeSponsorEarnings:
        sponsorshipState.lifetimeSponsorEarnings + sponsor.benefits.monthlyStipend,
    },
    amount: sponsor.benefits.monthlyStipend,
  };
}

/**
 * Get current sponsor details.
 */
export function getCurrentSponsor(
  sponsorshipState: SponsorshipState,
): Sponsor | null {
  if (!sponsorshipState.currentSponsor) return null;
  return SPONSORS[sponsorshipState.currentSponsor] ?? null;
}

/**
 * Get sponsor progression status.
 */
export function getSponsorProgression(
  sponsorshipState: SponsorshipState,
  gameState: GameState,
): {
  currentTier: string | null;
  nextTier: string | null;
  nextSponsor: Sponsor | null;
  daysAsSponsored: number;
} {
  const current = getCurrentSponsor(sponsorshipState);
  const available = getAvailableSponsors(sponsorshipState, gameState);

  return {
    currentTier: current?.tier ?? null,
    nextTier: available.length > 0 ? available[0].tier : null,
    nextSponsor: available.length > 0 ? available[0] : null,
    daysAsSponsored: current
      ? gameState.dayIndex - sponsorshipState.signedAtDay
      : 0,
  };
}

// Re-export
export type { Sponsor, SponsorshipState };
export { SPONSORS, DEFAULT_SPONSORSHIP_STATE };
