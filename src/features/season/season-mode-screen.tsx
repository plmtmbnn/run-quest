"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Lock,
  Play,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { type Season, useSeasonStore } from "@/store/season-store";

/**
 * Season Mode Screen
 * Structured 12-week progression without timeline management
 * Middle ground between Focus and Career modes
 */
export function SeasonModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { seasons, currentSeasonId, startSeason, unlockSeason } =
    useSeasonStore();
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const currentSeason = seasons.find((s) => s.id === currentSeasonId);

  const handleStartSeason = (seasonId: string) => {
    playSound("success");
    startSeason(seasonId);
    router.push(`/season/${seasonId}`);
  };

  const handleContinueSeason = () => {
    if (currentSeasonId) {
      playSound("click");
      router.push(`/season/${currentSeasonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[#E5E7EB] dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-180" />
            </button>
            <div>
              <h1 className="font-heading font-black text-lg">
                {t("season_mode.title" as TranslationKey)}
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-purple-500">
                {t("season_mode.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          {currentSeason && (
            <button
              onClick={handleContinueSeason}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95"
            >
              {t("season_mode.continue_season" as TranslationKey, {
                tier: currentSeason.tier,
              })}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Current Season Progress */}
        {currentSeason && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-black text-2xl mb-1">
                  {currentSeason.name}
                </h2>
                <p className="text-sm opacity-90">
                  {currentSeason.description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < currentSeason.tier
                        ? "fill-white text-white"
                        : "text-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Week Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">
                  {t("season_mode.week_progress" as TranslationKey)}
                </span>
                <span className="text-sm font-mono font-bold">
                  {currentSeason.currentWeek} / 12
                </span>
              </div>
              <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentSeason.currentWeek / 12) * 100}%`,
                  }}
                  className="bg-white h-full rounded-full"
                />
              </div>
            </div>

            {/* Season Goals */}
            <div>
              <div className="text-sm font-bold mb-2">
                {t("season_mode.season_goals" as TranslationKey)}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {currentSeason.seasonGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-bold">
                        {goal.description}
                      </span>
                      {goal.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/30 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] opacity-75 mb-2">
                      {goal.reward}
                    </div>
                    <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-white h-full rounded-full"
                        style={{
                          width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Seasons */}
        <div>
          <h2 className="font-heading font-black text-2xl mb-6">
            {t("season_mode.all_seasons" as TranslationKey)}
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {seasons.map((season) => (
              <motion.div
                key={season.id}
                whileHover={{ scale: season.unlocked ? 1.02 : 1 }}
                className={`
                  bg-white dark:bg-slate-900 border-2 rounded-2xl p-6 transition-all
                  ${
                    season.id === currentSeasonId
                      ? "border-purple-500"
                      : season.unlocked
                        ? "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                        : "border-slate-200 dark:border-slate-700 opacity-60"
                  }
                `}
                onClick={() => season.unlocked && setSelectedSeason(season)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading font-black text-xl">
                        {season.name}
                      </h3>
                      {season.completed && (
                        <Trophy className="w-5 h-5 text-amber-500" />
                      )}
                      {!season.unlocked && (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {season.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < season.tier
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                    <div className="font-mono font-bold text-sm">12</div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {t("season_mode.weeks" as TranslationKey)}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Target className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                    <div className="font-mono font-bold text-sm">
                      {season.seasonGoals.length}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {t("season_mode.goals" as TranslationKey)}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Award className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                    <div className="font-mono font-bold text-sm">
                      {season.rewards.currency}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {t("season_mode.prize" as TranslationKey)}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {season.unlocked &&
                  !season.completed &&
                  season.id !== currentSeasonId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSeason(season.id);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {t("season_mode.start_season" as TranslationKey)}
                    </button>
                  )}

                {season.id === currentSeasonId && (
                  <button
                    onClick={handleContinueSeason}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {t("season_mode.continue_season" as TranslationKey, {
                      tier: season.tier,
                    })}
                  </button>
                )}

                {season.completed && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {t("season_mode.completed" as TranslationKey)}
                  </div>
                )}

                {!season.unlocked && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t("season_mode.locked" as TranslationKey)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
