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
      className="min-h-screen bg-background flex flex-col pb-16"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-surface/90 px-6 py-4 backdrop-blur-md">
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
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
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
        <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-6">
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
                  className={`flex-grow border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white text-gray-800 dark:text-white font-bold transition-all ${
                    hasNameError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-250 dark:border-gray-850"
                  }`}
                  placeholder="Runner Name"
                />
                <button
                  type="button"
                  onClick={handleRegenerateName}
                  className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-205 dark:hover:bg-slate-700 active:scale-95 text-gray-650 dark:text-gray-300 rounded-xl transition-all shadow-sm flex items-center justify-center border border-gray-250/20"
                  title="Roll for random name"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>
              {hasNameError && (
                <p className="text-[11px] text-red-500 font-bold px-1 leading-none">
                  {t("settings.name.error" as TranslationKey)}
                </p>
              )}
            </div>
          </div>

          <hr className="border-[#E5E7EB]" />

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
              onClick={() => {
                playSound("click");
                setSound(!settings.sound);
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.sound ? "bg-blue-600" : "bg-gray-200"
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

          <hr className="border-[#E5E7EB]" />

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
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setLanguage("en");
                }}
                className={`text-sm font-bold py-3 rounded-2xl transition-all border-2 ${
                  settings.language === "en"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-200 bg-white dark:bg-slate-900 text-gray-600 hover:border-gray-300"
                }`}
              >
                {t("language.english" as TranslationKey)}
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setLanguage("id");
                }}
                className={`text-sm font-bold py-3 rounded-2xl transition-all border-2 ${
                  settings.language === "id"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-200 bg-white dark:bg-slate-900 text-gray-600 hover:border-gray-300"
                }`}
              >
                {t("language.indonesian" as TranslationKey)}
              </button>
            </div>
          </div>
        </section>

        {/* Running Preferences */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
            {t("settings.sections.race_preferences" as TranslationKey)}
          </h2>
          <p className="text-xs text-gray-400 -mt-2">
            {t("settings.preferences.desc" as TranslationKey)}
          </p>

          {/* Preferred Surface */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {t("settings.preferences.surface" as TranslationKey)}
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {["any", "road", "trail", "track"].map((surface) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() =>
                    handlePreferencesChange("preferredSurface", surface)
                  }
                  className={`text-xs font-bold py-3 rounded-2xl transition-all border-2 ${
                    settings.preferences.preferredSurface === surface
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white dark:bg-slate-900 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t(
                    `challenge.surface.${surface}` as TranslationKey,
                  ).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Distance */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {t("settings.preferences.distance" as TranslationKey)}
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {["any", "short", "medium", "long"].map((distance) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() =>
                    handlePreferencesChange("preferredDistance", distance)
                  }
                  className={`text-xs font-bold py-3 rounded-2xl transition-all border-2 ${
                    settings.preferences.preferredDistance === distance
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white dark:bg-slate-900 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t(
                    `challenge.distance_types.${distance}` as TranslationKey,
                  ).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50/50 rounded-3xl border-2 border-red-200 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-red-650" />{" "}
            {t("settings.sections.danger_zone" as TranslationKey)}
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex flex-col max-w-[70%]">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {t("settings.danger.reset" as TranslationKey)}
              </span>
              <span className="text-xs text-gray-550 leading-relaxed">
                {t("settings.danger.desc" as TranslationKey)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setShowResetConfirm(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
            >
              <Trash2 className="h-4 w-4" />{" "}
              {t("settings.danger.button" as TranslationKey)}
            </button>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-200 p-6 max-w-sm w-full shadow-lg flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="bg-red-100 p-3 rounded-full text-red-650 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white font-heading">
                {t("settings.danger.modal_title" as TranslationKey)}
              </h3>
              <p className="text-xs text-gray-550 leading-relaxed">
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
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold text-xs py-3 rounded-2xl transition-all"
              >
                {t("settings.danger.cancel" as TranslationKey)}
              </button>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  resetAllData();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-sm"
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
