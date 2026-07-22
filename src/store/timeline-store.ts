/**
 * Timeline Zustand store (Sprint 23-B).
 *
 * Bridges the pure time engine with the React UI. Loads/saves via
 * storageRepository so the engine stays pure.
 */

import { create } from "zustand";
import { DEFAULT_ECONOMY_STATE } from "@/economy/economy-types";
import { DEFAULT_SPONSORSHIP_STATE } from "@/economy/sponsorship-types";
import type { ActionId, CalendarEvent, GameState } from "@/engine/timeline";
import {
  applyAction,
  createInitialState,
  type FastForwardMode,
  fastForward,
  getAction,
  getScheduledStoryEvents,
  isDead,
} from "@/engine/timeline";
import { processMonthlySalary } from "@/economy/monthly-salary-engine";
import { DEFAULT_SCHEDULING_STATE } from "@/scheduling/race-calendar-types";
import { getScheduleById } from "@/scheduling/race-calendar-engine";
import { useSocialStore } from "@/social/social-store";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredGameState } from "@/storage/types";
import { markStoryBeatViewed } from "@/story/story-engine";
import { useStoryStore } from "@/story/story-store";

interface TimelineState {
  gameState: GameState | null;
  pendingEvents: CalendarEvent[];
  loaded: boolean;

  initialize(): void;
  doAction(actionId: ActionId): void;
  ff(mode: FastForwardMode): void;
  acknowledgeEvent(eventId: string): void;
  setRoutine(routine: GameState["routine"]): void;
  setGameState(updater: GameState | ((prev: GameState) => GameState)): void;
  newLife(): void;
  isAlive(): boolean;
}

function toStored(state: GameState): StoredGameState {
  return {
    version: 1,
    dayIndex: state.dayIndex,
    startAge: state.startAge,
    lifespan: state.lifespan,
    seed: state.seed,
    energy: state.energy,
    energyMax: state.energyMax,
    resources: state.resources,
    stats: state.stats,
    skills: state.skills,
    relationships: state.relationships,
    routine: state.routine,
    flags: state.flags,
    economy: state.economy,
    sponsorship: state.sponsorship,
    scheduling: state.scheduling,
  } as unknown as StoredGameState;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  gameState: null,
  pendingEvents: [],
  loaded: false,

  initialize() {
    const stored = storageRepository.loadGameState();
    let state = stored as unknown as GameState;
    if (!state) {
      state = createInitialState(Date.now());
    } else {
      // Merge defaults for new Sprint 26 fields in case loading an older save
      state = {
        ...state,
        economy: state.economy || DEFAULT_ECONOMY_STATE,
        sponsorship: state.sponsorship || DEFAULT_SPONSORSHIP_STATE,
        scheduling: state.scheduling || DEFAULT_SCHEDULING_STATE,
      };
    }
    // Ensure the current chapter's start day is initialized in flags
    const storyProgress = useStoryStore.getState().storyProgress;
    const currentChapterNum = storyProgress.currentChapter;
    const startDayKey = `chapter_${currentChapterNum}_start_day`;
    if (state.flags[startDayKey] === undefined) {
      state = {
        ...state,
        flags: {
          ...state.flags,
          [startDayKey]: state.dayIndex,
        },
      };
    }
    set({ gameState: state, loaded: true });
    storageRepository.saveGameState(state);
  },

  doAction(actionId: ActionId) {
    const { gameState } = get();
    if (!gameState) return;
    const action = getAction(actionId);
    const next = applyAction(gameState, action);

    // If day(s) advanced, simulate competition/social days!
    const daysAdvanced = next.dayIndex - gameState.dayIndex;
    if (daysAdvanced > 0) {
      const socialStore = useSocialStore.getState();
      const playerKm =
        actionId === "compete" ? 10 : actionId === "train" ? 5 : 0;
      for (let d = gameState.dayIndex; d < next.dayIndex; d++) {
        socialStore.simulateCompetitionDay(playerKm, undefined, d);
      }
      socialStore.ageActivities(next.dayIndex);
    }

    const updatedState = processMonthlySalary(next);
    set({ gameState: updatedState });
    storageRepository.saveGameState(updatedState);
  },

  ff(mode: FastForwardMode) {
    const { gameState } = get();
    if (!gameState) return;

    const storyProgress = useStoryStore.getState().storyProgress;
    const currentChapterNum = storyProgress.currentChapter;
    const startDayKey = `chapter_${currentChapterNum}_start_day`;

    let stateWithFlags = gameState;
    if (gameState.flags[startDayKey] === undefined) {
      stateWithFlags = {
        ...gameState,
        flags: {
          ...gameState.flags,
          [startDayKey]: gameState.dayIndex,
        },
      };
    }

    const eventsForDay = (d: number) => {
      const allEvents = getScheduledStoryEvents(stateWithFlags, storyProgress);
      const dayStoryEvents = allEvents.filter((e) => e.dayIndex === d);

      // Check for registered races scheduled on day d
      const registeredRacesOnDay: CalendarEvent[] = [];
      const registeredEntries = Object.entries(stateWithFlags.scheduling.registered);
      for (const [scheduleId, raceDay] of registeredEntries) {
        if (raceDay === d) {
          const schedule = getScheduleById(scheduleId);
          if (schedule) {
            registeredRacesOnDay.push({
              id: `race_${scheduleId}_day_${d}`,
              type: "competition",
              dayIndex: d,
              payload: schedule,
            });
          }
        }
      }

      return [...dayStoryEvents, ...registeredRacesOnDay];
    };

    const { state, events } = fastForward(stateWithFlags, mode, eventsForDay);

      // Apply monthly salary credit if applicable
      const stateAfterSalary = processMonthlySalary(state);

      // If day(s) advanced, simulate competition/social days!
      const daysAdvanced = stateAfterSalary.dayIndex - stateWithFlags.dayIndex;
    if (daysAdvanced > 0) {
      const socialStore = useSocialStore.getState();
      for (let d = stateWithFlags.dayIndex; d < stateAfterSalary.dayIndex; d++) {
        const dow = d % 7;
        const slot = stateWithFlags.routine[dow] || "rest";
        const playerKm = slot === "compete" ? 10 : slot === "train" ? 5 : 0;
        socialStore.simulateCompetitionDay(playerKm, undefined, d);
      }
      socialStore.ageActivities(stateAfterSalary.dayIndex);
    }

    set({ gameState: stateAfterSalary, pendingEvents: events });
    storageRepository.saveGameState(stateAfterSalary);

    // Mark any triggered story beats as viewed so subsequent fast-forwards don't get stuck on the same beat
    if (events.length > 0) {
      const storyStore = useStoryStore.getState();
      let currentProgress = storyStore.storyProgress;
      let progressUpdated = false;

      for (const ev of events) {
        if (ev.type === "story") {
          const beatId = (ev.payload as any)?.storyBeat?.id || ev.id;
          if (beatId && !currentProgress.viewedStoryBeats.includes(beatId)) {
            currentProgress = markStoryBeatViewed(currentProgress, beatId);
            progressUpdated = true;
          }
        }
      }

      if (progressUpdated) {
        storyStore.setStoryProgress(currentProgress);
      }
    }
  },

  acknowledgeEvent(eventId: string) {
    const { pendingEvents } = get();
    const eventToAck = pendingEvents.find((e) => e.id === eventId);
    if (eventToAck && eventToAck.type === "story") {
      const beatId = (eventToAck.payload as any)?.storyBeat?.id || eventToAck.id;
      if (beatId) {
        const storyStore = useStoryStore.getState();
        if (!storyStore.storyProgress.viewedStoryBeats.includes(beatId)) {
          storyStore.setStoryProgress(
            markStoryBeatViewed(storyStore.storyProgress, beatId)
          );
        }
      }
    }
    set({ pendingEvents: pendingEvents.filter((e) => e.id !== eventId) });
  },

  setRoutine(routine: GameState["routine"]) {
    const { gameState } = get();
    if (!gameState) return;
    const updated = { ...gameState, routine };
    set({ gameState: updated });
    storageRepository.saveGameState(updated);
  },

  newLife() {
    const fresh = createInitialState(Date.now());

    // Reset other stores
    useSocialStore.getState().resetSocial();
    useStoryStore.getState().resetStoryProgress();

    // Ensure first chapter start day is recorded on fresh state
    fresh.flags["chapter_1_start_day"] = 0;

    set({ gameState: fresh, pendingEvents: [], loaded: true });
    storageRepository.saveGameState(fresh);
  },

  isAlive() {
    const { gameState } = get();
    if (!gameState) return false;
    return !isDead(gameState);
  },

  setGameState(updater: GameState | ((prev: GameState) => GameState)) {
    const { gameState } = get();
    if (!gameState) return;
    const next = typeof updater === "function" ? updater(gameState) : updater;
    set({ gameState: next });
    storageRepository.saveGameState(next);
  },
}));
