import type { Language } from "@/i18n/types";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import type { Preparation } from "@/types/engine";
import { ShareCardRenderer } from "./share-card-renderer";

interface LoadoutCardProps {
  preparation: Preparation;
  raceTitle: string;
  lang: Language;
  date: string;
}

export function LoadoutCard({
  preparation,
  raceTitle,
  lang,
  date,
}: LoadoutCardProps) {
  const { t } = useTranslation();

  return (
    <ShareCardRenderer
      date={date}
      headerTitle={
        lang === "id" ? "RunQuest Strategi Balap" : "RunQuest Race Loadout"
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            {lang === "id" ? "Strategi Balap Saya" : "My Race Loadout"}
          </h2>
          <h1 className="text-xl font-black font-heading text-white mt-0.5 truncate">
            {raceTitle}
          </h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              👟 Shoes
            </span>
            <span className="font-semibold text-slate-100">
              {t(
                `preparation.shoes.${preparation.shoes}.name` as TranslationKey,
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              🥤 Nutrition
            </span>
            <span className="font-semibold text-slate-100">
              {t(
                `preparation.nutrition.${preparation.nutrition}.name` as TranslationKey,
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              🔥 Warm-up
            </span>
            <span className="font-semibold text-slate-100">
              {t(
                `preparation.warmup.${preparation.warmup}.name` as TranslationKey,
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              📊 Pacing
            </span>
            <span className="font-semibold text-slate-100">
              {t(
                `preparation.pacing.${preparation.pacing}.name` as TranslationKey,
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              🧠 Mindset
            </span>
            <span className="font-semibold text-slate-100">
              {t(
                `preparation.mindset.${preparation.mindset}.name` as TranslationKey,
              )}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              🎒 Selected Gear
            </span>
            <span className="font-semibold text-slate-100 truncate">
              {preparation.gear.length > 0
                ? preparation.gear
                    .map((g) =>
                      t(`preparation.gear.${g}.name` as TranslationKey),
                    )
                    .join(", ")
                : "None"}
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold italic text-slate-300">
          {lang === "id"
            ? "Kira-kira saya bakal selamat? 😅"
            : "Think I'll survive? 😅"}
        </p>
      </div>
    </ShareCardRenderer>
  );
}
