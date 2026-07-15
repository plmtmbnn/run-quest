/**
 * Integration adapter (Sprint 23-B, Task 5): maps the existing Story system's
 * `StoryEvent`s onto the engine's `CalendarEvent` shape so story beats, chapter
 * unlocks and championship availability can halt fast-forward on the in-game
 * calendar instead of the real clock.
 *
 * Pure and non-breaking: it only reshapes data; the caller decides which
 * in-game `dayIndex` each story event lands on via `resolveDayIndex`.
 */

import type { StoryEvent, StoryProgress } from "@/story";
import { getChapterByNumber } from "@/story";
import type { CalendarEvent, GameState } from "./time-types";

/** Map pending story events to calendar events scheduled on resolver-provided days. */
export function storyEventsToCalendarEvents(
  events: StoryEvent[],
  resolveDayIndex: (event: StoryEvent) => number,
): CalendarEvent[] {
  return events.map((event) => ({
    id: `story:${event.type}:${event.chapter?.number ?? event.storyBeat?.id ?? event.type}`,
    type: "story",
    dayIndex: resolveDayIndex(event),
    payload: event,
  }));
}

/**
 * Map the active chapter's story beats to specific in-game days based on the chapter's start day.
 * Helps narrative events and championship availability pause fast-forward on the calendar.
 */
export function getScheduledStoryEvents(
  state: GameState,
  storyProgress: StoryProgress,
): CalendarEvent[] {
  const currentChapterNum = storyProgress.currentChapter;
  const chapter = getChapterByNumber(currentChapterNum);
  if (!chapter) return [];

  // Determine chapter start day, default to state.dayIndex
  const startDayKey = `chapter_${currentChapterNum}_start_day`;
  const chapterStartDay = (state.flags[startDayKey] as number) ?? 0;

  const events: CalendarEvent[] = [];

  for (const beat of chapter.storyBeats) {
    if (storyProgress.viewedStoryBeats.includes(beat.id)) {
      continue;
    }

    let eventDay = chapterStartDay;
    if (beat.trigger === "mid_chapter") {
      eventDay = chapterStartDay + Math.ceil(chapter.estimatedRaces * 3);
    } else if (beat.trigger === "pre_final") {
      eventDay = chapterStartDay + Math.ceil(chapter.estimatedRaces * 5);
    }

    const storyEvent: StoryEvent = {
      type: "story_beat",
      storyBeat: beat,
      timestamp: eventDay,
    };

    events.push({
      id: `story_beat:${beat.id}`,
      type: "story",
      dayIndex: eventDay,
      payload: storyEvent,
    });
  }

  // Handle championship availability event if not already won
  const championshipId = chapter.finalRace.id;
  const championshipWon =
    storyProgress.championshipResults[championshipId]?.won ?? false;
  if (!championshipWon) {
    const championshipDay =
      chapterStartDay + Math.ceil(chapter.estimatedRaces * 6);

    const storyEvent: StoryEvent = {
      type: "championship_available",
      chapter,
      timestamp: championshipDay,
    };

    events.push({
      id: `championship_available:${championshipId}`,
      type: "competition",
      dayIndex: championshipDay,
      payload: storyEvent,
    });
  }

  return events;
}
