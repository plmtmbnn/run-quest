"use client";

import { Globe } from "lucide-react";
import type { Language } from "@/i18n/types";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  {
    code: "id",
    label: "Bahasa Indonesia",
    nativeLabel: "Bahasa Indonesia",
    flag: "🇮🇩",
  },
];

interface LanguageSelectionScreenProps {
  onComplete: () => void;
}

/**
 * Language selection screen shown on first visit.
 * Persists the selected language to both settings and player stores.
 */
export function LanguageSelectionScreen({
  onComplete,
}: LanguageSelectionScreenProps) {
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setPlayerLanguage = usePlayerStore((state) => state.setLanguage);

  function handleSelect(lang: Language) {
    setLanguage(lang);
    setPlayerLanguage(lang);
    onComplete();
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2 font-heading">
          Choose Your Language
        </h1>
        <p className="text-sm text-center text-gray-500 mb-10">
          You can change this later in settings.
        </p>

        {/* Language options */}
        <div className="flex flex-col gap-4">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              id={`language-option-${option.code}`}
              type="button"
              onClick={() => handleSelect(option.code)}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-[#E5E7EB] rounded-3xl text-left transition-all duration-200 hover:border-blue-500 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-3xl" role="img" aria-label={option.label}>
                {option.flag}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-gray-900 text-base">
                  {option.nativeLabel}
                </span>
              </span>
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
