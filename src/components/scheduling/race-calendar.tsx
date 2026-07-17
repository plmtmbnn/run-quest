/**
 * Race Calendar Component (Sprint 26 - Task 6)
 *
 * Calendar view showing today's races and upcoming events.
 */

"use client";

import type { RaceOccurrence } from "../../scheduling/race-calendar-types";

interface RaceCalendarProps {
  todayRaces: RaceOccurrence[];
  upcomingRaces: RaceOccurrence[];
  onRaceClick?: (race: RaceOccurrence) => void;
}

export function RaceCalendar({
  todayRaces,
  upcomingRaces,
  onRaceClick,
}: RaceCalendarProps) {
  return (
    <div className="space-y-6">
      {/* Today's Races */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📅</span> Today's Races
        </h2>

        {todayRaces.length === 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center">
            <p className="text-gray-400">No races available today</p>
            <p className="text-sm text-gray-500 mt-2">
              Rest or train to prepare for upcoming events
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
      </section>

      {/* Upcoming Races */}
      {upcomingRaces.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔮</span> Upcoming Races
          </h2>

          <div className="grid gap-2">
            {upcomingRaces.slice(0, 5).map((race) => (
              <UpcomingRaceCard
                key={`${race.scheduleId}_${race.dayIndex}`}
                race={race}
                onClick={() => onRaceClick?.(race)}
              />
            ))}
          </div>
        </section>
      )}
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
  const tierColors: Record<string, string> = {
    local: "border-green-500/30 bg-green-500/5",
    regional: "border-blue-500/30 bg-blue-500/5",
    state: "border-purple-500/30 bg-purple-500/5",
    national: "border-orange-500/30 bg-orange-500/5",
    international: "border-red-500/30 bg-red-500/5",
  };

  const tierBadges: Record<string, string> = {
    local: "bg-green-500/20 text-green-400",
    regional: "bg-blue-500/20 text-blue-400",
    state: "bg-purple-500/20 text-purple-400",
    national: "bg-orange-500/20 text-orange-400",
    international: "bg-red-500/20 text-red-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={race.isCompleted}
      className={`w-full text-left rounded-lg border p-4 transition-all hover:scale-[1.02] ${
        race.isCompleted
          ? "border-gray-600 bg-gray-800/30 opacity-50"
          : race.isFull
            ? "border-yellow-500/50 bg-yellow-500/5"
            : (tierColors[race.tier] ?? "border-gray-600 bg-gray-800")
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Name */}
        <div className="flex items-start gap-3 min-w-0">
          <span className={`text-2xl shrink-0 ${race.color}`}>{race.icon}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{race.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {race.description || "No description available"}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize ${tierBadges[race.tier] ?? "bg-gray-500/20 text-gray-400"}`}
              >
                {race.tier}
              </span>

              {race.isFull && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  FULL
                </span>
              )}

              {race.isRegistered && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  Registered
                </span>
              )}

              {race.isCompleted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cost + Prize */}
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-yellow-400">
            ${race.entryFee}
          </div>
          <div className="text-xs text-green-400">Pool: ${race.prizePool}</div>
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
  const daysUntil = race.dayIndex - race.registrationOpensAt;
  const status =
    daysUntil <= 0 ? "Registration Open" : `Opens in ${daysUntil} days`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-gray-700 bg-gray-800/30 p-3 transition-all hover:bg-gray-700/50"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-lg ${race.color}`}>{race.icon}</span>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">
              {race.name}
            </h4>
            <p className="text-xs text-gray-400 capitalize">
              {race.tier} • Day {race.dayIndex}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-medium text-blue-400">{status}</div>
          <div className="text-xs text-gray-500">${race.entryFee} entry</div>
        </div>
      </div>
    </button>
  );
}
