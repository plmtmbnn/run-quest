/**
 * Currency Converter (Sprint 26.5 - Task 3.2)
 *
 * Utilities for converting and formatting money values in different currencies.
 * Display-only conversion - internal economy always uses base units.
 */

import type { CurrencyCode, CurrencyConfig } from "./currency-config";
import { getCurrencyConfig } from "./currency-config";
import { formatCompact } from "@/utils/format-compact";

/**
 * Convert base units to display currency.
 *
 * @param baseAmount - Amount in base units (USD-equivalent)
 * @param currencyCode - Target currency code
 * @returns Converted amount (not formatted)
 */
export function convertToDisplayCurrency(
  baseAmount: number,
  currencyCode: CurrencyCode,
): number {
  const config = getCurrencyConfig(currencyCode);
  return Math.round(baseAmount * config.conversionRate);
}

/**
 * Convert display currency back to base units.
 *
 * @param displayAmount - Amount in display currency
 * @param currencyCode - Source currency code
 * @returns Amount in base units
 */
export function convertFromDisplayCurrency(
  displayAmount: number,
  currencyCode: CurrencyCode,
): number {
  const config = getCurrencyConfig(currencyCode);
  return Math.round(displayAmount / config.conversionRate);
}

/**
 * Format a number with thousands separators and decimal places.
 *
 * @param amount - Numeric amount
 * @param config - Currency configuration
 * @returns Formatted number string
 */
function formatNumber(amount: number, config: CurrencyConfig): string {
  // Round to specified decimal places
  const rounded =
    config.decimalPlaces > 0
      ? amount.toFixed(config.decimalPlaces)
      : Math.round(amount).toString();

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = rounded.split(".");

  // Add thousands separators
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandsSeparator,
  );

  // Combine with decimal part if needed
  if (decimalPart && config.decimalPlaces > 0) {
    return `${formattedInteger}${config.decimalSeparator}${decimalPart}`;
  }

  return formattedInteger;
}

/**
 * Format money amount in the specified currency.
 *
 * @param baseAmount - Amount in base units
 * @param currencyCode - Target currency code
 * @param options - Formatting options
 * @returns Fully formatted currency string (e.g., "$1,500" or "Rp 7.850.000")
 */
export function formatCurrency(
  baseAmount: number,
  currencyCode: CurrencyCode,
  options: {
    showSymbol?: boolean;
    compact?: boolean;
  } = {},
): string {
  const { showSymbol = true, compact = false } = options;
  const config = getCurrencyConfig(currencyCode);

  // Convert to display currency
  const displayAmount = convertToDisplayCurrency(baseAmount, currencyCode);

  // Handle compact notation for large numbers using K/M/B/T suffixes
  if (compact && displayAmount >= 1_000) {
    const compactStr = formatCompact(displayAmount);
    const symbol = showSymbol ? config.symbol : "";
    const space = config.symbol.length > 1 ? " " : "";
    return config.symbolPosition === "before"
      ? `${symbol}${space}${compactStr}`
      : `${compactStr}${space}${symbol}`;
  }

  // Format the number
  const formattedAmount = formatNumber(displayAmount, config);

  // Add symbol if requested
  if (!showSymbol) {
    return formattedAmount;
  }

  // Add symbol with proper spacing
  const space = config.symbol.length > 1 ? " " : ""; // Space for multi-char symbols like "Rp"

  return config.symbolPosition === "before"
    ? `${config.symbol}${space}${formattedAmount}`
    : `${formattedAmount}${space}${config.symbol}`;
}

/**
 * Parse currency input string and convert to base units.
 * Handles various formats: "1,500", "1.500", "$1500", etc.
 *
 * @param input - User input string
 * @param currencyCode - Currency code the input is in
 * @returns Amount in base units, or null if invalid
 */
export function parseCurrencyInput(
  input: string,
  currencyCode: CurrencyCode,
): number | null {
  const config = getCurrencyConfig(currencyCode);

  // Remove currency symbol and spaces
  let cleaned = input.trim();
  cleaned = cleaned.replace(config.symbol, "");
  cleaned = cleaned.trim();

  // Remove thousands separators
  cleaned = cleaned.replace(
    new RegExp(`\\${config.thousandsSeparator}`, "g"),
    "",
  );

  // Replace decimal separator with standard dot
  if (config.decimalSeparator !== ".") {
    cleaned = cleaned.replace(config.decimalSeparator, ".");
  }

  // Try to parse as number
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    return null;
  }

  // Convert to base units
  return convertFromDisplayCurrency(parsed, currencyCode);
}

/**
 * Get a currency comparison example for UI display.
 * Shows what an amount in one currency equals in another.
 *
 * @param baseAmount - Amount in base units
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Formatted comparison string
 */
export function getCurrencyComparison(
  baseAmount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): string {
  const fromFormatted = formatCurrency(baseAmount, fromCurrency);
  const toFormatted = formatCurrency(baseAmount, toCurrency);
  return `${fromFormatted} = ${toFormatted}`;
}

/**
 * Format a currency range (e.g., for work pay ranges).
 *
 * @param minBase - Minimum amount in base units
 * @param maxBase - Maximum amount in base units
 * @param currencyCode - Currency code
 * @returns Formatted range string
 */
export function formatCurrencyRange(
  minBase: number,
  maxBase: number,
  currencyCode: CurrencyCode,
): string {
  if (minBase === maxBase) {
    return formatCurrency(minBase, currencyCode);
  }

  const minFormatted = formatCurrency(minBase, currencyCode);
  const maxFormatted = formatCurrency(maxBase, currencyCode);
  return `${minFormatted} - ${maxFormatted}`;
}
