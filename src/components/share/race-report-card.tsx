import {
  Award,
  Clock,
  Flame,
  ShieldAlert,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { Language } from "@/i18n/types";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import type { DailyChallenge, Grade, Outcome } from "@/types/engine";
import { ShareCardRenderer } from "./share-card-renderer";

interface RaceReportCardProps {
  challenge: DailyChallenge;
  outcome: Outcome;
  grade: Grade;
  score: number;
  finishTime: number;
  lang: Language;
  date: string;
}

export function RaceReportCard({
  challenge,
  outcome,
  grade,
  score,
  finishTime,
  lang,
  date,
}: RaceReportCardProps) {
  const { t } = useTranslation();

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  const formatPace = (secs: number, distKm: number) => {
    if (!distKm || distKm <= 0 || secs <= 0) return "--:--";
    const paceSec = Math.round(secs / distKm);
    const m = Math.floor(paceSec / 60);
    const s = paceSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s} /km`;
  };

  const getOutcomeStyle = () => {
    switch (outcome) {
      case "gold":
        return {
          bg: "bg-gradient-to-br from-amber-500/25 via-yellow-500/10 to-amber-600/25 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/10",
          icon: <Trophy className="h-10 w-10 text-amber-300 drop-shadow-md" />,
          label:
            t("challenge.result.outcome_gold" as TranslationKey) ||
            "Gold Medal",
        };
      case "silver":
        return {
          bg: "bg-gradient-to-br from-slate-300/25 via-slate-400/10 to-slate-500/25 border-slate-300/50 text-slate-200 shadow-lg shadow-slate-400/10",
          icon: <Award className="h-10 w-10 text-slate-200 drop-shadow-md" />,
          label:
            t("challenge.result.outcome_silver" as TranslationKey) ||
            "Silver Medal",
        };
      case "bronze":
        return {
          bg: "bg-gradient-to-br from-amber-700/25 via-orange-600/10 to-amber-800/25 border-amber-600/50 text-amber-400 shadow-lg shadow-amber-700/10",
          icon: <Award className="h-10 w-10 text-amber-400 drop-shadow-md" />,
          label:
            t("challenge.result.outcome_bronze" as TranslationKey) ||
            "Bronze Medal",
        };
      case "finish":
        return {
          bg: "bg-gradient-to-br from-indigo-500/25 via-blue-500/10 to-indigo-600/25 border-indigo-400/50 text-indigo-300 shadow-lg shadow-indigo-500/10",
          icon: (
            <Sparkles className="h-10 w-10 text-indigo-300 drop-shadow-md" />
          ),
          label:
            t("challenge.result.outcome_finish" as TranslationKey) ||
            "Finisher",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-rose-600/25 via-red-500/10 to-rose-700/25 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-600/10",
          icon: (
            <ShieldAlert className="h-10 w-10 text-rose-400 drop-shadow-md" />
          ),
          label: outcome === "dns" ? "Did Not Start" : "Did Not Finish",
        };
    }
  };

  const outcomeStyle = getOutcomeStyle();

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={t("share.card_title.result" as TranslationKey)}
    >
      <div className="flex flex-col justify-between h-full py-1">
        {/* Race Title Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
              {t("share.card_subtitle.result" as TranslationKey)}
            </span>
            <h1 className="text-2xl font-black font-heading text-white mt-0.5 max-w-xl truncate tracking-tight drop-shadow-sm">
              {challenge.race.title[lang]}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs font-mono font-bold text-slate-300">
            <span>📏</span>
            <span>{challenge.race.distance} km</span>
            <span className="capitalize text-slate-400">
              ({challenge.race.surface})
            </span>
          </div>
        </div>

        {/* Core Metrics Glass Grid */}
        <div className="grid grid-cols-4 gap-4 my-auto">
          {/* Outcome Tile */}
          <div
            className={`rounded-2xl p-4 border flex flex-col items-center justify-center text-center ${outcomeStyle.bg}`}
          >
            {outcomeStyle.icon}
            <span className="text-[10px] uppercase tracking-wider font-black mt-2 truncate max-w-full">
              {outcomeStyle.label}
            </span>
          </div>

          {/* Grade Tile */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-1">
              {t("challenge.result.grade" as TranslationKey)}
            </span>
            <span className="text-4xl font-black font-heading text-yellow-400 drop-shadow-md">
              {grade}
            </span>
          </div>

          {/* Score Tile */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-1">
              {t("history.score" as TranslationKey)}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black text-cyan-400">{score}</span>
              <span className="text-[10px] text-slate-500 font-bold">/100</span>
            </div>
            <div className="w-16 h-1.5 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
          </div>

          {/* Time & Pace Tile */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-1">
              {t("challenge.result.time" as TranslationKey)}
            </span>
            <div className="flex items-center gap-1 font-mono font-black text-white text-lg">
              <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{formatTime(finishTime)}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              {formatPace(finishTime, challenge.race.distance)}
            </span>
          </div>
        </div>

        {/* Footer Info Row */}
        <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300 font-bold">
              Official Race Certificate
            </span>
          </div>
          <span className="font-extrabold text-indigo-400 italic">
            {outcome === "dns"
              ? t("share.card_footer.dns" as TranslationKey)
              : outcome === "dnf"
                ? t("share.card_footer.dnf" as TranslationKey)
                : t("share.card_footer.finished" as TranslationKey)}
          </span>
        </div>
      </div>
    </ShareCardRenderer>
  );
}
