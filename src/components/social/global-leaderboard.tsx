"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Flame,
  Globe,
  RefreshCw,
  Search,
  Trophy,
  UserCheck,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import {
  type ActivityFeedItem,
  type LeaderboardCategory,
  type LeaderboardEntry,
  LeaderboardService,
} from "@/services/leaderboard/leaderboard-service";
import { usePlayerStore } from "@/store/player-store";

export function GlobalLeaderboardView() {
  const router = useRouter();
  const { t } = useTranslation();
  const player = usePlayerStore((state) => state.player);
  const [category, setCategory] = useState<LeaderboardCategory>("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    const data = LeaderboardService.getLeaderboard(category, {
      id: player?.id || "current_player",
      name: player?.name || "Runner",
      timeSec: 1180, // Default baseline for current player
      distance: "5K",
    });
    setEntries(data);
    setFeed(LeaderboardService.getActivityFeed());
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    loadData();
  }, [category]);

  const filteredEntries = entries.filter((item) =>
    item.playerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const categories: {
    key: LeaderboardCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "daily",
      label: "Daily Top Times",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
    },
    {
      key: "weekly",
      label: "Weekly Champions",
      icon: <Trophy className="w-4 h-4 text-indigo-500" />,
    },
    {
      key: "all_time",
      label: "All-Time Records",
      icon: <Award className="w-4 h-4 text-emerald-500" />,
    },
    {
      key: "rising",
      label: "Rising Stars",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
    {
      key: "most_active",
      label: "Most Active",
      icon: <Globe className="w-4 h-4 text-sky-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl flex items-center gap-2">
                <Globe className="w-7 h-7 text-indigo-500 animate-spin-slow" />
                Global Leaderboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compete against runners worldwide and track top performances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 text-indigo-500 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 active:scale-95 ${
                category === cat.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 border-[#E5E7EB] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Leaderboard Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="font-heading font-black text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Top 50 Runners
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search runner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-4">
                      {t("social_table.rank" as TranslationKey)}
                    </th>
                    <th className="py-3 px-4">
                      {t("social_table.runner" as TranslationKey)}
                    </th>
                    <th className="py-3 px-4">
                      {t("social_table.distance" as TranslationKey)}
                    </th>
                    <th className="py-3 px-4 text-right">
                      {t("social_table.record_time" as TranslationKey)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {filteredEntries.map((item) => (
                    <tr
                      key={item.playerId}
                      className={`transition-colors ${
                        item.isCurrentPlayer
                          ? "bg-emerald-500/10 dark:bg-emerald-500/20 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {item.rank === 1
                          ? "🥇 1"
                          : item.rank === 2
                            ? "🥈 2"
                            : item.rank === 3
                              ? "🥉 3"
                              : `#${item.rank}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.avatarColor }}
                          />
                          <span className="font-heading font-black text-sm text-slate-800 dark:text-white">
                            {item.playerName}
                          </span>
                          {item.isCurrentPlayer && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {item.distance}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        {item.scoreOrTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Activity Feed Side Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-heading font-black text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 animate-bounce" />
              Live Activity Stream
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time achievements and record breaks across the community.
            </p>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {feed.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="font-mono text-indigo-500">
                      {act.distance}
                    </span>
                    <span>
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="font-heading font-black text-xs text-slate-800 dark:text-white">
                    {act.playerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                    {act.achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
