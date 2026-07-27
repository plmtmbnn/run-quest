"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Trophy, Globe2, RefreshCw, Activity } from "lucide-react";
import { getGlobalStats, type GlobalStatsData } from "@/lib/firebaseService";

interface GlobalCommunityStatsProps {
  compact?: boolean;
  className?: string;
}

/** Animated number counter that rolls up from 0 to `target` */
function AnimatedCount({
  target,
  loading,
  className = "",
}: {
  target: number | undefined;
  loading: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading || target === undefined) {
      setDisplay(0);
      return;
    }
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, loading]);

  if (loading) {
    return (
      <div
        className={`h-7 w-20 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded-lg ${className}`}
      />
    );
  }

  return (
    <span className={`tabular-nums ${className}`}>
      {display.toLocaleString()}
    </span>
  );
}

function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ─── Compact mode ─────────────────────────────────────────────────────────── */
function CompactStats({
  stats,
  loading,
  onRefresh,
}: {
  stats: GlobalStatsData | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 text-xs">
      {/* top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 rounded-t-2xl" />

      <div className="flex items-center justify-between gap-2 mb-2.5 mt-0.5">
        <span className="font-heading font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
          Community Overall
        </span>
        <div className="flex items-center gap-1.5">
          {!loading && (
            <span className="flex items-center gap-1 text-[9px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh stats"
            className="text-slate-400 hover:text-indigo-500 transition-colors active:scale-95"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Runners */}
        <div className="bg-white/80 dark:bg-slate-950/70 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="p-0.5 rounded bg-indigo-500/10">
              <Users className="w-2.5 h-2.5 text-indigo-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Runners
            </span>
          </div>
          <AnimatedCount
            target={stats?.runners_created}
            loading={loading}
            className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400"
          />
        </div>

        {/* Races */}
        <div className="bg-white/80 dark:bg-slate-950/70 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="p-0.5 rounded bg-emerald-500/10">
              <Trophy className="w-2.5 h-2.5 text-emerald-500" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Races
            </span>
          </div>
          <AnimatedCount
            target={stats?.races_registered}
            loading={loading}
            className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* footer */}
      <div className="mt-2 text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-mono">
        <span className="uppercase tracking-wider">updated</span>
        {loading ? (
          <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        ) : (
          <span className="font-bold">
            {formatTimestamp(stats?.last_updated ?? new Date().toISOString())}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Full mode ─────────────────────────────────────────────────────────────── */
function FullStats({
  stats,
  loading,
  onRefresh,
}: {
  stats: GlobalStatsData | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] shadow-sm">
      {/* gradient accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />

      {/* subtle ambient glow behind the header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-20 bg-indigo-400/10 dark:bg-indigo-500/5 blur-2xl pointer-events-none" />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                <Globe2 className="w-4 h-4" />
              </div>
              {/* live pulse ring */}
              {!loading && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white leading-tight">
                Global Community Stats
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                <Activity className="w-3 h-3" />
                Live metrics · all runners worldwide
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-400 hover:text-indigo-500 transition-all rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 active:scale-95"
            title="Refresh statistics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Runners card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-3.5">
            {/* decorative hover circle */}
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-indigo-500/8 dark:bg-indigo-500/10 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest block mb-1">
                  Runners Created
                </span>
                <AnimatedCount
                  target={stats?.runners_created}
                  loading={loading}
                  className="font-mono font-bold text-2xl text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div className="p-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 shrink-0">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Races card */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/30 dark:to-slate-950/60 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-3.5">
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-600 uppercase tracking-widest block mb-1">
                  Races Registered
                </span>
                <AnimatedCount
                  target={stats?.races_registered}
                  loading={loading}
                  className="font-mono font-bold text-2xl text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 shrink-0">
                <Trophy className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Last Updated
          </span>
          {loading ? (
            <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          ) : (
            <span className="font-mono font-bold text-[11px] text-slate-600 dark:text-slate-300">
              {formatTimestamp(stats?.last_updated ?? new Date().toISOString())}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Root component ────────────────────────────────────────────────────────── */
export function GlobalCommunityStats({
  compact = false,
  className = "",
}: GlobalCommunityStatsProps) {
  const [stats, setStats] = useState<GlobalStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getGlobalStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className={className}>
      {compact ? (
        <CompactStats stats={stats} loading={loading} onRefresh={fetchStats} />
      ) : (
        <FullStats stats={stats} loading={loading} onRefresh={fetchStats} />
      )}
    </div>
  );
}
