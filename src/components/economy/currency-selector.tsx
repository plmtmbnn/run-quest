"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CurrencyCode } from "@/economy/currency-config";
import { getAllCurrencies, getCurrencyConfig } from "@/economy/currency-config";
import { getCurrencyComparison } from "@/economy/currency-converter";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface Props {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
}

function interpolate(
  tpl: string,
  vars: Record<string, string | number>,
): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : "{" + k + "}",
  );
}

/* ------------------------------------------------------------------ */
/*  CurrencySelector – trigger button only (inline, no dropdown)       */
/* ------------------------------------------------------------------ */

export function CurrencySelector({ currentCurrency, onCurrencyChange }: Props) {
  const { t } = useTranslation();
  const cfg = getCurrencyConfig(currentCurrency);

  return (
    <button
      type="button"
      onClick={() => onCurrencyChange(currentCurrency)} // opens bottom sheet via handler
      className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 min-h-[44px] bg-slate-900/80 hover:bg-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-700 rounded-xl border border-slate-700/40 text-white text-sm font-bold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={t("settings.currency.select" as TranslationKey)}
    >
      <span className="text-xl">{cfg.flag}</span>
      <span className="truncate max-w-[80px] md:max-w-none">{cfg.code}</span>
      <ChevronDown className="h-4 w-4 ml-auto text-slate-400 shrink-0" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CurrencyBottomSheet – mobile-first bottom sheet / desktop popover  */
/* ------------------------------------------------------------------ */

interface CurrencyBottomSheetProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  open: boolean;
  onClose: () => void;
}

function CurrencyBottomSheet({
  currentCurrency,
  onCurrencyChange,
  open,
  onClose,
}: CurrencyBottomSheetProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const currencies = getAllCurrencies();

  // Focus search input when sheet opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(id);
    }
    setQuery("");
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const filtered = query.trim()
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : currencies;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
          {/* Tap-away backdrop */}
          <button
            type="button"
            aria-label={t("settings.currency.backdrop" as TranslationKey)}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:bg-black/60"
          />

          {/* Panel: bottom sheet on mobile, centered dialog on sm+ */}
          <motion.div
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="currency-picker-title"
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border-t border-[#E5E7EB] dark:border-slate-800 sm:border sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl shadow-black/30 max-h-[80vh] flex flex-col"
          >
            {/* Grab handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-3 sm:pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3
                id="currency-picker-title"
                className="font-heading font-black text-lg text-slate-800 dark:text-white"
              >
                {t("settings.currency.title" as TranslationKey)}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  ×
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("settings.currency.search" as TranslationKey)}
                  className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="px-5 py-2 overflow-y-auto flex-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                  {t("settings.currency.no_results" as TranslationKey)}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map((c) => {
                    const selected = c.code === currentCurrency;
                    const example = getCurrencyComparison(500, "USD", c.code);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          onCurrencyChange(c.code);
                          onClose();
                        }}
                        className={`w-full min-h-[56px] flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none
                          ${
                            selected
                              ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400"
                              : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99]"
                          }`}
                        aria-selected={selected}
                      >
                        <span className="text-2xl shrink-0">{c.flag}</span>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800 dark:text-white">
                              {c.code}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {c.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {interpolate(
                              t("settings.currency.example" as TranslationKey),
                              { amount: example },
                            )}
                          </p>
                        </div>
                        {selected && (
                          <span className="text-indigo-500 dark:text-indigo-400 text-sm font-black shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  CurrencySettingRow – settings page row with inline trigger         */
/* ------------------------------------------------------------------ */

export function CurrencySettingRow({
  currentCurrency,
  onCurrencyChange,
}: Props) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 md:py-4 border-b border-[#E5E7EB] dark:border-slate-800/60">
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
            onCurrencyChange={() => setSheetOpen(true)}
          />
        </div>
      </div>

      <CurrencyBottomSheet
        currentCurrency={currentCurrency}
        onCurrencyChange={onCurrencyChange}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
