"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Dices,
  ShieldAlert,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CurrencySettingRow } from "@/components/economy/currency-selector";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { generateRunnerName } from "@/utils/name-generator";

export function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const player = usePlayerStore((state) => state.player);
  const setPlayerName = usePlayerStore((state) => state.setPlayerName);
  const {
    settings,
    setSound,
    setLanguage,
    setTheme,
    setPreferences,
    setPreferredCurrency,
    resetAllData,
  } = useSettingsStore();
  const { playSound } = useSound();

  const [nameInput, setNameInput] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasInitializedName, setHasInitializedName] = useState(false);
  const [hasNameError, setHasNameError] = useState(false);

  useEffect(() => {
    if (player?.name && !hasInitializedName) {
      setNameInput(player.name);
      setHasInitializedName(true);
    }
  }, [player?.name, hasInitializedName]);

  const handleNameChange = (val: string) => {
    setNameInput(val);
    if (val.trim()) {
      setPlayerName(val.trim());
      setHasNameError(false);
    } else {
      setHasNameError(true);
    }
  };

  const handleRegenerateName = () => {
    playSound("click");
    const newName = generateRunnerName();
    setNameInput(newName);
    setPlayerName(newName);
    setHasNameError(false);
  };

  const handlePreferencesChange = (
    key: "preferredSurface" | "preferredDistance",
    value: string,
  ) => {
    playSound("click");
    const updated = {
      ...settings.preferences,
      [key]: value,
    };
    setPreferences(updated as typeof settings.preferences);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-[100dvh] bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col pb-16 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-gray-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              if (!nameInput.trim()) {
                setHasNameError(true);
                return;
              }
              router.push("/");
            }}
            aria-label={t("settings.title" as TranslationKey)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              {t("settings.title" as TranslationKey)}
            </h1>
            <p className="text-xs text-gray-550 dark:text-gray-350">
              {t("settings.subtitle" as TranslationKey)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-8">
        {/* General Settings */}
        <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
            {t("settings.sections.general" as TranslationKey)}
          </h2>

          {/* Runner Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-gray-550" />{" "}
                {t("settings.name.title" as TranslationKey)}
              </span>
              <span className="text-xs text-gray-400">
                {t("settings.name.desc" as TranslationKey)}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:max-w-xs">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  maxLength={24}
                  aria-label={t("settings.name.title" as TranslationKey)}
                  aria-invalid={hasNameError}
                  aria-describedby={hasNameError ? "settings-name-error" : undefined}
                  className={`flex-grow min-h-[44px] border rounded-xl px-3.5 py-2 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white font-bold transition-all ${
                    hasNameError
                      ? "border-red-500"
                      : "border-[#E5E7EB] dark:border-slate-700"
                  }`}
                  placeholder="Runner Name"
                />
                <button
                  type="button"
                  onClick={handleRegenerateName}
                  aria-label="Roll for random name"
                  className="min-h-[44px] min-w-[44px] p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-gray-300 rounded-xl transition-all shadow-sm flex items-center justify-center border border-[#E5E7EB] dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  title="Roll for random name"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>
              {hasNameError && (
                <p
                  id="settings-name-error"
                  role="alert"
                  className="text-[11px] text-red-500 font-bold px-1 leading-none"
                >
                  {t("settings.name.error" as TranslationKey)}
                </p>
              )}
            </div>
          </div>

          <hr className="border-[#E5E7EB] dark:border-slate-800" />

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Volume2 className="h-4.5 w-4.5 text-gray-550" />{" "}
                {t("settings.sound.title" as TranslationKey)}
              </span>
              <span className="text-xs text-gray-400">
                {t("settings.sound.desc" as TranslationKey)}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.sound}
              aria-label={t("settings.sound.title" as TranslationKey)}
              onClick={() => {
                playSound("click");
                setSound(!settings.sound);
              }}
              className={`w-14 h-8 shrink-0 rounded-full p-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                settings.sound ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <div
                className={`bg-white dark:bg-slate-900 w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.sound ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Theme selection (temporarily disabled for Sprint 13.1) */}
          {false && (
            <>
              <hr className="border-[#E5E7EB]" />
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("settings.theme.title" as TranslationKey)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t("settings.theme.desc" as TranslationKey)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(["light", "dark", "system"] as const).map((themeMode) => (
                    <button
                      key={themeMode}
                      type="button"
                      onClick={() => {
                        playSound("click");
                        setTheme(themeMode);
                      }}
                      className={`text-xs font-bold py-3 rounded-2xl transition-all border-2 capitalize ${
                        settings.theme === themeMode
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-200 bg-white dark:bg-slate-900 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {t(`settings.theme.${themeMode}` as TranslationKey)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <hr className="border-[#E5E7EB] dark:border-slate-800" />

          {/* Language selection */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {t("settings.language.title" as TranslationKey)}
              </span>
              <span className="text-xs text-gray-400">
                {t("settings.language.desc" as TranslationKey)}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label={t("settings.language.title" as TranslationKey)}
              className="grid grid-cols-2 gap-3 mt-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={settings.language === "en"}
                onClick={() => {
                  playSound("click");
                  setLanguage("en");
                }}
                className={`text-sm font-bold py-3 min-h-[44px] rounded-2xl transition-all border-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  settings.language === "en"
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-400"
                    : "border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {t("language.english" as TranslationKey)}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={settings.language === "id"}
                onClick={() => {
                  playSound("click");
                  setLanguage("id");
                }}
                className={`text-sm font-bold py-3 min-h-[44px] rounded-2xl transition-all border-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  settings.language === "id"
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-400"
                    : "border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {t("language.indonesian" as TranslationKey)}
              </button>
            </div>
          </div>

          <hr className="border-[#E5E7EB] dark:border-slate-800" />

          {/* Currency preference */}
          <CurrencySettingRow
            currentCurrency={settings.preferredCurrency || "USD"}
            onCurrencyChange={(currency) => {
              playSound("click");
              setPreferredCurrency(currency);
            }}
          />
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50/40 dark:bg-red-950/10 rounded-[2rem] border border-red-100/30 dark:border-red-950/30 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />{" "}
            {t("settings.sections.danger_zone" as TranslationKey)}
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex flex-col max-w-[70%]">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {t("settings.danger.reset" as TranslationKey)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("settings.danger.desc" as TranslationKey)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setShowResetConfirm(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-2xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <Trash2 className="h-4 w-4" />{" "}
              {t("settings.danger.button" as TranslationKey)}
            </button>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-red-200 dark:border-red-950/30 p-6 max-w-sm w-full shadow-xl flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-full text-red-600 dark:text-red-400 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white font-heading">
                {t("settings.danger.modal_title" as TranslationKey)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("settings.danger.modal_desc" as TranslationKey)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setShowResetConfirm(false);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              >
                {t("settings.danger.cancel" as TranslationKey)}
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  resetAllData();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                {t("settings.danger.confirm" as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
