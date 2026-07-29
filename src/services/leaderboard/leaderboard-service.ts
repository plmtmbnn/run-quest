export type LeaderboardCategory =
  | "daily"
  | "weekly"
  | "all_time"
  | "rising"
  | "most_active";

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatarColor: string;
  scoreOrTime: string; // e.g. "18:42" or "14 races"
  numericValue: number;
  distance: string;
  level: number;
  isCurrentPlayer?: boolean;
}

export interface ActivityFeedItem {
  id: string;
  playerName: string;
  avatarColor?: string;
  achievement: string;
  timestamp: number;
  distance: string;
  time: string;
  type: "record" | "milestone" | "rivalry" | "streak";
}

const STORAGE_KEY_LEADERBOARD = "runquest.leaderboard";
const STORAGE_KEY_ACTIVITY_FEED = "runquest.activity_feed";

// Initial seed activity feed
const INITIAL_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: "act_1",
    playerName: "Elena Rostova",
    avatarColor: "#ec4899",
    achievement: "🏆 Set a new 5K Course Record (18:12)!",
    timestamp: Date.now() - 1000 * 60 * 5,
    distance: "5K",
    time: "18:12",
    type: "record",
  },
  {
    id: "act_2",
    playerName: "Marcus Vance",
    avatarColor: "#ef4444",
    achievement: "🔥 Extended win streak to 5 consecutive races!",
    timestamp: Date.now() - 1000 * 60 * 12,
    distance: "10K",
    time: "38:40",
    type: "streak",
  },
  {
    id: "act_3",
    playerName: "Jake Miller",
    avatarColor: "#22c55e",
    achievement: "🎯 Reached 100th total race milestone!",
    timestamp: Date.now() - 1000 * 60 * 25,
    distance: "5K",
    time: "21:05",
    type: "milestone",
  },
  {
    id: "act_4",
    playerName: "Sarah Chen",
    avatarColor: "#3b82f6",
    achievement: "⚡ Beat rival in head-to-head sprint finish!",
    timestamp: Date.now() - 1000 * 60 * 40,
    distance: "Half Marathon",
    time: "1:24:10",
    type: "rivalry",
  },
];

const INITIAL_MOCK_LEADERBOARDS: Record<LeaderboardCategory, LeaderboardEntry[]> = {
  daily: [
    { rank: 1, playerId: "p_elena", playerName: "Elena Rostova", avatarColor: "#ec4899", scoreOrTime: "18:12", numericValue: 1092, distance: "5K", level: 24 },
    { rank: 2, playerId: "p_marcus", playerName: "Marcus Vance", avatarColor: "#ef4444", scoreOrTime: "18:45", numericValue: 1125, distance: "5K", level: 22 },
    { rank: 3, playerId: "p_jake", playerName: "Jake Miller", avatarColor: "#22c55e", scoreOrTime: "19:30", numericValue: 1170, distance: "5K", level: 18 },
    { rank: 4, playerId: "p_sarah", playerName: "Sarah Chen", avatarColor: "#3b82f6", scoreOrTime: "19:55", numericValue: 1195, distance: "5K", level: 19 },
    { rank: 5, playerId: "p_david", playerName: "David Kim", avatarColor: "#a855f7", scoreOrTime: "20:10", numericValue: 1210, distance: "5K", level: 15 },
  ],
  weekly: [
    { rank: 1, playerId: "p_marcus", playerName: "Marcus Vance", avatarColor: "#ef4444", scoreOrTime: "38:40", numericValue: 2320, distance: "10K", level: 22 },
    { rank: 2, playerId: "p_elena", playerName: "Elena Rostova", avatarColor: "#ec4899", scoreOrTime: "39:15", numericValue: 2355, distance: "10K", level: 24 },
    { rank: 3, playerId: "p_sarah", playerName: "Sarah Chen", avatarColor: "#3b82f6", scoreOrTime: "40:02", numericValue: 2402, distance: "10K", level: 19 },
  ],
  all_time: [
    { rank: 1, playerId: "p_elena", playerName: "Elena Rostova", avatarColor: "#ec4899", scoreOrTime: "17:45", numericValue: 1065, distance: "5K", level: 24 },
    { rank: 2, playerId: "p_marcus", playerName: "Marcus Vance", avatarColor: "#ef4444", scoreOrTime: "17:58", numericValue: 1078, distance: "5K", level: 22 },
  ],
  rising: [
    { rank: 1, playerId: "p_jake", playerName: "Jake Miller", avatarColor: "#22c55e", scoreOrTime: "-85s PB", numericValue: 85, distance: "5K", level: 18 },
    { rank: 2, playerId: "p_david", playerName: "David Kim", avatarColor: "#a855f7", scoreOrTime: "-62s PB", numericValue: 62, distance: "5K", level: 15 },
  ],
  most_active: [
    { rank: 1, playerId: "p_elena", playerName: "Elena Rostova", avatarColor: "#ec4899", scoreOrTime: "142 races", numericValue: 142, distance: "All", level: 24 },
    { rank: 2, playerId: "p_marcus", playerName: "Marcus Vance", avatarColor: "#ef4444", scoreOrTime: "128 races", numericValue: 128, distance: "All", level: 22 },
  ],
};

let activeFeedMemory: ActivityFeedItem[] | null = null;

export class LeaderboardService {
  static getLeaderboard(category: LeaderboardCategory, playerInfo?: { id: string; name: string; timeSec?: number; distance?: string }): LeaderboardEntry[] {
    let list = [...INITIAL_MOCK_LEADERBOARDS[category]];

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`${STORAGE_KEY_LEADERBOARD}_${category}`);
        if (cached) {
          list = JSON.parse(cached);
        }
      } catch (e) {
        console.warn("Failed to load local leaderboard state", e);
      }
    }

    if (playerInfo) {
      const existingIdx = list.findIndex((e) => e.playerId === playerInfo.id);
      if (existingIdx !== -1) {
        list[existingIdx].isCurrentPlayer = true;
      } else if (playerInfo.timeSec) {
        // Insert player position dynamically
        const playerEntry: LeaderboardEntry = {
          rank: 0,
          playerId: playerInfo.id,
          playerName: playerInfo.name || "You",
          avatarColor: "#6366f1",
          scoreOrTime: `${Math.floor(playerInfo.timeSec / 60)}:${String(Math.floor(playerInfo.timeSec % 60)).padStart(2, "0")}`,
          numericValue: playerInfo.timeSec,
          distance: playerInfo.distance || "5K",
          level: 1,
          isCurrentPlayer: true,
        };
        list.push(playerEntry);
        list.sort((a, b) => a.numericValue - b.numericValue);
        list.forEach((item, idx) => {
          item.rank = idx + 1;
        });
      }
    }

    return list.slice(0, 50);
  }

  static getActivityFeed(): ActivityFeedItem[] {
    if (activeFeedMemory) {
      return activeFeedMemory;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_ACTIVITY_FEED);
        if (cached) {
          activeFeedMemory = JSON.parse(cached);
          return activeFeedMemory!;
        }
      } catch (e) {
        console.warn("Failed to load activity feed", e);
      }
    }
    activeFeedMemory = [...INITIAL_ACTIVITIES];
    return activeFeedMemory;
  }

  static pushActivity(item: Omit<ActivityFeedItem, "id" | "timestamp">): ActivityFeedItem {
    const newItem: ActivityFeedItem = {
      ...item,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    const current = this.getActivityFeed();
    const updated = [newItem, ...current].slice(0, 100);
    activeFeedMemory = updated;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVITY_FEED, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist activity feed", e);
      }
    }
    return newItem;
  }
}
