const ADJECTIVES = [
  "Swift",
  "Rapid",
  "Nimble",
  "Fleet",
  "Storm",
  "Iron",
  "Bold",
  "Neon",
  "Turbo",
  "Solar",
  "Sonic",
  "Wild",
  "Alpha",
  "Hyper",
  "Steady",
  "Agile",
  "Quick",
  "Peak",
  "Blaze",
  "Phantom",
];

const NOUNS = [
  "Runner",
  "Pacer",
  "Sprinter",
  "Strider",
  "Racer",
  "Gazelle",
  "Cheetah",
  "Jaguar",
  "Falcon",
  "Hawk",
  "Chaser",
  "Drifter",
  "Tracker",
  "Glider",
  "Dasher",
  "Ranger",
  "Viper",
  "Spark",
  "Comet",
  "Wind",
];

export function generateRunnerName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}
