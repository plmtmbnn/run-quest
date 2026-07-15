import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  const mockStorage: Record<string, string> = {};
  global.window = {} as any;
  global.localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const key in mockStorage) delete mockStorage[key];
    },
    length: 0,
    key: (_index: number) => "",
  } as any;
});

import { useTimelineStore } from "@/store/timeline-store";
import { useSocialStore } from "@/social/social-store";
import { useStoryStore } from "@/story/story-store";
import { getScheduledStoryEvents } from "@/engine/timeline/story-adapter";

describe("Timeline Engine Integration", () => {
  beforeEach(() => {
    // Reset Zustand stores before each test
    useTimelineStore.getState().newLife();
  });

  it("schedules Chapter 1 story beats at specific dayIndex values", () => {
    const { gameState } = useTimelineStore.getState();
    expect(gameState).not.toBeNull();
    if (!gameState) return;

    const storyProgress = useStoryStore.getState().storyProgress;
    expect(storyProgress.currentChapter).toBe(1);

    const events = getScheduledStoryEvents(gameState, storyProgress);
    // Chapter 1 has 3 beats: ch1_start (0), ch1_mid (15), ch1_pre_final (25), and championship (30)
    // estimatedRaces = 5.
    // chapterStartDay = 0.
    // ch1_start: Day 0
    // ch1_mid: Day 15 (estimatedRaces 5 * 3)
    // ch1_pre_final: Day 25 (estimatedRaces 5 * 5)
    // championship: Day 30 (estimatedRaces 5 * 6)

    const startBeat = events.find((e) => e.id === "story_beat:ch1_start");
    const midBeat = events.find((e) => e.id === "story_beat:ch1_mid");
    const preFinalBeat = events.find(
      (e) => e.id === "story_beat:ch1_pre_final",
    );
    const championship = events.find(
      (e) => e.id === "championship_available:ch1_final_local_5k",
    );

    expect(startBeat?.dayIndex).toBe(0);
    expect(midBeat?.dayIndex).toBe(15);
    expect(preFinalBeat?.dayIndex).toBe(25);
    expect(championship?.dayIndex).toBe(30);
  });

  it("halts fast-forward at a scheduled story event", () => {
    const store = useTimelineStore.getState();
    expect(store.gameState?.dayIndex).toBe(0);

    // Fast forwarding to next week should run day 0, but day 0 has "ch1_start" event scheduled!
    // So fastForward should halt immediately on Day 0 and return the event.
    store.ff("week");

    const updated = useTimelineStore.getState();
    expect(updated.gameState?.dayIndex).toBe(0); // halted at day 0
    expect(updated.pendingEvents).toHaveLength(1);
    expect(updated.pendingEvents[0].id).toBe("story_beat:ch1_start");
  });

  it("advances competitor/rival progression and updates relative timestamps on in-game day changes", () => {
    // Select a region in social store to enable daily updates
    useSocialStore.getState().setRegion("North America");

    // Perform compete action (takes 0 days but spend energy)
    useTimelineStore.getState().doAction("compete");

    // Now let's acknowledge the first event so we can skip day 0
    useTimelineStore.getState().acknowledgeEvent("story_beat:ch1_start");

    // Perform a REST action which costs 1 day
    useTimelineStore.getState().doAction("rest");

    const updatedTimeline = useTimelineStore.getState();
    expect(updatedTimeline.gameState?.dayIndex).toBe(1);

    const socialState = useSocialStore.getState();
    // Activities generated on in-game day index 0 should now be relative
    const activity = socialState.rivalActivities.find((a) =>
      a.id.startsWith("act_day_0_"),
    );
    expect(activity).toBeDefined();
    if (activity) {
      expect(activity.timestamp).toBe("1 day ago");
    }
  });

  it("resets weekly club distance contributions at week rollover boundary (dayIndex % 7 === 0)", () => {
    useSocialStore.getState().setRegion("North America");
    useSocialStore.getState().joinClub("grit_syndicate");

    // Perform 7 REST actions to progress from day 0 to day 7
    useTimelineStore.getState().acknowledgeEvent("story_beat:ch1_start");
    for (let i = 0; i < 7; i++) {
      useTimelineStore.getState().doAction("rest");
    }

    const updatedTimeline = useTimelineStore.getState();
    expect(updatedTimeline.gameState?.dayIndex).toBe(7);

    // Weekly contributions should have reset at day 7 rollover
    const socialState = useSocialStore.getState();
    expect(socialState.weeklyContributedKm).toBe(0);
    expect(socialState.clubMembers.every((m) => m.contributionKm === 0)).toBe(
      true,
    );
  });

  it("resets all stores completely during newLife (roguelite loop restart)", () => {
    useSocialStore.getState().setRegion("North America");
    useSocialStore.getState().joinClub("apex_trails");

    // Advance calendar by 2 days
    useTimelineStore.getState().acknowledgeEvent("story_beat:ch1_start");
    useTimelineStore.getState().doAction("rest");
    useTimelineStore.getState().doAction("rest");

    expect(useTimelineStore.getState().gameState?.dayIndex).toBe(2);

    // Trigger newLife
    useTimelineStore.getState().newLife();

    const resetTimeline = useTimelineStore.getState();
    const resetSocial = useSocialStore.getState();
    const resetStory = useStoryStore.getState();

    expect(resetTimeline.gameState?.dayIndex).toBe(0);
    expect(resetSocial.clubId).toBeNull();
    expect(resetSocial.region).toBeNull();
    expect(resetStory.storyProgress.currentChapter).toBe(1);
    expect(resetStory.storyProgress.completedChapters).toHaveLength(0);
  });
});
