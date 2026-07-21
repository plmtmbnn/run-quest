import { Flame, Route, Trophy, Zap } from "lucide-react";
import type { Language } from "@/i18n/types";
import type { StoredPlayer } from "@/storage/types";
import { ShareCardRenderer } from "./share-card-renderer";

interface DailyStatsCardProps {
  player: StoredPlayer;
  lang: Language;
  date: string;
}

export function DailyStatsCard({ player, lang, date }: DailyStatsCardProps) {
  const stats = player.statistics;

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={
        lang === "id" ? "Statistik Profil RunQuest" : "RunQuest Runner Profile"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            {lang === "id" ? "Statistik Karir Runner" : "Runner Career Stats"}
          </h2>
          <h1 className="text-2xl font-black font-heading text-white mt-0.5">
            {player.name || `Runner #${player.id.slice(0, 8).toUpperCase()}`}
          </h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 grid grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">
            <Flame className="h-6 w-6 text-orange-500 fill-orange-500/20" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Streak
            </span>
            <span className="text-xl font-black text-white">
              {stats.currentStreak} Days
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">
            <Zap className="h-6 w-6 text-blue-500 fill-blue-500/20" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Total Runs
            </span>
            <span className="text-xl font-black text-white">
              {stats.totalRuns}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">
            <Route className="h-6 w-6 text-emerald-500" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Distance
            </span>
            <span className="text-xl font-black text-white">
              {stats.totalDistance} km
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-900/40 border border-slate-800/50 rounded-xl">
            <Trophy className="h-6 w-6 text-amber-500 dark:text-amber-300 fill-amber-500/20" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Perfect Runs
            </span>
            <span className="text-xl font-black text-white">
              {stats.perfectRuns || 0}
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold italic text-slate-300">
          {lang === "id"
            ? "Bisa kalahkan streak saya?"
            : "Can you beat my streak?"}
        </p>
      </div>
    </ShareCardRenderer>
  );
}
