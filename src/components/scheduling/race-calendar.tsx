"use client";

import { useState } from "react";
import type { RaceOccurrence } from "../../scheduling/race-calendar-types";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";
import { formatCurrency } from "@/economy/currency-converter";

function sortRegisteredRaces(races: RaceOccurrence[], currentDay: number): RaceOccurrence[] {
  const now = currentDay;
  const ninetyDays = 90;
  const finished: RaceOccurrence[] = [];
  const recent: RaceOccurrence[] = [];
  const upcoming: RaceOccurrence[] = [];

  for (const race of races) {
    if (race.isCompleted) {
      finished.push(race);
    } else if (race.dayIndex < now && now - race.dayIndex <= ninetyDays) {
      recent.push(race);
    } else {
      upcoming.push(race);
    }
  }

  // Sort each bucket: most recent first for finished and recent, earliest first for upcoming
  finished.sort((a, b) => b.dayIndex - a.dayIndex);
  recent.sort((a, b) => b.dayIndex - a.dayIndex);
  upcoming.sort((a, b) => a.dayIndex - b.dayIndex);

  return [...finished, ...recent, ...upcoming];
}

interface RaceCalendarProps {
  todayRaces: RaceOccurrence[];
  upcomingRaces: RaceOccurrence[];
  registeredRaces: RaceOccurrence[];
  onRaceClick?: (race: RaceOccurrence) => void;
}

type TabType = "today" | "registered" | "upcoming";

export function RaceCalendar({
  todayRaces,
  upcomingRaces,
  registeredRaces,
  onRaceClick,
}: RaceCalendarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const currentDayIndex = useTimelineStore.getState().gameState?.dayIndex ?? 0;

  const tabs = [
    { id: "today", label: "📅 Today's Races", count: todayRaces.length },
    { id: "registered", label: "🏆 Registered", count: registeredRaces.length },
    { id: "upcoming", label: "🔮 Upcoming Calendar", count: upcomingRaces.length },
  ] as const;

  return (
    <div className="space-y-5 bg-white/40 border border-grey-800/60 rounded-3xl p-5 md:p-6 backdrop-blur-md">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800/80 pb-0.5 gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-xs md:text-sm font-bold tracking-tight rounded-t-xl transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-1.5 cursor-pointer relative
                ${
                  isActive
                    ? "text-blue-400 border-blue-500 bg-blue-500/5 font-black"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20"
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold
                    ${isActive ? "bg-red-500 text-white" : "bg-slate-800 text-white"}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {activeTab === "today" && (
          <div className="space-y-4">
            {todayRaces.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">😴</span>
                <p className="text-slate-300 font-bold text-sm">No races scheduled today</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Take a rest day, hit the training screen to boost your runner stats, or apply for jobs.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {todayRaces.map((race) => (
                  <RaceCard
                    key={race.scheduleId}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "registered" && (
          <div className="space-y-4">
            {registeredRaces.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">🎟️</span>
                <p className="text-slate-100 font-bold text-sm">No registered races</p>
                <p className="text-xs text-slate-800 mt-1 max-w-xs mx-auto">
                  Browse the "Upcoming Calendar" tab to find events and sign up before registration closes!
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {sortRegisteredRaces(registeredRaces, currentDayIndex).map((race) => (
                  <RaceCard
                    key={`${race.scheduleId}_reg`}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingRaces.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">🔮</span>
                <p className="text-slate-300 font-bold text-sm">No upcoming races found</p>
                <p className="text-xs text-slate-500 mt-1">Check back later for new events.</p>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {upcomingRaces.map((race) => (
                  <UpcomingRaceCard
                    key={`${race.scheduleId}_${race.dayIndex}`}
                    race={race}
                    onClick={() => onRaceClick?.(race)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RaceCard({
  race,
  onClick,
}: {
  race: RaceOccurrence;
  onClick?: () => void;
}) {
  const preferredCurrency = useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  
  const tierColors: Record<string, string> = {
    local: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35 hover:bg-emerald-500/10",
    regional: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/35 hover:bg-blue-500/10",
    state: "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/35 hover:bg-purple-500/10",
    national: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/35 hover:bg-amber-500/10",
    international: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/35 hover:bg-rose-500/10",
  };

  const tierBadges: Record<string, string> = {
    local: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    regional: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    state: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    national: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    international: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={race.isCompleted}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99] flex flex-col gap-3.5
        ${
          race.isCompleted
            ? "border-slate-800 bg-slate-900/20 opacity-40 cursor-not-allowed"
            : race.isFull
              ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10"
              : (tierColors[race.tier] ?? "border-slate-700 bg-slate-800")
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 min-w-0">
          <span className={`text-2xl shrink-0 p-2 bg-slate-950/40 rounded-xl border border-slate-800/40 ${race.color}`}>{race.icon}</span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-black text-sm md:text-base tracking-tight truncate">{race.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
              {race.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Right: Cost + Prize */}
        <div className="text-right shrink-0">
          <div className="text-xs font-medium text-slate-500">Entry Fee</div>
          <div className="text-sm font-black text-amber-400 mt-0.5">
            {formatCurrency(race.entryFee, preferredCurrency)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/50">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider ${tierBadges[race.tier] ?? "bg-slate-800 text-slate-400 border border-slate-700"}`}
          >
            {race.tier}
          </span>

          {race.isRegistered && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Registered
            </span>
          )}

          {race.isFull && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              FULL
            </span>
          )}

          {race.isCompleted && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wider bg-slate-800 text-slate-500 border border-slate-800/50">
              Completed
            </span>
          )}

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-400 border border-slate-200 font-mono">
            🗓️ Day {race.dayIndex}
          </span>
        </div>

        <div className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
          <span>🏆</span> Pool: {formatCurrency(race.prizePool, preferredCurrency)}
        </div>
      </div>
    </button>
  );
}

function UpcomingRaceCard({
  race,
  onClick,
}: {
  race: RaceOccurrence;
  onClick?: () => void;
}) {
  const preferredCurrency = useSettingsStore((state) => state.settings.preferredCurrency) || "USD";
  const daysUntil = race.dayIndex - race.registrationOpensAt;
  const status =
    daysUntil <= 0 ? "Registration Open" : `Opens in ${daysUntil} days`;

  const tierColors: Record<string, string> = {
    local: "border-emerald-500/10 bg-emerald-500/[0.02] hover:bg-emerald-500/5 hover:border-emerald-500/20",
    regional: "border-blue-500/10 bg-blue-500/[0.02] hover:bg-blue-500/5 hover:border-blue-500/20",
    state: "border-purple-500/10 bg-purple-500/[0.02] hover:bg-purple-500/5 hover:border-purple-500/20",
    national: "border-amber-500/10 bg-amber-500/[0.02] hover:bg-amber-500/5 hover:border-amber-500/20",
    international: "border-rose-500/10 bg-rose-500/[0.02] hover:bg-rose-500/5 hover:border-rose-500/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-3 flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer shadow-sm
        ${tierColors[race.tier] ?? "border-slate-800 bg-slate-900/30 hover:bg-slate-800/40"}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-xl p-1.5 bg-slate-950/20 rounded-lg border border-slate-850 ${race.color}`}>{race.icon}</span>
        <div className="min-w-0">
          <h4 className="font-extrabold text-black text-sm truncate">
            {race.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 capitalize font-bold">
              {race.tier}
            </span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-[10px] text-slate-600 font-mono">
              Day {race.dayIndex}
            </span>
            {race.isRegistered && (
              <>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded border border-blue-500/20">
                  Registered
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-xs font-extrabold ${daysUntil <= 0 ? "text-emerald-400 animate-pulse" : "text-blue-400"}`}>
          {status}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {formatCurrency(race.entryFee, preferredCurrency)} entry
        </div>
      </div>
    </button>
  );
}
