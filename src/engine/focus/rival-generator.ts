import type { Difficulty } from "@/store/focus-progression-store";

/**
 * Dynamic Rival Generation System
 * Creates memorable AI opponents with personalities and varying difficulty
 */

export interface Rival {
  id: string;
  name: string;
  nationality: string;
  skillLevel: number; // 0.0 - 1.0
  personality: RivalPersonality;
  specialty: "sprinter" | "endurance" | "tactical" | "consistent";
  backstory: string;
  appearance: {
    avatar: string;
    primaryColor: string;
  };
}

export type RivalPersonality = 
  | "aggressive" // Fast starts, may burn out
  | "conservative" // Steady pace, strong finisher
  | "unpredictable" // Wild pacing swings
  | "tactical" // Adapts to player
  | "consistent"; // Robot-like consistency

export interface ArchRival extends Rival {
  relationshipLevel: number; // -100 to 100 (rivalry to friendship)
  racesAgainst: number;
  winsAgainstPlayer: number;
  lossesAgainstPlayer: number;
  trash_talk?: string[];
}

const RIVAL_NAMES = [
  { first: "Marcus", last: "Thompson", nationality: "USA" },
  { first: "Elena", last: "Rodriguez", nationality: "Spain" },
  { first: "Kenji", last: "Tanaka", nationality: "Japan" },
  { first: "Sofia", last: "Silva", nationality: "Brazil" },
  { first: "Lars", last: "Hansen", nationality: "Norway" },
  { first: "Amara", last: "Okonkwo", nationality: "Nigeria" },
  { first: "Chen", last: "Wei", nationality: "China" },
  { first: "Isabella", last: "Romano", nationality: "Italy" },
  { first: "Arjun", last: "Patel", nationality: "India" },
  { first: "Zoe", last: "Williams", nationality: "UK" },
  { first: "Diego", last: "Morales", nationality: "Mexico" },
  { first: "Fatima", last: "Al-Rashid", nationality: "UAE" },
  { first: "Noah", last: "Anderson", nationality: "Sweden" },
  { first: "Priya", last: "Sharma", nationality: "India" },
  { first: "Ethan", last: "Kim", nationality: "South Korea" },
];

const PERSONALITIES: Record<RivalPersonality, { description: string; pacing: string }> = {
  aggressive: {
    description: "Known for blistering starts that intimidate competitors",
    pacing: "front-runner",
  },
  conservative: {
    description: "Patient racer who waits for the right moment to strike",
    pacing: "negative-splitter",
  },
  unpredictable: {
    description: "You never know what strategy they'll use",
    pacing: "erratic",
  },
  tactical: {
    description: "Studies opponents and adapts mid-race",
    pacing: "responsive",
  },
  consistent: {
    description: "Like a metronome - perfectly even splits every time",
    pacing: "metronomic",
  },
};

const AVATAR_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

/**
 * Generate a random rival with specified difficulty
 */
export function generateRival(difficulty: Difficulty, specialty?: Rival["specialty"]): Rival {
  const nameData = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
  const personalities: RivalPersonality[] = ["aggressive", "conservative", "unpredictable", "tactical", "consistent"];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  
  // Skill level based on difficulty
  const skillLevelBase = {
    recreational: 0.3 + Math.random() * 0.2, // 0.3-0.5
    competitive: 0.5 + Math.random() * 0.2, // 0.5-0.7
    elite: 0.7 + Math.random() * 0.2, // 0.7-0.9
    professional: 0.85 + Math.random() * 0.15, // 0.85-1.0
  }[difficulty];
  
  const specialties: Rival["specialty"][] = ["sprinter", "endurance", "tactical", "consistent"];
  const chosenSpecialty = specialty || specialties[Math.floor(Math.random() * specialties.length)];
  
  return {
    id: `rival_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${nameData.first} ${nameData.last}`,
    nationality: nameData.nationality,
    skillLevel: skillLevelBase,
    personality,
    specialty: chosenSpecialty,
    backstory: generateBackstory(chosenSpecialty, personality),
    appearance: {
      avatar: `${nameData.first.charAt(0)}${nameData.last.charAt(0)}`,
      primaryColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    },
  };
}

/**
 * Generate a field of rivals with varying abilities
 */
export function generateRaceField(
  difficulty: Difficulty,
  fieldSize: number = 50
): {
  rivals: Rival[];
  archRival: Rival | null;
  underdog: Rival | null;
} {
  const rivals: Rival[] = [];
  
  // Determine strength distribution
  const strengthConfig = {
    recreational: { strong: 3, medium: 15, weak: 32 },
    competitive: { strong: 8, medium: 25, weak: 17 },
    elite: { strong: 15, medium: 25, weak: 10 },
    professional: { strong: 25, medium: 20, weak: 5 },
  }[difficulty];
  
  // Generate strong rivals (potential winners)
  for (let i = 0; i < strengthConfig.strong; i++) {
    rivals.push(generateRival(difficulty, i % 2 === 0 ? "sprinter" : "endurance"));
  }
  
  // Generate medium rivals
  const lowerDifficulty = {
    recreational: "recreational",
    competitive: "recreational",
    elite: "competitive",
    professional: "elite",
  }[difficulty] as Difficulty;
  
  for (let i = 0; i < strengthConfig.medium; i++) {
    rivals.push(generateRival(lowerDifficulty));
  }
  
  // Generate weak rivals
  const lowestDifficulty = {
    recreational: "recreational",
    competitive: "recreational",
    elite: "recreational",
    professional: "competitive",
  }[difficulty] as Difficulty;
  
  for (let i = 0; i < strengthConfig.weak; i++) {
    rivals.push(generateRival(lowestDifficulty));
  }
  
  // Shuffle to mix abilities
  rivals.sort(() => Math.random() - 0.5);
  
  // Select arch rival (slightly better than player's level)
  const topRivals = rivals
    .filter((r) => r.skillLevel > 0.7)
    .sort((a, b) => b.skillLevel - a.skillLevel);
  const archRival = topRivals[0] || null;
  
  // Select underdog (weaker but with unpredictable personality)
  const underdogs = rivals.filter(
    (r) => r.skillLevel < 0.5 && r.personality === "unpredictable"
  );
  const underdog = underdogs[0] || null;
  
  return { rivals, archRival, underdog };
}

function generateBackstory(specialty: Rival["specialty"], personality: RivalPersonality): string {
  const backstories = {
    sprinter: [
      "Former track athlete transitioning to road racing",
      "Known for explosive speed in the final kilometer",
      "Holds multiple course records for fast finishes",
    ],
    endurance: [
      "Ultra-marathon veteran with incredible stamina",
      "Thrives in the final miles when others fade",
      "Rarely breaks but never gives up",
    ],
    tactical: [
      "Chess player who treats races like strategy games",
      "Studies every competitor before race day",
      "Always seems to be in the right position",
    ],
    consistent: [
      "Trained by data scientists and running algorithms",
      "Every split within 2 seconds of target pace",
      "Predictable but impossible to break",
    ],
  };
  
  const stories = backstories[specialty];
  return stories[Math.floor(Math.random() * stories.length)];
}

/**
 * Get trash talk for arch rival based on context
 */
export function getTrashTalk(context: "pre-race" | "mid-race-leading" | "mid-race-behind" | "post-race-won" | "post-race-lost"): string {
  const trashTalk = {
    "pre-race": [
      "Hope you're ready to eat dust today.",
      "I've been training for this. Have you?",
      "Let's see if you can keep up this time.",
      "This course suits me perfectly.",
    ],
    "mid-race-leading": [
      "Told you I'd be faster today!",
      "Can't catch me now!",
      "Where's that speed you promised?",
    ],
    "mid-race-behind": [
      "You won't keep this pace up.",
      "I'm just getting started.",
      "Enjoy it while it lasts.",
    ],
    "post-race-won": [
      "Better luck next time!",
      "That's how it's done.",
      "Good race. I was just better today.",
    ],
    "post-race-lost": [
      "You got me this time. Well done.",
      "I'll be back stronger.",
      "Fair play. That was impressive.",
    ],
  };
  
  const options = trashTalk[context];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Adjust rival performance based on personality
 */
export function adjustRivalPacing(
  rival: Rival,
  currentKm: number,
  totalDistance: number,
  playerPosition: number,
  rivalPosition: number
): number {
  let paceModifier = 1.0;
  
  switch (rival.personality) {
    case "aggressive":
      // Fast start, gradual slowdown
      paceModifier = currentKm < totalDistance * 0.3 ? 0.95 : 1.05;
      break;
    
    case "conservative":
      // Slow start, strong finish
      paceModifier = currentKm > totalDistance * 0.7 ? 0.95 : 1.02;
      break;
    
    case "unpredictable":
      // Random surges
      paceModifier = Math.random() > 0.7 ? 0.9 : 1.05;
      break;
    
    case "tactical":
      // Matches player's position
      if (rivalPosition > playerPosition) {
        paceModifier = 0.98; // Speed up to catch player
      } else if (rivalPosition < playerPosition) {
        paceModifier = 1.01; // Maintain lead
      }
      break;
    
    case "consistent":
      // Perfect pacing
      paceModifier = 1.0;
      break;
  }
  
  return paceModifier;
}
