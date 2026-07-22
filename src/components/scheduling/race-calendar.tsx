"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, Trophy, Users } from "lucide-react";
import { useState } from "react";
import type { RaceOccurrence } from "../../scheduling/race-calendar-types";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";
import { formatCurrency } from "@/economy/currency-converter";
import { formatGameDate } from "@/engine/timeline/calendar";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

// Interpolate {placeholder} tokens in translation strings.
function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

/**
 * Empty state component matching social-screen.tsx style
 */
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
      <span className="text-4xl md:text-5xl mb-3">{icon}</span>
      <h3 className="font-heading font-black text-base text-slate-800 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function sortRegisteredRaces(
  races: RaceOccurrence[],
  currentDay: number,
): RaceOccurrence[] {
  const now = currentDay;
  const ninetyDays = 90;
  const finished: RaceOccurrence[] = [];
  const recent: RaceOccurrence[] = [];
  const upcoming: RaceOccurrence[] = [];

  for (const race of races) {
    if (race.isCompleted) {
      finished.push(race);
    } else if (race.dayIndex < now && now - race.dayIndex <= ninetyDays) {
      recent.push(race);
    } else {
      upcoming.push(race);
    }
  }

  finished.sort((a, b) => b.dayIndex - a.dayIndex);
  recent.sort((a, b) => b.dayIndex - a.dayIndex);
  upcoming.sort((a, b) => a.dayIndex - b.dayIndex);

  return [...finished, ...recent, ...upcoming];
}

/**
 * Animation variants matching social-screen patterns
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface RaceCalendarProps {
  todayRaces: RaceOccurrence[];
  upcomingRaces: RaceOccurrence[];
  registeredRaces: RaceOccurrence[];
  onRaceClick?: (race: RaceOccurrence) => void;
}

type TabType = "today" | "registered" | "upcoming";

const TAB_CONFIG = [
  { id: "today" as const, labelKey: "race_calendar.tabs.today" as TranslationKey, icon: "🏁", ariaBase: "Today's races" },
  { id: "registered" as const, labelKey: "race_calendar.tabs.registered" as TranslationKey, icon: "🎟️", ariaBase: "My registered races" },
  { id: "upcoming" as const, labelKey: "race_calendar.tabs.upcoming" as TranslationKey, icon: "🔮", ariaBase: "Upcoming races" },
] as const;

export function RaceCalendar({
  todayRaces,
  upcomingRaces,
  registeredRaces,
  onRaceClick,
}: RaceCalendarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const currentDayIndex = useTimelineStore.getState().gameState?.dayIndex ?? 0;

  const tabs = TAB_CONFIG.map((tab) => ({
    ...tab,
    count:
      tab.id === "today"
        ? todayRaces.length
        : tab.id === "registered"
          ? registeredRaces.length
          : upcomingRaces.length,
  }));

  const tabPanelId = `race-calendar-panel-${activeTab}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full max-w-3xl mx-auto flex flex-col"
    >
      {/* Tabs - matching social-screen pill style */}
      <div className="w-full px-4 sm:px-6 pt-4 sm:pt-6">
        <div
          role="tablist"
          aria-label={t("race_calendar.tabs.today" as TranslationKey)}
          className="flex bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-1.5 rounded-[1.75rem] shadow-sm"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabId = `race-calendar-tab-${tab.id}`;
            return (
              <button
                key={tab.id}
                id={tabId}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive}
                aria-controls={tabPanelId}
                className={`flex-1 min-h-[44px] py-2.5 sm:py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-[1.25rem] transition-all flex items-center justify-center gap-1 sm:gap-1.5
                  ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
                `}
              >
                <span aria-hidden="true" className="text-xs sm:text-sm shrink-0">
                  {tab.icon}
                </span>
                <span className={`${isActive ? "block" : "hidden sm:block"} truncate`}>
                  {t(tab.labelKey)}
                </span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                    aria-label={`${tab.count} ${tab.count === 1 ? "race" : "races"}`}
                  >
                    {tab.count}
                  </span>
                )}
                <span className="sr-only">
                  {`${tab.ariaBase}, ${tab.count} ${tab.count === 1 ? "race" : "races"}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main
        id={tabPanelId}
        role="tabpanel"
        aria-labelledby={`race-calendar-tab-${activeTab}`}
        className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col gap-4"
      >
        {activeTab === "today" && (
          <div className="flex flex-col gap-4">
            {todayRaces.length === 0 ? (
              <EmptyState
                icon="😴"
                title={t("race_calendar.empty.today_title" as TranslationKey)}
                description={t("race_calendar.empty.today_desc" as TranslationKey)}
              />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {todayRaces.map((race) => (
                  <RaceCard
                    key={race.scheduleId}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                    currentDayIndex={currentDayIndex}
                    variants={itemVariants}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "registered" && (
          <div className="flex flex-col gap-4">
            {registeredRaces.length === 0 ? (
              <EmptyState
                icon="🎟️"
                title={t("race_calendar.empty.registered_title" as TranslationKey)}
                description={t(
                  "race_calendar.empty.registered_desc" as TranslationKey,
                )}
              />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {sortRegisteredRaces(registeredRaces, currentDayIndex).map(
                  (race) => (
                    <RaceCard
                      key={`${race.scheduleId}_reg`}
                      race={race}
                      onClick={() => onRaceClick?.(race)}
                      currentDayIndex={currentDayIndex}
                      variants={itemVariants}
                    />
                  ),
                )}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "upcoming" && (
          <div className="flex flex-col gap-4">
            {upcomingRaces.length === 0 ? (
              <EmptyState
                icon="🔮"
                title={t("race_calendar.empty.upcoming_title" as TranslationKey)}
                description={t(
                  "race_calendar.empty.upcoming_desc" as TranslationKey,
                )}
              />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {upcomingRaces.map((race) => (
                  <UpcomingRaceCard
                    key={`${race.scheduleId}_${race.dayIndex}`}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                    variants={itemVariants}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  );
}

function RaceCard({
  race,
  onClick,
  currentDayIndex,
  variants,
}: {
  race: RaceOccurrence;
  onClick?: () => void;
  currentDayIndex: number;
  variants?: any;
}) {
  const { t } = useTranslation();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  const isCompleted = race.isCompleted;
  const isPast = race.dayIndex < currentDayIndex && !isCompleted;
  const isRaceDay = race.dayIndex === currentDayIndex;
  const isSoon =
    race.dayIndex > currentDayIndex && race.dayIndex - currentDayIndex <= 3;
  const isClickable = isRaceDay && !isCompleted;
  const isDisabled = isCompleted || isPast;
  const daysUntil = race.dayIndex - currentDayIndex;

  // Tier styling matching social-screen color patterns
  const tierConfig: Record<
    string,
    { bg: string; border: string; text: string; glow: string }
  > = {
    local: {
      bg: "bg-emerald-50/40 dark:bg-emerald-950/10",
      border: "border-emerald-100/30 dark:border-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    regional: {
      bg: "bg-blue-50/40 dark:bg-blue-950/10",
      border: "border-blue-100/30 dark:border-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      glow: "shadow-blue-500/10",
    },
    state: {
      bg: "bg-purple-50/40 dark:bg-purple-950/10",
      border: "border-purple-100/30 dark:border-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      glow: "shadow-purple-500/10",
    },
    national: {
      bg: "bg-amber-50/40 dark:bg-amber-950/10",
      border: "border-amber-100/30 dark:border-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/10",
    },
    international: {
      bg: "bg-rose-50/40 dark:bg-rose-950/10",
      border: "border-rose-100/30 dark:border-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      glow: "shadow-rose-500/10",
    },
  };

  const tier = tierConfig[race.tier] || tierConfig.local;

  const statusLabel = isCompleted
    ? t("race_calendar.status.completed" as TranslationKey)
    : isPast
      ? t("race_calendar.status.passed" as TranslationKey)
      : isRaceDay
        ? t("race_calendar.status.race_day" as TranslationKey)
        : interpolate(t("race_calendar.status.in_days" as TranslationKey), {
            days: daysUntil,
          });

  return (
    <motion.button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      whileHover={!isDisabled ? { scale: 1.01, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.99 } : {}}
      variants={variants}
      title={statusLabel}
      aria-label={`${race.name} - ${statusLabel}`}
      aria-disabled={!isClickable}
      className={`
        w-full text-left rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-4 sm:p-5 transition-all duration-200 shadow-sm flex flex-col gap-4
        ${isDisabled
          ? "bg-slate-50/70 dark:bg-slate-950/40 opacity-60 cursor-not-allowed"
          : race.isFull
            ? `bg-amber-50/40 dark:bg-amber-950/10 ${tier.border} ${tier.glow}`
            : `${tier.bg} ${tier.border} hover:${tier.glow} hover:shadow-md`
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
      `}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <span
            className={`text-2xl md:text-3xl shrink-0 p-2.5 bg-white/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 ${race.color}`}
          >
            {race.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-black text-sm md:text-base text-slate-800 dark:text-white tracking-tight truncate">
              {race.name}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {race.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Entry Fee Badge */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <DollarSign className="w-3 h-3" />
            {t("race_calendar.labels.entry_fee" as TranslationKey)}
          </div>
          <div className="text-sm md:text-base font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(race.entryFee, preferredCurrency)}
          </div>
        </div>
      </div>

      {/* Status Tags Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100/50 dark:border-slate-800/50">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {/* Tier Badge */}
          <span
            className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider ${tier.text} ${tier.bg} ${tier.border}`}
          >
            {race.tier}
          </span>

          {/* Status Badges */}
          {isCompleted && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-green-50/40 dark:bg-green-950/10 text-green-700 dark:text-green-300 border border-green-100/30 dark:border-green-950/30">
              ✓ {t("race_calendar.status.completed" as TranslationKey)}
            </span>
          )}

          {isPast && !isCompleted && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-gray-50/40 dark:bg-gray-950/10 text-gray-700 dark:text-gray-300 border border-gray-100/30 dark:border-gray-950/30">
              ⊗ {t("race_calendar.status.passed" as TranslationKey)}
            </span>
          )}

          {isRaceDay && !isDisabled && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100/30 dark:border-emerald-950/30 animate-pulse">
              🏁 {t("race_calendar.tabs.today" as TranslationKey)}!
            </span>
          )}

          {isSoon && !isDisabled && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-blue-50/40 dark:bg-blue-950/10 text-blue-700 dark:text-blue-300 border border-blue-100/30 dark:border-blue-950/30 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {interpolate(
                t("race_calendar.status.in_days" as TranslationKey),
                { days: daysUntil },
              )}
            </span>
          )}

          {race.isRegistered && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-indigo-50/40 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100/30 dark:border-indigo-950/30">
              ✓ {t("race_calendar.status.registered" as TranslationKey)}
            </span>
          )}

          {race.isFull && (
            <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-xl tracking-wider bg-amber-50/40 dark:bg-amber-950/10 text-amber-700 dark:text-amber-300 border border-amber-100/30 dark:border-amber-950/30 flex items-center gap-1">
              <Users className="w-3 h-3" /> {t(
                "race_calendar.status.full" as TranslationKey,
              )}
            </span>
          )}

          <span className="text-[9px] font-bold px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-950/10 border border-slate-100/30 dark:border-slate-850/30 font-mono">
            {formatGameDate(race.dayIndex)}
          </span>
        </div>

        {/* Prize Pool */}
        <div className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          {formatCurrency(race.prizePool, preferredCurrency)}
        </div>
      </div>
    </motion.button>
  );
}

function UpcomingRaceCard({
  race,
  onClick,
  variants,
}: {
  race: RaceOccurrence;
  onClick?: () => void;
  variants?: any;
}) {
  const { t } = useTranslation();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const currentDayIndex = useTimelineStore.getState().gameState?.dayIndex ?? 0;
  const daysUntil = race.dayIndex - race.registrationOpensAt;
  const daysFromNow = race.dayIndex - currentDayIndex;
  const isOpen = daysUntil <= 0;
  const isRegistered = race.isRegistered;
  const status = isOpen
    ? t("race_calendar.status.registration_open" as TranslationKey)
    : interpolate(t("race_calendar.status.opens_in" as TranslationKey), {
        days: daysUntil,
      });

  // Tier styling
  const tierConfig: Record<
    string,
    { bg: string; border: string; text: string; glow: string }
  > = {
    local: {
      bg: "bg-emerald-50/40 dark:bg-emerald-950/10",
      border: "border-emerald-100/30 dark:border-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    regional: {
      bg: "bg-blue-50/40 dark:bg-blue-950/10",
      border: "border-blue-100/30 dark:border-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      glow: "shadow-blue-500/10",
    },
    state: {
      bg: "bg-purple-50/40 dark:bg-purple-950/10",
      border: "border-purple-100/30 dark:border-purple-950/30",
      text: "text-purple-600 dark:text-purple-400",
      glow: "shadow-purple-500/10",
    },
    national: {
      bg: "bg-amber-50/40 dark:bg-amber-950/10",
      border: "border-amber-100/30 dark:border-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      glow: "shadow-amber-500/10",
    },
    international: {
      bg: "bg-rose-50/40 dark:bg-rose-950/10",
      border: "border-rose-100/30 dark:border-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      glow: "shadow-rose-500/10",
    },
  };

  const tier = tierConfig[race.tier] || tierConfig.local;

  const ariaLabel = `${race.name} - ${interpolate(
    t("race_calendar.labels.tier_race_on" as TranslationKey),
    { tier: race.tier, date: formatGameDate(race.dayIndex) },
  )}. ${status}. ${interpolate(
    t("race_calendar.labels.entry_fee_value" as TranslationKey),
    { fee: formatCurrency(race.entryFee, preferredCurrency) },
  )}. ${isRegistered ? t("race_calendar.status.registered" as TranslationKey) : ""}`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      variants={variants}
      className={`w-full text-left rounded-2xl border border-[#E5E7EB] dark:border-slate-800 p-4 transition-all duration-200 hover:shadow-sm cursor-pointer min-h-[44px]
        ${tier.bg} ${tier.border} hover:${tier.glow}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
      `}
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span
          className={`text-xl p-2.5 bg-white/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 ${race.color}`}
        >
          {race.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white truncate">
            {race.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className={`text-[10px] capitalize font-bold ${tier.text}`}
            >
              {race.tier}
            </span>
            <span
              className="text-slate-400 text-[10px]"
              aria-hidden="true"
            >
              •
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {formatGameDate(race.dayIndex)}
            </span>
            {isRegistered && (
              <>
                <span
                  className="text-slate-400 text-[10px]"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/10 px-1.5 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-950/30">
                  ✓ {t("race_calendar.status.registered" as TranslationKey)}
                </span>
              </>
            )}
            {daysFromNow > 0 && !isRegistered && (
              <>
                <span
                  className="text-slate-400 text-[10px]"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  {interpolate(
                    t("race_calendar.labels.days_until" as TranslationKey),
                    { days: daysFromNow },
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <div
          className={`text-xs font-extrabold flex items-center justify-end gap-1 ${isOpen ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : "text-blue-600 dark:text-blue-400"}`}
        >
          {isOpen && <Calendar className="w-3 h-3" />}
          {status}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {formatCurrency(race.entryFee, preferredCurrency)}
        </div>
      </div>
    </motion.button>
  );
}
