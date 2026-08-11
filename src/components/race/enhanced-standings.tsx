/**
 * Enhanced Live Standings Component
 * Shows Top 10, Player Context, and Bottom 3 with intelligent dividers
 */

"use client";

import { AlertCircle, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

interface Runner {
  id: string;
  name: string;
  distance: number;
  isPlayer: boolean;
  isDNF: boolean;
  dnfReason?: string;
  pace?: number; // Current pace in seconds per km
  previousDistance?: number; // For calculating momentum
}

interface EnhancedStandingsProps {
  runners: Runner[];
  raceDistance: number;
  showMobileVersion?: boolean; // Compact layout for mobile navbar
}

export function EnhancedStandings({
  runners,
  raceDistance,
  showMobileVersion = false,
}: EnhancedStandingsProps) {
  const { t } = useTranslation();

  // Sort runners by distance (descending)
  const sortedRunners = [...runners].sort((a, b) => {
    // DNF runners go to bottom
    if (a.isDNF && !b.isDNF) return 1;
    if (!a.isDNF && b.isDNF) return -1;
    // Otherwise sort by distance
    return b.distance - a.distance;
  });

  const playerIndex = sortedRunners.findIndex((r) => r.isPlayer);
  const totalRunners = sortedRunners.length;
  const dnfCount = sortedRunners.filter((r) => r.isDNF).length;
  const activeRunners = totalRunners - dnfCount;

  // Determine display sections
  const sections = calculateStandingsSections(
    sortedRunners,
    playerIndex,
    totalRunners,
  );

  return (
    <div className={`${showMobileVersion ? "text-xs" : "text-sm"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Trophy
            className={`${showMobileVersion ? "w-4 h-4" : "w-5 h-5"} text-amber-500`}
          />
          <h3
            className={`font-heading font-black ${showMobileVersion ? "text-sm" : "text-base"} text-slate-800 dark:text-white`}
          >
            {t("race.live_standings" as TranslationKey)}
          </h3>
        </div>
        <div
          className={`${showMobileVersion ? "text-[10px]" : "text-xs"} font-mono font-bold text-slate-500`}
        >
          {activeRunners} {t("race.active" as TranslationKey)}
          {dnfCount > 0 && ` • ${dnfCount} DNF`}
        </div>
      </div>

      {/* Top 10 Section */}
      {sections.top10.length > 0 && (
        <div className="mb-2">
          {sections.top10.map((runner, idx) => (
            <RunnerRow
              key={runner.id}
              runner={runner}
              position={idx + 1}
              raceDistance={raceDistance}
              showMobile={showMobileVersion}
            />
          ))}
        </div>
      )}

      {/* Divider between Top 10 and Player Context */}
      {sections.middleGap1 > 0 && (
        <Divider
          runnerCount={sections.middleGap1}
          showMobile={showMobileVersion}
        />
      )}

      {/* Player Context Section (if not in Top 10 or Bottom 3) */}
      {sections.playerContext.length > 0 && (
        <div className="mb-2">
          {sections.playerContext.map((runner, idx) => {
            const actualPosition =
              sections.top10.length + sections.middleGap1 + idx + 1;
            return (
              <RunnerRow
                key={runner.id}
                runner={runner}
                position={actualPosition}
                raceDistance={raceDistance}
                showMobile={showMobileVersion}
              />
            );
          })}
        </div>
      )}

      {/* Divider between Player Context and Bottom 3 */}
      {sections.middleGap2 > 0 && (
        <Divider
          runnerCount={sections.middleGap2}
          showMobile={showMobileVersion}
        />
      )}

      {/* Bottom 3 Section */}
      {sections.bottom3.length > 0 && (
        <div>
          {sections.bottom3.map((runner, idx) => {
            const position = totalRunners - sections.bottom3.length + idx + 1;
            return (
              <RunnerRow
                key={runner.id}
                runner={runner}
                position={position}
                raceDistance={raceDistance}
                showMobile={showMobileVersion}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Calculate which runners to show in each section
 */
function calculateStandingsSections(
  sortedRunners: Runner[],
  playerIndex: number,
  totalRunners: number,
) {
  const top10Count = Math.min(10, totalRunners);
  const bottom3Count = Math.min(3, totalRunners);

  // Edge case: Small field (< 15 runners), show all
  if (totalRunners < 15) {
    return {
      top10: sortedRunners,
      playerContext: [],
      bottom3: [],
      middleGap1: 0,
      middleGap2: 0,
    };
  }

  // Top 10
  const top10 = sortedRunners.slice(0, top10Count);

  // Bottom 3
  const bottom3 = sortedRunners.slice(-bottom3Count);

  // Player context (if player is between Top 10 and Bottom 3)
  let playerContext: Runner[] = [];
  let middleGap1 = 0;
  let middleGap2 = 0;

  const playerInTop10 = playerIndex < top10Count;
  const playerInBottom3 = playerIndex >= totalRunners - bottom3Count;

  if (!playerInTop10 && !playerInBottom3) {
    // Show player + 1 ahead + 1 behind
    const contextStart = Math.max(top10Count, playerIndex - 1);
    const contextEnd = Math.min(totalRunners - bottom3Count, playerIndex + 2);
    playerContext = sortedRunners.slice(contextStart, contextEnd);

    // Calculate gaps
    middleGap1 = contextStart - top10Count;
    middleGap2 = totalRunners - bottom3Count - contextEnd;
  } else {
    // Player is in Top 10 or Bottom 3, calculate single gap
    middleGap1 = totalRunners - top10Count - bottom3Count;
  }

  return {
    top10,
    playerContext,
    bottom3,
    middleGap1,
    middleGap2,
  };
}

/**
 * Individual runner row component
 */
interface RunnerRowProps {
  runner: Runner;
  position: number;
  raceDistance: number;
  showMobile: boolean;
}

function RunnerRow({
  runner,
  position,
  raceDistance,
  showMobile,
}: RunnerRowProps) {
  const progressPercent = (runner.distance / raceDistance) * 100;
  const isMedal = position <= 3 && !runner.isDNF;
  const medalIcons = { 1: "🥇", 2: "🥈", 3: "🥉" };

  // Calculate momentum (gaining or losing ground)
  const momentum = calculateMomentum(runner);

  return (
    <div
      className={`
        flex items-center justify-between gap-2 py-2 px-3 rounded-lg
        ${
          runner.isPlayer
            ? "bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-600"
            : "bg-slate-50 dark:bg-slate-800/50"
        }
        ${runner.isDNF ? "opacity-60" : ""}
        ${showMobile ? "py-1.5 px-2" : ""}
        mb-1
      `}
    >
      {/* Position + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Position Number or Medal */}
        <span
          className={`
          ${showMobile ? "text-[10px] w-5" : "text-xs w-6"}
          font-mono font-black text-slate-600 dark:text-slate-400 text-right
        `}
        >
          {isMedal ? medalIcons[position as 1 | 2 | 3] : position}
        </span>

        {/* Runner Name */}
        <span
          className={`
          ${showMobile ? "text-xs" : "text-sm"}
          font-semibold truncate
          ${runner.isPlayer ? "text-indigo-800 dark:text-indigo-200 font-bold" : "text-slate-700 dark:text-slate-300"}
          ${runner.isDNF ? "line-through" : ""}
        `}
        >
          {runner.name}
          {runner.isPlayer && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded">
              You
            </span>
          )}
        </span>
      </div>

      {/* Distance or DNF Reason */}
      <div className="flex items-center gap-2">
        {runner.isDNF ? (
          <div className="flex items-center gap-1">
            <AlertCircle
              className={`${showMobile ? "w-3 h-3" : "w-4 h-4"} text-rose-500`}
            />
            <span
              className={`${showMobile ? "text-[10px]" : "text-xs"} font-bold text-rose-600 dark:text-rose-400`}
            >
              DNF
            </span>
            {runner.dnfReason && !showMobile && (
              <span className="text-[10px] text-slate-500">
                ({runner.dnfReason})
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Momentum Indicator */}
            {momentum !== "neutral" &&
              (momentum === "gaining" ? (
                <TrendingUp
                  className={`${showMobile ? "w-3 h-3" : "w-4 h-4"} text-emerald-500`}
                />
              ) : (
                <TrendingDown
                  className={`${showMobile ? "w-3 h-3" : "w-4 h-4"} text-rose-500`}
                />
              ))}

            {/* Distance */}
            <span
              className={`
              ${showMobile ? "text-[10px]" : "text-xs"}
              font-mono font-bold text-slate-800 dark:text-white
            `}
            >
              {runner.distance.toFixed(1)} km
            </span>

            {/* Progress Bar (optional, for desktop) */}
            {!showMobile && (
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Divider showing hidden runner count
 */
function Divider({
  runnerCount,
  showMobile,
}: {
  runnerCount: number;
  showMobile: boolean;
}) {
  if (runnerCount <= 0) return null;

  return (
    <div
      className={`
      flex items-center justify-center gap-2 my-2
      ${showMobile ? "text-[10px]" : "text-xs"}
      text-slate-400 dark:text-slate-600
    `}
    >
      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
      <span className="font-mono font-bold">
        ... ({runnerCount} {runnerCount === 1 ? "runner" : "runners"}) ...
      </span>
      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
    </div>
  );
}

/**
 * Calculate runner momentum (gaining/losing/neutral)
 */
function calculateMomentum(runner: Runner): "gaining" | "losing" | "neutral" {
  if (!runner.previousDistance || runner.isDNF) return "neutral";

  const distanceGain = runner.distance - runner.previousDistance;

  // Threshold: significant if gained/lost more than 0.05 km since last update
  if (distanceGain > 0.05) return "gaining";
  if (distanceGain < -0.05) return "losing";
  return "neutral";
}
