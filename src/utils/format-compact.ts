/**
 * Compact Number Formatting Utility
 *
 * Formats large numbers into readable compact form:
 * - < 1,000      → as-is (e.g., "999")
 * - 1,000+       → K (e.g., "1.5K", "23K")
 * - 1,000,000+   → M (e.g., "2.3M")
 * - 1,000,000,000+ → B (e.g., "1.2B")
 * - 1,000,000,000,000+ → T
 */

/**
 * Format a number compactly using K/M/B/T suffixes.
 * Numbers below 1000 are returned as-is.
 */
export function formatCompact(n: number, decimals = 1): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) {
    const val = abs / 1_000_000_000_000;
    return `${sign}${trimDecimals(val, decimals)}T`;
  }
  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    return `${sign}${trimDecimals(val, decimals)}B`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}${trimDecimals(val, decimals)}M`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}${trimDecimals(val, decimals)}K`;
  }
  return `${sign}${Math.round(abs)}`;
}

/** Strip unnecessary trailing zeros from decimal */
function trimDecimals(val: number, decimals: number): string {
  // e.g., 1.0 → "1", 1.5 → "1.5", 1.50 → "1.5"
  return Number(val.toFixed(decimals)).toString();
}

/**
 * Format a number compactly with a currency symbol.
 * Used for compact prize/fee displays.
 *
 * @param amount - raw number (in display currency units)
 * @param symbol - currency symbol (e.g., "$", "Rp", "€")
 * @param symbolBefore - whether symbol comes before the number
 */
export function formatCompactWithSymbol(
  amount: number,
  symbol: string,
  symbolBefore = true,
): string {
  const compact = formatCompact(amount);
  const space = symbol.length > 1 ? " " : "";
  return symbolBefore
    ? `${symbol}${space}${compact}`
    : `${compact}${space}${symbol}`;
}
