/**
 * Location Database (Sprint 24)
 *
 * Curated collection of memorable race locations with distinct personalities.
 */

import type {
  Location,
  LocationPersonality,
  WeatherImpact,
} from "./location-types";

/**
 * Weather impact definitions.
 */
export const WEATHER_IMPACTS: Record<string, WeatherImpact> = {
  perfect: {
    condition: "perfect",
    label: "Perfect Conditions",
    description: "Clear skies, mild temperature, no wind",
    speedModifier: 1.0,
    staminaModifier: 1.0,
    mentalImpact: 5,
    icon: "☀️",
  },
  hot: {
    condition: "hot",
    label: "Hot & Humid",
    description: "High temperature increases fatigue",
    speedModifier: 0.92,
    staminaModifier: 0.85,
    mentalImpact: -5,
    icon: "🔥",
  },
  cold: {
    condition: "cold",
    label: "Cold Weather",
    description: "Low temperature affects warm-up",
    speedModifier: 0.95,
    staminaModifier: 0.95,
    mentalImpact: -3,
    icon: "❄️",
  },
  rainy: {
    condition: "rainy",
    label: "Rainy",
    description: "Wet conditions slow pace and reduce traction",
    speedModifier: 0.9,
    staminaModifier: 0.92,
    mentalImpact: -8,
    icon: "🌧️",
  },
  windy: {
    condition: "windy",
    label: "Windy",
    description: "Strong headwinds increase effort",
    speedModifier: 0.88,
    staminaModifier: 0.88,
    mentalImpact: -6,
    icon: "💨",
  },
  stormy: {
    condition: "stormy",
    label: "Storm",
    description: "Severe weather threatens race completion",
    speedModifier: 0.8,
    staminaModifier: 0.8,
    mentalImpact: -15,
    icon: "⛈️",
  },
  snowy: {
    condition: "snowy",
    label: "Snow",
    description: "Snow coverage makes footing treacherous",
    speedModifier: 0.75,
    staminaModifier: 0.85,
    mentalImpact: -10,
    icon: "🌨️",
  },
  foggy: {
    condition: "foggy",
    label: "Foggy",
    description: "Limited visibility affects pacing",
    speedModifier: 0.93,
    staminaModifier: 0.97,
    mentalImpact: -4,
    icon: "🌫️",
  },
};

/**
 * Core location database.
 */
export const LOCATIONS: Record<string, Location> = {
  // Local Tier
  local_5k_park: {
    id: "local_5k_park",
    name: "Riverside Park Run",
    city: "Springfield",
    region: "Metro Valley",
    country: "USA",
    tier: "local",
    terrain: "flat_road",
    elevation: 150,
    typicalWeather: ["perfect", "rainy", "hot"],
    atmosphere: "intimate",
    description:
      "A friendly local park loop where every runner starts their journey. Familiar faces, encouraging cheers, and the smell of morning coffee from the nearby cafe.",
    lore: [
      "Every champion started here with their first nervous steps",
      "The old oak at the 2K mark has witnessed thousands of personal victories",
      "Saturday morning tradition for the local running club",
    ],
    difficultyModifier: 0.9,
    crowdSupport: 0.3,
    colors: { primary: "#4ade80", secondary: "#22c55e" },
    landmark: "The Old Oak Tree",
  },

  regional_10k_hills: {
    id: "regional_10k_hills",
    name: "Rolling Thunder 10K",
    city: "Hillcrest",
    region: "Metro Valley",
    country: "USA",
    tier: "regional",
    terrain: "hilly_road",
    elevation: 300,
    elevationGain: 200,
    typicalWeather: ["perfect", "windy", "cold"],
    atmosphere: "challenging",
    description:
      "A demanding course that separates pretenders from contenders. The hills don't lie, and neither does your training.",
    lore: [
      "Named for the thunderous sound of hundreds of feet hitting 'Heartbreak Hill'",
      "The 8K climb has broken many egos and forged many champions",
      "Local legend says if you can run this, you can run anything",
    ],
    difficultyModifier: 1.15,
    crowdSupport: 0.5,
    colors: { primary: "#f59e0b", secondary: "#d97706" },
    landmark: "Heartbreak Hill",
    unlockRequirements: { minLevel: 5 },
  },

  state_half_coastal: {
    id: "state_half_coastal",
    name: "Pacific Coast Half Marathon",
    city: "Seaside",
    region: "West Coast",
    country: "USA",
    tier: "national",
    terrain: "coastal_path",
    elevation: 50,
    elevationGain: 150,
    typicalWeather: ["perfect", "foggy", "windy"],
    atmosphere: "inspiring",
    description:
      "Run where the land meets the sea. Breathtaking ocean views compete with your focus as waves crash beside you. This is where dreams touch the horizon.",
    lore: [
      "The most photographed race in the state",
      "Marine fog at dawn creates an otherworldly atmosphere",
      "Dolphins have been spotted swimming alongside runners at the 15K mark",
    ],
    famousRunners: ["Sarah Chen (Course Record 1:08:23)", "Marcus Williams"],
    courseRecords: [
      { distance: 21.1, time: 4103, holder: "Sarah Chen", year: 2024 },
    ],
    difficultyModifier: 1.1,
    crowdSupport: 0.7,
    colors: { primary: "#06b6d4", secondary: "#0891b2" },
    landmark: "Lighthouse Point",
    unlockRequirements: { minLevel: 12, storyChapter: 2 },
  },

  national_marathon_city: {
    id: "national_marathon_city",
    name: "Capital City Marathon",
    city: "Washington",
    region: "East Coast",
    country: "USA",
    tier: "national",
    terrain: "urban_streets",
    elevation: 100,
    elevationGain: 300,
    typicalWeather: ["perfect", "hot", "rainy"],
    atmosphere: "prestigious",
    description:
      "Run through the heart of power. Historic monuments, roaring crowds, and national TV coverage. This is where you prove you belong among the nation's best.",
    lore: [
      "Attracts elite runners from across the country",
      "The 20-mile wall happens right at Monument Square - symbolic and brutal",
      "Winners get featured in national running magazines",
    ],
    famousRunners: [
      "Olympic Trials qualifier James Peterson",
      "Boston Marathon winner Emma Rodriguez",
    ],
    courseRecords: [
      { distance: 42.2, time: 7823, holder: "James Peterson", year: 2025 },
    ],
    difficultyModifier: 1.2,
    crowdSupport: 0.85,
    colors: { primary: "#3b82f6", secondary: "#2563eb" },
    landmark: "Monument Square",
    unlockRequirements: { minLevel: 18, storyChapter: 3 },
  },

  mountain_trail_ultra: {
    id: "mountain_trail_ultra",
    name: "Alpine Challenge Ultra",
    city: "Boulder",
    region: "Rocky Mountains",
    country: "USA",
    tier: "international",
    terrain: "alpine_pass",
    elevation: 2500,
    elevationGain: 1200,
    typicalWeather: ["cold", "snowy", "windy", "perfect"],
    atmosphere: "hostile",
    description:
      "Where runners go to test their souls. Thin air, brutal climbs, and Mother Nature's indifference. Only the mentally unbreakable finish.",
    lore: [
      "60% DNF rate - finishing is victory enough",
      "Altitude sickness claims more runners than fatigue",
      "Survivors speak of it in hushed, reverent tones",
    ],
    difficultyModifier: 1.5,
    crowdSupport: 0.2,
    colors: { primary: "#8b5cf6", secondary: "#7c3aed" },
    landmark: "Summit Pass (3,200m)",
    unlockRequirements: { minLevel: 25, storyChapter: 4 },
  },

  olympic_trials: {
    id: "olympic_trials",
    name: "Olympic Marathon Trials",
    city: "Atlanta",
    region: "Southeast",
    country: "USA",
    tier: "legendary",
    terrain: "urban_streets",
    elevation: 300,
    elevationGain: 400,
    typicalWeather: ["hot", "perfect", "stormy"],
    atmosphere: "electric",
    description:
      "The pinnacle. Every stride carries the weight of a lifetime of training. The world watches. History is written here. Top 3 go to the Olympics.",
    lore: [
      "Dreams are realized and shattered on this course",
      "The pressure is suffocating - champions thrive, others crumble",
      "Your name etched in history - or forgotten forever",
    ],
    famousRunners: [
      "Olympic Gold Medalist Alana Brooks",
      "World Record Holder Kenji Tanaka",
    ],
    courseRecords: [
      { distance: 42.2, time: 7651, holder: "Kenji Tanaka", year: 2024 },
    ],
    difficultyModifier: 1.3,
    crowdSupport: 1.0,
    colors: { primary: "#ef4444", secondary: "#dc2626" },
    landmark: "Olympic Stadium Finish",
    unlockRequirements: { minLevel: 30, storyChapter: 5, minRating: 2400 },
  },
};

/**
 * Location personalities and narrative content.
 */
export const LOCATION_PERSONALITIES: Record<string, LocationPersonality> = {
  local_5k_park: {
    locationId: "local_5k_park",
    arrivalTexts: [
      "You pull up to the familiar parking lot. The smell of fresh-cut grass and morning dew reminds you why you love this sport.",
      "Old friends wave as you warm up. This is home. This is where it all began.",
      "The starter's voice crackles over the PA system: 'Welcome back, everyone!'",
    ],
    raceAtmosphere: [
      "A dog barks encouragement as you pass the playground.",
      "The local coffee shop owner rings a bell: 'Go get 'em!'",
      "Children on bikes follow along the path, cheering wildly.",
    ],
    victoryTexts: [
      "You cross the line to applause from the small crowd. A volunteer hands you a homemade cookie. You're home.",
      "The old oak tree seems to nod approvingly as you walk your cooldown.",
    ],
    defeatTexts: [
      "Not your best race, but familiar faces still pat your back. 'You'll get it next time.'",
      "The park doesn't judge. It'll be here next week, ready for your redemption.",
    ],
    landmarks: [
      {
        distance: 2.0,
        name: "The Old Oak",
        description:
          "The ancient tree that's watched thousands of runners pass",
      },
    ],
  },

  regional_10k_hills: {
    locationId: "regional_10k_hills",
    arrivalTexts: [
      "You size up the hills in the distance. Your training will be tested today.",
      "Serious faces surround you at the start line. Everyone knows what's coming.",
      "The course profile taped to your arm looks like a heart rate monitor gone wild.",
    ],
    raceAtmosphere: [
      "Your quads scream as the gradient kicks up. This is Heartbreak Hill.",
      "Other runners grimace and grind. Nobody's smiling here.",
      "The descent offers brief respite, but you know another climb lurks ahead.",
    ],
    victoryTexts: [
      "You conquered the hills. Respect in the eyes of other finishers - they know what you just did.",
      "The course broke others, but you broke the course. Pride surges through you.",
    ],
    defeatTexts: [
      "The hills won today. Your legs gave out, your lungs burned. It happens.",
      "Walking the final climb stings, but at least you didn't quit.",
    ],
    landmarks: [
      {
        distance: 5.8,
        name: "Heartbreak Hill",
        description: "The infamous 12% gradient that defines this race",
      },
    ],
  },

  state_half_coastal: {
    locationId: "state_half_coastal",
    arrivalTexts: [
      "The salt air fills your lungs during warm-up. The Pacific stretches endlessly to your left.",
      "Sunrise paints the fog golden. This is going to be beautiful.",
      "Elite runners toe the line beside you. You belong here.",
    ],
    raceAtmosphere: [
      "Waves crash in rhythm with your footfalls. Ocean spray cools your face.",
      "The lighthouse emerges from the fog - halfway point. You're flying.",
      "Spectators line the coastal path, their cheers carried on the sea breeze.",
    ],
    victoryTexts: [
      "Salt on your lips, pride in your heart. You just ran one of the most beautiful races in America.",
      "The ocean witnessed your triumph. This is a memory you'll carry forever.",
    ],
    defeatTexts: [
      "The beauty couldn't mask the pain today. But at least you ran beside the sea.",
      "Not the result you wanted, but the views alone made it worthwhile.",
    ],
    landmarks: [
      {
        distance: 10.5,
        name: "Lighthouse Point",
        description: "The iconic lighthouse marking the turnaround",
      },
      {
        distance: 15.0,
        name: "Dolphin Cove",
        description: "Where lucky runners spot dolphins in the surf",
      },
    ],
  },

  national_marathon_city: {
    locationId: "national_marathon_city",
    arrivalTexts: [
      "National TV cameras pan across the elite field. Your number is pinned straight. You're ready.",
      "The energy is electric. Thousands of runners, tens of thousands of spectators. This is big.",
      "You spot a runner you've only seen in magazines. Today you race them.",
    ],
    raceAtmosphere: [
      "The crowd roar is deafening as you pass Monument Square.",
      "News helicopters circle overhead. This race matters.",
      "At mile 20, the wall hits. Champions push through. What are you made of?",
    ],
    victoryTexts: [
      "The finish line banner frames your moment of glory. Cameras flash. You did it.",
      "A national-level victory. Your name in the record books. The validation you needed.",
    ],
    defeatTexts: [
      "Monument Square witnessed your breakdown. The wall won today.",
      "DNF at the national level stings differently. But you'll be back.",
    ],
    specialEvents: [
      {
        name: "National TV Feature",
        description: "Camera crew follows you for a segment",
        probability: 0.1,
        effect: "Pressure increases but so does motivation",
      },
    ],
    landmarks: [
      {
        distance: 20.0,
        name: "Monument Square",
        description: "Where the 20-mile wall breaks runners",
      },
      {
        distance: 42.0,
        name: "Victory Boulevard",
        description: "The final 200m sprint to glory",
      },
    ],
  },

  mountain_trail_ultra: {
    locationId: "mountain_trail_ultra",
    arrivalTexts: [
      "The thin mountain air makes you light-headed before you even start.",
      "You check your pack one more time. Out here, preparation means survival.",
      "The mountain doesn't care about your training. It only respects grit.",
    ],
    raceAtmosphere: [
      "Your lungs burn. The altitude doesn't negotiate.",
      "Another runner sits defeated on a rock. 'Go on without me,' they gasp.",
      "The summit is beautiful and cruel. You push forward.",
    ],
    victoryTexts: [
      "You finished. FINISHED. That puts you in rare company. Pride doesn't cover it.",
      "The mountain tested you and found you worthy. This changes you.",
    ],
    defeatTexts: [
      "DNF. The mountain won. There's no shame - 60% don't finish.",
      "You gave everything. The altitude took more. You'll heal and return.",
    ],
    landmarks: [
      {
        distance: 25.0,
        name: "Summit Pass",
        description: "3,200m elevation - where altitude breaks spirits",
      },
    ],
  },

  olympic_trials: {
    locationId: "olympic_trials",
    arrivalTexts: [
      "The weight of a lifetime of training sits on your shoulders at the start line.",
      "Top 3 go to the Olympics. Everyone else goes home. The stakes couldn't be higher.",
      "Olympic dreams hang in the humid Atlanta air. This is it.",
    ],
    raceAtmosphere: [
      "The pace is blistering. Olympic-level. You're hanging on.",
      "Every stride is history being written. Push or perish.",
      "The crowd roar is primordial. They know they're watching legends.",
    ],
    victoryTexts: [
      "TOP 3. YOU'RE GOING TO THE OLYMPICS. Everything you sacrificed was worth it.",
      "Your name will be remembered. Olympic Trials qualifier. Forever.",
    ],
    defeatTexts: [
      "4th place. So close. The cruelest position. The Olympic dream dies here.",
      "You gave everything and came up short. But you were here. You tried.",
    ],
    landmarks: [
      {
        distance: 30.0,
        name: "Judgment Mile",
        description: "Where Olympic dreams are made or broken",
      },
      {
        distance: 42.2,
        name: "Olympic Stadium Finish",
        description: "Cross this line in top 3 and your life changes forever",
      },
    ],
  },
};

/**
 * Get a random weather condition for a location.
 */
export function getRandomWeather(
  location: Location,
  seed: number,
): WeatherImpact {
  const conditions = location.typicalWeather;
  const index = ((seed * 9301 + 49297) % 233280) % conditions.length;
  const condition = conditions[index];
  return WEATHER_IMPACTS[condition];
}

/**
 * Get random flavor text from personality.
 */
export function getRandomText(texts: string[], seed: number): string {
  const index = ((seed * 9301 + 49297) % 233280) % texts.length;
  return texts[index];
}
