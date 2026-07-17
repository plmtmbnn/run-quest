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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all duration-200 shadow-sm active:scale-95"
      >
        <span className="text-2xl">{currentConfig.flag}</span>
        <div className="text-left">
          <div className="text-sm font-bold text-white tracking-tight">
            {currentConfig.code}
          </div>
          <div className="text-[11px] text-slate-400">{currentConfig.name}</div>
        </div>
        <span className={`text-slate-400 ml-1 text-xs transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
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
          <div className="absolute top-full mt-2 left-0 min-w-[240px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/40 z-20 overflow-hidden">
            <div className="p-1.5 space-y-0.5">
              {currencies.map((currency) => {
                const isSelected = currency.code === currentCurrency;
                const example = getCurrencyComparison(500, "USD", currency.code);

                return (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleSelect(currency.code)}
                    className={`
                      w-full px-3 py-2.5 flex items-center gap-3 transition-all duration-150 rounded-xl text-left
                      ${
                        isSelected
                          ? "bg-blue-500/20 border border-blue-500/20 text-white"
                          : "hover:bg-slate-800/80 border border-transparent text-slate-200 hover:text-white"
                      }
                    `}
                  >
                    <span className="text-xl shrink-0">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">
                          {currency.code}
                        </span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-xs text-slate-400 truncate">
                          {currency.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Example: {example}
                      </div>
                    </div>
                    {isSelected && <span className="text-blue-400 text-sm shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
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
    <div className="flex items-center justify-between py-4 border-b border-slate-800/60">
      <div>
        <h3 className="text-base font-bold text-white">Display Currency</h3>
        <p className="text-sm text-slate-400 mt-0.5">
          Choose how money amounts are displayed. This doesn't affect game
          balance.
        </p>
      </div>
      <div className="ml-4 shrink-0">
        <CurrencySelector
          currentCurrency={currentCurrency}
          onCurrencyChange={onCurrencyChange}
        />
      </div>
    </div>
  );
}

