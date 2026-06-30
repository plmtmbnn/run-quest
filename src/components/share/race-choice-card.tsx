import { Clock, Flame, MapPin, Sparkles } from "lucide-react";
import type { Language } from "@/i18n/types";
import type { DailyChallenge } from "@/types/engine";
import { ShareCardRenderer } from "./share-card-renderer";

interface RaceChoiceCardProps {
  challenge: DailyChallenge;
  lang: Language;
  date: string;
}

export function RaceChoiceCard({ challenge, lang, date }: RaceChoiceCardProps) {
  const formatTargetTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={
        lang === "id" ? "RunQuest Pilihan Balapan" : "RunQuest Race Choice"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            {lang === "id"
              ? "Hari Ini Saya Berlari..."
              : "Today I'm Running..."}
          </h2>
          <h1 className="text-3xl font-black font-heading text-white mt-1">
            {challenge.race.title[lang]}
          </h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Terrain / Surface
              </p>
              <p className="font-bold text-slate-200 capitalize">
                {challenge.race.surface}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Weather & Temp
              </p>
              <p className="font-bold text-slate-200 capitalize">
                {challenge.environment.weather} (
                {challenge.environment.temperature}°C)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Elevation Profile
              </p>
              <p className="font-bold text-slate-200 capitalize">
                {challenge.race.elevation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                Target Time
              </p>
              <p className="font-bold text-slate-200">
                Under {formatTargetTime(challenge.objective.targetTime)}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold italic text-slate-300">
          {lang === "id"
            ? "Balapan apa yang KAMU pilih hari ini?"
            : "What race are YOU picking today?"}
        </p>
      </div>
    </ShareCardRenderer>
  );
}
