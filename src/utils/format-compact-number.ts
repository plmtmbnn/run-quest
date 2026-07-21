/**
 * Format a number in compact form (K, M, B, T).
 * Used for displaying money, prices, prizes, and large numbers.
 * 
 * @param value - The number to format
 * @returns Compact string (e.g., 1000 → "1K", 1000000 → "1M")
 */
export function formatCompactNumber(value: number): string {
  if (value < 1000) {
    return value.toString();
  }
  
  const suffixes = ["", "K", "M", "B", "T"];
  const suffixIndex = Math.floor(Math.log10(value) / 3);
  const suffix = suffixes[Math.min(suffixIndex, suffixes.length - 1)];
  
  const scaledValue = value / Math.pow(1000, suffixIndex);
  const roundedValue = Math.round(scaledValue * 10) / 10;
  
  // Remove decimal point if whole number
  return Number.isInteger(roundedValue) 
    ? `${roundedValue}${suffix}`
    : `${roundedValue}${suffix}`;
}

/**
 * Format currency with compact numbers.
 * Combines formatCurrency with formatCompactNumber for large amounts.
 * 
 * @param amount - The amount in base units
 * @param currencyCode - The currency code
 * @returns Compact currency string (e.g., "$1.5K", "$2M")
 */
export function formatCompactCurrency(
  amount: number,
  currencySymbol: string,
): string {
  if (amount < 1000) {
    return `${currencySymbol}${amount}`;
  }
  
  const suffixes = ["", "K", "M", "B", "T"];
  const suffixIndex = Math.floor(Math.log10(amount) / 3);
  const suffix = suffixes[Math.min(suffixIndex, suffixes.length - 1)];
  
  const scaledValue = amount / Math.pow(1000, suffixIndex);
  const roundedValue = Math.round(scaledValue * 10) / 10;
  
  return Number.isInteger(roundedValue)
    ? `${currencySymbol}${roundedValue}${suffix}`
    : `${currencySymbol}${roundedValue}${suffix}`;
}