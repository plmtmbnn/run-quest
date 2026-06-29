Domain Overview
RunQuest

Player
│
├── Profile
├── Settings
├── Statistics
└── Progress

↓

Daily Challenge

↓

Preparation

↓

Simulation

↓

Result

↓

History

↓

Story

↓

Sharing

Setiap domain independen.

1. Shared Domain

Semua domain menggunakan tipe ini.

type UUID = string;

type ISODate = string;

type Timestamp = string;

type Language = 'en' | 'id';

type Theme = 'light' | 'dark' | 'system';

type LocalizedText = {
  en: string;
  id: string;
};
2. Player Domain
type Player = {
  id: UUID;

  profile: PlayerProfile;

  settings: PlayerSettings;

  statistics: PlayerStatistics;

  progress: PlayerProgress;
};
Profile
type PlayerProfile = {
  nickname?: string;

  createdAt: Timestamp;

  language: Language;
};
Settings
type PlayerSettings = {
  theme: Theme;

  reducedMotion: boolean;

  soundEnabled: boolean;

  vibrationEnabled: boolean;
};
Statistics
type PlayerStatistics = {
  totalRuns: number;

  totalWins: number;

  totalDistance: number;

  currentStreak: number;

  longestStreak: number;

  perfectRuns: number;
};
Progress

Future-proof.

type PlayerProgress = {
  unlockedBadges: string[];

  completedChallenges: string[];
};
3. Daily Challenge Domain
Daily Challenge

↓

Environment

↓

Race

↓

Objective

↓

Story Seed
type DailyChallenge = {
  id: string;

  date: ISODate;

  environment: Environment;

  race: Race;

  objective: Objective;

  storySeed: StorySeed;
};
Environment
type Environment = {
  weather: Weather;

  temperature: number;

  humidity: number;

  wind: Wind;

  timeOfDay: TimeOfDay;
};
Weather
type Weather =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'hot'
  | 'cold'
  | 'fog';
Wind
type Wind = {
  direction:

    | 'north'

    | 'south'

    | 'east'

    | 'west';

  speed: number;
};
Time
type TimeOfDay =
  | 'morning'
  | 'afternoon'
  | 'evening';
Race
type Race = {
  title: LocalizedText;

  description: LocalizedText;

  distance: number;

  surface: Surface;

  elevation: Elevation;

  checkpoints: Checkpoint[];
};
Surface
type Surface =
  | 'road'
  | 'track'
  | 'trail';
Elevation
type Elevation =
  | 'flat'
  | 'rolling'
  | 'hilly';
Checkpoint
type Checkpoint = {
  km: number;

  eventPool: string[];
};
Objective
type Objective = {
  targetTime: number;

  bonusCondition?: string;
};
Story Seed
type StorySeed = {
  mood:

    | 'optimistic'

    | 'tense'

    | 'survival'

    | 'competitive';
};
4. Preparation Domain

Ini menurut saya domain terpenting.

Preparation

↓

Shoes

↓

Nutrition

↓

Gear

↓

Warmup

↓

Pacing

↓

Mindset
type Preparation = {
  shoes: Shoe;

  nutrition: Nutrition;

  gear: Gear[];

  warmup: Warmup;

  pacing: PacingPlan;

  mindset: Mindset;
};
Shoes
type Shoe =
  | 'daily_trainer'
  | 'carbon_racer'
  | 'lightweight'
  | 'trail';
Nutrition
type Nutrition =
  | 'water'
  | 'electrolyte'
  | 'energy_gel'
  | 'none';
Gear
type Gear =
  | 'cap'
  | 'sunglasses'
  | 'arm_sleeves'
  | 'hydration_vest';
Warmup
type Warmup =
  | 'none'
  | 'dynamic'
  | 'full';
Pacing
type PacingPlan =
  | 'negative_split'
  | 'steady'
  | 'aggressive'
  | 'conservative';
Mindset
type Mindset =
  | 'calm'
  | 'confident'
  | 'fearless';
5. Simulation Domain

Tidak ada React.

Tidak ada UI.

type SimulationInput = {
  player: Player;

  challenge: DailyChallenge;

  preparation: Preparation;

  seed: number;
};

↓

SimulationEngine

↓

type SimulationResult = {
  finishTime: number;

  score: number;

  grade: Grade;

  events: RaceEvent[];

  outcome: Outcome;

  story: Story;
};
6. Race Event Domain
type RaceEvent = {
  km: number;

  title: LocalizedText;

  description: LocalizedText;

  effect: Effect;
};
Effect
type Effect = {
  stamina: number;

  hydration: number;

  morale: number;

  pace: number;
};
7. Story Domain
type Story = {
  headline: LocalizedText;

  summary: LocalizedText;

  highlights: LocalizedText[];

  lessons: LocalizedText[];
};
8. Result Domain
type Outcome =
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'finish'
  | 'dnf';
type Grade =
  | 'S'
  | 'A'
  | 'B'
  | 'C'
  | 'D';
9. History Domain
type RaceHistory = {
  challengeId: string;

  playedAt: Timestamp;

  result: SimulationResult;

  preparation: Preparation;
};
10. Share Domain
type ShareCard = {
  title: string;

  headline: string;

  score: number;

  outcome: Outcome;

  imageTheme: string;
};