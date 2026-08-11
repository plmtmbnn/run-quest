"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
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

type GuideTab =
  | "scheduling"
  | "economy"
  | "shop"
  | "training"
  | "race_day"
  | "progression";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.28, ease: "easeOut" },
  }),
};

const TAB_CONFIG: {
  id: GuideTab;
  titleKey: TranslationKey;
  emoji: string;
  icon: React.ElementType;
  accent: string; // tailwind color name used in dynamic classes
  gradient: string;
  iconBg: string;
  iconText: string;
  border: string;
  activeBg: string;
  activeText: string;
  cta: { label: string; route: string; bg: string; shadow: string } | null;
}[] = [
  {
    id: "scheduling",
    titleKey: "how_to_play.sections.scheduling.title",
    emoji: "🗓️",
    icon: Calendar,
    accent: "indigo",
    gradient: "from-indigo-500/15 via-violet-500/5 to-transparent",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconText: "text-indigo-500",
    border: "border-indigo-100 dark:border-indigo-900/60",
    activeBg: "bg-indigo-50 dark:bg-indigo-950/40",
    activeText: "text-indigo-700 dark:text-indigo-300",
    cta: {
      label: "🏁 Go Home →",
      route: "/",
      bg: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30",
      shadow: "shadow-md",
    },
  },
  {
    id: "economy",
    titleKey: "how_to_play.sections.economy.title",
    emoji: "💼",
    icon: Briefcase,
    accent: "emerald",
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconText: "text-emerald-500",
    border: "border-emerald-100 dark:border-emerald-900/60",
    activeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    activeText: "text-emerald-700 dark:text-emerald-300",
    cta: {
      label: "💰 Economy →",
      route: "/economy",
      bg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
      shadow: "shadow-md",
    },
  },
  {
    id: "shop",
    titleKey: "how_to_play.sections.shop.title",
    emoji: "🏪",
    icon: ShoppingBag,
    accent: "blue",
    gradient: "from-blue-500/15 via-sky-500/5 to-transparent",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconText: "text-blue-500",
    border: "border-blue-100 dark:border-blue-900/60",
    activeBg: "bg-blue-50 dark:bg-blue-950/40",
    activeText: "text-blue-700 dark:text-blue-300",
    cta: {
      label: "🏪 Shop →",
      route: "/shop",
      bg: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
      shadow: "shadow-md",
    },
  },
  {
    id: "training",
    titleKey: "how_to_play.sections.training.title",
    emoji: "🏃",
    icon: Zap,
    accent: "amber",
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconText: "text-amber-500",
    border: "border-amber-100 dark:border-amber-900/60",
    activeBg: "bg-amber-50 dark:bg-amber-950/40",
    activeText: "text-amber-700 dark:text-amber-300",
    cta: {
      label: "🏃 Training →",
      route: "/training",
      bg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
      shadow: "shadow-md",
    },
  },
  {
    id: "race_day",
    titleKey: "how_to_play.sections.race_day.title",
    emoji: "⏱️",
    icon: Timer,
    accent: "rose",
    gradient: "from-rose-500/15 via-pink-500/5 to-transparent",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    iconText: "text-rose-500",
    border: "border-rose-100 dark:border-rose-900/60",
    activeBg: "bg-rose-50 dark:bg-rose-950/40",
    activeText: "text-rose-700 dark:text-rose-300",
    cta: {
      label: "🏁 Go Home →",
      route: "/",
      bg: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30",
      shadow: "shadow-md",
    },
  },
  {
    id: "progression",
    titleKey: "how_to_play.sections.progression.title",
    emoji: "🏆",
    icon: Trophy,
    accent: "purple",
    gradient: "from-purple-500/15 via-violet-500/5 to-transparent",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconText: "text-purple-500",
    border: "border-purple-100 dark:border-purple-900/60",
    activeBg: "bg-purple-50 dark:bg-purple-950/40",
    activeText: "text-purple-700 dark:text-purple-300",
    cta: {
      label: "👤 My Profile →",
      route: "/profile",
      bg: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/30",
      shadow: "shadow-md",
    },
  },
];

export function HowToPlayScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { setLanguage } = useSettingsStore();
  const { playSound } = useSound();
  const [activeTab, setActiveTab] = useState<GuideTab>("scheduling");

  const activeConfig = TAB_CONFIG.find((c) => c.id === activeTab)!;

  const handleTabChange = (id: GuideTab) => {
    playSound("click");
    setActiveTab(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/4 dark:bg-emerald-500/8 rounded-full blur-[160px] pointer-events-none" />

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        {/* rainbow accent bar */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                if (window.history.length > 1) router.back();
                else router.push("/");
              }}
              aria-label={t("how_to_play.back" as TranslationKey)}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2 leading-tight">
                <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                {t("how_to_play.title" as TranslationKey)}
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5">
                {t("how_to_play.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-full shadow-sm">
            {(["en", "id"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  playSound("click");
                  setLanguage(lang);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                  language === lang
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 relative z-10">
        {/* Pro Tip Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/30 dark:border-amber-500/30 rounded-2xl p-4 md:p-5 flex items-start gap-3 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent pointer-events-none" />
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl shadow-md shadow-amber-500/30 shrink-0 relative">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="relative">
            <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
              {t("how_to_play.pro_tip_title" as TranslationKey)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
              {t("how_to_play.pro_tip_desc" as TranslationKey)}
            </p>
          </div>
        </div>

        {/* ── Tab Pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap border shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-white" : tab.iconText}`}
                />
                {t(tab.titleKey)
                  .replace(/^[\p{Emoji}\s]+/u, "")
                  .trim()}
              </button>
            );
          })}
        </div>

        {/* ── Active Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`relative overflow-hidden bg-white dark:bg-slate-900 border ${activeConfig.border} rounded-[2rem] shadow-sm flex flex-col gap-5 p-5 sm:p-6`}
          >
            {/* gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${activeConfig.gradient} pointer-events-none`}
            />
            {/* decorative circle */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-current opacity-[0.04] text-current pointer-events-none"
              style={{ color: "inherit" }}
            />

            {/* Section header */}
            <div className="flex items-center gap-3 relative z-10">
              <div
                className={`p-2.5 rounded-2xl ${activeConfig.iconBg} border ${activeConfig.border} shrink-0`}
              >
                <activeConfig.icon
                  className={`w-5 h-5 ${activeConfig.iconText}`}
                />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-black font-heading text-slate-900 dark:text-white">
                  {t(
                    `how_to_play.sections.${activeTab}.title` as TranslationKey,
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t(
                    `how_to_play.sections.${activeTab}.desc` as TranslationKey,
                  )}
                </p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-slate-100 via-slate-200 to-transparent dark:from-slate-800 dark:via-slate-700 relative z-10" />

            {/* Step cards */}
            <div className="flex flex-col gap-3 relative z-10">
              {[1, 2, 3].map((n, idx) => (
                <motion.div
                  key={n}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="flex items-start gap-3 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70 p-4 rounded-2xl hover:border-indigo-300/50 dark:hover:border-indigo-700/50 transition-colors"
                >
                  <div
                    className={`h-6 w-6 rounded-full ${activeConfig.iconBg} ${activeConfig.iconText} font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-mono`}
                  >
                    {n}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {t(
                      `how_to_play.sections.${activeTab}.item${n}` as TranslationKey,
                    )}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA footer */}
            {activeConfig.cta && (
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    router.push(activeConfig.cta!.route);
                  }}
                  className={`px-4 py-2 ${activeConfig.cta.bg} ${activeConfig.cta.shadow} text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 flex items-center gap-1.5`}
                >
                  {activeConfig.cta.label}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Quick Navigation Grid ── */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TAB_CONFIG.map((tItem) => {
              const isActive = activeTab === tItem.id;
              const Icon = tItem.icon;
              return (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => {
                    handleTabChange(tItem.id);
                    window.scrollTo({ top: 140, behavior: "smooth" });
                  }}
                  className={`group p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-95 ${
                    isActive
                      ? `${tItem.activeBg} ${tItem.border} shadow-sm`
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl ${isActive ? tItem.iconBg : "bg-slate-100 dark:bg-slate-800"} shrink-0 transition-colors`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? tItem.iconText : "text-slate-500 dark:text-slate-400"}`}
                    />
                  </div>
                  <span
                    className={`text-xs font-black flex-1 min-w-0 truncate ${isActive ? tItem.activeText : "text-slate-700 dark:text-slate-300"}`}
                  >
                    {t(
                      `how_to_play.sections.${tItem.id}.title` as TranslationKey,
                    )
                      .replace(/^[\p{Emoji}\s]+/u, "")
                      .trim()}
                  </span>
                  {isActive ? (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${tItem.iconText} shrink-0`}
                    />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 relative z-10">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <Info className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <h4 className="font-heading font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {t("disclaimer.title" as TranslationKey)}
            </h4>
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {[
              { emoji: "⚡", key: "disclaimer.offline_info" as TranslationKey },
              {
                emoji: "⚠️",
                key: "disclaimer.unofficial_notice" as TranslationKey,
              },
            ].map(({ emoji, key }) => (
              <div
                key={key}
                className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80"
              >
                <span className="text-sm shrink-0 leading-tight mt-0.5">
                  {emoji}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(key)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
