"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useCrowdAtmosphereNoise, type CrowdMood, type CrowdState } from "@/hooks/use-crowd-atmosphere-noise";

interface CrowdAtmosphereProps {
  /** Current kilometer */
  currentKm: number;
  /** Total race distance */
  totalDistance: number;
  /** Player's current position */
  playerPosition: number;
  /** Total number of runners */
  totalRunners: number;
  /** Player's energy level */
  energy: number;
  /** Player's momentum */
  momentum: number;
  /** Whether race is paused */
  isPaused: boolean;
  /** Whether player is in breaking point */
  isBreakingPoint: boolean;
  /** Callback for position changes */
  onPositionChange?: (oldPos: number, newPos: number) => void;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

/**
 * Virtual Crowd & Atmosphere System
 * 
 * Displays visual crowd effects and manages crowd audio:
 * - Crowd intensity meter
 * - Density dots at screen edges
 * - Floating emoji reactions
 * - Cheer bursts for big moments
 * - Underdog support mechanics
 */
export function CrowdAtmosphere({
  currentKm,
  totalDistance,
  playerPosition,
  totalRunners,
  energy,
  momentum,
  isPaused,
  isBreakingPoint,
  onPositionChange,
}: CrowdAtmosphereProps) {
  const [crowdState, setCrowdState] = useState<CrowdState>({
    intensity: 30,
    dominantMood: "supportive",
    density: 20,
  });
  
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [lastPosition, setLastPosition] = useState(playerPosition);
  const [showUnderdogBoost, setShowUnderdogBoost] = useState(false);
  
  const { playCheerBurst, playUnderdogCheer, playFinishRoar } = useCrowdAtmosphereNoise(crowdState);

  // Calculate crowd intensity based on race conditions
  useEffect(() => {
    if (isPaused) return;

    const progress = currentKm / totalDistance;
    let intensity = crowdState.intensity;
    let mood: CrowdMood = "supportive";
    let density = 20 + progress * 60; // Increases toward finish

    // Base intensity from progress
    intensity = 30 + progress * 30;

    // Player overtakes opponent
    if (lastPosition > playerPosition && lastPosition > 0) {
      intensity += 15;
      mood = "excited";
      addFloatingEmoji("🔥");
      playCheerBurst("excited");
      
      // Underdog bonus (if player was in 3rd or worse and overtook)
      if (lastPosition >= 3) {
        setShowUnderdogBoost(true);
        playUnderdogCheer();
        setTimeout(() => setShowUnderdogBoost(false), 2000);
      }
      
      onPositionChange?.(lastPosition, playerPosition);
    }

    // Final 1km
    if (totalDistance - currentKm <= 1) {
      intensity += 30;
      mood = "celebratory";
      density = Math.min(100, density + 20);
    }

    // Breaking point (crowd goes quiet)
    if (isBreakingPoint) {
      intensity = Math.max(10, intensity - 20);
      mood = "tense";
    }

    // Low energy but pushing (crowd supports)
    if (energy < 30 && momentum > 60) {
      intensity += 10;
      mood = "supportive";
    }

    // Player in last place (underdog support)
    if (playerPosition === totalRunners && totalRunners > 1) {
      intensity += 5;
      mood = "supportive";
    }

    // Sprint detection (high momentum)
    if (momentum > 75) {
      intensity += 10;
      mood = "excited";
    }

    // Finish line
    if (currentKm >= totalDistance) {
      intensity = 100;
      mood = "celebratory";
      density = 100;
      playFinishRoar();
      triggerCheerBurst();
    }

    // Clamp values
    intensity = Math.max(0, Math.min(100, intensity));
    density = Math.max(0, Math.min(100, density));

    setCrowdState({ intensity, dominantMood: mood, density });
    setLastPosition(playerPosition);
  }, [currentKm, playerPosition, energy, momentum, isBreakingPoint, totalDistance, totalRunners, isPaused]);

  // Add floating emoji
  const addFloatingEmoji = useCallback((emoji: string) => {
    const id = `emoji-${Date.now()}-${Math.random()}`;
    const x = 10 + Math.random() * 80; // 10% to 90% across screen
    const y = 60 + Math.random() * 30; // Start from middle-bottom
    
    setFloatingEmojis(prev => [...prev, { id, emoji, x, y }]);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  }, []);

  // Trigger cheer burst (multiple emojis)
  const triggerCheerBurst = useCallback(() => {
    const emojis = ["🔥", "👏", "🏃", "⚡", "🎉"];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        addFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }, i * 100);
    }
  }, [addFloatingEmoji]);

  // Occasional random reactions based on intensity
  useEffect(() => {
    if (isPaused || crowdState.intensity < 40) return;
    
    const interval = setInterval(() => {
      if (Math.random() < crowdState.intensity / 200) {
        const emojis = ["👏", "🏃", "💪"];
        addFloatingEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [crowdState.intensity, isPaused, addFloatingEmoji]);

  // Get crowd meter color based on mood
  const getMoodColor = () => {
    switch (crowdState.dominantMood) {
      case "celebratory": return "bg-yellow-500";
      case "excited": return "bg-orange-500";
      case "supportive": return "bg-blue-500";
      case "tense": return "bg-gray-500";
    }
  };

  // Get crowd meter gradient
  const getMoodGradient = () => {
    switch (crowdState.dominantMood) {
      case "celebratory": return "from-yellow-400 to-orange-500";
      case "excited": return "from-orange-400 to-red-500";
      case "supportive": return "from-blue-400 to-purple-500";
      case "tense": return "from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="relative w-full h-full pointer-events-none">
      {/* Crowd Intensity Meter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 px-4 py-2 z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              👥 Crowd
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
              {Math.round(crowdState.intensity)}%
            </span>
          </div>
          
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${crowdState.intensity}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`h-full bg-gradient-to-r ${getMoodGradient()}`}
            />
          </div>
        </div>
      </motion.div>

      {/* Crowd Density Dots */}
      <CrowdDensityDots density={crowdState.density} />

      {/* Floating Emojis */}
      <AnimatePresence>
        {floatingEmojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ opacity: 0, y: emoji.y, x: `${emoji.x}%`, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: emoji.y - 100, scale: [0.5, 1.2, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute text-2xl z-20 pointer-events-none"
          >
            {emoji.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Underdog Boost Animation */}
      <AnimatePresence>
        {showUnderdogBoost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-black text-lg uppercase tracking-wider">Underdog Power!</p>
                  <p className="text-xs opacity-90">The crowd is behind you!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cheer Burst (when intensity > 80) */}
      {crowdState.intensity > 80 && (
        <CheerBurstEffect />
      )}
    </div>
  );
}

/**
 * Crowd Density Dots - Visual representation of crowd at edges
 */
function CrowdDensityDots({ density }: { density: number }) {
  const dotCount = Math.floor(density / 10);
  
  return (
    <>
      {/* Left side dots */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around py-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <motion.div
            key={`left-${i}`}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="w-2 h-2 rounded-full bg-orange-400 opacity-60"
          />
        ))}
      </div>
      
      {/* Right side dots */}
      <div className="absolute right-0 top-0 bottom-0 w-8 flex flex-col justify-around py-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <motion.div
            key={`right-${i}`}
            initial={{ scale: 0, x: 10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="w-2 h-2 rounded-full bg-orange-400 opacity-60"
          />
        ))}
      </div>
    </>
  );
}

/**
 * Cheer Burst Effect - Animated burst when crowd is at peak
 */
function CheerBurstEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        const radius = 150;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: `calc(50% + ${x}px)`,
              y: `calc(50% + ${y}px)`,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
              delay: i * 0.1,
            }}
            className="absolute w-4 h-4 rounded-full bg-yellow-400"
          />
        );
      })}
    </div>
  );
}
