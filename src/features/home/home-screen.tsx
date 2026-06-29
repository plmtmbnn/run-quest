"use client";

import { Clock, Flame, MapPin, Wind } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/use-translation";
import { usePlayerStore } from "@/store/player-store";

/**
 * Home screen — shows today's daily challenge summary and primary CTA.
 */
export function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const player = usePlayerStore((state) => state.player);

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
          RunQuest
        </p>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">
          {t("home.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("home.subtitle")}</p>
      </header>

      {/* Daily Challenge Card */}
      <main className="flex-1 px-6 py-4 flex flex-col gap-4">
        <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-6">
          {/* Date badge */}
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Daily Challenge</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 font-heading mb-1">
            Morning Tempo
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            A rolling road race under the morning heat. Stay patient and manage
            your hydration.
          </p>

          {/* Race details */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatChip
              icon={<MapPin className="w-4 h-4" />}
              label="Distance"
              value="21.1 km"
            />
            <StatChip
              icon={<Flame className="w-4 h-4" />}
              label="Weather"
              value="Hot 31°"
            />
            <StatChip
              icon={<Wind className="w-4 h-4" />}
              label="Surface"
              value="Road"
            />
          </div>

          {/* Target time */}
          <div className="flex items-center gap-2 bg-orange-50 rounded-2xl p-3 mb-6">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-orange-800 font-medium">
              Target: finish under 2:00:00
            </span>
          </div>

          {/* Primary CTA */}
          <button
            id="start-race-cta"
            type="button"
            onClick={() => router.push("/preparation")}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-full transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {t("common.start")} Today&apos;s Race
          </button>
        </div>

        {/* Player ID (dev helper) */}
        {player && (
          <p className="text-xs text-center text-gray-300 select-all">
            ID: {player.id.slice(0, 8)}
          </p>
        )}
      </main>
    </div>
  );
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatChip({ icon, label, value }: StatChipProps) {
  return (
    <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-2xl p-3">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}
