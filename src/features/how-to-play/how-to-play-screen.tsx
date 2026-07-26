"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Flame,
  HelpCircle,
  Info,
  Lightbulb,
  ShoppingBag,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { useSettingsStore } from "@/store/settings-store";

type GuideTab = "scheduling" | "economy" | "shop" | "training" | "race_day" | "progression";

export function HowToPlayScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { setLanguage } = useSettingsStore();
  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState<GuideTab>("scheduling");

  const tabs: { id: GuideTab; titleKey: TranslationKey; icon: React.ReactNode; color: string }[] = [
    {
      id: "scheduling",
      titleKey: "how_to_play.sections.scheduling.title",
      icon: <Calendar className="w-5 h-5 text-indigo-500" />,
      color: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    },
    {
      id: "economy",
      titleKey: "how_to_play.sections.economy.title",
      icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
      color: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    },
    {
      id: "shop",
      titleKey: "how_to_play.sections.shop.title",
      icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      color: "from-blue-500/10 via-blue-500/5 to-transparent",
    },
    {
      id: "training",
      titleKey: "how_to_play.sections.training.title",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      color: "from-amber-500/10 via-amber-500/5 to-transparent",
    },
    {
      id: "race_day",
      titleKey: "how_to_play.sections.race_day.title",
      icon: <Timer className="w-5 h-5 text-rose-500" />,
      color: "from-rose-500/10 via-rose-500/5 to-transparent",
    },
    {
      id: "progression",
      titleKey: "how_to_play.sections.progression.title",
      icon: <Trophy className="w-5 h-5 text-purple-500" />,
      color: "from-purple-500/10 via-purple-500/5 to-transparent",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 md:px-6 py-4 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              aria-label={t("how_to_play.back" as TranslationKey)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-indigo-500" />
                {t("how_to_play.title" as TranslationKey)}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t("how_to_play.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setLanguage("en");
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                language === "en"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setLanguage("id");
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                language === "id"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ID
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 relative z-10">
        {/* Pro Tip Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/20 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              {t("how_to_play.pro_tip_title" as TranslationKey)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
              {t("how_to_play.pro_tip_desc" as TranslationKey)}
            </p>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs / Section Selectors */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playSound("click");
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border shrink-0 ${
                  isActive
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className={isActive ? "text-white" : ""}>{tab.icon}</span>
                <span>{t(tab.titleKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="flex flex-col gap-6">
          {tabs.map((tab) => {
            if (activeTab !== tab.id) return null;

            const titleKey = `how_to_play.sections.${tab.id}.title` as TranslationKey;
            const descKey = `how_to_play.sections.${tab.id}.desc` as TranslationKey;
            const item1Key = `how_to_play.sections.${tab.id}.item1` as TranslationKey;
            const item2Key = `how_to_play.sections.${tab.id}.item2` as TranslationKey;
            const item3Key = `how_to_play.sections.${tab.id}.item3` as TranslationKey;

            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-50 pointer-events-none`} />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                    {tab.icon}
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black font-heading text-slate-900 dark:text-white">
                      {t(titleKey)}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(descKey)}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800 relative z-10" />

                <div className="flex flex-col gap-4 relative z-10">
                  {[item1Key, item2Key, item3Key].map((itemKey, idx) => (
                    <div
                      key={itemKey}
                      className="flex items-start gap-3 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl transition hover:border-indigo-500/40"
                    >
                      <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-500 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {t(itemKey)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Direct Action Link Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
                  {tab.id === "shop" && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("click");
                        router.push("/shop");
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>🏪 {t("nav.shop" as TranslationKey)} →</span>
                    </button>
                  )}
                  {tab.id === "training" && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("click");
                        router.push("/training");
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>🏃 {t("home.daily_training" as TranslationKey)} →</span>
                    </button>
                  )}
                  {tab.id === "economy" && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("click");
                        router.push("/economy");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>💰 {t("nav.economy" as TranslationKey)} →</span>
                    </button>
                  )}
                  {tab.id === "progression" && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("click");
                        router.push("/profile");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>👤 {t("home.runner_profile" as TranslationKey)} →</span>
                    </button>
                  )}
                  {(tab.id === "scheduling" || tab.id === "race_day") && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("click");
                        router.push("/");
                      }}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <span>🏁 {t("nav.home" as TranslationKey)} →</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* All Sections Overview List */}
        <div className="mt-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">
            Quick Navigation Topics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tabs.map((tItem) => (
              <button
                key={tItem.id}
                type="button"
                onClick={() => {
                  playSound("click");
                  setActiveTab(tItem.id);
                  window.scrollTo({ top: 150, behavior: "smooth" });
                }}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  activeTab === tItem.id
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {tItem.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black truncate block">
                    {t(`how_to_play.sections.${tItem.id}.title` as TranslationKey)}
                  </span>
                </div>
                {activeTab === tItem.id && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Official Disclaimer & Offline Notice */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Info className="h-4 w-4 shrink-0" />
            <h4 className="font-heading font-black uppercase tracking-wider">
              {t("disclaimer.title" as TranslationKey)}
            </h4>
          </div>
          <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2 bg-white/70 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-sm shrink-0">⚡</span>
              <p>{t("disclaimer.offline_info" as TranslationKey)}</p>
            </div>
            <div className="flex items-start gap-2 bg-white/70 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-sm shrink-0">⚠️</span>
              <p>{t("disclaimer.unofficial_notice" as TranslationKey)}</p>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
