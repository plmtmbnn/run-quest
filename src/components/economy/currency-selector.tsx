/**
 * Currency Selector Component (Sprint 26.5 - Task 3.4)
 *
 * Dropdown for selecting preferred display currency.
 */

"use client";

import { useState } from "react";
import type { CurrencyCode } from "@/economy/currency-config";
import { getAllCurrencies, getCurrencyConfig } from "@/economy/currency-config";
import { getCurrencyComparison } from "@/economy/currency-converter";

interface CurrencySelectorProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function CurrencySelector({
  currentCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAllCurrencies();
  const currentConfig = getCurrencyConfig(currentCurrency);

  const handleSelect = (code: CurrencyCode) => {
    onCurrencyChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Selection Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
      >
        <span className="text-2xl">{currentConfig.flag}</span>
        <div className="text-left">
          <div className="text-sm font-semibold text-white">
            {currentConfig.code}
          </div>
          <div className="text-xs text-gray-400">{currentConfig.name}</div>
        </div>
        <span className="text-gray-400 ml-2">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full mt-2 left-0 right-0 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-20 overflow-hidden">
            {currencies.map((currency) => {
              const isSelected = currency.code === currentCurrency;
              const example = getCurrencyComparison(500, "USD", currency.code);

              return (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 transition-colors text-left
                    ${
                      isSelected
                        ? "bg-blue-500/20 border-l-4 border-blue-500"
                        : "hover:bg-gray-700"
                    }
                  `}
                >
                  <span className="text-2xl">{currency.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {currency.code}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {currency.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Example: {example}
                    </div>
                  </div>
                  {isSelected && <span className="text-blue-400">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Inline currency display with selector (for settings page).
 */
export function CurrencySettingRow({
  currentCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-700">
      <div>
        <h3 className="text-lg font-semibold text-white">Display Currency</h3>
        <p className="text-sm text-gray-400 mt-1">
          Choose how money amounts are displayed. This doesn't affect game
          balance.
        </p>
      </div>
      <div className="ml-4">
        <CurrencySelector
          currentCurrency={currentCurrency}
          onCurrencyChange={onCurrencyChange}
        />
      </div>
    </div>
  );
}
