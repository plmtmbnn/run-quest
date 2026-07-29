"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowUp, ArrowDown, Zap, ShieldAlert, Volume2, VolumeX } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";

export interface RivalProximityData {
  id: string;
  name: string;
  distanceKm: number;
  avatarColor?: string;
}

interface RivalProximityAlertProps {
  playerDistanceKm: number;
  rivals: RivalProximityData[];
  isRaceActive: boolean;
}

export type ProximityZone = "close" | "near" | "medium" | "far";
export type ThreatDirection = "behind" | "ahead" | "side_by_side" | "overtaking" | "overtaken";

/**
 * Web Audio synthetic sound manager for proximity alerts
 */
function playProximityTone(type: "footstep" | "chime" | "warning", isMuted: boolean) {
  if (isMuted || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === "footstep") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "chime") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "warning") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio contexts blocked by browser policy
  }
}

export function RivalProximityAlert({ playerDistanceKm, rivals, isRaceActive }: RivalProximityAlertProps) {
  const soundEnabled = useSettingsStore((s) => s.settings.sound);
  const lastAlertTimeRef = useRef(0);

  if (!isRaceActive || !rivals || rivals.length === 0) return null;

  // Find nearest rival
  const targetRival = (rivals as RivalProximityData[]).reduce<RivalProximityData | null>((acc, r) => {
    const gapMeters = (r.distanceKm - playerDistanceKm) * 1000;
    if (!acc) return r;
    const accGap = (acc.distanceKm - playerDistanceKm) * 1000;
    return Math.abs(gapMeters) < Math.abs(accGap) ? r : acc;
  }, null);

  if (!targetRival) return null;

  const minGapMeters = (targetRival.distanceKm - playerDistanceKm) * 1000;
  const absGapMeters = Math.abs(Math.round(minGapMeters));
  if (absGapMeters > 200) return null; // Out of range

  let zone: ProximityZone = "far";
  if (absGapMeters <= 30) zone = "close";
  else if (absGapMeters <= 100) zone = "near";
  else if (absGapMeters <= 200) zone = "medium";

  const isBehind = minGapMeters < -10;
  const isAhead = minGapMeters > 10;
  const isSideBySide = absGapMeters <= 10;

  // Sound triggers
  useEffect(() => {
    const now = Date.now();
    if (now - lastAlertTimeRef.current > 3000) {
      lastAlertTimeRef.current = now;
      if (zone === "close") {
        playProximityTone(isBehind ? "warning" : "chime", !soundEnabled);
      }
    }
  }, [zone, isBehind, soundEnabled]);

  return (
    <div className="fixed bottom-24 left-4 z-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${targetRival.id}_${zone}`}
          initial={{ opacity: 0, scale: 0.8, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: -20 }}
          className={`relative p-3.5 rounded-2xl border backdrop-blur-md shadow-xl flex items-center gap-3 transition-all ${
            zone === "close"
              ? isBehind
                ? "bg-rose-950/80 border-rose-500/80 text-rose-100 animate-pulse"
                : "bg-emerald-950/80 border-emerald-500/80 text-emerald-100"
              : "bg-slate-900/80 border-slate-700 text-slate-200"
          }`}
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 border border-white/10 shrink-0">
            {isSideBySide ? (
              <Zap className="w-6 h-6 text-amber-400 animate-bounce" />
            ) : isBehind ? (
              <ArrowDown className="w-6 h-6 text-rose-400 animate-bounce" />
            ) : (
              <ArrowUp className="w-6 h-6 text-emerald-400 animate-bounce" />
            )}
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-black"
              style={{ backgroundColor: targetRival.avatarColor || "#ef4444" }}
            />
          </div>

          <div className="flex flex-col min-w-[130px]">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {zone === "close" ? "IMMEDIATE THREAT" : zone === "near" ? "APPROACHING" : "RIVAL PROXIMITY"}
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400">
                {soundEnabled ? <Volume2 className="w-3 h-3 inline" /> : <VolumeX className="w-3 h-3 inline text-slate-500" />}
              </span>
            </div>
            <p className="font-heading font-black text-xs text-white truncate">
              {targetRival.name}
            </p>
            <p className="text-xs font-mono font-bold text-slate-300">
              {isSideBySide
                ? "HEAD TO HEAD!"
                : isBehind
                ? `${absGapMeters}m behind you!`
                : `${absGapMeters}m ahead!`}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
