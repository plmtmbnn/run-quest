/**
 * Currency Configuration (Sprint 26.5 - Task 3.1)
 *
 * Defines supported currencies with conversion rates and formatting rules.
 * This is a display-only system - internal economy uses base units.
 */

export type CurrencyCode = "USD" | "EUR" | "JPY" | "IDR";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  symbolPosition: "before" | "after";

  /** Conversion rate from base units (USD equivalent) */
  conversionRate: number;

  /** Number of decimal places to show */
  decimalPlaces: number;

  /** Thousands separator (e.g., "," or ".") */
  thousandsSeparator: string;

  /** Decimal separator (e.g., "." or ",") */
  decimalSeparator: string;

  /** Flag emoji for visual representation */
  flag: string;
}

/**
 * All supported currencies.
 *
 * Note: Conversion rates are for display purposes only.
 * The internal economy always uses base units (USD-equivalent).
 *
 * Rates are approximate and don't need frequent updates since
 * this is a game economy, not a real financial system.
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    symbolPosition: "before",
    conversionRate: 1.0,
    decimalPlaces: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇺🇸",
  },

  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    symbolPosition: "before",
    conversionRate: 0.92,
    decimalPlaces: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    flag: "🇪🇺",
  },

  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    symbolPosition: "before",
    conversionRate: 150,
    decimalPlaces: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇯🇵",
  },

  IDR: {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    symbolPosition: "before",
    conversionRate: 15700,
    decimalPlaces: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    flag: "🇮🇩",
  },
};

/**
 * Get currency configuration by code.
 */
export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES[code];
}

/**
 * Get all available currencies (for selector dropdown).
 */
export function getAllCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}

/**
 * Default currency for new users.
 */
export const DEFAULT_CURRENCY: CurrencyCode = "USD";
