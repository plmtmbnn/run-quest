import type { RunnerProfile } from "@/runner/runner-types";
import { getChapterByNumber } from "./chapter-database";
import type { ChampionshipResult, StoryProgress } from "./story-types";

/**
 * Career Biography - Tracks runner's story and achievements
 */

export interface CareerMilestone {
  id: string;
  chapterNumber: number;
  title: { en: string; id: string };
  description: { en: string; id: string };
  achievedAt: number;
  icon: string;
}

export interface CareerStatistics {
  totalChaptersCompleted: number;
  totalChampionshipsWon: number;
  totalStoryRaces: number;
  fastestChampionshipTime: number | null;
  averageChampionshipPosition: number;
  perfectChampionships: number; // Won on first attempt
  comebackWins: number; // Won after losing once
  totalAttempts: number;
}

export interface CareerBiography {
  milestones: CareerMilestone[];
  statistics: CareerStatistics;
  currentTitle: { en: string; id: string } | null;
  collectedTitles: Array<{ en: string; id: string }>;
  careerHighlights: string[]; // Story beat IDs of memorable moments
  rivalHistory: Record<
    string,
    { encounters: number; wins: number; losses: number }
  >;
  legacyRating: number; // 0-100 based on achievements
}

/**
 * Generate career biography from story progress and profile
 */
export function generateCareerBiography(
  profile: RunnerProfile,
  storyProgress: StoryProgress,
): CareerBiography {
  const milestones = generateMilestones(storyProgress);
  const statistics = calculateStatistics(storyProgress);
  const currentTitle = getCurrentTitle(storyProgress);
  const collectedTitles = getCollectedTitles(storyProgress);
  const rivalHistory = buildRivalHistory(profile);
  const legacyRating = calculateLegacyRating(storyProgress, profile);

  return {
    milestones,
    statistics,
    currentTitle,
    collectedTitles,
    careerHighlights: storyProgress.viewedStoryBeats,
    rivalHistory,
    legacyRating,
  };
}

/**
 * Generate milestones from completed chapters
 */
function generateMilestones(storyProgress: StoryProgress): CareerMilestone[] {
  const milestones: CareerMilestone[] = [];

  for (const chapterNum of storyProgress.completedChapters) {
    const chapter = getChapterByNumber(chapterNum);
    if (!chapter) continue;

    const completedAt = storyProgress.chapterCompletedAt[chapterNum];
    const championshipResult =
      storyProgress.championshipResults[chapter.finalRace.id];

    milestones.push({
      id: `chapter_${chapterNum}_complete`,
      chapterNumber: chapterNum,
      title: {
        en: `${chapter.title.en} Complete`,
        id: `${chapter.title.id} Selesai`,
      },
      description: {
        en: `Won the ${chapter.finalRace.title.en}`,
        id: `Memenangkan ${chapter.finalRace.title.id}`,
      },
      achievedAt: completedAt || 0,
      icon: chapter.icon || "🏆",
    });

    // Add special milestone if won on first attempt
    if (championshipResult && championshipResult.attempts === 1) {
      milestones.push({
        id: `chapter_${chapterNum}_perfect`,
        chapterNumber: chapterNum,
        title: {
          en: `Perfect Victory`,
          id: `Kemenangan Sempurna`,
        },
        description: {
          en: `Won ${chapter.finalRace.title.en} on first attempt`,
          id: `Memenangkan ${chapter.finalRace.title.id} pada percobaan pertama`,
        },
        achievedAt: completedAt || 0,
        icon: "⭐",
      });
    }
  }

  return milestones.sort((a, b) => a.achievedAt - b.achievedAt);
}

/**
 * Calculate career statistics
 */
function calculateStatistics(storyProgress: StoryProgress): CareerStatistics {
  const championships = Object.values(storyProgress.championshipResults);
  const wonChampionships = championships.filter((r) => r.won);

  let fastestTime: number | null = null;
  let totalPosition = 0;
  let perfectCount = 0;
  let comebackCount = 0;
  let totalAttempts = 0;

  for (const result of wonChampionships) {
    if (fastestTime === null || result.finishTime < fastestTime) {
      fastestTime = result.finishTime;
    }
    totalPosition += result.position;
    totalAttempts += result.attempts;

    if (result.attempts === 1) {
      perfectCount++;
    } else if (result.attempts > 1) {
      comebackCount++;
    }
  }

  const avgPosition =
    wonChampionships.length > 0 ? totalPosition / wonChampionships.length : 0;

  return {
    totalChaptersCompleted: storyProgress.completedChapters.length,
    totalChampionshipsWon: wonChampionships.length,
    totalStoryRaces:
      storyProgress.totalStoryRaces +
      storyProgress.completedChapters.length * 10, // Estimate
    fastestChampionshipTime: fastestTime,
    averageChampionshipPosition: avgPosition,
    perfectChampionships: perfectCount,
    comebackWins: comebackCount,
    totalAttempts,
  };
}

/**
 * Get current title based on latest achievement
 */
function getCurrentTitle(
  storyProgress: StoryProgress,
): { en: string; id: string } | null {
  const latestChapter = Math.max(...storyProgress.completedChapters, 0);
  if (latestChapter === 0) return null;

  const chapter = getChapterByNumber(latestChapter);
  return chapter?.rewards.title || null;
}

/**
 * Get all collected titles
 */
function getCollectedTitles(
  storyProgress: StoryProgress,
): Array<{ en: string; id: string }> {
  const titles: Array<{ en: string; id: string }> = [];

  for (const chapterNum of storyProgress.completedChapters) {
    const chapter = getChapterByNumber(chapterNum);
    if (chapter?.rewards.title) {
      titles.push(chapter.rewards.title);
    }
  }

  return titles;
}

/**
 * Build rival encounter history
 */
function buildRivalHistory(
  profile: RunnerProfile,
): Record<string, { encounters: number; wins: number; losses: number }> {
  const history: Record<
    string,
    { encounters: number; wins: number; losses: number }
  > = {};

  if (profile.rivalRelationships) {
    for (const [rivalId, relationship] of Object.entries(
      profile.rivalRelationships,
    )) {
      history[rivalId] = {
        encounters: relationship.totalEncounters,
        wins: relationship.wins,
        losses: relationship.losses,
      };
    }
  }

  return history;
}

/**
 * Calculate legacy rating (0-100)
 */
function calculateLegacyRating(
  storyProgress: StoryProgress,
  profile: RunnerProfile,
): number {
  let rating = 0;

  // Base: 20 points per chapter completed
  rating += storyProgress.completedChapters.length * 20;

  // Perfect championships: +5 points each
  const championships = Object.values(storyProgress.championshipResults);
  const perfectWins = championships.filter(
    (r) => r.won && r.attempts === 1,
  ).length;
  rating += perfectWins * 5;

  // Level bonus: +1 per level above 10
  if (profile.level > 10) {
    rating += profile.level - 10;
  }

  // Story milestones: +2 per milestone
  rating += storyProgress.storyMilestones.length * 2;

  return Math.min(100, rating);
}

/**
 * Get career summary text
 */
export function getCareerSummary(
  biography: CareerBiography,
  lang: "en" | "id",
): string {
  const stats = biography.statistics;

  if (lang === "en") {
    if (stats.totalChaptersCompleted === 0) {
      return "Your journey begins. Every legend starts with a single step.";
    }
    if (stats.totalChaptersCompleted === 1) {
      return "You've proven yourself locally. The road ahead is long, but you're ready.";
    }
    if (stats.totalChaptersCompleted === 2) {
      return "A rising star in the regional circuit. People are starting to notice.";
    }
    if (stats.totalChaptersCompleted === 3) {
      return "You've overcome adversity and emerged stronger. A true competitor.";
    }
    if (stats.totalChaptersCompleted === 4) {
      return "National champion. Your name is known across the country.";
    }
    if (stats.totalChaptersCompleted === 5) {
      return "A legend. Your legacy will inspire generations of runners.";
    }
  } else {
    if (stats.totalChaptersCompleted === 0) {
      return "Perjalananmu dimulai. Setiap legenda dimulai dengan satu langkah.";
    }
    if (stats.totalChaptersCompleted === 1) {
      return "Kamu telah membuktikan diri secara lokal. Jalan ke depan panjang, tapi kamu siap.";
    }
    if (stats.totalChaptersCompleted === 2) {
      return "Bintang terbit di sirkuit regional. Orang mulai memperhatikan.";
    }
    if (stats.totalChaptersCompleted === 3) {
      return "Kamu telah mengatasi kesulitan dan muncul lebih kuat. Kompetitor sejati.";
    }
    if (stats.totalChaptersCompleted === 4) {
      return "Juara nasional. Namamu dikenal di seluruh negara.";
    }
    if (stats.totalChaptersCompleted === 5) {
      return "Sebuah legenda. Warisanmu akan menginspirasi generasi pelari.";
    }
  }

  return "";
}

/**
 * Get achievement badges based on career
 */
export function getAchievementBadges(biography: CareerBiography): string[] {
  const badges: string[] = [];
  const stats = biography.statistics;

  if (stats.perfectChampionships >= 3) badges.push("🎯");
  if (stats.comebackWins >= 2) badges.push("💪");
  if (stats.totalChaptersCompleted >= 5) badges.push("👑");
  if (biography.legacyRating >= 90) badges.push("⭐");
  if (stats.averageChampionshipPosition <= 1.5) badges.push("🥇");

  return badges;
}
