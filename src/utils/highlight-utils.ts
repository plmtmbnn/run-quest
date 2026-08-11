/**
 * Story Highlight Utilities
 * Sprint 33 - Feature 4: Determine which highlights are shareable
 */

import type { LocalizedText } from "@/types/engine";

/**
 * Determine if a highlight should have a share button
 * @param highlight The highlight text object
 * @param index Position in the highlights array
 * @returns true if this highlight should be shareable
 */
export function isHighlightShareable(
  highlight: LocalizedText,
  index: number,
): boolean {
  const textEn = highlight.en.toLowerCase();
  const textId = highlight.id?.toLowerCase() || "";

  // Shareable: Synergies (major strategic moments)
  if (textEn.includes("synergy unlocked")) return true;
  if (textEn.includes("synergy activated")) return true;
  if (textId.includes("sinergi")) return true;

  // Shareable: Significant km events with narrative
  if (textEn.includes("at km") && textEn.includes(":")) {
    // But not generic statements
    if (textEn.includes("tactical style")) return false;
    return true;
  }

  // Shareable: Breaking points and desperation mode
  if (textEn.includes("breaking point")) return true;
  if (textEn.includes("desperation mode")) return true;
  if (textEn.includes("mental fortitude")) return true;
  if (textId.includes("titik kritis")) return true;

  // Shareable: Weather-related dramatic moments
  if (textEn.includes("weather") && !textEn.includes("gave")) return true;
  if (
    textEn.includes("rain") ||
    textEn.includes("heat") ||
    textEn.includes("wind")
  ) {
    if (!textEn.includes("gave")) return true;
  }

  // NOT shareable: Tactical style summaries
  if (textEn.includes("tactical style:")) return false;

  // NOT shareable: Equipment effect descriptions (boring stats)
  if (textEn.includes("gave") || textEn.includes("provided")) {
    if (textEn.includes("shoes") || textEn.includes("gear")) return false;
  }

  // NOT shareable: Generic nutrition descriptions
  if (textEn.includes("consumed") || textEn.includes("drank")) return false;

  // Default: not shareable for generic highlights
  return false;
}

/**
 * Get a summary count of shareable vs total highlights
 */
export function getShareableCount(highlights: LocalizedText[]): {
  total: number;
  shareable: number;
} {
  const shareable = highlights.filter((h, idx) =>
    isHighlightShareable(h, idx),
  ).length;

  return {
    total: highlights.length,
    shareable,
  };
}
