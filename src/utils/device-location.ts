import type { CurrencyCode } from "@/economy/currency-config";

/**
 * Infer country code (ISO 3166-1 alpha-2) from browser locale and timezone signals.
 * Runs 100% locally with 0ms latency and full offline support.
 */
export function detectDeviceCountry(): string {
  if (typeof window === "undefined") return "ID";

  try {
    // 1. Try navigator.language or navigator.languages
    const locales = [
      navigator.language,
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    ].filter(Boolean);

    for (const locale of locales) {
      // Look for 2-letter uppercase region subtag (e.g. "en-US", "id-ID", "ja-JP", "de-DE")
      const match = locale.match(/-([A-Z]{2})\b/i);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    // 2. Try timezone mapping if locale had no region subtag (e.g. just "en")
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      const tzUpper = timeZone.toLowerCase();
      if (tzUpper.includes("jakarta") || tzUpper.includes("jayapura") || tzUpper.includes("makassar")) {
        return "ID";
      }
      if (tzUpper.includes("tokyo")) return "JP";
      if (tzUpper.includes("london")) return "GB";
      if (tzUpper.includes("berlin")) return "DE";
      if (tzUpper.includes("paris")) return "FR";
      if (tzUpper.includes("seoul")) return "KR";
      if (tzUpper.includes("singapore")) return "SG";
      if (tzUpper.includes("sydney") || tzUpper.includes("melbourne")) return "AU";
      if (tzUpper.includes("nairobi")) return "KE";
      if (tzUpper.includes("addis_ababa")) return "ET";
      if (tzUpper.includes("new_york") || tzUpper.includes("los_angeles") || tzUpper.includes("chicago")) {
        return "US";
      }
    }
  } catch {
    // Fallback gracefully on any API error
  }

  // Default fallback
  return "ID";
}
