/**
 * Currency Selector Component (Sprint 26.5 - Task 3.4)
 *
 * Dropdown for selecting preferred display currency.
 * Mobile-first, responsive, theme-aware, and accessible.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CurrencyCode } from "@/economy/currency-config";
import { getAllCurrencies, getCurrencyConfig } from "@/economy/currency-config";
import { getCurrencyComparison } from "@/economy/currency-converter";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface CurrencySelectorProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

// Interpolate {placeholder} tokens in translation strings.
function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export function CurrencySelector({
  currentCurrency,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const currencies = getAllCurrencies();
  const currentConfig = getCurrencyConfig(currentCurrency);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = currencies.findIndex((c) => c.code === currentCurrency);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      // Prevent background scroll while the menu/sheet is open
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, currentIndex]);

  const handleSelect = (code: CurrencyCode) => {
    onCurrencyChange(code);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % currencies.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + currencies.length) % currencies.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect(currencies[activeIndex].code);
        break;
    }
  };

  return (
    <div className="relative">
      {/* Current Selection Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={interpolate(t("settings.currency.trigger_label" as TranslationKey), {
          name: currentConfig.name,
        })}
        className="flex items-center gap-2.5 px-4 min-h-[44px] bg-slate-900/80 hover:bg-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 rounded-xl border border-slate-700/60 hover:border-slate-600 dark:border-slate-700 dark:hover:border-slate-600 transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span className="text-2xl">{currentConfig.flag}</span>
        <div className="text-left">
          <div className="text-sm font-bold text-white tracking-tight">
            {currentConfig.code}
          </div>
          <div className="text-[11px] text-slate-400">{currentConfig.name}</div>
        </div>
        <span
          className={`text-slate-400 ml-1 text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Desktop dropdown (sm and up): anchored under the trigger */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              role="listbox"
              aria-label={t("settings.currency.listbox_label" as TranslationKey)}
              aria-activedescendant={`currency-option-${currencies[activeIndex].code}`}
              className="hidden sm:block absolute top-full mt-2 left-0 z-20 min-w-[280px] max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
            >
            <div className="p-1.5 space-y-0.5">
              {currencies.map((currency, idx) => {
                const isSelected = currency.code === currentCurrency;
                const isActive = idx === activeIndex;
                const example = getCurrencyComparison(500, "USD", currency.code);

                return (
                  <button
                    key={currency.code}
                    id={`currency-option-${currency.code}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(currency.code)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`
                      w-full px-3 py-2.5 min-h-[44px] flex items-center gap-3 transition-all duration-150 rounded-xl text-left
                      ${
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800/80"
                          : ""
                      }
                      ${
                        isSelected
                          ? "border border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white"
                          : "border border-transparent text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                      }
                    `}
                  >
                    <span className="text-xl shrink-0">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">
                          {currency.code}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600 text-xs">
                          •
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {currency.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {interpolate(t("settings.currency.example" as TranslationKey), {
                          amount: example,
                        })}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-indigo-500 dark:text-indigo-400 text-sm shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile bottom sheet (< sm): full-width, slides up from bottom */}
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Tap-away backdrop */}
            <button
              type="button"
              aria-label={t("settings.currency.listbox_label" as TranslationKey)}
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              role="dialog"
              aria-modal="true"
              aria-label={t("settings.currency.listbox_label" as TranslationKey)}
              className="bg-white dark:bg-slate-900 border-t border-[#E5E7EB] dark:border-slate-700 rounded-t-[2rem] shadow-2xl shadow-black/30 max-h-[75vh] flex flex-col"
            >
              {/* Grab handle */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div
                role="listbox"
                aria-label={t("settings.currency.listbox_label" as TranslationKey)}
                aria-activedescendant={`currency-option-${currencies[activeIndex].code}`}
                className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto"
              >
                {currencies.map((currency, idx) => {
                  const isSelected = currency.code === currentCurrency;
                  const isActive = idx === activeIndex;
                  const example = getCurrencyComparison(500, "USD", currency.code);

                  return (
                    <button
                      key={currency.code}
                      id={`currency-option-${currency.code}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(currency.code)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`
                        w-full px-3 py-3 min-h-[52px] flex items-center gap-3 transition-all duration-150 rounded-2xl text-left mb-1
                        ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800/80"
                            : ""
                        }
                        ${
                          isSelected
                            ? "border border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white"
                            : "border border-transparent text-slate-700 dark:text-slate-200"
                        }
                      `}
                    >
                      <span className="text-2xl shrink-0">{currency.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm">
                            {currency.code}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600 text-xs">
                            •
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {currency.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {interpolate(t("settings.currency.example" as TranslationKey), {
                            amount: example,
                          })}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-indigo-500 dark:text-indigo-400 text-base shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
        )}
      </AnimatePresence>
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#E5E7EB] dark:border-slate-800/60">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t("settings.currency.title" as TranslationKey)}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t("settings.currency.desc" as TranslationKey)}
        </p>
      </div>
      <div className="sm:ml-4 shrink-0">
        <CurrencySelector
          currentCurrency={currentCurrency}
          onCurrencyChange={onCurrencyChange}
        />
      </div>
    </div>
  );
}
