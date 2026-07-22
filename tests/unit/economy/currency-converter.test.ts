import { describe, expect, it } from "vitest";
import {
  convertFromDisplayCurrency,
  convertToDisplayCurrency,
  formatCurrency,
  formatCurrencyRange,
  parseCurrencyInput,
} from "../../../src/economy/currency-converter";

describe("Currency Converter & Formatter", () => {
  describe("convertToDisplayCurrency", () => {
    it("converts USD (base) to display currencies correctly", () => {
      expect(convertToDisplayCurrency(100, "USD")).toBe(100);
      expect(convertToDisplayCurrency(100, "EUR")).toBe(92);
      expect(convertToDisplayCurrency(100, "JPY")).toBe(15000);
      expect(convertToDisplayCurrency(100, "IDR")).toBe(1570000);
    });
  });

  describe("convertFromDisplayCurrency", () => {
    it("converts display currencies back to base USD correctly", () => {
      expect(convertFromDisplayCurrency(100, "USD")).toBe(100);
      expect(convertFromDisplayCurrency(92, "EUR")).toBe(100);
      expect(convertFromDisplayCurrency(15000, "JPY")).toBe(100);
      expect(convertFromDisplayCurrency(1570000, "IDR")).toBe(100);
    });
  });

  describe("formatCurrency", () => {
    it("formats USD with standard thousands separator", () => {
      expect(formatCurrency(1250, "USD")).toBe("$1,250");
    });

    it("formats EUR with dot separators", () => {
      expect(formatCurrency(1250, "EUR")).toBe("€1.150");
    });

    it("formats JPY with no decimals and comma separator", () => {
      expect(formatCurrency(1250, "JPY")).toBe("¥187,500");
    });

    it("formats IDR with space after symbol and dot separator", () => {
      expect(formatCurrency(100, "IDR")).toBe("Rp 1.570.000");
    });

    it("supports compact formatting for large numbers", () => {
      expect(formatCurrency(1000000, "USD", { compact: true })).toBe("$1M");
    });
  });

  describe("parseCurrencyInput", () => {
    it("parses input values back to base units correctly", () => {
      expect(parseCurrencyInput("$1,250", "USD")).toBe(1250);
      expect(parseCurrencyInput("1,250", "USD")).toBe(1250);
      expect(parseCurrencyInput("1250", "USD")).toBe(1250);
      expect(parseCurrencyInput("Rp 1.570.000", "IDR")).toBe(100);
    });

    it("returns null for invalid inputs", () => {
      expect(parseCurrencyInput("abc", "USD")).toBeNull();
    });
  });

  describe("formatCurrencyRange", () => {
    it("formats equal min and max as a single value", () => {
      expect(formatCurrencyRange(100, 100, "USD")).toBe("$100");
    });

    it("formats different min and max as a range", () => {
      expect(formatCurrencyRange(50, 100, "USD")).toBe("$50 - $100");
    });
  });
});
