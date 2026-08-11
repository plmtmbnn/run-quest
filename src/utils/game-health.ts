/**
 * Game Health Monitoring System
 *
 * Comprehensive health monitoring for the Run-Quest game,
 * tracking XP persistence, performance, errors, and overall game stability.
 */

import { loadRunnerState } from "@/runner/runner-persistence";
import { getXPState, resetXPTracker } from "@/runner/xp-tracker";
import { useTimelineStore } from "@/store/timeline-store";
import {
  clearReportedErrors,
  getErrorStats,
  isRecoverableState,
} from "./error-handling";
import {
  getPerformanceScore,
  getPerformanceTips,
  isPerformanceAcceptable,
} from "./performance-monitor";

/**
 * Game health status interface
 */
export interface GameHealthStatus {
  id: string;
  timestamp: number;

  // XP System Health
  xpHealth: {
    currentXP: number;
    currentLevel: number;
    pendingAwards: number;
    status: "healthy" | "warning" | "critical";
    issues: string[];
  };

  // Error System Health
  errorHealth: {
    totalErrors: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    recoverable: boolean;
    status: "healthy" | "warning" | "critical";
    issues: string[];
  };

  // Performance Health
  performanceHealth: {
    score: number;
    frameRate: number;
    memoryUsage: number;
    acceptable: boolean;
    status: "healthy" | "warning" | "critical";
    tips: string[];
  };

  // Storage Health
  storageHealth: {
    runnerStateValid: boolean;
    gameStateValid: boolean;
    inventoryValid: boolean;
    status: "healthy" | "warning" | "critical";
    issues: string[];
  };

  // Overall Health
  overallStatus: "healthy" | "warning" | "critical";
  overallScore: number; // 0-100
  recommendations: string[];
}

/**
 * Game health monitor configuration
 */
export interface GameHealthConfig {
  checkInterval: number; // ms between health checks
  maxHistory: number; // max number of health reports to keep
  thresholds: {
    xpPendingWarning: number; // warning if more than X pending XP awards
    errorWarning: number; // warning if more than X errors
    errorCritical: number; // critical if more than X errors
    performanceWarning: number; // warning if performance score below X
    performanceCritical: number; // critical if performance score below X
  };
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GameHealthConfig = {
  checkInterval: 30000, // 30 seconds
  maxHistory: 50,
  thresholds: {
    xpPendingWarning: 5,
    errorWarning: 3,
    errorCritical: 10,
    performanceWarning: 70,
    performanceCritical: 40,
  },
};

/**
 * Health monitoring state
 */
let healthConfig: GameHealthConfig = DEFAULT_CONFIG;
let healthHistory: GameHealthStatus[] = [];
let isMonitoring = false;
let monitoringInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize game health monitoring
 */
export function initializeGameHealthMonitoring(
  config?: Partial<GameHealthConfig>,
): void {
  healthConfig = { ...DEFAULT_CONFIG, ...config };

  if (isMonitoring) {
    stopGameHealthMonitoring();
  }

  isMonitoring = true;
  healthHistory = [];

  // Start periodic health checks
  monitoringInterval = setInterval(() => {
    const status = checkGameHealth();
    recordHealthStatus(status);

    // Log health issues in development
    if (process.env.NODE_ENV !== "production") {
      if (status.overallStatus !== "healthy") {
        console.log(`🏥 Game Health: ${status.overallStatus}`, status);
      }
    }
  }, healthConfig.checkInterval);

  // Initial health check
  const initialStatus = checkGameHealth();
  recordHealthStatus(initialStatus);

  if (process.env.NODE_ENV !== "production") {
    console.log("🏥 Game Health Monitoring Started");
  }
}

/**
 * Stop game health monitoring
 */
export function stopGameHealthMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  isMonitoring = false;
}

/**
 * Check current game health
 */
export function checkGameHealth(): GameHealthStatus {
  const timestamp = Date.now();
  const statusId = `health_${timestamp}`;

  // Check XP Health
  const xpState = getXPState();
  const xpHealth = checkXPHealth(xpState);

  // Check Error Health
  const errorStats = getErrorStats();
  const errorHealth = checkErrorHealth(errorStats);

  // Check Performance Health
  const performanceScore = getPerformanceScore();
  const isPerfAcceptable = isPerformanceAcceptable();
  const performanceTips = getPerformanceTips();
  const performanceHealth = checkPerformanceHealth(
    performanceScore,
    isPerfAcceptable,
    performanceTips,
  );

  // Check Storage Health
  const storageHealth = checkStorageHealth();

  // Calculate Overall Health
  const overallStatus = calculateOverallStatus(
    xpHealth,
    errorHealth,
    performanceHealth,
    storageHealth,
  );
  const overallScore = calculateOverallScore(
    xpHealth,
    errorHealth,
    performanceHealth,
    storageHealth,
  );
  const recommendations = generateRecommendations(
    xpHealth,
    errorHealth,
    performanceHealth,
    storageHealth,
  );

  return {
    id: statusId,
    timestamp,
    xpHealth,
    errorHealth,
    performanceHealth,
    storageHealth,
    overallStatus,
    overallScore,
    recommendations,
  };
}

/**
 * Check XP system health
 */
function checkXPHealth(
  state: ReturnType<typeof getXPState>,
): GameHealthStatus["xpHealth"] {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  if (state.pending > healthConfig.thresholds.xpPendingWarning) {
    issues.push(`High pending XP awards: ${state.pending}`);
    status = "warning";
  }

  // Check if XP seems reasonable (not negative, not extremely high)
  if (state.xp < 0) {
    issues.push("Negative XP detected");
    status = "critical";
  }

  if (state.level < 1) {
    issues.push("Invalid level detected");
    status = "critical";
  }

  return {
    currentXP: state.xp,
    currentLevel: state.level,
    pendingAwards: state.pending,
    status,
    issues,
  };
}

/**
 * Check error system health
 */
function checkErrorHealth(
  stats: ReturnType<typeof getErrorStats>,
): GameHealthStatus["errorHealth"] {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  if (stats.total > healthConfig.thresholds.errorCritical) {
    issues.push(`High error count: ${stats.total}`);
    status = "critical";
  } else if (stats.total > healthConfig.thresholds.errorWarning) {
    issues.push(`Elevated error count: ${stats.total}`);
    status = "warning";
  }

  if (!isRecoverableState()) {
    issues.push("Game in unrecoverable state");
    status = "critical";
  }

  // Check for critical errors
  if (stats.bySeverity.critical > 0) {
    issues.push(`${stats.bySeverity.critical} critical errors detected`);
    status = "critical";
  }

  return {
    totalErrors: stats.total,
    bySeverity: stats.bySeverity,
    byType: stats.byType,
    recoverable: isRecoverableState(),
    status,
    issues,
  };
}

/**
 * Check performance health
 */
function checkPerformanceHealth(
  score: number,
  acceptable: boolean,
  tips: string[],
): GameHealthStatus["performanceHealth"] {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  if (!acceptable) {
    issues.push("Performance below acceptable thresholds");
    status = "warning";
  }

  if (score < healthConfig.thresholds.performanceCritical) {
    issues.push(`Low performance score: ${score}`);
    status = "critical";
  } else if (score < healthConfig.thresholds.performanceWarning) {
    issues.push(`Performance score could be improved: ${score}`);
    status = "warning";
  }

  return {
    score,
    frameRate: 0, // Will be updated with actual metrics
    memoryUsage: 0, // Will be updated with actual metrics
    acceptable,
    status,
    tips,
  };
}

/**
 * Check storage health
 */
function checkStorageHealth(): GameHealthStatus["storageHealth"] {
  const issues: string[] = [];
  let status: "healthy" | "warning" | "critical" = "healthy";

  try {
    // Check runner state
    const runnerState = loadRunnerState();
    const runnerStateValid =
      runnerState && runnerState.profile && runnerState.profile.xp >= 0;

    if (!runnerStateValid) {
      issues.push("Runner state appears corrupted");
      status = "critical";
    }

    // Check game state
    const gameState = useTimelineStore.getState().gameState;
    const gameStateValid = gameState !== null;

    if (!gameStateValid) {
      issues.push("Game state not initialized");
      status = "warning";
    }

    return {
      runnerStateValid,
      gameStateValid,
      inventoryValid: true, // Simplified for now
      status,
      issues,
    };
  } catch (error) {
    issues.push(`Storage check failed: ${error}`);
    return {
      runnerStateValid: false,
      gameStateValid: false,
      inventoryValid: false,
      status: "critical",
      issues,
    };
  }
}

/**
 * Calculate overall status
 */
function calculateOverallStatus(
  xpHealth: GameHealthStatus["xpHealth"],
  errorHealth: GameHealthStatus["errorHealth"],
  performanceHealth: GameHealthStatus["performanceHealth"],
  storageHealth: GameHealthStatus["storageHealth"],
): "healthy" | "warning" | "critical" {
  const statuses = [
    xpHealth.status,
    errorHealth.status,
    performanceHealth.status,
    storageHealth.status,
  ];

  // If any system is critical, overall is critical
  if (statuses.includes("critical")) {
    return "critical";
  }

  // If any system is warning, overall is warning
  if (statuses.includes("warning")) {
    return "warning";
  }

  return "healthy";
}

/**
 * Calculate overall score (0-100)
 */
function calculateOverallScore(
  xpHealth: GameHealthStatus["xpHealth"],
  errorHealth: GameHealthStatus["errorHealth"],
  performanceHealth: GameHealthStatus["performanceHealth"],
  storageHealth: GameHealthStatus["storageHealth"],
): number {
  // Weighted average
  const xpScore =
    xpHealth.status === "healthy"
      ? 100
      : xpHealth.status === "warning"
        ? 70
        : 0;
  const errorScore =
    errorHealth.status === "healthy"
      ? 100
      : errorHealth.status === "warning"
        ? 70
        : 0;
  const perfScore = performanceHealth.score;
  const storageScore =
    storageHealth.status === "healthy"
      ? 100
      : storageHealth.status === "warning"
        ? 70
        : 0;

  // XP: 25%, Errors: 25%, Performance: 30%, Storage: 20%
  return Math.round(
    xpScore * 0.25 + errorScore * 0.25 + perfScore * 0.3 + storageScore * 0.2,
  );
}

/**
 * Generate recommendations based on health status
 */
function generateRecommendations(
  xpHealth: GameHealthStatus["xpHealth"],
  errorHealth: GameHealthStatus["errorHealth"],
  performanceHealth: GameHealthStatus["performanceHealth"],
  storageHealth: GameHealthStatus["storageHealth"],
): string[] {
  const recommendations: string[] = [];

  // XP recommendations
  if (xpHealth.issues.length > 0) {
    recommendations.push("Check XP system for pending awards");
  }

  // Error recommendations
  if (errorHealth.issues.length > 0) {
    recommendations.push("Review error logs for issues");
  }

  // Performance recommendations
  if (performanceHealth.tips.length > 0) {
    recommendations.push(...performanceHealth.tips);
  }

  // Storage recommendations
  if (storageHealth.issues.length > 0) {
    recommendations.push("Verify game data integrity");
  }

  return recommendations;
}

/**
 * Record health status
 */
function recordHealthStatus(status: GameHealthStatus): void {
  healthHistory.push(status);

  // Keep only the most recent health reports
  if (healthHistory.length > healthConfig.maxHistory) {
    healthHistory.shift();
  }
}

/**
 * Get current health status
 */
export function getCurrentHealthStatus(): GameHealthStatus | null {
  if (healthHistory.length === 0) return null;
  return healthHistory[healthHistory.length - 1];
}

/**
 * Get health history
 */
export function getHealthHistory(): GameHealthStatus[] {
  return [...healthHistory];
}

/**
 * Get health trends
 */
export function getHealthTrends(): {
  improving: boolean;
  scoreChange: number;
  statusChanges: number;
} {
  if (healthHistory.length < 2) {
    return {
      improving: true,
      scoreChange: 0,
      statusChanges: 0,
    };
  }

  const latest = healthHistory[healthHistory.length - 1];
  const previous = healthHistory[healthHistory.length - 2];

  return {
    improving: latest.overallScore > previous.overallScore,
    scoreChange: latest.overallScore - previous.overallScore,
    statusChanges: latest.overallStatus !== previous.overallStatus ? 1 : 0,
  };
}

/**
 * Reset health monitoring (useful for testing)
 */
export function resetHealthMonitoring(): void {
  stopGameHealthMonitoring();
  clearReportedErrors();
  resetXPTracker();
  healthHistory = [];
}

/**
 * Get a health report for display
 */
export function getHealthReport(): string {
  const status = getCurrentHealthStatus();

  if (!status) {
    return "Health monitoring not started";
  }

  const lines = [
    `🏥 Game Health Report (${new Date(status.timestamp).toLocaleTimeString()})`,
    `===`,
    `Overall: ${status.overallStatus.toUpperCase()} (Score: ${status.overallScore}/100)`,
    `===`,
    `XP System: ${status.xpHealth.status.toUpperCase()}`,
    `  XP: ${status.xpHealth.currentXP}, Level: ${status.xpHealth.currentLevel}`,
    `  Pending: ${status.xpHealth.pendingAwards}`,
    `Errors: ${status.errorHealth.status.toUpperCase()}`,
    `  Total: ${status.errorHealth.totalErrors}`,
    `  Recoverable: ${status.errorHealth.recoverable}`,
    `Performance: ${status.performanceHealth.status.toUpperCase()} (${status.performanceHealth.score}/100)`,
    `Storage: ${status.storageHealth.status.toUpperCase()}`,
  ];

  if (status.recommendations.length > 0) {
    lines.push("===");
    lines.push("Recommendations:");
    status.recommendations.forEach((rec) => lines.push(`  • ${rec}`));
  }

  return lines.join("\n");
}

// Auto-initialize in development
if (process.env.NODE_ENV !== "production") {
  // Don't auto-start in production to avoid performance overhead
  // Call initializeGameHealthMonitoring() explicitly when needed
}
