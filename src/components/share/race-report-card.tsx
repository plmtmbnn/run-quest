import { Award, Clock } from "lucide-react";
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

  const getOutcomeColor = () => {
    switch (outcome) {
      case "gold":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "silver":
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
      case "bronze":
        return "text-amber-600 bg-amber-600/10 border-amber-600/30";
      case "finish":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "dnf":
        return "text-red-500 bg-red-50/10 border-red-500/30";
      case "dns":
        return "text-red-500 bg-red-50/10 border-red-500/30";
    }
  };

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={t("share.card_title.result" as TranslationKey)}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            {t("share.card_subtitle.result" as TranslationKey)}
          </h2>
          <h1 className="text-xl font-black font-heading text-white mt-0.5 truncate">
            {challenge.race.title[lang]}
          </h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex items-center justify-around gap-6">
          <div
            className={`flex flex-col items-center p-4 rounded-xl border ${getOutcomeColor()}`}
          >
            <Award className="h-12 w-12 mb-1" />
            <span className="text-[10px] uppercase tracking-widest font-black">
              {t(`challenge.result.outcome_${outcome}` as TranslationKey)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
              {t("challenge.result.grade" as TranslationKey)}
            </span>
            <span className="text-5xl font-black font-heading text-white">
              {grade}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
              {t("history.score" as TranslationKey)}
            </span>
            <span className="text-4xl font-extrabold text-blue-400">
              {score}
            </span>
            <span className="text-[9px] text-slate-500">
              {t("challenge.result.score_out_of" as TranslationKey)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">
              {t("challenge.result.time" as TranslationKey)}
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-200 text-xl mt-1">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              <span>{formatTime(finishTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-400 px-1">
          <span>
            {t("history.distance" as TranslationKey)}:{" "}
            {outcome === "dns" ? "0" : challenge.race.distance} km
          </span>
          <span className="italic text-indigo-400 font-medium">
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
