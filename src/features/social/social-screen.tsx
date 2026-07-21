"use client";

import { motion } from "framer-motion";
import { Activity, ArrowLeft } from "lucide-react";
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

type Tab = "leaderboard" | "club" | "stats";
type LeaderboardScope = "regional" | "global" | "rivals";

export function SocialScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { playSound } = useSound();
  const { runnerState, setRunnerState } = useRunnerStore();
  const profile = runnerState.profile;
  const player = usePlayerStore((state) => state.player);
  
  // Get player name from player store
  const playerName = player?.name || "You";

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
  const [selectedRegion, setSelectedRegion] = useState<string>("");

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

    // Apply club attributes bonuses directly (e.g. +5 to corresponding attribute)
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

    // Sort by RP descending
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
      {
        id: "marcus_rivera",
        name: "Marcus 'The Machine' Rivera",
        baseRp: 1350,
      },
      { id: "ellie_park", name: "Ellie 'Lightning' Park", baseRp: 890 },
      {
        id: "kenji_nakamura",
        name: "Kenji 'Silent Storm' Nakamura",
        baseRp: 1100,
      },
      { id: "sarah_chen", name: "Sarah 'Ironheart' Chen", baseRp: 1450 },
      { id: "alex_santos", name: "Alex 'The Natural' Santos", baseRp: 980 },
      { id: "maria_gonzalez", name: "Maria 'Momentum' Gonzalez", baseRp: 1200 },
    ];

    const list = rivalsData.map((rival) => {
      // Calculate dynamic rival RP based on matches
      const stats = profile.rivalRelationships?.[rival.id] || {
        wins: 0,
        losses: 0,
      };
      const currentRivalRp = rival.baseRp + stats.losses * 40 - stats.wins * 25;
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

  const formatTargetTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedClub = CLUBS.find((c) => c.id === clubId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white flex flex-col pb-16"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] dark:border-gray-800 bg-white/95 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:bg-slate-900 transition hover:bg-gray-55 active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-heading text-xl font-bold">
                Social & Competition Hub
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">
                Simulated online rankings, clubs, and head-to-head stats
              </p>
            </div>
          </div>
          {profile.rankPoints !== undefined && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200/50 px-3.5 py-1.5 rounded-full text-xs font-black text-indigo-650 dark:text-indigo-400 font-mono shadow-sm">
              <span>🏆</span>
              <span>{profile.rankPoints} RP</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto w-full max-w-3xl px-6 pt-6">
        <div className="flex bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-1.5 rounded-[1.75rem] shadow-sm">
          {(["leaderboard", "club", "stats"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-[1.25rem] transition-all
                ${
                  activeTab === tab
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }
              `}
            >
              {tab === "leaderboard" && "Leaderboards"}
              {tab === "club" && "Running Club"}
              {tab === "stats" && "Head to Head"}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 flex flex-col gap-6">
        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-6">
            {/* Scope select */}
            <div className="flex justify-center gap-2">
              {(["regional", "global", "rivals"] as LeaderboardScope[]).map(
                (sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => handleScopeChange(sc)}
                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all border
                    ${
                      scope === sc
                        ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-50"
                    }
                  `}
                  >
                    {sc === "regional" &&
                      (region ? `${region} Division` : "Regional Ladder")}
                    {sc === "global" && "Global Elite"}
                    {sc === "rivals" && "Rivals Standing"}
                  </button>
                ),
              )}
            </div>

            {/* Region picker if regional and no region set */}
            {!region && scope === "regional" ? (
              <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 text-center flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-2xl shadow-inner">
                  🌎
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Select Your League Region
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 leading-relaxed">
                    Select a competitive region to unlock simulated daily
                    divisions, leaderboards, and contribution stats.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
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
                      className="py-3 px-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-gray-200 dark:border-slate-850 dark:bg-slate-950 dark:hover:bg-indigo-950 text-xs font-extrabold transition text-slate-800 dark:text-gray-300"
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* The Leaderboard List */
              <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-1 px-5 py-3.5 bg-slate-100/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-slate-800 font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
                  <span className="col-span-2 text-center">Rank</span>
                  <span className="col-span-6">Runner</span>
                  <span className="col-span-2 text-center">Tier</span>
                  <span className="col-span-2 text-right">Points</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
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
                        className={`grid grid-cols-12 gap-1 px-5 py-4 items-center text-xs font-medium transition-all
                          ${
                            isPlayer
                              ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-200 font-bold border-l-4 border-indigo-500"
                              : "text-slate-700 dark:text-gray-300"
                          }
                        `}
                      >
                        <span className="col-span-2 text-center font-bold text-sm">
                          {idx < 3 ? medals[idx] : `${idx + 1}`}
                        </span>
                        <span className="col-span-6 truncate flex items-center gap-1.5">
                          <span className="font-heading font-black">
                            {comp.name}
                          </span>
                          {comp.archetype && (
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">
                              {comp.archetype[0]}
                            </span>
                          )}
                          {isPlayer && (
                            <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                              You
                            </span>
                          )}
                        </span>
                        <span className="col-span-2 text-center font-semibold text-[11px]">
                          {comp.tier} {comp.division && comp.division}
                        </span>
                        <span className="col-span-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200 dark:text-white">
                          {comp.rp} RP
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
                <h3 className="font-heading font-black text-base text-center">
                  Join a Running Syndicate
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-sm mx-auto leading-relaxed mb-2">
                  Joining a club provides unique weekly combined distance goals
                  and passive training bonuses for attribute gains.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {CLUBS.map((club) => (
                    <div
                      key={club.id}
                      className={`bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-850 rounded-[2rem] p-5 shadow-sm flex flex-col justify-between gap-4`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner mb-1">
                          {club.emblem}
                        </div>
                        <h4 className="font-heading font-black text-sm">
                          {club.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-400 leading-normal">
                          {club.description.en}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 mt-2">
                        <div className="bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-dashed border-gray-200 dark:border-slate-750 text-[10px] leading-normal font-semibold text-slate-800 dark:text-gray-300">
                          🌟 {club.bonusDesc.en}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoinClub(club.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition"
                        >
                          Join Club
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
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-indigo-950/40 dark:to-slate-950/60 border border-slate-850 rounded-[2rem] p-6 text-white shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">
                        {selectedClub.emblem}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-black">
                          ACTIVE MEMBERSHIP
                        </span>
                        <h3 className="font-heading font-black text-xl mt-0.5">
                          {selectedClub.name}
                        </h3>
                        <p className="text-[10px] text-gray-300 dark:text-gray-400 leading-relaxed mt-1 max-w-sm">
                          {selectedClub.description.en}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/15 px-3 py-2 rounded-2xl border border-white/10 text-[9px] uppercase tracking-wider font-extrabold text-center shrink-0">
                      <span>Bonus Status</span>
                      <span className="block text-indigo-200 font-bold mt-0.5">
                        +5 Attribute Boost
                      </span>
                    </div>
                  </div>
                )}

                {/* Weekly combined progress */}
                <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                        Weekly Combined Distance Goal
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Progress of all members towards the weekly chest
                      </p>
                    </div>
                    <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {weeklyProgressKm} / {selectedClub?.weeklyGoalKm} km
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-850">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-inner"
                      style={{
                        width: `${Math.min(100, (weeklyProgressKm / (selectedClub?.weeklyGoalKm || 150)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 p-3 rounded-2xl">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      Your Contribution
                    </span>
                    <span className="font-mono font-black text-indigo-650 dark:text-indigo-400">
                      {weeklyContributedKm} km contributed
                    </span>
                  </div>
                </div>

                {/* Member Contributions */}
                <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-3">
                  <h4 className="font-heading font-black text-sm mb-1 text-slate-800 dark:text-white">
                    Member Contributions
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {/* Player */}
                    <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/10 p-3 rounded-2xl border border-indigo-50 dark:border-indigo-950/40 text-xs">
                      <span className="font-bold flex items-center gap-1">
                        <span>🏃</span>
                        <span>{playerName} (You)</span>
                      </span>
                      <span className="font-mono font-bold">
                        {weeklyContributedKm} km
                      </span>
                    </div>
                    {/* Other members */}
                    {clubMembers.map((member) => (
                      <div
                        key={member.name}
                        className="flex justify-between items-center px-3 py-2 text-xs text-slate-700 dark:text-gray-300"
                      >
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="text-[10px] opacity-40">●</span>
                          <span>{member.name}</span>
                          <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-slate-400 uppercase">
                            Lv {member.level}
                          </span>
                        </span>
                        <span className="font-mono font-medium">
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

        {/* COMPARATIVE STATS TAB */}
        {activeTab === "stats" && (
          <div className="flex flex-col gap-6">
            {/* Percentile Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">
                  Percentile Rank
                </span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-heading">
                  Top {percentile}%
                </span>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 max-w-[150px] leading-relaxed">
                  Compared to other active runners in the regional ladder
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-5 shadow-sm flex flex-col items-center justify-center text-center gap-1">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider font-extrabold">
                  League Rank
                </span>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200 dark:text-white font-heading">
                  {getTierAndDivision(profile.rankPoints || 0).tier}{" "}
                  {getTierAndDivision(profile.rankPoints || 0).division &&
                    `Division ${getTierAndDivision(profile.rankPoints || 0).division}`}
                </span>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 max-w-[150px] leading-relaxed">
                  {profile.rankPoints || 0} competitive Rank Points
                </p>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">📈</span>
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                    Performance Trend
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Based on your last{" "}
                    {Math.min(5, (profile.runHistory || []).length)} runs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Trend direction */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                    Trend
                  </span>
                  <span className="text-2xl font-black font-heading">
                    {getTrend(profile) === "improving" && "🚀"}
                    {getTrend(profile) === "declining" && "📉"}
                    {getTrend(profile) === "steady" && "➡️"}
                    {getTrend(profile) === null && "—"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    {getTrend(profile) === "improving" && "Improving"}
                    {getTrend(profile) === "declining" && "Declining"}
                    {getTrend(profile) === "steady" && "Steady"}
                    {getTrend(profile) === null && "N/A"}
                  </span>
                </div>

                {/* Win streak */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                    Win Streak
                  </span>
                  <span className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400">
                    {getWinStreak(profile)}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    {getWinStreak(profile) === 1
                      ? "Race"
                      : getWinStreak(profile) > 1
                        ? "Races"
                        : "—"}
                  </span>
                </div>

                {/* Vs last run */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl p-4 flex flex-col items-center gap-1 text-center">
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">
                    Vs Last Run
                  </span>
                  {(() => {
                    const delta = getTimeDeltaVsLastRun(profile);
                    if (delta === null) {
                      return (
                        <>
                          <span className="text-2xl font-black font-heading text-slate-400">
                            —
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">
                            No data
                          </span>
                        </>
                      );
                    }
                    const isFaster = delta < 0;
                    const mins = Math.floor(Math.abs(delta) / 60);
                    const secs = Math.floor(Math.abs(delta) % 60);
                    return (
                      <>
                        <span
                          className={`text-xl font-black font-heading ${
                            isFaster
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isFaster ? "−" : "+"}
                          {mins > 0 ? `${mins}m ` : ""}
                          {secs}s
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {isFaster ? "Faster" : "Slower"}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Personal best and average */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-950/30 rounded-2xl p-3 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200">
                    🏆 Personal Best
                  </span>
                  <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                    {(() => {
                      const pb = getPersonalBestTime(profile);
                      if (!pb) return "—";
                      const m = Math.floor(pb / 60);
                      const s = Math.floor(pb % 60);
                      return `${m}m ${s}s`;
                    })()}
                  </span>
                </div>
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-950/30 rounded-2xl p-3 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-950 dark:text-emerald-200">
                    📊 Avg (Last 5)
                  </span>
                  <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                    {(() => {
                      const avg = getAverageFinishTime(profile);
                      if (!avg) return "—";
                      const m = Math.floor(avg / 60);
                      const s = Math.floor(avg % 60);
                      return `${m}m ${s}s`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Rival Relationships & Head to Head */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                  Rival Head to Head
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Your lifetime win-loss records against named rivals
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "marcus_rivera", name: "Marcus Rivera", emoji: "🏃‍♂️" },
                  { id: "ellie_park", name: "Ellie Park", emoji: "🏃‍♀️" },
                  { id: "kenji_nakamura", name: "Kenji Nakamura", emoji: "🏃" },
                  { id: "sarah_chen", name: "Sarah Chen", emoji: "🏃‍♀️" },
                  { id: "alex_santos", name: "Alex Santos", emoji: "🏃‍♂️" },
                  {
                    id: "maria_gonzalez",
                    name: "Maria Gonzalez",
                    emoji: "🏃‍♀️",
                  },
                ].map((rival) => {
                  const relationship = profile.rivalRelationships?.[
                    rival.id
                  ] || {
                    wins: 0,
                    losses: 0,
                    relationshipLevel: 0,
                    closestMargin: Infinity,
                  };

                  const totalRaces = relationship.wins + relationship.losses;
                  const winRate =
                    totalRaces > 0
                      ? Math.round((relationship.wins / totalRaces) * 100)
                      : null;
                  const isWinning =
                    totalRaces > 0 && relationship.wins > relationship.losses;
                  const isEven =
                    totalRaces > 0 && relationship.wins === relationship.losses;

                  return (
                    <div
                      key={rival.id}
                      className={`bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border text-xs
                        ${
                          isWinning
                            ? "border-emerald-200 dark:border-emerald-900/40"
                            : isEven
                              ? "border-amber-200 dark:border-amber-900/30"
                              : totalRaces > 0
                                ? "border-rose-200 dark:border-rose-900/30"
                                : "border-slate-100 dark:border-slate-850"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{rival.emoji}</span>
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-white leading-tight">
                              {rival.name}
                            </h5>
                            {totalRaces > 0 ? (
                              <span
                                className={`text-[9px] font-bold ${
                                  isWinning
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : isEven
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {isWinning
                                  ? "⬆ Leading"
                                  : isEven
                                    ? "⬌ Tied"
                                    : "⬇ Trailing"}
                                {" · "}
                                {winRate}% WR
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400">
                                🤝 No encounters yet
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-slate-800 dark:text-slate-200 dark:text-white">
                            {relationship.wins}W - {relationship.losses}L
                          </span>
                          {relationship.closestMargin < Infinity && (
                            <div className="text-[8px] text-slate-400 font-mono mt-0.5">
                              Best margin:{" "}
                              {Math.floor(relationship.closestMargin / 60)}m{" "}
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

            {/* Rival Activity Feed */}
            <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="font-heading font-black text-sm text-slate-800 dark:text-white">
                  Rival Activities Feed
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time simulated logs of competitor activity and training
                  logs
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {rivalActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0 text-xs"
                  >
                    <div className="h-8 w-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-800 dark:text-white">
                          {act.rivalName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          {act.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5 leading-normal text-[11px]">
                        {act.action.en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
