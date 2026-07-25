"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Zap, Heart, Users, Clock } from "lucide-react";
import { useTranslation } from "@/i18n/use-translation";
import type { RaceAnalytics, WhatIfScenario } from "@/services/analytics/race-analytics";

interface PostRaceAnalyticsProps {
  analytics: RaceAnalytics;
  lang: "en" | "id";
}

/**
 * Comprehensive post-race analytics dashboard with 5 visualization sections
 * and "What If" scenario simulator
 */
export function PostRaceAnalytics({ analytics, lang }: PostRaceAnalyticsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"pace" | "energy" | "position" | "fatigue" | "moments">("pace");

  return (
    <section className="rounded-[2rem] border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <Zap className="h-5 w-5 text-orange-500" />
        <h2 className="font-heading text-lg font-bold text-gray-800 dark:text-gray-100">
          {t("race.analytics.title" as any) || "Deep Dive Analytics"}
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "pace" as const, label: t("race.analytics.pace_chart" as any) || "Pace Chart", icon: "📊" },
          { id: "energy" as const, label: t("race.analytics.energy_curve" as any) || "Energy Curve", icon: "⚡" },
          { id: "position" as const, label: t("race.analytics.position_progression" as any) || "Position", icon: "🏃" },
          { id: "fatigue" as const, label: t("race.analytics.fatigue_split" as any) || "Fatigue", icon: "💪" },
          { id: "moments" as const, label: t("race.analytics.critical_moments" as any) || "Key Moments", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pace" && <PaceChart analytics={analytics} lang={lang} />}
          {activeTab === "energy" && <EnergyCurve analytics={analytics} lang={lang} />}
          {activeTab === "position" && <PositionProgression analytics={analytics} lang={lang} />}
          {activeTab === "fatigue" && <FatigueSplit analytics={analytics} lang={lang} />}
          {activeTab === "moments" && <CriticalMoments analytics={analytics} lang={lang} />}
        </motion.div>
      </AnimatePresence>

      {/* What If Simulator */}
      {analytics.whatIfScenarios.length > 0 && (
        <WhatIfSimulator scenarios={analytics.whatIfScenarios} lang={lang} />
      )}
    </section>
  );
}

/**
 * Pace Chart - Line chart showing pace per km
 */
function PaceChart({ analytics, lang }: { analytics: RaceAnalytics; lang: "en" | "id" }) {
  const { splits, bestSplit, worstSplit, averagePace } = analytics;
  
  const maxPace = Math.max(...splits.map(s => s.pace));
  const minPace = Math.min(...splits.map(s => s.pace));
  const paceRange = maxPace - minPace || 1;
  
  const chartHeight = 200;
  const chartWidth = Math.max(600, splits.length * 40);
  const padding = 40;
  
  const getY = (pace: number) => {
    const normalized = (maxPace - pace) / paceRange;
    return padding + normalized * (chartHeight - padding * 2);
  };
  
  const getX = (index: number) => {
    return padding + (index / (splits.length - 1)) * (chartWidth - padding * 2);
  };
  
  const pathData = splits.map((split, i) => {
    const x = getX(i);
    const y = getY(split.pace);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {lang === "en" ? "Pace Analysis" : "Analisis Pace"}
        </h3>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-500">
            {lang === "en" ? "Avg" : "Rata-rata"}: <span className="font-mono font-bold">{formatPace(averagePace)}</span>
          </span>
          <span className="text-green-500">
            {lang === "en" ? "Best" : "Terbaik"}: <span className="font-mono font-bold">{formatPace(bestSplit.pace)}</span>
          </span>
          <span className="text-red-500">
            {lang === "en" ? "Worst" : "Terburuk"}: <span className="font-mono font-bold">{formatPace(worstSplit.pace)}</span>
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (chartHeight - padding * 2);
            return (
              <line
                key={ratio}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeDasharray="4,4"
              />
            );
          })}
          
          {/* Average pace baseline */}
          <line
            x1={padding}
            y1={getY(averagePace)}
            x2={chartWidth - padding}
            y2={getY(averagePace)}
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-blue-400 dark:stroke-blue-500"
            strokeDasharray="6,6"
          />
          
          {/* Pace line */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="stroke-orange-500"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {splits.map((split, i) => {
            const isBest = split.km === bestSplit.km;
            const isWorst = split.km === worstSplit.km;
            return (
              <circle
                key={split.km}
                cx={getX(i)}
                cy={getY(split.pace)}
                r={isBest || isWorst ? 6 : 4}
                fill="currentColor"
                className={isBest ? "fill-green-500" : isWorst ? "fill-red-500" : "fill-orange-500"}
              />
            );
          })}
          
          {/* X-axis labels */}
          {splits.map((split, i) => {
            if (i % Math.ceil(splits.length / 10) === 0 || i === splits.length - 1) {
              return (
                <text
                  key={`label-${split.km}`}
                  x={getX(i)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 text-xs"
                >
                  {split.km}km
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * Energy Curve - Area chart showing energy decline
 */
function EnergyCurve({ analytics, lang }: { analytics: RaceAnalytics; lang: "en" | "id" }) {
  const { energyCurve, consumableUsage } = analytics;
  
  const chartHeight = 200;
  const chartWidth = Math.max(600, energyCurve.length * 40);
  const padding = 40;
  
  const getY = (energy: number) => {
    return padding + (100 - energy) / 100 * (chartHeight - padding * 2);
  };
  
  const getX = (index: number) => {
    return padding + (index / (energyCurve.length - 1)) * (chartWidth - padding * 2);
  };
  
  const pathData = energyCurve.map((point, i) => {
    const x = getX(i);
    const y = getY(point.energy);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  const areaData = pathData + ` L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {lang === "en" ? "Energy Management" : "Manajemen Energi"}
        </h3>
        <div className="text-xs text-slate-500">
          {lang === "en" ? "Drain Rate" : "Tingkat Berkurang"}: <span className="font-mono font-bold">{analytics.energyDrainRate.toFixed(1)}%/km</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="rgb(251, 191, 36)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Energy zones */}
          <rect x={padding} y={padding} width={chartWidth - padding * 2} height={(chartHeight - padding * 2) * 0.3} fill="rgb(34, 197, 94)" opacity="0.1" />
          <rect x={padding} y={padding + (chartHeight - padding * 2) * 0.3} width={chartWidth - padding * 2} height={(chartHeight - padding * 2) * 0.5} fill="rgb(251, 191, 36)" opacity="0.1" />
          <rect x={padding} y={padding + (chartHeight - padding * 2) * 0.8} width={chartWidth - padding * 2} height={(chartHeight - padding * 2) * 0.2} fill="rgb(239, 68, 68)" opacity="0.1" />
          
          {/* Area fill */}
          <path
            d={areaData}
            fill="url(#energyGradient)"
          />
          
          {/* Energy line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Consumable markers */}
          {consumableUsage.map((usage) => {
            const index = energyCurve.findIndex(e => e.km === usage.km);
            if (index >= 0) {
              const x = getX(index);
              const y = getY(energyCurve[index].energy);
              return (
                <g key={usage.km}>
                  <circle cx={x} cy={y} r={8} fill="rgb(59, 130, 246)" opacity="0.3" />
                  <text x={x} y={y + 4} textAnchor="middle" className="text-xs">💧</text>
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * Position Progression - Step chart showing position changes
 */
function PositionProgression({ analytics, lang }: { analytics: RaceAnalytics; lang: "en" | "id" }) {
  const { positionProgression } = analytics;
  
  const maxPosition = Math.max(...positionProgression.map(p => p.position));
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {lang === "en" ? "Position Throughout Race" : "Posisi Sepanjang Race"}
      </h3>
      
      <div className="space-y-2">
        {positionProgression.map((prog, i) => {
          const prevPosition = i > 0 ? positionProgression[i - 1].position : prog.position;
          const positionChange = prevPosition - prog.position; // positive = moved up
          
          return (
            <div key={prog.km} className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 w-12">
                {prog.km}km
              </span>
              
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-8 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(prog.position / maxPosition) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`h-full rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      prog.position === 1 ? "bg-yellow-500" :
                      prog.position === 2 ? "bg-gray-400" :
                      prog.position === 3 ? "bg-amber-600" :
                      "bg-blue-500"
                    }`}
                  >
                    {prog.position}
                  </motion.div>
                </div>
                
                {positionChange !== 0 && (
                  <span className={`text-xs font-bold ${positionChange > 0 ? "text-green-500" : "text-red-500"}`}>
                    {positionChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fatigue Split - Stacked bar chart of muscle vs mental fatigue
 */
function FatigueSplit({ analytics, lang }: { analytics: RaceAnalytics; lang: "en" | "id" }) {
  const { fatigueProgression } = analytics;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {lang === "en" ? "Fatigue Buildup" : "Akumulasi Kelelahan"}
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            {lang === "en" ? "Muscle" : "Otot"}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
            {lang === "en" ? "Mental" : "Mental"}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {fatigueProgression.map((fatigue, i) => (
          <div key={fatigue.km} className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500 w-12">
              {fatigue.km}km
            </span>
            
            <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fatigue.muscle}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white"
              >
                {fatigue.muscle > 10 && `${fatigue.muscle}%`}
              </motion.div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fatigue.mental}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white"
              >
                {fatigue.mental > 10 && `${fatigue.mental}%`}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Critical Moments - Timeline of key events
 */
function CriticalMoments({ analytics, lang }: { analytics: RaceAnalytics; lang: "en" | "id" }) {
  const { criticalMoments } = analytics;
  
  if (criticalMoments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {lang === "en" ? "No critical moments detected" : "Tidak ada momen kritis terdeteksi"}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
        {lang === "en" ? "Key Race Moments" : "Momen Kunci Race"}
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
        
        <div className="space-y-4">
          {criticalMoments.map((moment, i) => (
            <motion.div
              key={`${moment.km}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              {/* Timeline dot */}
              <div className={`absolute left-3.5 top-2 w-5 h-5 rounded-full border-2 ${
                moment.impact === "positive" 
                  ? "bg-green-500 border-green-300" 
                  : moment.impact === "negative"
                    ? "bg-red-500 border-red-300"
                    : "bg-blue-500 border-blue-300"
              }`}></div>
              
              {/* Event card */}
              <div className={`p-3 rounded-xl border ${
                moment.impact === "positive"
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  : moment.impact === "negative"
                    ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    KM {moment.km}
                  </span>
                  <span className={`text-xs font-bold ${
                    moment.impact === "positive" ? "text-green-600 dark:text-green-400" :
                    moment.impact === "negative" ? "text-red-600 dark:text-red-400" :
                    "text-blue-600 dark:text-blue-400"
                  }`}>
                    {moment.impact === "positive" ? "↑" : moment.impact === "negative" ? "↓" : "→"}
                  </span>
                </div>
                
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  {moment.event}
                </p>
                
                {Object.keys(moment.statsChange).length > 0 && (
                  <div className="flex gap-2 flex-wrap text-xs">
                    {moment.statsChange.energy !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full ${
                        moment.statsChange.energy > 0 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        ⚡ {moment.statsChange.energy > 0 ? "+" : ""}{moment.statsChange.energy}
                      </span>
                    )}
                    {moment.statsChange.focus !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full ${
                        moment.statsChange.focus > 0
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        🎯 {moment.statsChange.focus > 0 ? "+" : ""}{moment.statsChange.focus}
                      </span>
                    )}
                    {moment.statsChange.hydration !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full ${
                        moment.statsChange.hydration > 0
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        💧 {moment.statsChange.hydration > 0 ? "+" : ""}{moment.statsChange.hydration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * What If Simulator - Shows alternative scenarios
 */
function WhatIfSimulator({ scenarios, lang }: { scenarios: WhatIfScenario[]; lang: "en" | "id" }) {
  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <span>💭</span>
        {lang === "en" ? "What If Scenarios" : "Skenario Alternatif"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800"
          >
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              {scenario.title}
            </h4>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {scenario.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                {scenario.estimatedImpact}
              </span>
              
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                scenario.confidence === "high"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : scenario.confidence === "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
              }`}>
                {scenario.confidence}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to format pace (mm:ss)
 */
function formatPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
