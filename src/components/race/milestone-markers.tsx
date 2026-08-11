"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flag, Flame, Star, Target, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { MilestoneMarkerItem } from "@/engine/achievements/race-achievements";

interface MilestoneMarkersProps {
  currentKm: number;
  markers: MilestoneMarkerItem[];
  isRaceActive: boolean;
}

export function MilestoneMarkers({
  currentKm,
  markers,
  isRaceActive,
}: MilestoneMarkersProps) {
  const [activeBanner, setActiveBanner] = useState<{
    text: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    if (!isRaceActive || !markers || markers.length === 0) return;

    // Check proximity to upcoming markers (within 0.5km or 1km)
    for (const marker of markers) {
      const gap = marker.distanceKm - currentKm;
      if (gap > 0.4 && gap <= 0.6) {
        setActiveBanner({
          text: `Upcoming: ${marker.title} in 500m!`,
          icon: marker.icon,
        });
        const timer = setTimeout(() => setActiveBanner(null), 3000);
        return () => clearTimeout(timer);
      } else if (gap > 0.9 && gap <= 1.1) {
        setActiveBanner({
          text: `Upcoming: ${marker.title} in 1km!`,
          icon: marker.icon,
        });
        const timer = setTimeout(() => setActiveBanner(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentKm, markers, isRaceActive]);

  if (!isRaceActive || !activeBanner) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.9 }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 backdrop-blur-md border border-white/20"
        >
          <span className="text-sm">{activeBanner.icon}</span>
          <span>{activeBanner.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
