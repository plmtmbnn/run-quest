"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { COUNTRIES_DATA, type CountryData, getCountryByCode } from "@/config/countries-data";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface SearchableCountrySelectProps {
  selectedCode: string;
  onSelect: (country: CountryData) => void;
  label?: string;
}

export function SearchableCountrySelect({
  selectedCode,
  onSelect,
  label,
}: SearchableCountrySelectProps) {
  const { t, language } = useTranslation();
  const { playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalId = useId();

  const activeCountry = getCountryByCode(selectedCode);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredCountries = COUNTRIES_DATA.filter((country) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameEn = country.name.en.toLowerCase();
    const nameId = country.name.id.toLowerCase();
    const code = country.code.toLowerCase();
    return nameEn.includes(q) || nameId.includes(q) || code.includes(q);
  });

  const featuredList = filteredCountries.filter((c) => c.isFeatured);
  const allList = filteredCountries.filter((c) => !c.isFeatured);

  const handleSelectCountry = (country: CountryData) => {
    playSound("click");
    onSelect(country);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      {label && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-500" /> {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          playSound("click");
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={modalId}
        className="w-full min-h-[44px] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-white font-bold transition flex items-center justify-between shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-xl leading-none">{activeCountry.flag}</span>
          <span className="text-sm truncate">
            {language === "id" ? activeCountry.name.id : activeCountry.name.en}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {activeCountry.code}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {/* Dropdown Modal / Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            {/* Backdrop click */}
            <div
              className="absolute inset-0"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              id={modalId}
              role="dialog"
              aria-modal="true"
              aria-label="Select Country"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              {/* Header with Search */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-black text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    {t("onboarding.nationality.title" as TranslationKey) || "Select Nationality"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                    aria-label="Close country selection modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country name or code..."
                    className="w-full pl-10 pr-9 py-2.5 text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[60vh]">
                {filteredCountries.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    No countries found matching "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {/* Featured Section */}
                    {featuredList.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                          ⭐ Featured Nations
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {featuredList.map((c) => (
                            <CountryRow
                              key={c.code}
                              country={c}
                              isSelected={c.code === selectedCode}
                              language={language}
                              onSelect={() => handleSelectCountry(c)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Nations Section */}
                    {allList.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          🌍 All Countries
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {allList.map((c) => (
                            <CountryRow
                              key={c.code}
                              country={c}
                              isSelected={c.code === selectedCode}
                              language={language}
                              onSelect={() => handleSelectCountry(c)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountryRow({
  country,
  isSelected,
  language,
  onSelect,
}: {
  country: CountryData;
  isSelected: boolean;
  language: string;
  onSelect: () => void;
}) {
  const name = language === "id" ? country.name.id : country.name.en;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-center justify-between text-xs font-bold border ${
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300"
          : "bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl leading-none">{country.flag}</span>
        <span>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          {country.code}
        </span>
        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
      </div>
    </button>
  );
}
