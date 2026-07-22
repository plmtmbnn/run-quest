import type { CurrencyCode } from "@/economy/currency-config";

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2 code
  name: {
    en: string;
    id: string;
  };
  flag: string; // Unicode flag emoji
  defaultCurrency: CurrencyCode;
  isFeatured?: boolean;
}

/**
 * ISO 3166-1 Country Dataset with featured running nations and default currency hints.
 */
export const COUNTRIES_DATA: CountryData[] = [
  // ─── FEATURED / POPULAR RUNNING NATIONS ───
  {
    code: "ID",
    name: { en: "Indonesia", id: "Indonesia" },
    flag: "🇮🇩",
    defaultCurrency: "IDR",
    isFeatured: true,
  },
  {
    code: "US",
    name: { en: "United States", id: "Amerika Serikat" },
    flag: "🇺🇸",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "JP",
    name: { en: "Japan", id: "Jepang" },
    flag: "🇯🇵",
    defaultCurrency: "JPY",
    isFeatured: true,
  },
  {
    code: "GB",
    name: { en: "United Kingdom", id: "Inggris Raya" },
    flag: "🇬🇧",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "DE",
    name: { en: "Germany", id: "Jerman" },
    flag: "🇩🇪",
    defaultCurrency: "EUR",
    isFeatured: true,
  },
  {
    code: "FR",
    name: { en: "France", id: "Prancis" },
    flag: "🇫🇷",
    defaultCurrency: "EUR",
    isFeatured: true,
  },
  {
    code: "KE",
    name: { en: "Kenya", id: "Kenya" },
    flag: "🇰🇪",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "ET",
    name: { en: "Ethiopia", id: "Etiopia" },
    flag: "🇪🇹",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "SG",
    name: { en: "Singapore", id: "Singapura" },
    flag: "🇸🇬",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "AU",
    name: { en: "Australia", id: "Australia" },
    flag: "🇦🇺",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "KR",
    name: { en: "South Korea", id: "Korea Selatan" },
    flag: "🇰🇷",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "NL",
    name: { en: "Netherlands", id: "Belanda" },
    flag: "🇳🇱",
    defaultCurrency: "EUR",
    isFeatured: true,
  },
  {
    code: "IT",
    name: { en: "Italy", id: "Italia" },
    flag: "🇮🇹",
    defaultCurrency: "EUR",
    isFeatured: true,
  },
  {
    code: "ES",
    name: { en: "Spain", id: "Spanyol" },
    flag: "🇪🇸",
    defaultCurrency: "EUR",
    isFeatured: true,
  },
  {
    code: "MY",
    name: { en: "Malaysia", id: "Malaysia" },
    flag: "🇲🇾",
    defaultCurrency: "USD",
    isFeatured: true,
  },
  {
    code: "TH",
    name: { en: "Thailand", id: "Thailand" },
    flag: "🇹🇭",
    defaultCurrency: "USD",
    isFeatured: true,
  },

  // ─── ALL OTHER NATIONS ───
  { code: "AF", name: { en: "Afghanistan", id: "Afganistan" }, flag: "🇦🇫", defaultCurrency: "USD" },
  { code: "AL", name: { en: "Albania", id: "Albania" }, flag: "🇦🇱", defaultCurrency: "EUR" },
  { code: "DZ", name: { en: "Algeria", id: "Aljazair" }, flag: "🇩🇿", defaultCurrency: "USD" },
  { code: "AR", name: { en: "Argentina", id: "Argentina" }, flag: "🇦🇷", defaultCurrency: "USD" },
  { code: "AT", name: { en: "Austria", id: "Austria" }, flag: "🇦🇹", defaultCurrency: "EUR" },
  { code: "BE", name: { en: "Belgium", id: "Belgia" }, flag: "🇧🇪", defaultCurrency: "EUR" },
  { code: "BR", name: { en: "Brazil", id: "Brasil" }, flag: "🇧🇷", defaultCurrency: "USD" },
  { code: "CA", name: { en: "Canada", id: "Kanada" }, flag: "🇨🇦", defaultCurrency: "USD" },
  { code: "CH", name: { en: "Switzerland", id: "Swiss" }, flag: "🇨🇭", defaultCurrency: "EUR" },
  { code: "CL", name: { en: "Chile", id: "Chile" }, flag: "🇨🇱", defaultCurrency: "USD" },
  { code: "CN", name: { en: "China", id: "Tiongkok" }, flag: "🇨🇳", defaultCurrency: "USD" },
  { code: "CO", name: { en: "Colombia", id: "Kolombia" }, flag: "🇨🇴", defaultCurrency: "USD" },
  { code: "DK", name: { en: "Denmark", id: "Denmark" }, flag: "🇩🇰", defaultCurrency: "EUR" },
  { code: "FI", name: { en: "Finland", id: "Finlandia" }, flag: "🇫🇮", defaultCurrency: "EUR" },
  { code: "GR", name: { en: "Greece", id: "Yunani" }, flag: "🇬🇷", defaultCurrency: "EUR" },
  { code: "HK", name: { en: "Hong Kong", id: "Hong Kong" }, flag: "🇭🇰", defaultCurrency: "USD" },
  { code: "IN", name: { en: "India", id: "India" }, flag: "🇮🇳", defaultCurrency: "USD" },
  { code: "IE", name: { en: "Ireland", id: "Irlandia" }, flag: "🇮🇪", defaultCurrency: "EUR" },
  { code: "MX", name: { en: "Mexico", id: "Meksiko" }, flag: "🇲🇽", defaultCurrency: "USD" },
  { code: "NZ", name: { en: "New Zealand", id: "Selandia Baru" }, flag: "🇳🇿", defaultCurrency: "USD" },
  { code: "NO", name: { en: "Norway", id: "Norwegia" }, flag: "🇳🇴", defaultCurrency: "EUR" },
  { code: "PH", name: { en: "Philippines", id: "Filipina" }, flag: "🇵🇭", defaultCurrency: "USD" },
  { code: "PL", name: { en: "Poland", id: "Polandia" }, flag: "🇵🇱", defaultCurrency: "EUR" },
  { code: "PT", name: { en: "Portugal", id: "Portugal" }, flag: "🇵🇹", defaultCurrency: "EUR" },
  { code: "SE", name: { en: "Sweden", id: "Swedia" }, flag: "🇸🇪", defaultCurrency: "EUR" },
  { code: "TR", name: { en: "Turkey", id: "Turki" }, flag: "🇹🇷", defaultCurrency: "USD" },
  { code: "ZA", name: { en: "South Africa", id: "Afrika Selatan" }, flag: "🇿🇦", defaultCurrency: "USD" },
];

/** Lookup helper to get country by code */
export function getCountryByCode(code: string): CountryData {
  const found = COUNTRIES_DATA.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return (
    found || {
      code: "ID",
      name: { en: "Indonesia", id: "Indonesia" },
      flag: "🇮🇩",
      defaultCurrency: "IDR",
    }
  );
}
