import { describe, expect, it, vi } from "vitest";

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

import {
  applyAction,
  type CalendarEvent,
  canAfford,
  createInitialState,
  daysRemaining,
  deriveDate,
  endDay,
  fastForward,
  type GameState,
  getAction,
  isDead,
  resolveSlot,
  storyEventsToCalendarEvents,
} from "@/engine/timeline";
import type { StoryEvent } from "@/story";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    dayIndex: 0,
    startAge: 20,
    lifespan: 80,
    seed: 1,
    energy: 100,
    energyMax: 100,
    resources: { money: 0 },
    stats: { health: 100, strength: 0, intellect: 0, charisma: 0 },
    skills: {},
    relationships: {},
    routine: ["work", "work", "work", "work", "work", "train", "social"],
    flags: {},
    ...overrides,
  };
}

describe("deriveDate", () => {
  it("resolves day 0 to the start of life", () => {
    const d = deriveDate(makeState({ startAge: 20 }));
    expect(d).toEqual({
      age: 20,
      yearOffset: 0,
      month: 0,
      week: 0,
      dayOfWeek: 0,
    });
  });

  it("rolls weeks, months and years", () => {
    expect(deriveDate(makeState({ dayIndex: 7 })).week).toBe(1);
    expect(deriveDate(makeState({ dayIndex: 28 })).month).toBe(1);
    expect(deriveDate(makeState({ dayIndex: 336 })).age).toBe(21);
  });
});

describe("lifespan", () => {
  it("reports days remaining and death at the rolled lifespan", () => {
    const born = makeState({ startAge: 20, lifespan: 80 });
    expect(daysRemaining(born)).toBe(60 * 336);
    expect(isDead(born)).toBe(false);
    const end = makeState({ startAge: 20, lifespan: 80, dayIndex: 60 * 336 });
    expect(daysRemaining(end)).toBe(0);
    expect(isDead(end)).toBe(true);
  });
});

describe("createInitialState", () => {
  it("is deterministic for a given seed", () => {
    const a = createInitialState(42);
    const b = createInitialState(42);
    expect(a.startAge).toBe(b.startAge);
    expect(a.lifespan).toBe(b.lifespan);
  });

  it("keeps start age and lifespan within the productive window", () => {
    for (let seed = 0; seed < 50; seed++) {
      const s = createInitialState(seed);
      expect(s.startAge).toBeGreaterThanOrEqual(18);
      expect(s.startAge).toBeLessThanOrEqual(30);
      expect(s.lifespan).toBeGreaterThanOrEqual(70);
      expect(s.lifespan).toBeLessThanOrEqual(90);
    }
  });
});

describe("canAfford", () => {
  it("checks energy and age gating", () => {
    const work = getAction("work");
    expect(canAfford(makeState({ energy: 100, startAge: 30 }), work)).toBe(
      true,
    );
    expect(canAfford(makeState({ energy: 10 }), work)).toBe(false);
    expect(canAfford(makeState({ startAge: 66 }), work)).toBe(false);
    expect(canAfford(makeState({ startAge: 31 }), getAction("study"))).toBe(
      false,
    );
  });
});

describe("applyAction", () => {
  it("applies same-day effects and spends energy", () => {
    const after = applyAction(makeState({ energy: 100 }), getAction("work"));
    expect(after.resources.money).toBe(50);
    expect(after.dayIndex).toBe(0);
    expect(after.energy).toBe(60);
  });

  it("clamps health between 0 and 100", () => {
    const rested = applyAction(
      makeState({
        stats: { health: 95, strength: 0, intellect: 0, charisma: 0 },
      }),
      getAction("rest"),
    );
    expect(rested.stats.health).toBe(100);
    const damaged = applyAction(
      makeState({
        stats: { health: 1, strength: 0, intellect: 0, charisma: 0 },
      }),
      getAction("work"),
    );
    expect(damaged.stats.health).toBe(0);
  });

  it("jumps whole days for dayCost actions", () => {
    const after = applyAction(
      makeState({ dayIndex: 0, energy: 100 }),
      getAction("travel"),
    );
    expect(after.dayIndex).toBe(2);
    expect(after.energy).toBe(100);
    expect(after.flags.relocated).toBe(true);
  });

  it("returns the state unchanged when unaffordable", () => {
    const before = makeState({ energy: 10 });
    const after = applyAction(before, getAction("work"));
    expect(after).toEqual(before);
  });
});

describe("endDay", () => {
  it("advances one day and refills energy", () => {
    const after = endDay(makeState({ dayIndex: 5, energy: 20 }));
    expect(after.dayIndex).toBe(6);
    expect(after.energy).toBe(100);
  });
});

describe("routine", () => {
  it("resolveSlot ends the day for same-day actions", () => {
    const after = resolveSlot(makeState({ dayIndex: 0, energy: 100 }), "work");
    expect(after.dayIndex).toBe(1);
    expect(after.resources.money).toBe(50);
  });

  it("resolveSlot advances days for rest/travel", () => {
    expect(resolveSlot(makeState({ dayIndex: 0 }), "rest").dayIndex).toBe(1);
    expect(resolveSlot(makeState({ dayIndex: 0 }), "travel").dayIndex).toBe(2);
  });
});

describe("fastForward", () => {
  const noEvents = () => [] as CalendarEvent[];

  it("advances one day in 'day' mode", () => {
    const { state } = fastForward(makeState({ dayIndex: 0 }), "day", noEvents);
    expect(state.dayIndex).toBe(1);
  });

  it("advances a week / month in the respective modes", () => {
    expect(
      fastForward(makeState({ dayIndex: 0 }), "week", noEvents).state.dayIndex,
    ).toBe(7);
    expect(
      fastForward(makeState({ dayIndex: 0 }), "month", noEvents).state.dayIndex,
    ).toBe(28);
  });

  it("halts at a scheduled event and returns it", () => {
    const eventsForDay = (d: number): CalendarEvent[] =>
      d === 3 ? [{ id: "e3", type: "story", dayIndex: 3 }] : [];
    const { state, events } = fastForward(
      makeState({ dayIndex: 0 }),
      "month",
      eventsForDay,
    );
    expect(state.dayIndex).toBe(3);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("e3");
  });

  it("halts immediately on death", () => {
    const { state, events } = fastForward(
      makeState({ startAge: 80, lifespan: 80 }),
      "month",
      noEvents,
    );
    expect(state.dayIndex).toBe(0);
    expect(events).toHaveLength(0);
    expect(isDead(state)).toBe(true);
  });
});

describe("storyEventsToCalendarEvents", () => {
  it("maps story events onto calendar events", () => {
    const fake: StoryEvent = {
      type: "chapter_unlock",
      chapter: { number: 2 } as unknown as StoryEvent["chapter"],
      timestamp: "",
    };
    const mapped = storyEventsToCalendarEvents([fake], () => 99);
    expect(mapped[0].type).toBe("story");
    expect(mapped[0].dayIndex).toBe(99);
  });
});
