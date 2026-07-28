"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, Bandage, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { BodyStressState, BodyZoneId, ZoneStressInfo } from "@/engine/simulation/body-stress-engine";

interface BodyStressAvatarProps {
  bodyStress?: BodyStressState;
  className?: string;
}

export function BodyStressAvatar({ bodyStress, className = "" }: BodyStressAvatarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<ZoneStressInfo | null>(null);

  const zones: ZoneStressInfo[] = bodyStress
    ? [
        bodyStress.head,
        bodyStress.lungs,
        bodyStress.core,
        bodyStress.quads,
        bodyStress.calves,
        bodyStress.feet,
      ]
    : [
        { zoneId: "head", label: "Head & Focus", percentage: 10, level: "normal", hasInjury: false },
        { zoneId: "lungs", label: "Lungs & Chest", percentage: 15, level: "normal", hasInjury: false },
        { zoneId: "core", label: "Core & Back", percentage: 12, level: "normal", hasInjury: false },
        { zoneId: "quads", label: "Quads & Thighs", percentage: 20, level: "normal", hasInjury: false },
        { zoneId: "calves", label: "Calves & Shins", percentage: 18, level: "normal", hasInjury: false },
        { zoneId: "feet", label: "Feet & Ankles", percentage: 25, level: "normal", hasInjury: false },
      ];

  const worstZone = zones.reduce((max, z) => (z.percentage > max.percentage ? z : max), zones[0]);
  const activeInjuries = zones.filter((z) => z.hasInjury);

  const getZoneFill = (info: ZoneStressInfo) => {
    if (info.hasInjury) return "fill-red-500 animate-pulse stroke-red-300";
    switch (info.level) {
      case "critical":
        return "fill-red-500 dark:fill-red-600 animate-pulse";
      case "stressed":
        return "fill-orange-500 dark:fill-orange-600";
      case "fatigued":
        return "fill-amber-400 dark:fill-amber-500";
      default:
        return "fill-slate-300 dark:fill-slate-700";
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "stressed":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "fatigued":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-3 shadow-md transition-all ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white">
            BODY STRESS
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsed Pill Summary */}
      {isCollapsed ? (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500">MAX STRESS</span>
          <span className={`px-2 py-0.5 rounded-full font-mono font-bold border text-[10px] ${getLevelBadgeColor(worstZone.level)}`}>
            {worstZone.percentage}% ({worstZone.zoneId.toUpperCase()})
          </span>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-4">
          {/* SVG Humanoid Runner Avatar (w-24 h-48) */}
          <div className="relative w-24 h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-sm">
              {/* HEAD */}
              <circle
                cx="50"
                cy="25"
                r="16"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[0])}`}
                onMouseEnter={() => setHoveredZone(zones[0])}
                onMouseLeave={() => setHoveredZone(null)}
              />

              {/* LUNGS / CHEST */}
              <path
                d="M 32 45 C 32 45, 50 42, 68 45 L 65 85 L 35 85 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[1])}`}
                onMouseEnter={() => setHoveredZone(zones[1])}
                onMouseLeave={() => setHoveredZone(null)}
              />

              {/* CORE / ABS */}
              <path
                d="M 35 87 L 65 87 L 60 115 L 40 115 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[2])}`}
                onMouseEnter={() => setHoveredZone(zones[2])}
                onMouseLeave={() => setHoveredZone(null)}
              />

              {/* QUADS (Left & Right Thighs) */}
              <path
                d="M 38 118 L 48 118 L 46 155 L 34 155 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[3])}`}
                onMouseEnter={() => setHoveredZone(zones[3])}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                d="M 52 118 L 62 118 L 66 155 L 54 155 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[3])}`}
                onMouseEnter={() => setHoveredZone(zones[3])}
                onMouseLeave={() => setHoveredZone(null)}
              />

              {/* CALVES (Left & Right Lower Legs) */}
              <path
                d="M 35 158 L 45 158 L 43 185 L 37 185 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[4])}`}
                onMouseEnter={() => setHoveredZone(zones[4])}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                d="M 55 158 L 65 158 L 63 185 L 57 185 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[4])}`}
                onMouseEnter={() => setHoveredZone(zones[4])}
                onMouseLeave={() => setHoveredZone(null)}
              />

              {/* FEET */}
              <path
                d="M 33 187 L 45 187 L 46 195 L 30 195 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[5])}`}
                onMouseEnter={() => setHoveredZone(zones[5])}
                onMouseLeave={() => setHoveredZone(null)}
              />
              <path
                d="M 55 187 L 67 187 L 70 195 L 54 195 Z"
                className={`transition-colors duration-300 cursor-pointer stroke-slate-400 dark:stroke-slate-600 ${getZoneFill(zones[5])}`}
                onMouseEnter={() => setHoveredZone(zones[5])}
                onMouseLeave={() => setHoveredZone(null)}
              />
            </svg>

            {/* Active Injury Badge Overlays */}
            {activeInjuries.map((z) => (
              <div
                key={z.zoneId}
                className="absolute top-2 right-0 bg-red-500 text-white rounded-full p-1 shadow-md animate-bounce"
                title={`INJURY: ${z.injuryMessage || z.label}`}
              >
                <Bandage className="w-3.5 h-3.5" />
              </div>
            ))}
          </div>

          {/* Side Mini Breakdown Legend */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {zones.map((z) => (
              <div
                key={z.zoneId}
                onMouseEnter={() => setHoveredZone(z)}
                onMouseLeave={() => setHoveredZone(null)}
                className={`flex items-center justify-between text-[10px] p-1 rounded-md cursor-pointer transition-colors ${
                  hoveredZone?.zoneId === z.zoneId ? "bg-slate-100 dark:bg-slate-800" : ""
                }`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  {z.hasInjury && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                  <span className="font-semibold truncate text-slate-700 dark:text-slate-300">
                    {z.label.split(" ")[0]}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {z.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hover Tooltip Popup */}
      <AnimatePresence>
        {hoveredZone && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs w-48 z-40 border border-slate-700 pointer-events-none"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{hoveredZone.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getLevelBadgeColor(hoveredZone.level)}`}>
                {hoveredZone.level}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Stress Level: <span className="font-bold text-white">{hoveredZone.percentage}%</span>
            </div>
            {hoveredZone.hasInjury && (
              <div className="mt-1 text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {hoveredZone.injuryMessage || "Active Breaking Point Injury"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
