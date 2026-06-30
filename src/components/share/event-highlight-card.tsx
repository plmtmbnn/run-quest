import { Sparkles } from "lucide-react";
import type { Language } from "@/i18n/types";
import type { RaceEvent } from "@/types/engine";
import { ShareCardRenderer } from "./share-card-renderer";

interface EventHighlightCardProps {
  event: RaceEvent;
  raceTitle: string;
  lang: Language;
  date: string;
}

export function EventHighlightCard({
  event,
  raceTitle,
  lang,
  date,
}: EventHighlightCardProps) {
  const formatEffects = () => {
    const effects: string[] = [];
    if (event.effect.stamina !== 0) {
      effects.push(
        `${event.effect.stamina > 0 ? "+" : ""}${event.effect.stamina} Stamina`,
      );
    }
    if (event.effect.hydration !== 0) {
      effects.push(
        `${event.effect.hydration > 0 ? "+" : ""}${event.effect.hydration} Hydration`,
      );
    }
    if (event.effect.morale !== 0) {
      effects.push(
        `${event.effect.morale > 0 ? "+" : ""}${event.effect.morale} Focus`,
      );
    }
    if (event.effect.pace !== 0) {
      effects.push(
        `${event.effect.pace > 0 ? "+" : "-"}${Math.abs(event.effect.pace)}s/km Pace`,
      );
    }
    return effects.length > 0 ? effects.join("  •  ") : "No impact";
  };

  const isPositive = event.effect.stamina >= 0 && event.effect.morale >= 0;

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={
        lang === "id" ? "RunQuest Momen Balapan" : "RunQuest Race Highlight"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            {lang === "id" ? "Momen Balapan — Kilometer" : "Race Moment — Km"}{" "}
            {event.km}
          </h2>
          <p className="text-xs text-slate-400 mt-1 truncate">{raceTitle}</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 min-h-[160px] justify-center">
          <div>
            <h3
              className={`text-xl font-black font-heading ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            >
              {event.title[lang]}
            </h3>
            <p className="text-base font-semibold leading-relaxed text-slate-200 mt-1.5 italic">
              "{event.description[lang]}"
            </p>
          </div>

          <div className="border-t border-slate-700/60 pt-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Impact
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300">
              {formatEffects()}
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold italic text-slate-300">
          {lang === "id" ? "Saya berhasil melewatinya! 🏃‍♂️" : "Survived it! 💪"}
        </p>
      </div>
    </ShareCardRenderer>
  );
}
