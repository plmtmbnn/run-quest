"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Award,
  ChevronRight,
  Flame,
  Globe,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import {
  getAverageFinishTime,
  getPersonalBestTime,
  getTimeDeltaVsLastRun,
  getTrend,
  getWinStreak,
} from "@/runner/run-history";
import { useRunnerStore } from "@/runner/runner-store";
import { getTierAndDivision } from "@/social/ranking-engine";
import type { Competitor } from "@/social/ranking-types";
import { CLUBS } from "@/social/social-persistence";
import { useSocialStore } from "@/social/social-store";
import { usePlayerStore } from "@/store/player-store";

type Tab = "leaderboard" | "club" | "stats" | "feed";
type LeaderboardScope = "regional" | "global" | "rivals";

export function SocialScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { runnerState, setRunnerState } = useRunnerStore();
  const profile = runnerState.profile;
  const player = usePlayerStore((state) => state.player);

  const playerName = player?.name || profile.displayName || "Runner";

  const socialState = useSocialStore();
  const {
    region,
    regionalCompetitors,
    globalLeaderboard,
    clubId,
    weeklyProgressKm,
    weeklyContributedKm,
    clubMembers,
    rivalActivities,
    setRegion,
    joinClub,
    loadFromStorage,
  } = socialState;

  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [scope, setScope] = useState<LeaderboardScope>("regional");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleTabChange = (tab: Tab) => {
    playSound("click");
    setActiveTab(tab);
  };

  const handleScopeChange = (newScope: LeaderboardScope) => {
    playSound("click");
    setScope(newScope);
  };

  const handleSelectRegion = (reg: string) => {
    playSound("success");
    setRegion(reg);
  };

  const handleJoinClub = (id: string) => {
    playSound("success");
    joinClub(id);

    let bonusField: "speedAttr" | "staminaAttr" | "willpowerAttr" | null = null;
    if (id === "aero_striders") bonusField = "speedAttr";
    else if (id === "apex_trails") bonusField = "staminaAttr";
    else if (id === "grit_syndicate") bonusField = "willpowerAttr";

    if (bonusField) {
      setRunnerState({
        ...runnerState,
        profile: {
          ...profile,
          clubId: id,
          [bonusField]: (profile[bonusField] || 10) + 5,
        },
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  // Compile regional leaderboard including the player
  const regionalLeaderboardList = useMemo((): Competitor[] => {
    const list: Competitor[] = [...regionalCompetitors];
    const playerInList = list.some((c) => c.id === "player");

    if (!playerInList) {
      const { tier, division } = getTierAndDivision(profile.rankPoints || 0);
      list.push({
        id: "player",
        name: playerName,
        region: region || "Global",
        rp: profile.rankPoints || 0,
        tier,
        division,
        archetype: "steady",
        level: profile.level || 1,
      });
    }

    return list.sort((a, b) => b.rp - a.rp);
  }, [
    regionalCompetitors,
    profile.rankPoints,
    playerName,
    profile.level,
    region,
  ]);

  // Compile global leaderboard including the player
  const globalLeaderboardList = useMemo((): Competitor[] => {
    const list: Competitor[] = [...globalLeaderboard];
    const playerInList = list.some((c) => c.id === "player");

    if (!playerInList && (profile.rankPoints || 0) >= 2000) {
      const { tier, division } = getTierAndDivision(profile.rankPoints || 0);
      list.push({
        id: "player",
        name: playerName,
        region: region || "Global",
        rp: profile.rankPoints || 0,
        tier,
        division,
        archetype: "steady",
        level: profile.level || 1,
      });
    }

    return list.sort((a, b) => b.rp - a.rp);
  }, [
    globalLeaderboard,
    profile.rankPoints,
    playerName,
    profile.level,
    region,
  ]);

  // Compile rivals comparison
  const rivalsLeaderboardList = useMemo(() => {
    const rivalsData = [
      { id: "marcus_rivera", name: "Marcus Rivera", baseRp: 1350 },
      { id: "ellie_park", name: "Ellie Park", baseRp: 890 },
      { id: "kenji_nakamura", name: "Kenji Nakamura", baseRp: 1100 },
      { id: "sarah_chen", name: "Sarah Chen", baseRp: 1450 },
      { id: "alex_santos", name: "Alex Santos", baseRp: 980 },
      { id: "maria_gonzalez", name: "Maria Gonzalez", baseRp: 1200 },
    ];

    const list = rivalsData.map((rival) => {
      const stats = profile.rivalRelationships?.[rival.id] || {
        wins: 0,
        losses: 0,
      };
      const currentRivalRp = Math.max(0, rival.baseRp + stats.losses * 40 - stats.wins * 25);
      const { tier, division } = getTierAndDivision(currentRivalRp);
      return {
        id: rival.id,
        name: rival.name,
        rp: currentRivalRp,
        tier,
        division,
        level: Math.floor(currentRivalRp / 150) + 1,
        archetype: undefined,
      };
    });

    const { tier, division } = getTierAndDivision(profile.rankPoints || 0);
    list.push({
      id: "player",
      name: `${playerName} (You)`,
      rp: profile.rankPoints || 0,
      tier,
      division,
      level: profile.level || 1,
      archetype: undefined,
    });

    return list.sort((a, b) => b.rp - a.rp);
  }, [
    profile.rivalRelationships,
    profile.rankPoints,
    playerName,
    profile.level,
  ]);

  const percentile = useMemo(() => {
    const list = regionalLeaderboardList;
    const playerIndex = list.findIndex((c) => c.id === "player");
    if (playerIndex === -1) return 50;
    const percentileVal = ((list.length - playerIndex) / list.length) * 100;
    return Math.round(percentileVal);
  }, [regionalLeaderboardList]);

  const selectedClub = CLUBS.find((c) => c.id === clubId);
  const playerTierInfo = getTierAndDivision(profile.rankPoints || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col pb-20"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 px-4 sm:px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                router.push("/");
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-heading text-lg sm:text-xl font-black truncate">
                {t("social.title" as TranslationKey)}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t("social.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 px-3 py-1.5 rounded-full text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono shadow-xs shrink-0">
            <Trophy className="h-3.5 w-3.5 text-indigo-500" />
            <span>{profile.rankPoints || 0} RP</span>
          </div>
        </div>
      </header>

      {/* 4-Tab Navigation Bar */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-5">
        <div className="grid grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl sm:rounded-3xl shadow-xs gap-1">
          {(["leaderboard", "club", "stats", "feed"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`py-2.5 px-1 sm:px-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span>
                  {tab === "leaderboard" && "🏆"}
                  {tab === "club" && "🛡️"}
                  {tab === "stats" && "⚔️"}
                  {tab === "feed" && "📡"}
                </span>
                <span className="truncate">
                  {t(`social.tabs.${tab}` as TranslationKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-5 flex-1 flex flex-col gap-6">
        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-5">
            {/* Scope Filter Pills */}
            <div className="flex justify-center gap-2 flex-wrap">
              {(["regional", "global", "rivals"] as LeaderboardScope[]).map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => handleScopeChange(sc)}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all border min-h-[40px] cursor-pointer ${
                    scope === sc
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {sc === "regional" && (region ? `${region} Division` : t("social.scope.regional" as TranslationKey))}
                  {sc === "global" && t("social.scope.global" as TranslationKey)}
                  {sc === "rivals" && t("social.scope.rivals" as TranslationKey)}
                </button>
              ))}
            </div>

            {/* Region picker if regional and no region set */}
            {!region && scope === "regional" ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 flex items-center justify-center text-3xl shadow-inner text-indigo-500">
                  <Globe className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    {t("social.scope.select_region" as TranslationKey)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                    {t("social.scope.select_region_desc" as TranslationKey)}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mt-2">
                  {[
                    "North America",
                    "Europe",
                    "Southeast Asia",
                    "Jakarta",
                    "California",
                    "Tokyo",
                  ].map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => handleSelectRegion(reg)}
                      className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700/80 text-xs font-black transition text-slate-800 dark:text-slate-200 min-h-[44px] cursor-pointer"
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* The Leaderboard List */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-1 px-4 sm:px-5 py-3.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800 font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
                  <span className="col-span-2 text-center">Rank</span>
                  <span className="col-span-6">Runner</span>
                  <span className="col-span-2 text-center">Tier</span>
                  <span className="col-span-2 text-right">RP</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {(scope === "regional"
                    ? regionalLeaderboardList
                    : scope === "global"
                      ? globalLeaderboardList
                      : rivalsLeaderboardList
                  ).map((comp, idx) => {
                    const isPlayer = comp.id === "player";
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={comp.id}
                        className={`grid grid-cols-12 gap-1 px-4 sm:px-5 py-3.5 items-center text-xs font-medium transition-all ${
                          isPlayer
                            ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-200 font-bold border-l-4 border-indigo-500"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span className="col-span-2 text-center font-black text-sm">
                          {idx < 3 ? medals[idx] : `#${idx + 1}`}
                        </span>
                        <span className="col-span-6 truncate flex items-center gap-1.5 min-w-0">
                          <span className="font-heading font-black truncate">
                            {comp.name}
                          </span>
                          {isPlayer && (
                            <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                              YOU
                            </span>
                          )}
                        </span>
                        <span className="col-span-2 text-center font-bold text-[10px] sm:text-[11px] truncate">
                          {comp.tier} {comp.division && comp.division}
                        </span>
                        <span className="col-span-2 text-right font-mono font-black text-slate-900 dark:text-white">
                          {comp.rp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLUB TAB */}
        {activeTab === "club" && (
          <div className="flex flex-col gap-6">
            {!clubId ? (
              /* Club Chooser */
              <div className="flex flex-col gap-4">
                <div className="text-center flex flex-col items-center">
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    {t("social.club.title" as TranslationKey)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
                    {t("social.club.subtitle" as TranslationKey)}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {CLUBS.map((club) => (
                    <div
                      key={club.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-1 border border-slate-200/50 dark:border-slate-700/50">
                          {club.emblem}
                        </div>
                        <h4 className="font-heading font-black text-base">
                          {club.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {club.description.en}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 mt-2">
                        <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs leading-relaxed font-bold text-indigo-900 dark:text-indigo-200">
                          🌟 {club.bonusDesc.en}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoinClub(club.id)}
                          className="w-full py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition min-h-[44px] cursor-pointer"
                        >
                          {t("social.club.join_button" as TranslationKey)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Club Details */
              <div className="flex flex-col gap-6">
                {selectedClub && (
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 shrink-0">
                        {selectedClub.emblem}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-black">
                          {t("social.club.active_membership" as TranslationKey)}
                        </span>
                        <h3 className="font-heading font-black text-xl mt-0.5">
                          {selectedClub.name}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-sm">
                          {selectedClub.description.en}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 text-[10px] uppercase tracking-wider font-extrabold text-center shrink-0 w-full sm:w-auto">
                      <span className="text-slate-300">{t("social.club.bonus_status" as TranslationKey)}</span>
                      <span className="block text-indigo-200 font-bold mt-0.5">
                        +5 Attribute Boost
                      </span>
                    </div>
                  </div>
                )}

                {/* Weekly Combined Progress */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                        {t("social.club.weekly_goal" as TranslationKey)}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t("social.club.weekly_goal_desc" as TranslationKey)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                      {weeklyProgressKm} / {selectedClub?.weeklyGoalKm} km
                    </span>
                  </div>

                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/80">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(100, (weeklyProgressKm / (selectedClub?.weeklyGoalKm || 150)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-3.5 rounded-2xl">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      {t("social.club.your_contribution" as TranslationKey)}
                    </span>
                    <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {weeklyContributedKm} km
                    </span>
                  </div>
                </div>

                {/* Member Contributions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                  <h4 className="font-heading font-black text-sm mb-1 text-slate-900 dark:text-white">
                    {t("social.club.member_contributions" as TranslationKey)}
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {/* Player */}
                    <div className="flex justify-between items-center bg-indigo-50/60 dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🏃</span>
                        <span>{playerName} (You)</span>
                      </span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {weeklyContributedKm} km
                      </span>
                    </div>
                    {/* Other members */}
                    {clubMembers.map((member) => (
                      <div
                        key={member.name}
                        className="flex justify-between items-center px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <span className="text-[10px] text-slate-400">●</span>
                          <span>{member.name}</span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-bold text-slate-400 uppercase">
                            Lv {member.level}
                          </span>
                        </span>
                        <span className="font-mono font-bold">
                          {member.contributionKm} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPARATIVE STATS & HEAD TO HEAD TAB */}
        {activeTab === "stats" && (
          <div className="flex flex-col gap-6">
            {/* Percentile & League Rank Overview */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider font-black">
                  {t("social.stats.percentile_rank" as TranslationKey)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-heading">
                  Top {percentile}%
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {t("social.stats.percentile_desc" as TranslationKey)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider font-black">
                  {t("social.stats.league_rank" as TranslationKey)}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading truncate">
                  {playerTierInfo.tier} {playerTierInfo.division && `Div ${playerTierInfo.division}`}
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {profile.rankPoints || 0} Rank Points
                </p>
              </div>
            </div>

            {/* Performance Trend Cards */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    {t("social.stats.performance_trend" as TranslationKey)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("social.stats.trend_desc" as TranslationKey)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Trend direction */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 flex flex-col items-center gap-1 text-center border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                    Trend
                  </span>
                  <span className="text-2xl font-black font-heading">
                    {getTrend(profile) === "improving" && "🚀"}
                    {getTrend(profile) === "declining" && "📉"}
                    {getTrend(profile) === "steady" && "➡️"}
                    {getTrend(profile) === null && "—"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {getTrend(profile) === "improving" && "Improving"}
                    {getTrend(profile) === "declining" && "Declining"}
                    {getTrend(profile) === "steady" && "Steady"}
                    {getTrend(profile) === null && "N/A"}
                  </span>
                </div>

                {/* Win streak */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 flex flex-col items-center gap-1 text-center border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                    {t("social.stats.win_streak" as TranslationKey)}
                  </span>
                  <span className="text-2xl font-black font-heading text-amber-500">
                    {getWinStreak(profile)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {getWinStreak(profile) === 1 ? "Race" : getWinStreak(profile) > 1 ? "Races" : "—"}
                  </span>
                </div>

                {/* Vs last run */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 flex flex-col items-center gap-1 text-center border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                    {t("social.stats.vs_last_run" as TranslationKey)}
                  </span>
                  {(() => {
                    const delta = getTimeDeltaVsLastRun(profile);
                    if (delta === null) {
                      return (
                        <>
                          <span className="text-2xl font-black text-slate-400">—</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">N/A</span>
                        </>
                      );
                    }
                    const isFaster = delta < 0;
                    const mins = Math.floor(Math.abs(delta) / 60);
                    const secs = Math.floor(Math.abs(delta) % 60);
                    return (
                      <>
                        <span
                          className={`text-lg font-black font-heading ${
                            isFaster ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {isFaster ? "−" : "+"}
                          {mins > 0 ? `${mins}m ` : ""}
                          {secs}s
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {isFaster ? "Faster" : "Slower"}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Rival Relationships & Head to Head */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  {t("social.stats.rival_head_to_head" as TranslationKey)}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("social.stats.rival_desc" as TranslationKey)}
                </p>
              </div>

              {/* Active Nemesis Card (if unlocked) */}
              {profile.currentNemesis && (
                <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-200 dark:border-red-900/40 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400 font-black block">
                        {t("social.stats.nemesis_title" as TranslationKey)}
                      </span>
                      <h5 className="font-black text-sm text-slate-900 dark:text-white font-heading">
                        {profile.currentNemesis.name}
                      </h5>
                    </div>
                  </div>
                  <div className="font-mono font-black text-sm text-red-600 dark:text-red-400">
                    {profile.currentNemesis.wins || 0}W - {profile.currentNemesis.losses || 0}L
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "marcus_rivera", name: "Marcus Rivera", emoji: "🏃‍♂️" },
                  { id: "ellie_park", name: "Ellie Park", emoji: "🏃‍♀️" },
                  { id: "kenji_nakamura", name: "Kenji Nakamura", emoji: "🏃" },
                  { id: "sarah_chen", name: "Sarah Chen", emoji: "🏃‍♀️" },
                  { id: "alex_santos", name: "Alex Santos", emoji: "🏃‍♂️" },
                  { id: "maria_gonzalez", name: "Maria Gonzalez", emoji: "🏃‍♀️" },
                ].map((rival) => {
                  const relationship = profile.rivalRelationships?.[rival.id] || {
                    wins: 0,
                    losses: 0,
                    relationshipLevel: 0,
                    closestMargin: Infinity,
                  };

                  const totalRaces = relationship.wins + relationship.losses;
                  const winRate =
                    totalRaces > 0 ? Math.round((relationship.wins / totalRaces) * 100) : null;
                  const isWinning = totalRaces > 0 && relationship.wins > relationship.losses;
                  const isEven = totalRaces > 0 && relationship.wins === relationship.losses;

                  return (
                    <div
                      key={rival.id}
                      className={`bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border text-xs ${
                        isWinning
                          ? "border-emerald-200 dark:border-emerald-900/40"
                          : isEven
                            ? "border-amber-200 dark:border-amber-900/30"
                            : totalRaces > 0
                              ? "border-rose-200 dark:border-rose-900/30"
                              : "border-slate-200/60 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{rival.emoji}</span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                              {rival.name}
                            </h5>
                            {totalRaces > 0 ? (
                              <span
                                className={`text-[10px] font-bold ${
                                  isWinning
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isEven
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {isWinning
                                  ? `⬆ ${t("social.stats.leading" as TranslationKey)}`
                                  : isEven
                                    ? `⬌ ${t("social.stats.tied" as TranslationKey)}`
                                    : `⬇ ${t("social.stats.trailing" as TranslationKey)}`}
                                {" · "}
                                {winRate}% WR
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                🤝 {t("social.stats.no_encounters" as TranslationKey)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-slate-900 dark:text-white">
                            {relationship.wins}W - {relationship.losses}L
                          </span>
                          {relationship.closestMargin < Infinity && (
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              Margin: {Math.floor(relationship.closestMargin / 60)}m{" "}
                              {Math.floor(relationship.closestMargin % 60)}s
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LIVE ACTIVITY FEED TAB */}
        {activeTab === "feed" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                {t("social.feed.title" as TranslationKey)}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("social.feed.subtitle" as TranslationKey)}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {rivalActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0 text-xs"
                >
                  <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                    <Activity className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-black text-slate-900 dark:text-white truncate">
                        {act.rivalName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs">
                      {act.action.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
