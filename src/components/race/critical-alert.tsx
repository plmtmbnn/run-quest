"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Flame } from "lucide-react";
import { useState } from "react";
import type { SimulationState } from "@/types/engine";

export type AlertLevel = "warning" | "critical" | "emergency";

interface CriticalAlertProps {
  level: AlertLevel;
  energy: number;
  distanceRemaining: number;
  onBurnReserves?: () => void;
  hasBurnedReserves?: boolean;
}

/**
 * Get alert configuration based on level
 */
function getAlertConfig(level: AlertLevel): {
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  title: string;
  animate: boolean;
} {
  switch (level) {
    case "warning":
      return {
        bgColor: "bg-amber-500",
        textColor: "text-white",
        icon: <AlertTriangle className="w-6 h-6" />,
        title: "⚠️ CAUTION",
        animate: false,
      };
    case "critical":
      return {
        bgColor: "bg-orange-600",
        textColor: "text-white",
        icon: <AlertTriangle className="w-7 h-7" />,
        title: "🚨 CRITICAL",
        animate: false,
      };
    case "emergency":
      return {
        bgColor: "bg-red-600",
        textColor: "text-white",
        icon: <AlertTriangle className="w-8 h-8" />,
        title: "💀 EMERGENCY",
        animate: true,
      };
  }
}

/**
 * CriticalAlert - Progressive DNF warning system
 * Shows increasingly urgent alerts as energy depletes
 */
export function CriticalAlert({
  level,
  energy,
  distanceRemaining,
  onBurnReserves,
  hasBurnedReserves,
}: CriticalAlertProps) {
  const config = getAlertConfig(level);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Alert Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: config.animate ? [1, 1.02, 1] : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          scale: {
            repeat: config.animate ? Infinity : 0,
            duration: 0.8,
          },
        }}
        className={`fixed top-16 left-0 right-0 z-40 ${config.bgColor} ${config.textColor} shadow-2xl`}
        style={{
          height:
            level === "warning"
              ? "4rem"
              : level === "critical"
                ? "5rem"
                : "6rem",
        }}
      >
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
          {/* Left: Icon + Title + Message */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className={config.animate ? "animate-pulse" : ""}>
              {config.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg md:text-xl uppercase tracking-wider">
                {config.title}
              </span>
              <span className="text-xs md:text-sm font-bold">
                {level === "warning" && "Energy Low"}
                {level === "critical" && "Collapse Risk"}
                {level === "emergency" &&
                  `DNF Imminent! ${distanceRemaining.toFixed(1)}km to finish`}
              </span>
            </div>
          </div>

          {/* Right: Energy Display + Action Button */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Energy Display */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Energy
              </span>
              <span className="font-mono font-black text-2xl">
                {Math.round(energy)}%
              </span>
            </div>

            {/* Burn Reserves Button (Emergency only) */}
            {level === "emergency" && onBurnReserves && !hasBurnedReserves && (
              <motion.button
                type="button"
                onClick={onBurnReserves}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-red-600 hover:bg-red-50 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-sm md:text-base shadow-lg border-2 border-red-600 transition-all flex items-center gap-2"
              >
                <Flame className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">BURN RESERVES</span>
                <span className="md:hidden">BURN</span>
              </motion.button>
            )}

            {/* Already Used Indicator */}
            {level === "emergency" && hasBurnedReserves && (
              <div className="bg-white/20 px-3 md:px-4 py-2 rounded-lg">
                <span className="text-xs md:text-sm font-bold uppercase opacity-80">
                  Reserves Used
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Screen Vignette Effect (Emergency only) */}
      {level === "emergency" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
          }}
          className="fixed inset-0 pointer-events-none z-30"
          style={{
            boxShadow: "inset 0 0 100px 20px rgba(220, 38, 38, 0.4)",
          }}
        />
      )}

      {/* Screen Shake Effect (Emergency only) */}
      {level === "emergency" && (
        <style jsx global>{`
          @keyframes emergencyShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          body {
            animation: emergencyShake 0.15s infinite;
          }
        `}</style>
      )}
    </>
  );
}

/**
 * Calculate alert level based on energy
 */
export function getAlertLevel(energy: number): AlertLevel | null {
  if (energy <= 15) {
    return "emergency";
  } else if (energy <= 30) {
    return "critical";
  } else if (energy <= 40) {
    return "warning";
  }
  return null;
}
