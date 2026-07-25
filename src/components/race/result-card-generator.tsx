"use client";

import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";
import type { SimulationResult, Outcome, Grade } from "@/types/engine";
import type { DailyChallenge } from "@/types/engine";
import type { PlacedBet } from "./self-bet-panel";
import type { RaceAchievement } from "@/engine/achievements/race-achievements";

interface ResultCardGeneratorProps {
  /** The challenge data */
  challenge: DailyChallenge;
  /** The simulation result */
  result: SimulationResult;
  /** Player's name */
  playerName: string;
  /** Language for translations */
  lang: "en" | "id";
  /** Placed bets that were settled */
  betResults?: Array<PlacedBet & { payout: number; won: boolean }>;
  /** Achievements earned during the race */
  earnedAchievements?: RaceAchievement[];
  /** Callback when card is downloaded */
  onDownloadComplete?: () => void;
  /** Callback when card is copied to clipboard */
  onCopyComplete?: () => void;
}

interface CardData {
  title: string;
  subtitle: string;
  raceInfo: string;
  finishTime: string;
  position: string;
  totalRunners: number;
  medal: string;
  achievements: string[];
  betResults: string[];
  pbInfo: string;
  hashtag: string;
}

/**
 * Generates a shareable result card as a visual element that can be downloaded or copied.
 * Uses html-to-image library to convert the rendered card to PNG.
 */
export function ResultCardGenerator({
  challenge,
  result,
  playerName,
  lang,
  betResults = [],
  earnedAchievements = [],
  onDownloadComplete,
  onCopyComplete,
}: ResultCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const preferredCurrency = useSettingsStore(
    (s) => s.settings.preferredCurrency ?? "USD",
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [showTooltip, setShowTooltip] = useState<"download" | "copy" | null>(null);

  // Extract final standings
  const finalState = result.stateLog?.[result.stateLog.length - 1];
  const totalRunners = (finalState?.opponents?.length ?? 0) + 1;

  // Get player position
  const getPlayerPosition = (): number => {
    if (!finalState || !finalState.opponents) return 1;
    
    const allRunners = [
      { id: "player_local", time: result.finishTime, isDNF: result.outcome === "dnf" },
      ...finalState.opponents.map(o => ({ id: o.id, time: o.accumulatedTime, isDNF: o.isDNF }))
    ];
    
    // Sort: DNF last, then by time
    allRunners.sort((a, b) => {
      if (a.isDNF && !b.isDNF) return 1;
      if (!a.isDNF && b.isDNF) return -1;
      return a.time - b.time;
    });
    
    return allRunners.findIndex(r => r.id === "player_local") + 1;
  };

  const playerPosition = getPlayerPosition();

  // Format time
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  // Get medal emoji
  const getMedal = (position: number, outcome: Outcome) => {
    if (outcome === "dnf") return "💀";
    if (outcome === "dns") return "❌";
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "🏃";
  };

  // Check if PB
  const isPersonalBest = (): boolean => {
    // This would need to check against stored PBs, but for card display we'll use grade
    return result.grade === "S" || result.grade === "A";
  };

  // Get PB info
  const getPBInfo = (): string => {
    if (isPersonalBest()) {
      return lang === "en" ? "🎯 Personal Best!" : "🎯 Rekor Pribadi!";
    }
    return "";
  };

  // Get outcome text
  const getOutcomeText = (outcome: Outcome, lang: "en" | "id") => {
    const outcomes = {
      en: { gold: "1st Place", silver: "2nd Place", bronze: "3rd Place", finish: "Finished", dnf: "DNF", dns: "DNS" },
      id: { gold: "Juara 1", silver: "Juara 2", bronze: "Juara 3", finish: "Finish", dnf: "DNF", dns: "DNS" }
    };
    return outcomes[lang][outcome] || outcome;
  };

  // Prepare card data
  const cardData: CardData = {
    title: "RUN QUEST",
    subtitle: "Race Complete",
    raceInfo: `${challenge.race.title[lang]} • ${challenge.race.distance}km • ${challenge.environment.weather}`,
    finishTime: formatTime(result.finishTime),
    position: getOutcomeText(result.outcome, lang),
    totalRunners,
    medal: getMedal(playerPosition, result.outcome),
    achievements: earnedAchievements.slice(0, 3).map(a => a.title[lang]),
    betResults: betResults.filter(b => b.won).map(b => 
      lang === "en" ? `+${formatCurrency(b.payout, preferredCurrency)} (${b.target.label})` : 
      `+${formatCurrency(b.payout, preferredCurrency)} (${b.target.label})`
    ),
    pbInfo: getPBInfo(),
    hashtag: `#RunQuest`,
  };

  // Download card as PNG using html-to-image
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    setShowTooltip(null);
    
    try {
      // Import html-to-image dynamically to avoid SSR issues
      const { toPng } = await import("html-to-image");
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });
      
      const link = document.createElement("a");
      link.download = `runquest-result-${challenge.date}.png`;
      link.href = dataUrl;
      link.click();
      
      onDownloadComplete?.();
    } catch (error) {
      console.error("Failed to generate card image:", error);
    } finally {
      setIsDownloading(false);
      setShowTooltip("download");
      setTimeout(() => setShowTooltip(null), 2000);
    }
  }, [challenge.date, onDownloadComplete]);

  // Copy card to clipboard using html-to-image
  const handleCopy = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsCopying(true);
    setShowTooltip(null);
    
    try {
      // Import html-to-image dynamically to avoid SSR issues
      const { toBlob, toPng } = await import("html-to-image");
      
      const blob = await toBlob(cardRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });
      
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        
        onCopyComplete?.();
      }
    } catch (error) {
      console.error("Failed to copy card to clipboard:", error);
      // Fallback: try to copy data URL
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          quality: 1,
          pixelRatio: 2,
        });
        await navigator.clipboard.writeText(dataUrl);
        onCopyComplete?.();
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
    } finally {
      setIsCopying(false);
      setShowTooltip("copy");
      setTimeout(() => setShowTooltip(null), 2000);
    }
  }, [onCopyComplete]);

  // Translations
  const translations = {
    en: {
      download: "Download Card",
      copy: "Copy to Clipboard",
      copied: "Copied!",
      downloading: "Saving...",
      share_title: "Share Your Victory!",
      share_desc: "Download or copy your race result card to share with friends.",
    },
    id: {
      download: "Unduh Kartu",
      copy: "Salin ke Clipboard",
      copied: "Tersalin!",
      downloading: "Menyimpan...",
      share_title: "Bagikan Kemenanganmu!",
      share_desc: "Unduh atau salin kartu hasil balapan untuk dibagikan kepada teman.",
    }
  };

  const t = translations[lang];

  return (
    <div className="flex flex-col gap-4">
      {/* Card Preview */}
      <div 
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border-4 border-slate-800 dark:border-slate-600 bg-gradient-to-br from-orange-900/20 via-slate-900 to-orange-900/20 p-6 shadow-2xl"
        style={{
          width: "400px",
          maxWidth: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2"
          >
            {cardData.title}
          </motion.div>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            {cardData.subtitle}
          </p>
        </div>

        {/* Race Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-6">
          <p className="text-white font-bold text-center text-lg">
            {challenge.race.title[lang]}
          </p>
          <p className="text-slate-400 text-center text-sm mt-1">
            {cardData.raceInfo}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Medal/Position */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-4xl mb-2">{cardData.medal}</div>
            <p className="text-white font-bold text-sm uppercase tracking-wider">
              {cardData.position}
            </p>
            <p className="text-slate-400 text-xs">
              {playerPosition}/{cardData.totalRunners}
            </p>
          </div>

          {/* Grade */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              {result.grade}
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              {lang === "en" ? "Grade" : "Nilai"}
            </p>
          </div>

          {/* Finish Time */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {cardData.finishTime}
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">
              {lang === "en" ? "Finish Time" : "Waktu Finish"}
            </p>
          </div>

          {/* Score */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {result.score}
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">
              {lang === "en" ? "Score" : "Skor"}
            </p>
          </div>
        </div>

        {/* PB Info */}
        {cardData.pbInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-3 mb-4"
          >
            <p className="text-amber-400 font-bold text-center text-sm">
              {cardData.pbInfo}
            </p>
          </motion.div>
        )}

        {/* Achievements */}
        {cardData.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 mb-4"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {lang === "en" ? "Achievements" : "Pencapaian"}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {cardData.achievements.map((achievement, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-700/50 border border-slate-600/40 px-2 py-0.5 rounded-full text-slate-200"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bet Results */}
        {cardData.betResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4 mb-4"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              {lang === "en" ? "Bets Won" : "Taruhan Menang"}
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {cardData.betResults.map((bet, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-emerald-900/50 border border-emerald-500/40 px-2 py-0.5 rounded-full text-emerald-400"
                >
                  {bet}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center pt-4 border-t border-slate-700/40"
        >
          <p className="text-slate-500 text-xs">
            {cardData.hashtag} • {new Date().toLocaleDateString(lang === "en" ? "en-US" : "id-ID")}
          </p>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 text-2xl opacity-20">🏃</div>
        <div className="absolute top-4 right-4 text-2xl opacity-20">🏁</div>
        <div className="absolute bottom-4 left-4 text-2xl opacity-20">⚡</div>
        <div className="absolute bottom-4 right-4 text-2xl opacity-20">🔥</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          disabled={isDownloading}
          className="relative flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <span className="animate-spin">🌀</span>
              <span>{t.downloading}</span>
            </>
          ) : (
            <>
              <span>📥</span>
              <span>{t.download}</span>
            </>
          )}
          {showTooltip === "download" && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
            >
              {t.copied}
            </motion.span>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          disabled={isCopying}
          className="relative flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCopying ? (
            <>
              <span className="animate-spin">🌀</span>
              <span>{t.downloading}</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>{t.copy}</span>
            </>
          )}
          {showTooltip === "copy" && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
            >
              {t.copied}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-slate-500 text-xs"
      >
        {t.share_desc}
      </motion.p>
    </div>
  );
}

/**
 * Hook to generate and download result card programmatically
 */
export function useResultCardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const generateCard = useCallback(async (
    challenge: DailyChallenge,
    result: SimulationResult,
    playerName: string,
    lang: "en" | "id" = "en"
  ) => {
    if (!cardRef.current) return null;
    
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });
      return dataUrl;
    } catch (error) {
      console.error("Failed to generate card:", error);
      return null;
    }
  }, []);

  return { cardRef, generateCard };
}
