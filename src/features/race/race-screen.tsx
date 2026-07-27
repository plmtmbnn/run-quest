"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Flame, Gauge, TrendingUp, FastForward, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { analyzeRace } from "@/coach/coach-analysis";
import { BreakingPointOverlay } from "@/components/race/breaking-point";
import { DesperationOverlay } from "@/components/race/desperation-mode";
import { FinalKick, type KickTiming } from "@/components/race/final-kick";
import { MicroAchievementPopup } from "@/components/race/micro-achievement-popup";
import { PaceProjector } from "@/components/race/pace-projector";
import { TrackPositionVisualizer } from "@/components/race/track-position-visualizer";
import { checkRaceAchievements, type RaceAchievement } from "@/engine/achievements/race-achievements";
import { advanceSimulation } from "@/engine/simulation/engine";

import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { getRunnerState, useRunnerStore } from "@/runner/runner-store";
import { getEnergyCostForDistance } from "@/economy/race-entry-engine";
import { generateDailyChallenge } from "@/services/challenge/generator";
import { useGameStore } from "@/store/game-store";
import { usePlayerStore } from "@/store/player-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useShopStore } from "@/shop/shop-store";
import { useTimelineStore } from "@/store/timeline-store";
import { BetResultsPopup } from "@/components/race/bet-results-popup";

import { GhostSplitComparison } from "@/components/race/ghost-split-comparison";
import { PhotoFinish, isPhotoFinish } from "@/components/race/photo-finish";
import { ResultCardGenerator } from "@/components/race/result-card-generator";
import { RivalDialog, RivalLineup, RivalStatusUpdate } from "@/components/race/rival-dialog";
import { SelfBetPanel, type BetTarget, type PlacedBet } from "@/components/race/self-bet-panel";
import { WeatherAlert } from "@/components/race/weather-alert";
import { selectRivalsForRace, generateRivalDialog, getRivalMilestoneText, updateRivalRelationship, type Rival } from "@/engine/rivals/rival-engine";

import { formatCurrency } from "@/economy/currency-converter";
import { recordTransaction } from "@/economy/earning-engine";
import type {
  ActiveBreakingPoint,
  DecisionCard,
  DecisionPrompt,
  DesperationMode,
  RaceEvent,
  SimulationResult,
  SimulationState,
  SimulationStepResult,
} from "@/types/engine";

export function RaceScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";

  const { currentChallenge, setResult, activeGhost } = useGameStore();
  const completeChallenge = usePlayerStore((state) => state.completeChallenge);
  const { preparation } = usePreparationStore();
  const { runnerState, setRunnerState } = useRunnerStore();
  const player = usePlayerStore((state) => state.player);

  const [selectedPacing, setSelectedPacing] = useState<
    import("@/types/engine").PacingPlan
  >(preparation.pacing);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);

  const selectedPacingRef = useRef(selectedPacing);
  useEffect(() => {
    selectedPacingRef.current = selectedPacing;
  }, [selectedPacing]);

  const CONSUMABLE_META: Record<string, { label: string; icon: string; boostType: string }> = {
    water: { label: "Purified Water", icon: "💧", boostType: "+20 Hydration" },
    energy_bar: { label: "Energy Bar", icon: "🍫", boostType: "+25 Stamina" },
    electrolyte: { label: "Electrolytes", icon: "⚡", boostType: "+35 Hydration" },
    electrolytes: { label: "Electrolytes", icon: "⚡", boostType: "+35 Hydration" },
    salt_tablets: { label: "Salt Tablets", icon: "🧂", boostType: "+20 Hydration" },
    energy_gel: { label: "Energy Gel", icon: "🔋", boostType: "+30 Stamina" },
    caffeine: { label: "Caffeine Shot", icon: "🧠", boostType: "+25 Focus" },
    hydration_mix: { label: "Pro Hydration", icon: "🥤", boostType: "+40 Hydration" },
    caffeine_gum: { label: "Caffeine Gum", icon: "⚡", boostType: "+20 Focus" },
  };

  // Active Consumables state initialized directly from player's preparation selection
  const [activeConsumables, setActiveConsumables] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const selectedList = preparation.nutrition || [];
    const quantities = preparation.nutritionQuantities || {};

    selectedList.forEach((itemId) => {
      initial[itemId] = quantities[itemId] ?? 1;
    });

    // Fallback if player selected no nutrition items in preparation screen
    if (Object.keys(initial).length === 0) {
      initial["water"] = 1;
      initial["energy_gel"] = 1;
    }
    return initial;
  });

  // Load/Generate today's challenge once on mount
  const [challenge] = useState(() => {
    const dayIndex = useTimelineStore.getState().gameState?.dayIndex ?? 0;
    return currentChallenge || generateDailyChallenge(dayIndex.toString());
  });

  const [currentKm, setCurrentKm] = useState(0);
  const [targetKm, setTargetKm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [runningEvents, setRunningEvents] = useState<RaceEvent[]>([]);
  // Define the stats reducer
  const statsReducer = (state: typeof initialStats, action: { type: string; payload: Partial<typeof initialStats> }) => {
    switch (action.type) {
      case 'UPDATE':
        return { ...state, ...action.payload };
      default:
        return state;
    }
  };
  
  const initialStats = {
    energy: 100,
    hydration: 100,
    focus: 100,
    confidence: 100,
    muscleFatigue: 0,
    mentalFatigue: 0,
    momentum: 50,
    paceStability: 80,
    riskLevel: 20,
    pace: 0,
  };
  
  const [stats, dispatchStats] = useReducer(statsReducer, initialStats);

  // State elements for decision moments
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [activeDecision, setActiveDecision] = useState<DecisionCard | null>(
    null,
  );
  const [countdown, setCountdown] = useState<number>(30);
  const [timeoutAlert, setTimeoutAlert] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<DecisionPrompt | null>(
    null,
  );
  const [activeBreakingPoint, setActiveBreakingPoint] =
    useState<ActiveBreakingPoint | null>(null);
  const [activeDesperation, setActiveDesperation] =
    useState<DesperationMode | null>(null);

  const isPaused = Boolean(
    activeDecision || activeBreakingPoint || activeDesperation,
  );

  // ── Micro-Achievement system ─────────────────────────────────────────────
  type AchievementQueueItem = RaceAchievement & { isFirstTime: boolean; instanceId: string };
  const [achievementQueue, setAchievementQueue] = useState<AchievementQueueItem[]>([]);
  /** IDs of achievements already earned this race (prevents re-triggering) */
  const earnedAchievementsRef = useRef<Set<string>>(new Set());
  /** Pace per km, used for negative split / fastest km detection */
  const kmPacesRef = useRef<number[]>([]);
  /** Previous player position, for comeback/overtake detection */
  const prevPlayerPositionRef = useRef<number>(1);

  // ── Final Kick mini-game ─────────────────────────────────────────────────
  const [isFinalKick, setIsFinalKick] = useState(false);
  const [kickTotalBoost, setKickTotalBoost] = useState(0);
  const [kickPerfectCount, setKickPerfectCount] = useState(0);

  // -- Bet on Yourself system
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [betResults, setBetResults] = useState<Array<PlacedBet & { payout: number; won: boolean }>>([]);
  const [showBetResults, setShowBetResults] = useState(false);
  const hadBreakingPointRef = useRef(false);

  // -- Photo Finish & Result Card system
  const [isPhotoFinishMode, setIsPhotoFinishMode] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const playerName = player?.name || `Runner #${player?.id.slice(0, 5).toUpperCase() || "00000"}`;

  // -- Dynamic Weather System (Sprint 34 – Task 5)
  /** The currently active weather transition to show an alert for, or null */
  const [activeWeatherTransition, setActiveWeatherTransition] = useState<import("@/types/engine").WeatherTransition | null>(null);
  /** The live weather icon shown in the header (updated after each transition) */
  const [currentWeatherDisplay, setCurrentWeatherDisplay] = useState(challenge.environment.weather);
  /** Tracks which transition IDs have already fired, so they don't re-trigger */
  const firedTransitionIdsRef = useRef<Set<string>>(new Set());



  // -- Rivalry system
  const [raceRivals, setRaceRivals] = useState<Rival[]>([]);
  const [showRivalLineup, setShowRivalLineup] = useState(true);
  const [activeRivalDialog, setActiveRivalDialog] = useState<{
    rival: Rival;
    text: string;
    context: "pre_race" | "overtake_player" | "overtaken_by_player";
  } | null>(null);
  const [activeRivalStatus, setActiveRivalStatus] = useState<{
    rival: Rival;
    relationshipLevel: number;
    playerBeatRival: boolean;
    margin: number;
  } | null>(null);
  const overtakenRivalsRef = useRef<Set<string>>(new Set());

  const simStateRef = useRef<SimulationState | null>(null);
  const fullStateLogRef = useRef<
    Omit<SimulationState, "accumulatedStateLog">[]
  >([]);
  const maxDistanceMapRef = useRef<Map<string, number>>(new Map());

  // Trigger to advance simulation chunk
  const handleAdvance = useCallback(
    (choiceId?: string) => {
      // Validate challenge and preparation objects
      if (!challenge || !preparation) {
        console.error("Missing challenge or preparation data");
        router.push("/preparation");
        return;
      }
      
      const seed = Number.parseInt(challenge.date.replace(/-/g, ""), 10) || 42;
      const input = {
        player: { id: "player_local" },
        challenge,
        preparation,
        seed,
        runnerProfile: runnerState.profile,
        ghostRun: activeGhost,
      };

      let nextStep: SimulationStepResult;
      try {
        nextStep = advanceSimulation(
          input,
          simStateRef.current || undefined,
          choiceId,
          selectedPacingRef.current,
          true,
        );
      } catch (error) {
        console.error("Simulation failed:", error);
        router.push("/preparation");
        return;
      }

      // Helper function to update the state log
      const updateStateLog = (newLog: Omit<SimulationState, "accumulatedStateLog">[]) => {
        if (newLog.length >= fullStateLogRef.current.length) {
          fullStateLogRef.current = newLog;
        }
      };

      if (nextStep.type === "decision") {
        simStateRef.current = nextStep.state;
        setSimState(nextStep.state);
        updateStateLog(nextStep.state.accumulatedStateLog || []);
        setTargetKm(nextStep.state.distanceCovered);
        setPendingPrompt(nextStep.prompt);
      } else if (nextStep.type === "breaking_point") {
        simStateRef.current = nextStep.state;
        setSimState(nextStep.state);
        updateStateLog(nextStep.state.accumulatedStateLog || []);
        setTargetKm(nextStep.state.distanceCovered);
        setPendingPrompt(null);
      } else if (nextStep.type === "desperation") {
        simStateRef.current = nextStep.state;
        setSimState(nextStep.state);
        updateStateLog(nextStep.state.accumulatedStateLog || []);
        setTargetKm(nextStep.state.distanceCovered);
        setPendingPrompt(null);
      } else if (nextStep.type === "step") {
        simStateRef.current = nextStep.state;
        setSimState(nextStep.state);
        updateStateLog(nextStep.state.accumulatedStateLog || []);
        setTargetKm(nextStep.state.distanceCovered);
        setPendingPrompt(null);
      } else {
        simStateRef.current = null;
        setSimState(null);
        setSimResult(nextStep.result);
        updateStateLog(nextStep.result.stateLog || []);
        setTargetKm(nextStep.result.stateLog.length - 1);
        setPendingPrompt(null);
      }
    },
    [challenge, preparation, router, runnerState, activeGhost],
  );

  // Initial simulation load on mount
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      handleAdvance();
    }
  }, [handleAdvance]);
  
  // Select rivals for this race on mount
  useEffect(() => {
    if (raceRivals.length === 0 && runnerState.profile) {
      const selected = selectRivalsForRace({
        playerSkill: runnerState.profile.skillPoints || 50,
        raceDistance: challenge.race.distance,
        previousRivals: runnerState.profile.rivalRelationships || {},
      });
      setRaceRivals(selected);
    }
  }, [runnerState.profile, challenge.race.distance, raceRivals.length]);

  // Ticker animation that catches up to targetKm one by one
  useEffect(() => {
    if (fullStateLogRef.current.length === 0 || isFinished || isPaused) return;

    if (currentKm >= targetKm) {
      // STOP! Never auto-advance while a decision / breaking point / desperation modal is active
      if (activeDecision || activeBreakingPoint || activeDesperation) {
        return;
      }

      // Ticker has caught up to the simulated chunk
      if (
        simState?.activeBreakingPoint &&
        !simState.activeBreakingPoint.resolved
      ) {
        hadBreakingPointRef.current = true; // track for clean_race bet
        setActiveBreakingPoint(simState.activeBreakingPoint);
        return;
      } else if (
        simState?.desperationMode &&
        !simState.hasTriggeredDesperation
      ) {
        setActiveDesperation(simState.desperationMode);
        return;
      } else if (pendingPrompt) {
        setActiveDecision(pendingPrompt.decisionCard);
        setCountdown(30);
        setPendingPrompt(null); // Clear prompt to avoid trigger loop
        return;
      } else if (
        simState &&
        simState.distanceCovered < challenge.race.distance
      ) {
        // Ticker caught up, but simulation yielded at a step. Proactively advance for the next km!
        handleAdvance();
        return;
      } else if (simResult) {
        setIsFinished(true);

        // Deduct energy after race finishes in RaceScreen
        const energyCost = getEnergyCostForDistance(challenge?.race?.distance);
        useTimelineStore.getState().doAction("compete", energyCost);

        // ── Save result and process XP, coins, leveling, and standings FIRST ──
        setResult(simResult);
        analyzeRace(simResult, challenge, preparation);
        completeChallenge(
          challenge.id,
          challenge.race.distance,
          simResult,
          language,
        );

        // ── Update rival relationships after XP/leveling are persisted ─────
        if (raceRivals.length > 0 && simResult.stateLog && simResult.stateLog.length > 0) {
          const playerFinishTime = simResult.finishTime;
          const playerOutcome = simResult.outcome;
          const playerIsDNF = playerOutcome === "dnf" || playerOutcome === "dns";
          const finalState = simResult.stateLog[simResult.stateLog.length - 1];
          
          const freshState = getRunnerState();
          const updatedRelationships = { ...(freshState.profile.rivalRelationships || {}) };
          
          for (const rival of raceRivals) {
            const rivalOpponent = finalState.opponents?.find(o => o.id === rival.id);
            if (rivalOpponent) {
              const rivalFinishTime = rivalOpponent.accumulatedTime;
              const rivalIsDNF = rivalOpponent.isDNF || false;
              const margin = Math.abs(playerFinishTime - rivalFinishTime);
              const playerBeatRival = !playerIsDNF && (rivalIsDNF || playerFinishTime < rivalFinishTime);
              
              const existingRel = updatedRelationships[rival.id];
              const updatedRel = updateRivalRelationship(
                existingRel,
                playerBeatRival,
                margin,
              );
              updatedRelationships[rival.id] = updatedRel;
              
              if (raceRivals.indexOf(rival) === 0) {
                setActiveRivalStatus({
                  rival,
                  relationshipLevel: updatedRel.relationshipLevel,
                  playerBeatRival,
                  margin,
                });
              }
            }
          }

          const updatedRunnerState = {
            ...freshState,
            profile: {
              ...freshState.profile,
              rivalRelationships: updatedRelationships,
            },
          };
          setRunnerState(updatedRunnerState);
        }

        // -- Settle bets if any were placed
        const currentBets = placedBets;
        if (currentBets.length > 0) {
          const lastStateLog = simResult.stateLog;
          const lastState = lastStateLog[lastStateLog.length - 1];
          const isTop3 = ["gold", "silver", "bronze"].includes(simResult.outcome);
          const isWin = simResult.outcome === "gold";
          const isDNF = simResult.outcome === "dnf" || simResult.outcome === "dns";

          // Negative split: compare first half vs second half accumulated times
          const halfIdx = Math.floor(lastStateLog.length / 2);
          const firstHalfPaces = lastStateLog.slice(1, halfIdx + 1).map((s, i) => {
            const prev = lastStateLog[i];
            return s.accumulatedTime - prev.accumulatedTime;
          });
          const secondHalfPaces = lastStateLog.slice(halfIdx + 1).map((s, i) => {
            const prev = lastStateLog[halfIdx + i];
            return s.accumulatedTime - prev.accumulatedTime;
          });
          const avgFirst = firstHalfPaces.length > 0 ? firstHalfPaces.reduce((a, b) => a + b, 0) / firstHalfPaces.length : 999;
          const avgSecond = secondHalfPaces.length > 0 ? secondHalfPaces.reduce((a, b) => a + b, 0) / secondHalfPaces.length : 999;
          const isNegativeSplit = avgSecond < avgFirst;

          // PB check
          const pbForDistance = runnerState.profile.runHistory
            ?.filter((r) => r.distance === challenge.race.distance)
            .sort((a, b) => a.finishTime - b.finishTime)[0]?.finishTime;
          const beatsPB = pbForDistance ? simResult.finishTime < pbForDistance : false;

          const settled = currentBets.map((bet) => {
            let won = false;
            switch (bet.target.id) {
              case "top_3": won = isTop3 && !isDNF; break;
              case "win": won = isWin; break;
              case "no_dnf": won = !isDNF; break;
              case "negative_split": won = isNegativeSplit && !isDNF; break;
              case "beat_pb": won = beatsPB; break;
              case "clean_race": won = !hadBreakingPointRef.current && !isDNF; break;
            }
            const payout = won ? Math.round(bet.wager * bet.target.multiplier) : 0;
            return { ...bet, won, payout, status: (won ? "won" : "lost") as PlacedBet["status"] };
          });

          setBetResults(settled);

          // Apply economy transactions for wins
          const gameState = useTimelineStore.getState().gameState;
          if (gameState) {
            let updatedEconomy = { ...gameState.economy };
            const dayIndex = gameState.dayIndex;
            for (const s of settled) {
              if (s.won) {
                const { economy } = recordTransaction(
                  updatedEconomy,
                  "earn",
                  "race_prize",
                  s.payout,
                  dayIndex,
                  `Bet won: ${s.target.label} (${s.target.multiplier}x)`,
                );
                updatedEconomy = economy;
              }
            }
            useTimelineStore.getState().setGameState((prev) => ({
              ...prev!,
              economy: updatedEconomy,
              resources: { ...prev!.resources, money: updatedEconomy.currentBalance },
            }));
          }

          setShowBetResults(true);
          // Check if this qualifies for photo finish
          const photoFinishEligible = isPhotoFinish(simResult, playerName);
          
          if (photoFinishEligible) {
            // Show photo finish animation first, then bet results, then redirect
            setIsPhotoFinishMode(true);
            // After photo finish completes, show bet results and redirect
            setTimeout(() => {
              setIsPhotoFinishMode(false);
              setShowBetResults(true);
              setTimeout(() => { router.push("/result"); }, 4000);
            }, 4000);
          } else {
            // Delay redirect so bet popup is visible
            setTimeout(() => { router.push("/result"); }, 4000);
          }
        } else {
          // Check if this qualifies for photo finish (no bets case)
          const photoFinishEligible = isPhotoFinish(simResult, playerName);
          
          if (photoFinishEligible) {
            // Show photo finish animation first, then redirect
            setIsPhotoFinishMode(true);
            setTimeout(() => {
              setIsPhotoFinishMode(false);
              router.push("/result");
            }, 4000);
          } else {
            setTimeout(() => {
              router.push("/result");
            }, 1500);
          }
        }
        return;
      }
      return;
    }

    // Ticker needs to advance
    const intervalMs = 1500 / simSpeed; // 1.5 seconds per km scaled by speed multiplier
    const timer = setTimeout(() => {
      const nextKmValue = currentKm + 1;
      setCurrentKm(nextKmValue);


      // Extract events resolved at nextKmValue
      const events = simResult
        ? simResult.events
        : simState
          ? simState.eventsResolved
          : [];

      const matchedEvents = events.filter((e) => e.km === nextKmValue);
      if (matchedEvents.length > 0) {
        setRunningEvents((prev) => [...prev, ...matchedEvents]);
      }

      // Read actual stats from log snapshot
      const snapshot = fullStateLogRef.current[nextKmValue];
      if (snapshot) {
        const prevSnapshot = fullStateLogRef.current[nextKmValue - 1];
        const elapsedSeconds = prevSnapshot
          ? snapshot.accumulatedTime - prevSnapshot.accumulatedTime
          : snapshot.accumulatedTime;

        // Track km paces for achievement detection
        if (elapsedSeconds > 0) {
          kmPacesRef.current = [...kmPacesRef.current, elapsedSeconds];
        }

          dispatchStats({
            type: 'UPDATE',
            payload: {
              energy: Math.max(0, Math.round(snapshot.energy)),
              hydration: Math.max(0, Math.round(snapshot.hydration)),
              focus: Math.max(0, Math.round(snapshot.focus)),
              confidence: Math.max(0, Math.round(snapshot.confidence)),
              muscleFatigue: Math.round(snapshot.muscleFatigue ?? 0),
              mentalFatigue: Math.round(snapshot.mentalFatigue ?? 0),
              momentum: Math.round(snapshot.momentum ?? 50),
              paceStability: Math.round(snapshot.paceStability ?? 80),
              riskLevel: Math.round(snapshot.riskLevel ?? 20),
              pace: elapsedSeconds,
            }
          });

        // ── Achievement detection ──────────────────────────────────────────
        // Compute current player position by sorting all runners together
        type RunnerEntry = { id: string; distanceCovered: number; accumulatedTime: number };
        const allRunners: RunnerEntry[] = [
          { id: "player_local", distanceCovered: snapshot.distanceCovered, accumulatedTime: snapshot.accumulatedTime },
          ...(snapshot.opponents ?? []).map((o) => ({ id: o.id, distanceCovered: o.distanceCovered, accumulatedTime: o.accumulatedTime })),
        ];
        allRunners.sort((a, b) => b.distanceCovered - a.distanceCovered || a.accumulatedTime - b.accumulatedTime);
        const playerPos = Math.max(1, allRunners.findIndex((r) => r.id === "player_local") + 1);
        const prevPos = prevPlayerPositionRef.current;

        // ── Rival overtake detection ────────────────────────────────────────
        // Check if player overtook any rival or was overtaken by any rival
        if (snapshot.opponents && prevSnapshot?.opponents) {
          const currentOpponents = snapshot.opponents;
          const prevOpponents = prevSnapshot.opponents;
          
          // Build position maps for current and previous km
          const currentPositions = [...currentOpponents, { id: "player_local", distanceCovered: snapshot.distanceCovered, accumulatedTime: snapshot.accumulatedTime }]
            .sort((a, b) => b.distanceCovered - a.distanceCovered || a.accumulatedTime - b.accumulatedTime);
          
          const prevPositions = [...prevOpponents, { id: "player_local", distanceCovered: prevSnapshot.distanceCovered, accumulatedTime: prevSnapshot.accumulatedTime }]
            .sort((a, b) => b.distanceCovered - a.distanceCovered || a.accumulatedTime - b.accumulatedTime);
          
          // Find rivals that the player overtook (rival was ahead, now behind)
          for (const rival of raceRivals) {
            const rivalId = rival.id;
            const currentRivalIndex = currentPositions.findIndex(r => r.id === rivalId);
            const prevRivalIndex = prevPositions.findIndex(r => r.id === rivalId);
            const currentPlayerIndex = currentPositions.findIndex(r => r.id === "player_local");
            const prevPlayerIndex = prevPositions.findIndex(r => r.id === "player_local");
            
            // Player overtook this rival
            if (prevRivalIndex !== -1 && currentRivalIndex !== -1 && 
                prevPlayerIndex !== -1 && currentPlayerIndex !== -1) {
              if (prevRivalIndex < prevPlayerIndex && currentRivalIndex > currentPlayerIndex) {
                // Player overtook rival - trigger dialog
                if (!overtakenRivalsRef.current.has(rivalId)) {
                  const dialog = generateRivalDialog(rival, "overtake_player", {
                    km: nextKmValue,
                    relationshipLevel: runnerState.profile.rivalRelationships?.[rivalId]?.relationshipLevel ?? 0,
                  });
                  setActiveRivalDialog({
                    rival,
                    text: dialog.text,
                    context: "overtake_player",
                  });
                  overtakenRivalsRef.current.add(rivalId);
                }
              }
              // Rival overtook player
              else if (prevRivalIndex > prevPlayerIndex && currentRivalIndex < currentPlayerIndex) {
                // Rival overtook player - trigger dialog
                if (!overtakenRivalsRef.current.has(rivalId)) {
                  const dialog = generateRivalDialog(rival, "overtaken_by_player", {
                    km: nextKmValue,
                    relationshipLevel: runnerState.profile.rivalRelationships?.[rivalId]?.relationshipLevel ?? 0,
                  });
                  setActiveRivalDialog({
                    rival,
                    text: dialog.text,
                    context: "overtaken_by_player",
                  });
                  overtakenRivalsRef.current.add(rivalId);
                }
              }
            }
          }
        }

        const earnedSet = earnedAchievementsRef.current;
        const newAchievements = checkRaceAchievements(
          snapshot,
          prevSnapshot ?? null,
          {
            km: nextKmValue,
            totalDistance: challenge.race.distance,
            playerPosition: playerPos,
            prevPlayerPosition: prevPos,
            totalRunners: (snapshot.opponents?.length ?? 0) + 1,
            isFirstTime: true, // refined inside checkRaceAchievements
            events: matchedEvents,
            kmPaces: kmPacesRef.current,
          },
          earnedSet,
        );

        if (newAchievements.length > 0) {
          const queueItems: AchievementQueueItem[] = newAchievements.map((a) => ({
            ...a,
            isFirstTime: !earnedSet.has(a.id),
            instanceId: `${a.id}-${nextKmValue}-${Date.now()}`,
          }));
          newAchievements.forEach((a) => earnedSet.add(a.id));
          setAchievementQueue((prev) => [...prev, ...queueItems]);
        }

        prevPlayerPositionRef.current = playerPos;

        // ── Weather Transition detection (Sprint 34 – Task 5) ────────────────
        // Check if any pre-rolled transition fires at this km
        if (challenge.weatherTransitions && challenge.weatherTransitions.length > 0) {
          for (const wt of challenge.weatherTransitions) {
            if (wt.km === nextKmValue && !firedTransitionIdsRef.current.has(wt.id)) {
              firedTransitionIdsRef.current.add(wt.id);
              setActiveWeatherTransition(wt);
              setCurrentWeatherDisplay(wt.to);
            }
          }
        }

        // ── Final kick detection ───────────────────────────────────────────
        const tickerMetersRemaining = (challenge.race.distance - snapshot.distanceCovered) * 1000;
        if (tickerMetersRemaining <= 500 && !isFinalKick) {
          setIsFinalKick(true);
        }
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [
    currentKm,
    targetKm,
    pendingPrompt,
    activeDecision,
    activeBreakingPoint,
    activeDesperation,
    simResult,
    simState,
    challenge,
    setResult,
    completeChallenge,
    language,
    router,
    preparation,
    handleAdvance,
    simSpeed,
    isFinished,
  ]);

  // Countdown timer decrement
  useEffect(() => {
    if (!activeDecision) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeDecision, countdown]);

  // Handle timeout resolution
  useEffect(() => {
    if (activeDecision && countdown <= 0) {
      setTimeoutAlert(true);
      const timer = setTimeout(() => {
        setTimeoutAlert(false);
        setActiveDecision(null);
        handleAdvance(undefined); // undefined choice forces getFallbackChoice auto-pick
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeDecision, countdown, handleAdvance]);

  // Selection callback for user choices
  const selectChoice = (choiceId: string) => {
    setActiveDecision(null);
    handleAdvance(choiceId);
  };

  const handleBreakingPointRecovery = (optionId: string) => {
    if (!activeBreakingPoint) return;
    setActiveBreakingPoint(null);
    handleAdvance(optionId);
  };

  const handleDesperationChoice = (choiceId: string) => {
    if (!activeDesperation) return;
    setActiveDesperation(null);
    handleAdvance(choiceId);
  };


  const consumeItem = (itemKey: string) => {
    const qty = activeConsumables[itemKey] || 0;
    if (qty <= 0 || isFinished) return;

    // 1. Deduct 1 from local activeConsumables state
    setActiveConsumables((prev) => ({
      ...prev,
      [itemKey]: prev[itemKey] - 1,
    }));

    // 2. Deduct from persistent shop store inventory if available
    try {
      useShopStore.getState().consumeNutrition(itemKey as any, 1);
    } catch {
      // safe fallback
    }

    // 4. Calculate boost values based on item
    const isIronStomach = runnerState.profile.activePerks?.includes("iron_stomach");
    let staminaBoost = 0;
    let hydrationBoost = 0;
    let focusBoost = 0;
    const meta = CONSUMABLE_META[itemKey] || { label: itemKey, boostType: "+Boost" };
    const label = `Consumed ${meta.label}`;
    const desc = `${meta.label} (${meta.boostType})`;
    const effects = { stamina: staminaBoost, hydration: hydrationBoost, morale: focusBoost, pace: 0 };

    if (itemKey === "energy_gel") {
      staminaBoost = isIronStomach ? 50 : 30;
    } else if (itemKey === "water") {
      hydrationBoost = 20;
      staminaBoost = 10;
    } else if (itemKey === "electrolyte" || itemKey === "electrolytes") {
      hydrationBoost = 35;
      staminaBoost = 10;
    } else if (itemKey === "salt_tablets") {
      hydrationBoost = 20;
      staminaBoost = 15;
    } else if (itemKey === "energy_bar") {
      staminaBoost = 25;
    } else if (itemKey === "hydration_mix") {
      hydrationBoost = 40;
      staminaBoost = 15;
    } else if (itemKey === "caffeine" || itemKey === "caffeine_gum") {
      focusBoost = 25;
      staminaBoost = 10;
    } else {
      staminaBoost = 20;
    }

    if (simStateRef.current) {
      if (staminaBoost > 0) {
        simStateRef.current.energy = Math.min(100, simStateRef.current.energy + staminaBoost);
      }
      if (hydrationBoost > 0) {
        simStateRef.current.hydration = Math.min(100, (simStateRef.current.hydration || 80) + hydrationBoost);
      }
      if (focusBoost > 0) {
        simStateRef.current.focus = Math.min(100, simStateRef.current.focus + focusBoost);
      }
    }

    // 5. Update local screen stats directly
    dispatchStats({
      type: "UPDATE",
      payload: {
        ...stats,
        energy: Math.min(100, stats.energy + staminaBoost),
        hydration: Math.min(100, stats.hydration + hydrationBoost),
        focus: Math.min(100, stats.focus + focusBoost),
      },
    });

    // 6. Append to runningEvents log
    setRunningEvents((prev) => [
      ...prev,
      {
        km: currentKm,
        title: {
          en: label,
          id: `Mengonsumsi ${meta.label}`,
        },
        description: { en: desc, id: desc },
        effect: effects,
      },
    ]);
  };

  // Handle final kick timing result
  const handleKick = useCallback(
    (timing: KickTiming) => {
      const boostMap: Record<KickTiming, number> = { perfect: 0.5, good: 0.2, miss: 0 };
      const boost = boostMap[timing];
      if (boost > 0) {
        setKickTotalBoost((prev) => prev + boost);
      }
      if (timing === "perfect") {
        setKickPerfectCount((prev) => prev + 1);
      }
    },
    [],
  );

  // Bet callbacks
  const handlePlaceBet = useCallback(
    (target: BetTarget, wager: number) => {
      const newBet: PlacedBet = {
        id: `bet-${Date.now()}`,
        target,
        wager,
        status: "pending",
      };
      // Deduct wager from economy immediately
      const gameState = useTimelineStore.getState().gameState;
      if (gameState) {
        const { economy } = recordTransaction(
          gameState.economy,
          "spend",
          "race_entry",
          wager,
          gameState.dayIndex,
          `Bet placed: ${target.label}`,
        );
        useTimelineStore.getState().setGameState((prev) => ({
          ...prev!,
          economy,
          resources: { ...prev!.resources, money: economy.currentBalance },
        }));
      }
      setPlacedBets((prev) => [...prev, newBet]);
    },
    [],
  );

  const handleCancelBet = useCallback(
    (betId: string) => {
      const bet = placedBets.find((b) => b.id === betId);
      if (!bet) return;
      // Refund wager
      const gameState = useTimelineStore.getState().gameState;
      if (gameState) {
        const { economy } = recordTransaction(
          gameState.economy,
          "earn",
          "race_prize",
          bet.wager,
          gameState.dayIndex,
          `Bet cancelled: ${bet.target.label} (refund)`,
        );
        useTimelineStore.getState().setGameState((prev) => ({
          ...prev!,
          economy,
          resources: { ...prev!.resources, money: economy.currentBalance },
        }));
      }
      setPlacedBets((prev) => prev.filter((b) => b.id !== betId));
    },
    [placedBets],
  );
  // Compute live meters remaining for the final kick component
  const metersRemaining = Math.max(
    0,
    (challenge.race.distance - currentKm) * 1000,
  );

  const progressPercentage = Math.min(
    100,
    (currentKm / challenge.race.distance) * 100,
  );

  const formatPace = (seconds: number) => {
    if (!seconds || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Compute live runners list for leaderboard and progress visualizer
  // Use current snapshot, or fall back to the most recent available snapshot
  let currentSnapshot = fullStateLogRef.current[currentKm];
  
  // If current km doesn't have data yet, use the last available snapshot
  if (!currentSnapshot && fullStateLogRef.current.length > 0) {
    const lastAvailableIndex = Math.min(
      currentKm,
      fullStateLogRef.current.length - 1
    );
    currentSnapshot = fullStateLogRef.current[lastAvailableIndex];
  }

  const runners: {
    id: string;
    name: string;
    isPlayer: boolean;
    distance: number;
    accumulatedTime: number;
    isDNF: boolean;
    isGhost?: boolean;
  }[] = [];

  if (currentSnapshot) {
    const rawPlayerDist = currentSnapshot.distanceCovered;
    const prevPlayerMax = maxDistanceMapRef.current.get("player_local") || 0;
    const playerDist = Math.max(prevPlayerMax, rawPlayerDist);
    maxDistanceMapRef.current.set("player_local", playerDist);

    runners.push({
      id: "player_local",
      name: "You",
      isPlayer: true,
      distance: playerDist,
      accumulatedTime: currentSnapshot.accumulatedTime,
      isDNF: stats.energy <= 0 || stats.hydration <= 0,
      isGhost: false,
    });

    if (currentSnapshot.opponents) {
      for (const opp of currentSnapshot.opponents) {
        const rawOppDist = opp.distanceCovered;
        const prevOppMax = maxDistanceMapRef.current.get(opp.id) || 0;
        const oppDist = Math.max(prevOppMax, rawOppDist);
        maxDistanceMapRef.current.set(opp.id, oppDist);

        runners.push({
          id: opp.id,
          name: opp.name,
          isPlayer: false,
          distance: oppDist,
          accumulatedTime: opp.accumulatedTime,
          isDNF: opp.isDNF,
          isGhost: opp.id === "ghost_runner" || opp.isGhost,
        });
      }
    }
  }

  // Only use 0 distance fallback if we have no state at all
  if (runners.length === 0) {
    runners.push({
      id: "player_local",
      name: "You",
      isPlayer: true,
      distance: 0,
      accumulatedTime: 0,
      isDNF: false,
    });
  }

  // Sort: DNF runners last, then by distance desc, then by time asc
  runners.sort((a, b) => {
    if (a.isDNF && !b.isDNF) return 1;
    if (!a.isDNF && b.isDNF) return -1;
    if (a.isDNF && b.isDNF) return 0;
    if (b.distance !== a.distance) {
      return b.distance - a.distance;
    }
    return a.accumulatedTime - b.accumulatedTime;
  });



  return (
    <div className="min-h-screen bg-[#fffdf8] dark:bg-[#090d16] text-slate-900 dark:text-white flex flex-col justify-between overflow-hidden relative">
      {/* Header */}
      <header className="px-4 md:px-6 py-4 md:py-6 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 font-semibold">
              {t("challenge.race.live_simulation" as TranslationKey)}
            </span>
            <h1 className="font-heading text-base md:text-lg lg:text-xl font-bold text-slate-800 dark:text-gray-100 truncate">
              {challenge.race.title[lang]}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1 text-[10px] md:text-xs text-slate-500 dark:text-gray-400">
              <span className="capitalize">
                {/* Use live weather display which updates after transitions */}
                {t(
                  `challenge.weather.${currentWeatherDisplay}` as TranslationKey,
                )}
              </span>
              <span>•</span>
              <span>{challenge.environment.temperature}°C</span>
              <span>•</span>
              <span className="capitalize">
                {t(
                  `challenge.surface.${challenge.race.surface}` as TranslationKey,
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Speed Controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700">
              {([1, 2, 5] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setSimSpeed(speed);
                  }}
                  className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-[10px] md:text-xs font-bold transition-all ${
                    simSpeed === speed 
                      ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] md:text-xs font-semibold">
              <Activity className="h-3.5 md:h-4.5 w-3.5 md:w-4.5 animate-pulse" />
              <span className="hidden sm:inline">{t("challenge.race.simulating" as TranslationKey)}</span>
              <span className="sm:hidden">Live</span>
            </div>
          </div>
        </div>
      </header>
 
      {/* Main content area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col justify-center gap-4 md:gap-6 relative">
        {/* Distance Tracker & Visual Track Progress */}
        <div className="flex flex-col gap-4 md:gap-5 items-center justify-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-4 md:p-6 shadow-sm">
          {/* Distance Circular Tracker */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center group">
            <div className="absolute inset-0 rounded-full border-[6px] border-orange-500/5 dark:border-orange-500/10 scale-105" />
            <svg
              className="w-full h-full transform -rotate-90 drop-shadow-sm"
              role="img"
              aria-label="Race progress circle"
            >
              <title>Race progress circle</title>
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-orange-500 fill-none"
                strokeWidth="8"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276 }}
                animate={{
                  strokeDashoffset: 276 - (276 * progressPercentage) / 100,
                }}
                transition={{ duration: (isPaused ? 0 : 1.5) / simSpeed, ease: "linear" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                Distance
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight font-heading text-slate-800 dark:text-white">
                  {currentKm}
                </span>
                <span className="text-sm md:text-base font-bold text-slate-300 dark:text-slate-600">
                  /{challenge.race.distance}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-150 dark:border-slate-700">
                <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  PACE
                </span>
                <span className="text-[10px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 font-mono">
                  {formatPace(stats.pace)}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Race Track Progress */}
          <div className="w-full flex flex-col gap-2 mt-4 md:mt-6 border-t border-slate-100 dark:border-gray-800 pt-4 md:pt-6 relative">

            <TrackPositionVisualizer
              runners={runners}
              currentKm={currentKm}
              raceDistance={challenge.race.distance}
              simSpeed={simSpeed}
              selectedPacing={selectedPacing}
              surface={challenge.race.surface}
              playerEnergy={stats.energy}
              isPaused={isPaused}
            />
          </div>

          {/* Ghost Split Comparison - shows when ghost is active */}
          {activeGhost && currentKm > 0 && (
            <GhostSplitComparison
              challenge={challenge}
              stateLog={fullStateLogRef.current}
              currentKm={currentKm}
              currentPace={stats.pace}
              lang={lang}
              activeGhost={activeGhost}
              playerName={playerName}
              isPaused={isPaused}
            />
          )}
        </div>

        {/* Pace Projector — Live finish prediction */}
        {currentKm > 0 && !isFinished && (
          <PaceProjector
            currentPace={stats.pace}
            distanceCovered={currentKm}
            totalDistance={challenge.race.distance}
            accumulatedTime={currentSnapshot?.accumulatedTime ?? 0}
            personalBest={runnerState.profile.runHistory?.length
              ? (() => {
                  const pbs = runnerState.profile.runHistory
                    ?.filter(r => r.distance === challenge.race.distance)
                    .sort((a, b) => a.finishTime - b.finishTime);
                  return pbs.length > 0 ? pbs[0].finishTime : undefined;
                })()
              : undefined}
            isPaused={isPaused}
            simSpeed={simSpeed}
          />
        )}

        {/* Final Kick mini-game — activates in last 500m */}
        <AnimatePresence>
          {isFinalKick && !isFinished && (
            <FinalKick
              metersRemaining={metersRemaining}
              onKick={handleKick}
              totalBoost={kickTotalBoost}
              perfectCount={kickPerfectCount}
              isPaused={isPaused}
            />
          )}
        </AnimatePresence>

        {/* Live Simulation HUD Dashboard */}
        <div className="flex flex-col gap-4 md:gap-6 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-4 md:p-6 shadow-sm">
          {/* Strategy Tactics & Leaderboard Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 border-b border-slate-100 dark:border-gray-800 pb-4 md:pb-6">
            {/* Left Column: Real-Time Tactics (Pacing Buttons) */}
            <div className="flex flex-col gap-3">
              {/* Bet on Yourself Panel */}
              <div className="mb-2">
                <SelfBetPanel
                  currentBalance={useTimelineStore((s) => s.gameState?.economy.currentBalance ?? 0)}
                  placedBets={placedBets}
                  onPlaceBet={handlePlaceBet}
                  onCancelBet={handleCancelBet}
                  currentKm={currentKm}
                  hasBreakingPoint={hadBreakingPointRef.current}
                />
              </div>

              <h4 className="text-xs md:text-sm uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                <span>⚡</span> Real-Time Tactics
              </h4>
              <p className="text-[10.5px] md:text-xs text-slate-450 dark:text-gray-400 leading-relaxed mb-1">
                Select your pacing strategy. Changes apply to the next kilometer
                simulated. Sprints are locked until the final 2km.
              </p>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                {(["jog", "cruise", "push", "sprint"] as const).map((mode) => {
                  const isActive = selectedPacing === mode;
                  const isSprintLocked =
                    mode === "sprint" &&
                    currentKm < challenge.race.distance - 2;
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={isSprintLocked}
                      onClick={() => {
                        setSelectedPacing(mode);
                      }}
                      className={`py-2 px-3 rounded-[1.25rem] text-xs font-bold transition-all transform active:scale-95 flex flex-col items-start gap-0.5 border
                        ${
                          isActive
                            ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                            : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }
                        ${isSprintLocked ? "opacity-40 cursor-not-allowed border-dashed" : ""}
                      `}
                    >
                      <span className="capitalize text-sm md:text-base font-extrabold">
                        {mode}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-semibold opacity-75">
                        {mode === "jog" && "Conserve fatigue"}
                        {mode === "cruise" && "Steady pace"}
                        {mode === "push" && "Attack segments"}
                        {mode === "sprint" &&
                          (isSprintLocked
                            ? "Locked until 2km"
                            : "Max speed kick!")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Preparation Consumables */}
              <div className="mt-3 md:mt-4 border-t border-slate-100 dark:border-gray-800 pt-3 md:pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] md:text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span>🥤</span> Active Consumables
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400">
                    {Object.values(activeConsumables).reduce((a, b) => a + b, 0)} items remaining
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(activeConsumables).map(([itemKey, qty]) => {
                    const meta = CONSUMABLE_META[itemKey] || {
                      label: itemKey.replace("_", " "),
                      icon: "⚡",
                      boostType: "+Boost",
                    };
                    const isAvailable = qty > 0;

                    return (
                      <button
                        key={itemKey}
                        type="button"
                        disabled={!isAvailable || isFinished}
                        onClick={() => consumeItem(itemKey)}
                        className={`py-2.5 px-3.5 rounded-[1.25rem] text-[11px] font-extrabold flex items-center gap-1.5 transition-all transform active:scale-95 border min-h-[44px] ${
                          isAvailable && !isFinished
                            ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer shadow-sm"
                            : "bg-slate-100 dark:bg-slate-900 border-slate-150 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-45 cursor-not-allowed"
                        }`}
                        title={`${meta.label} (${meta.boostType})`}
                      >
                        <span>{meta.icon}</span>
                        <span>
                          {meta.label} <span className="font-mono font-black">({qty})</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Live Leaderboard */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs md:text-sm uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span>🏆</span> Live Standings
              </h4>
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-[1.5rem] border border-slate-150 dark:border-gray-800 overflow-hidden text-xs md:text-sm">
                <div className="grid grid-cols-12 gap-1 px-2 md:px-3 py-1.5 md:py-2 bg-slate-100 dark:bg-gray-800/40 border-b border-slate-200 dark:border-gray-800 font-extrabold text-[9px] md:text-[10px] text-slate-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span className="col-span-2 text-center">Pos</span>
                  <span className="col-span-6">Runner</span>
                  <span className="col-span-4 text-right">Gap</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-gray-850">
                  {runners.map((r, idx) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const isLeader = idx === 0;
                    const leaderTime = runners[0]?.accumulatedTime || 0;
                    const gap = r.accumulatedTime - leaderTime;

                    return (
                      <div
                        key={r.id}
                        className={`grid grid-cols-12 gap-1 px-2 md:px-3 py-2 md:py-2.5 items-center font-medium text-xs md:text-sm
                          ${r.isPlayer ? "bg-orange-50/50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-100 font-bold" : r.isGhost ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 font-semibold" : "text-slate-700 dark:text-gray-300"}
                          ${r.isDNF ? "opacity-50" : ""}
                        `}
                      >
                        <span className="col-span-2 text-center text-sm md:text-base">
                          {idx < 3 && !r.isDNF
                            ? r.isGhost
                              ? "👻"
                              : medals[idx]
                            : `${idx + 1}`}
                        </span>
                        <span className="col-span-6 truncate flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.isPlayer && (
                            <span className="text-[8px] bg-orange-100 dark:bg-orange-900/60 text-orange-605 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded uppercase">
                              You
                            </span>
                          )}
                          {r.isGhost && (
                            <span className="text-[8px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-650 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">
                              Ghost
                            </span>
                          )}
                          {r.isDNF && (
                            <span className="text-[8px] bg-red-100 dark:bg-red-950/60 text-red-655 dark:text-red-400 font-bold px-1.5 py-0.5 rounded uppercase">
                              DNF
                            </span>
                          )}
                        </span>
                        <span className="col-span-4 text-right font-mono text-[11px] font-bold text-slate-500 dark:text-gray-400">
                          {r.isDNF
                            ? "Exhausted"
                            : isLeader
                              ? formatPace(r.accumulatedTime)
                              : `+${gap.toFixed(1)}s`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Attributes Panel */}
          <div>
            <h3 className="text-xs md:text-sm uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500 dark:text-gray-400 mb-2 md:mb-3 flex items-center gap-1.5">
              <span>📊</span> Live Runner Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-3 md:p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] uppercase font-bold mb-1">
                  Pace
                </span>
                <div className="flex items-center gap-1 text-slate-800 dark:text-gray-200">
                  <Gauge className="h-4 w-4 md:h-4.5 md:w-4.5 text-orange-500" />
                  <span className="text-base md:text-lg font-bold">
                    {formatPace(stats.pace)} /km
                  </span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-3 md:p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] uppercase font-bold mb-1">
                  Energy
                </span>
                <div className="flex items-center gap-1 text-amber-655 dark:text-amber-500">
                  <Flame className="h-4 w-4 md:h-4.5 md:w-4.5" />
                  <span className="text-base md:text-lg font-bold">{stats.energy}%</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-3 md:p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] uppercase font-bold mb-1">
                  Hydration
                </span>
                <div className="flex items-center gap-1 text-blue-650 dark:text-blue-500">
                  <Activity className="h-4 w-4 md:h-4.5 md:w-4.5" />
                  <span className="text-base md:text-lg font-bold">{stats.hydration}%</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-3 md:p-4 flex flex-col items-center bg-slate-50/50 dark:bg-gray-950/20">
                <span className="text-slate-400 dark:text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] uppercase font-bold mb-1">
                  Focus
                </span>
                <div className="flex items-center gap-1 text-purple-650 dark:text-purple-550">
                  <TrendingUp className="h-4 w-4 md:h-4.5 md:w-4.5" />
                  <span className="text-base md:text-lg font-bold">{stats.focus}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-attributes / Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 border-t border-slate-100 dark:border-gray-800 pt-4 md:pt-6">
            <div className="flex flex-col gap-2 md:gap-3">
              <span className="text-xs md:text-sm uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500">
                Fatigue & Stability
              </span>
              <div className="flex flex-col gap-2 md:gap-2.5 text-xs md:text-sm">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Muscle Fatigue</span>
                    <span>{stats.muscleFatigue}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-350"
                      style={{ width: `${stats.muscleFatigue}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Mental Fatigue</span>
                    <span>{stats.mentalFatigue}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-350"
                      style={{ width: `${stats.mentalFatigue}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-slate-700 dark:text-gray-300">
                    <span>Pace Stability</span>
                    <span>{stats.paceStability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full transition-all duration-350"
                      style={{ width: `${stats.paceStability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-gray-500">
                Strategy & Status
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Risk Level
                  </span>
                  <span
                    className={`font-bold ${stats.riskLevel > 50 ? "text-red-500 font-extrabold" : "text-slate-700 dark:text-gray-300"}`}
                  >
                    {stats.riskLevel}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Momentum
                  </span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">
                    {stats.momentum}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-gray-950">
                  <span className="text-slate-500 dark:text-gray-400">
                    Confidence
                  </span>
                  <span className="font-bold text-slate-700 dark:text-gray-300">
                    {stats.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Effects List */}
          <div className="border-t border-slate-100 dark:border-gray-800 pt-4 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 dark:text-gray-400 mr-2">
              Active Effects:
            </span>
            {preparation.nutrition.map((item) => (
              <span
                key={item}
                className="text-[10px] font-bold px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-605 dark:text-orange-400 rounded-full capitalize"
              >
                {t(`preparation.nutrition.${item}.name` as TranslationKey)}
              </span>
            ))}
            {preparation.nutrition.includes("caffeine") && currentKm < 6 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-purple-55 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 rounded-full animate-pulse">
                ⚡ Caffeine Surge
              </span>
            )}
            {preparation.nutrition.includes("caffeine") && currentKm >= 6 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md">
                💤 Caffeine Crash
              </span>
            )}
            {preparation.nutrition.includes("energy_gel") && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-md">
                🤢 Stomach Stress Risk
              </span>
            )}
            {stats.energy < 40 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-md">
                🚨 Exhaustion
              </span>
            )}
            {preparation.nutrition.length === 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-md">
                💀 No Nutrition
              </span>
            )}
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="flex-grow bg-slate-950 border border-slate-800 rounded-[1.5rem] p-5 font-mono text-xs overflow-y-auto max-h-[160px] text-slate-200 shadow-inner">
          <div className="text-gray-500 mb-2">
            {t("challenge.race.feed" as TranslationKey)}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              &gt;{" "}
              {t("challenge.race.started_on" as TranslationKey).replace(
                "{{surface}}",
                t(
                  `challenge.surface.${challenge.race.surface}` as TranslationKey,
                ),
              )}
            </div>
            <AnimatePresence>
              {runningEvents.map((event, index) => (
                <motion.div
                  key={`${event.km}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 ${
                    event.effect.stamina < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  <span>[{event.km} km]</span>
                  <span className="flex-grow">
                    {event.title[lang]} — {event.description[lang]}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400 font-semibold"
              >
                &gt; {t("challenge.race.finished_rendering" as TranslationKey)}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Decision moments Overlay Modal */}
      {activeDecision && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-gray-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-orange-500 dark:text-orange-400 font-bold">
                  {t(`challenge.race.decision_title` as TranslationKey)} •{" "}
                  {activeDecision.category}
                </span>
                <h2 className="font-heading text-xl font-black text-slate-805 dark:text-white mt-0.5">
                  {activeDecision.title[lang]}
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 dark:text-gray-555 uppercase tracking-wider">
                  {t("challenge.race.remaining_seconds" as TranslationKey)}
                </span>
                <span
                  className={`text-2xl font-black font-mono ${countdown <= 3 ? "text-red-500 animate-pulse" : "text-orange-500 dark:text-orange-400"}`}
                >
                  {countdown}s
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-gray-300 text-xs leading-relaxed">
              {activeDecision.description[lang]}
            </p>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-455 dark:text-gray-500 dark:text-gray-400 font-bold">
                {t("challenge.race.strategic_choices" as TranslationKey)}
              </span>
              {activeDecision.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => selectChoice(choice.id)}
                  disabled={timeoutAlert}
                  className="flex flex-col text-left p-3.5 rounded-[1.25rem] border border-slate-250 dark:border-gray-850 bg-slate-50/50 dark:bg-gray-950/40 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:border-orange-500/50 transition-all group duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-slate-700 dark:text-white text-xs group-hover:text-orange-505 dark:group-hover:text-orange-400 transition-colors">
                      {choice.label[lang]}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-250 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
                      {choice.behavior}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-450 mt-1 leading-normal">
                    {choice.description[lang]}
                  </p>

                  {/* Visual micro trade-offs list */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {choice.effects.stamina !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.stamina > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.stamina > 0 ? "+" : ""}
                        {choice.effects.stamina}% Energy
                      </span>
                    )}
                    {choice.effects.hydration !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.hydration > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.hydration > 0 ? "+" : ""}
                        {choice.effects.hydration}% Hydration
                      </span>
                    )}
                    {choice.effects.morale !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.morale > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.morale > 0 ? "+" : ""}
                        {choice.effects.morale}% Focus
                      </span>
                    )}
                    {choice.effects.pace !== 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${choice.effects.pace < 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"}`}
                      >
                        {choice.effects.pace < 0
                          ? "Faster Pace"
                          : "Slower Pace"}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Breaking Point Overlay */}
      {activeBreakingPoint && (
        <BreakingPointOverlay
          breakingPoint={activeBreakingPoint}
          onRecovery={handleBreakingPointRecovery}
          onEndorphinTrigger={() => setActiveBreakingPoint(null)}
        />
      )}

      {/* Desperation Mode Overlay */}
      {activeDesperation && (
        <DesperationOverlay
          desperation={activeDesperation}
          onChoose={handleDesperationChoice}
        />
      )}

      {/* Timeout Overlay Alert */}
      {timeoutAlert && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl text-center flex flex-col items-center gap-4 max-w-sm w-full"
          >
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-500 text-3xl animate-bounce">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {t("challenge.race.timeout" as TranslationKey)}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              {t("challenge.race.timeout_instinct" as TranslationKey)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Photo Finish Overlay */}
      {isPhotoFinishMode && simResult && (
        <PhotoFinish
          result={simResult}
          challenge={challenge}
          playerName={playerName}
          lang={lang}
          onComplete={() => setIsPhotoFinishMode(false)}
        />
      )}

      {/* Result Card Generator Overlay */}
      {showResultCard && simResult && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <ResultCardGenerator
              challenge={challenge}
              result={simResult}
              playerName={playerName}
              lang={lang}
              betResults={betResults}
              earnedAchievements={[]}
              onDownloadComplete={() => setShowResultCard(false)}
              onCopyComplete={() => setShowResultCard(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-6 border-t border-slate-200 dark:border-gray-900 bg-white dark:bg-gray-900/30 text-center text-xs text-slate-400 dark:text-gray-500">
        {t("challenge.race.engine_version" as TranslationKey)}
      </footer>

      {/* Rival Lineup Overlay — pre-race introduction */}
      <AnimatePresence>
        {showRivalLineup && raceRivals.length > 0 && (
          <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
            <RivalLineup
              rivals={raceRivals}
              onIntroComplete={() => setShowRivalLineup(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Rival Dialog Overlay — during race */}
      <AnimatePresence>
        {activeRivalDialog && (
          <div className="fixed top-16 right-4 md:top-20 md:right-6 z-50">
            <RivalDialog
              rival={activeRivalDialog.rival}
              text={activeRivalDialog.text}
              context={activeRivalDialog.context}
              onDismiss={() => setActiveRivalDialog(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Rival Status Update Overlay — post-race */}
      <AnimatePresence>
        {activeRivalStatus && (
          <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
            <RivalStatusUpdate
              rival={activeRivalStatus.rival}
              relationshipLevel={activeRivalStatus.relationshipLevel}
              playerBeatRival={activeRivalStatus.playerBeatRival}
              margin={activeRivalStatus.margin}
              onDismiss={() => setActiveRivalStatus(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Micro-Achievement Popup Overlay — fixed top-right, stacked queue */}
      <MicroAchievementPopup
        queue={achievementQueue}
        onDismiss={(instanceId) =>
          setAchievementQueue((prev) => prev.filter((a) => a.instanceId !== instanceId))
        }
      />

      {/* Weather Alert Overlay — slides in from top on mid-race weather change */}
      <WeatherAlert
        transition={activeWeatherTransition}
        onDismiss={() => setActiveWeatherTransition(null)}
      />

      {/* Bet Results Overlay */}
      <AnimatePresence>
        {showBetResults && (
          <BetResultsPopup
            results={betResults}
            onClose={() => {
              setShowBetResults(false);
              router.push("/result");
            }}
            onRunItBack={() => {
              setShowBetResults(false);
              router.push("/result"); // Eventually could redirect to prep screen instead
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
