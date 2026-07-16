/**
 * Atmospheric Moments Database (Sprint 24)
 * 
 * Curated collection of immersive moments across all atmospheric layers.
 */

import type {
  AtmosphericMoment,
  CompetitorMoment,
  InternalMonologue,
  NarrativeBeat,
} from "./atmosphere-types";

/**
 * Environmental moments - weather, time of day, sensory details.
 */
export const ENVIRONMENTAL_MOMENTS: AtmosphericMoment[] = [
  {
    id: "dawn_start",
    layer: "environment",
    intensity: "subtle",
    triggers: [{ condition: "distance", value: 0 }],
    description: "Dawn breaks as you toe the line. The sky bleeds pink and gold.",
    sensory: {
      visual: "Soft morning light painting the world in pastels",
      audio: "Birds beginning their morning songs",
      physical: "Cool air on your skin, dew on the grass",
      emotional: "Anticipation and possibility",
    },
  },
  {
    id: "midday_heat",
    layer: "environment",
    intensity: "moderate",
    triggers: [{ condition: "distance", value: 5 }],
    description: "The sun beats down relentlessly. Heat radiates from the pavement.",
    sensory: {
      visual: "Shimmering heat waves distorting the horizon",
      physical: "Sweat stinging your eyes, shirt clinging to your back",
      emotional: "The elements testing your resolve",
    },
    impact: {
      mental: -5,
      focus: -3,
    },
  },
  {
    id: "rain_struggle",
    layer: "environment",
    intensity: "dramatic",
    triggers: [{ condition: "random", probability: 0.2 }],
    description: "Rain sheets down. Your shoes squelch with every step. The course is a river.",
    sensory: {
      visual: "Gray curtain of rain obscuring everything",
      audio: "Drumming rain drowning out the crowd",
      physical: "Cold water soaking through, every step uncertain",
      emotional: "Nature indifferent to your suffering",
    },
    impact: {
      mental: -10,
      motivation: 5, // Adversity can motivate
    },
  },
  {
    id: "perfect_conditions",
    layer: "environment",
    intensity: "subtle",
    triggers: [{ condition: "distance", value: 10 }],
    description: "Perfect running weather. Cool, clear, calm. The world conspires in your favor today.",
    sensory: {
      visual: "Crystal clear sky, visibility for miles",
      physical: "Body temperature ideal, no wind resistance",
      emotional: "Everything clicking into place",
    },
    impact: {
      mental: 5,
      focus: 5,
    },
  },
];

/**
 * Crowd moments - spectator energy and interaction.
 */
export const CROWD_MOMENTS: AtmosphericMoment[] = [
  {
    id: "crowd_roar",
    layer: "crowd",
    intensity: "dramatic",
    triggers: [{ condition: "position", value: "1-3" }, { condition: "distance", value: 20 }],
    description: "The crowd erupts as you move into podium position. Their energy lifts you.",
    sensory: {
      audio: "Deafening roar, your name being chanted",
      emotional: "Adrenaline surge, feeling invincible",
    },
    impact: {
      mental: 10,
      motivation: 15,
    },
  },
  {
    id: "quiet_struggle",
    layer: "crowd",
    intensity: "subtle",
    triggers: [{ condition: "energy", value: "<30" }],
    description: "The crowd's cheers fade into background noise. You're alone with your pain.",
    sensory: {
      audio: "Muffled, distant sounds",
      physical: "Only your labored breathing and footfalls",
      emotional: "Isolation in the midst of thousands",
    },
    impact: {
      focus: 5, // Blocking out distraction
    },
  },
  {
    id: "cowbell_chaos",
    layer: "crowd",
    intensity: "moderate",
    triggers: [{ condition: "distance", value: 15 }, { condition: "random", probability: 0.3 }],
    description: "Someone's ringing a cowbell RIGHT next to the course. It's annoying. It's motivating. It's working.",
    sensory: {
      audio: "CLANG CLANG CLANG - relentless cowbell",
      emotional: "Equal parts irritation and energy",
    },
    impact: {
      motivation: 5,
      focus: -2,
    },
  },
  {
    id: "kids_cheering",
    layer: "crowd",
    intensity: "subtle",
    triggers: [{ condition: "distance", value: 8 }, { condition: "random", probability: 0.4 }],
    description: "A group of kids holds signs and cheers wildly for every runner. Their enthusiasm is infectious.",
    sensory: {
      visual: "Hand-drawn signs with encouraging messages",
      audio: "High-pitched cheers, pure joy",
      emotional: "Warmth cutting through the fatigue",
    },
    impact: {
      mental: 8,
      motivation: 10,
    },
  },
];

/**
 * Internal monologue - runner's thoughts and self-talk.
 */
export const INTERNAL_MOMENTS: AtmosphericMoment[] = [
  {
    id: "doubt_creeping",
    layer: "internal",
    intensity: "moderate",
    triggers: [{ condition: "distance", value: 18 }, { condition: "energy", value: "<40" }],
    description: "The doubt whispers: 'You're not ready for this. Slow down. It's okay to quit.'",
    sensory: {
      emotional: "Fear and doubt competing with determination",
    },
    impact: {
      mental: -8,
      motivation: -5,
    },
  },
  {
    id: "flow_state",
    layer: "internal",
    intensity: "epic",
    triggers: [{ condition: "pace", value: "on_target" }, { condition: "distance", value: 12 }],
    description: "Everything clicks. Breathing, pace, form - perfection. You're not running. You ARE running.",
    sensory: {
      physical: "Weightless, effortless, machine-like precision",
      emotional: "Transcendent focus, time slowing down",
    },
    impact: {
      mental: 15,
      focus: 20,
      motivation: 10,
    },
  },
  {
    id: "mental_bargaining",
    layer: "internal",
    intensity: "moderate",
    triggers: [{ condition: "distance", value: 20 }, { condition: "energy", value: "<35" }],
    description: "You negotiate with yourself: 'Just to the next mile marker. Just 100 more steps. Just keep moving.'",
    sensory: {
      emotional: "Desperation and determination in equal measure",
    },
    impact: {
      motivation: 8, // Bargaining helps you continue
      focus: 5,
    },
  },
  {
    id: "breakthrough_moment",
    layer: "internal",
    intensity: "epic",
    triggers: [{ condition: "breaking_point" }],
    description: "The wall approaches. You can feel it. But this time... THIS TIME you push through. You find something deeper.",
    sensory: {
      emotional: "Breaking through limits, discovering new strength",
      physical: "Pain still there but no longer controlling you",
    },
    impact: {
      mental: 20,
      motivation: 25,
      focus: 15,
    },
  },
];

/**
 * Competitor moments - racing dynamics and battles.
 */
export const COMPETITOR_MOMENTS: AtmosphericMoment[] = [
  {
    id: "rival_surge",
    layer: "competitor",
    intensity: "dramatic",
    triggers: [{ condition: "distance", value: 25 }, { condition: "position", value: "2-5" }],
    description: "Your rival surges past. No words. Just a glance that says everything. Are you going to respond?",
    sensory: {
      visual: "Their form accelerating away",
      emotional: "Pride, anger, determination igniting",
    },
    impact: {
      motivation: 15,
      mental: -5, // Pressure of being passed
    },
  },
  {
    id: "pack_mentality",
    layer: "competitor",
    intensity: "moderate",
    triggers: [{ condition: "distance", value: 8 }, { condition: "position", value: "5-15" }],
    description: "You're in the pack. Shoulder to shoulder. Everyone working, everyone hurting. Collective suffering.",
    sensory: {
      audio: "Synchronized breathing, footfalls in rhythm",
      physical: "Bodies close, shared effort",
      emotional: "Camaraderie and competition intertwined",
    },
    impact: {
      focus: 5,
      motivation: 8,
    },
  },
  {
    id: "leaving_them_behind",
    layer: "competitor",
    intensity: "epic",
    triggers: [{ condition: "distance", value: 30 }, { condition: "position", value: "1-2" }],
    description: "You glance back. The gap is growing. They're breaking. You're not. Victory tastes close.",
    sensory: {
      visual: "Competitors fading into the distance",
      emotional: "Confidence surging, dominance established",
    },
    impact: {
      mental: 15,
      motivation: 20,
      focus: 10,
    },
  },
  {
    id: "getting_dropped",
    layer: "competitor",
    intensity: "dramatic",
    triggers: [{ condition: "distance", value: 15 }, { condition: "energy", value: "<30" }],
    description: "The pack pulls away. You try to hold on but your legs won't respond. The gap widens with each stride.",
    sensory: {
      visual: "Backs of runners disappearing ahead",
      physical: "Legs heavy, lungs burning, body refusing orders",
      emotional: "Helplessness and determination fighting",
    },
    impact: {
      mental: -15,
      motivation: -10,
    },
  },
];

/**
 * Narrative beats - story moments that create meaning.
 */
export const NARRATIVE_BEATS: NarrativeBeat[] = [
  {
    id: "redemption_mile",
    title: "Redemption Mile",
    trigger: { condition: "distance", value: 20 },
    setup: "Last time you raced here, the wheels came off at mile 20. The memory haunts you.",
    climax: "You reach mile 20 again. The ghosts are here. But this time... you're different. Stronger.",
    resolution: "You power through. Mile 20 isn't your enemy anymore. It's your proving ground.",
    significance: "personal",
  },
  {
    id: "moment_of_truth",
    title: "The Moment of Truth",
    trigger: { condition: "distance", value: 35 },
    setup: "This is it. The final miles. Everything you've trained for comes down to this.",
    climax: "Your body screams to quit. Your mind shows you the easy way out. But your heart... your heart wants this.",
    resolution: "You choose the pain. You choose to finish. You choose to become who you want to be.",
    significance: "transformative",
  },
  {
    id: "history_in_making",
    title: "History in the Making",
    trigger: { condition: "position", value: "1" },
    setup: "Championship record pace. The clock doesn't lie. You're on track for something special.",
    climax: "The course record flashes on the screen as you pass. You're ahead of it. You could be the one.",
    resolution: "Win or lose the record, you'll know you went for it. That's what matters.",
    significance: "historic",
  },
];

/**
 * Competitor interactions database.
 */
export const COMPETITOR_INTERACTIONS: CompetitorMoment[] = [
  {
    type: "surging",
    description: "A runner beside you surges hard. Testing the field. Testing you.",
    tacticalImplication: "Match the surge or let them go and hope they blow up?",
  },
  {
    type: "fading",
    description: "You notice a competitor's form deteriorating. They're hurting badly.",
    tacticalImplication: "Time to attack their weakness",
  },
  {
    type: "battling",
    description: "You and another runner trade positions every quarter mile. Neither will give an inch.",
    tacticalImplication: "Psychological warfare - who breaks first?",
  },
  {
    type: "drafting",
    description: "You tuck in behind the leaders, saving energy in their slipstream.",
    tacticalImplication: "Conserve now, attack later",
  },
  {
    type: "breaking_away",
    description: "You make your move. Acceleration. Breaking contact with the pack.",
    tacticalImplication: "All or nothing - can you hold this pace to the finish?",
  },
];

/**
 * Internal monologue templates by context.
 */
export const INTERNAL_MONOLOGUES: Record<string, InternalMonologue> = {
  struggling: {
    context: "struggling",
    thoughts: [
      "Why did I sign up for this?",
      "This is so much harder than training",
      "Just survive to the finish line",
      "One foot in front of the other",
    ],
    doubts: [
      "Maybe I'm not ready for this distance",
      "Everyone else looks stronger",
      "I should have trained more",
    ],
    motivations: [
      "But I've come this far",
      "Quitting isn't an option",
      "Pain is temporary, pride is forever",
    ],
  },
  flowing: {
    context: "flowing",
    thoughts: [
      "This is why I run",
      "I could do this forever",
      "Everything is clicking",
      "Effortless speed",
    ],
    motivations: [
      "This is my day",
      "I'm exactly where I need to be",
      "Trust the training",
    ],
  },
  deciding: {
    context: "deciding",
    thoughts: [
      "Do I have enough left for a kick?",
      "Should I surge now or wait?",
      "This is the moment that matters",
    ],
    doubts: [
      "What if I go too early?",
      "What if I wait too long?",
    ],
    motivations: [
      "Trust your instincts",
      "You've prepared for this decision",
      "Be brave",
    ],
  },
  suffering: {
    context: "suffering",
    thoughts: [
      "Everything hurts",
      "How is there still this far to go?",
      "My legs are concrete",
    ],
    doubts: [
      "I can't keep this up",
      "Maybe I should slow down",
    ],
    motivations: [
      "But I won't quit",
      "Champions are made in moments like this",
      "You didn't come this far to only come this far",
    ],
  },
  triumphant: {
    context: "triumphant",
    thoughts: [
      "I did it",
      "All the training was worth it",
      "I'm stronger than I knew",
    ],
    motivations: [
      "This is just the beginning",
      "I proved it to myself",
      "I am a runner",
    ],
  },
};
