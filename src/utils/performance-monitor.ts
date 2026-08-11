/**
 * Performance Monitoring System for Run-Quest
 *
 * Monitors and reports performance metrics to ensure smooth gameplay,
 * especially on mobile devices.
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  renderTime: number;
  scriptTime: number;
  paintTime: number;
  loadTime: number;
  timestamp: number;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  connectionType: "wifi" | "cellular" | "offline" | "unknown";
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  minFrameRate: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  warningFrameRate: number;
  warningRenderTime: number;
  warningMemoryUsage: number;
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFrameRate: 30, // Minimum acceptable FPS
  maxRenderTime: 16, // Max render time in ms (for 60fps)
  maxMemoryUsage: 500, // Max memory usage in MB
  warningFrameRate: 45, // Warning FPS threshold
  warningRenderTime: 30, // Warning render time in ms
  warningMemoryUsage: 300, // Warning memory usage in MB
};

/**
 * Performance monitoring state
 */
let metricsHistory: PerformanceMetrics[] = [];
let performanceThresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
let isMonitoring = false;
let frameCount = 0;
let lastFrameTime = 0;
let currentFrameRate = 60;

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring(
  customThresholds?: Partial<PerformanceThresholds>,
): void {
  if (isMonitoring) return;

  performanceThresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  isMonitoring = true;
  frameCount = 0;
  lastFrameTime = performance.now();
  metricsHistory = [];

  // Start frame rate monitoring
  startFrameRateMonitoring();

  // Start memory monitoring
  startMemoryMonitoring();

  // Log startup
  if (process.env.NODE_ENV !== "production") {
    console.log("📊 Performance monitoring started");
  }
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring(): void {
  isMonitoring = false;
  frameCount = 0;
  lastFrameTime = 0;
}

/**
 * Start frame rate monitoring
 */
function startFrameRateMonitoring(): void {
  if (typeof window === "undefined") return;

  let lastTime = performance.now();
  let frameCount = 0;

  function updateFrameRate() {
    if (!isMonitoring) return;

    const now = performance.now();
    frameCount++;

    // Update frame rate every second
    if (now - lastTime >= 1000) {
      currentFrameRate = Math.round((frameCount * 1000) / (now - lastTime));
      frameCount = 0;
      lastTime = now;

      // Check for performance issues
      checkPerformanceThresholds();
    }

    requestAnimationFrame(updateFrameRate);
  }

  requestAnimationFrame(updateFrameRate);
}

/**
 * Start memory monitoring
 */
function startMemoryMonitoring(): void {
  if (
    typeof window === "undefined" ||
    !window.performance ||
    !(window.performance as any).memory
  )
    return;

  setInterval(() => {
    if (!isMonitoring) return;

    const memory = (window.performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / (1024 * 1024) : 0; // Convert to MB

    // Record metrics
    recordMetrics({
      frameRate: currentFrameRate,
      memoryUsage,
      renderTime: 0, // Will be updated by other monitoring
      scriptTime: 0,
      paintTime: 0,
      loadTime: 0,
      timestamp: Date.now(),
      deviceType: getDeviceType(),
      connectionType: getConnectionType(),
    });

    // Check for memory issues
    if (memoryUsage > performanceThresholds.maxMemoryUsage) {
      reportPerformanceIssue("memory", memoryUsage);
    }
  }, 5000); // Check every 5 seconds
}

/**
 * Record performance metrics
 */
export function recordMetrics(metrics: Partial<PerformanceMetrics>): void {
  if (!isMonitoring) return;

  const fullMetrics: PerformanceMetrics = {
    frameRate: currentFrameRate,
    memoryUsage: 0,
    renderTime: 0,
    scriptTime: 0,
    paintTime: 0,
    loadTime: 0,
    timestamp: Date.now(),
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
    ...metrics,
  };

  metricsHistory.push(fullMetrics);

  // Keep only the last 100 metrics to prevent memory issues
  if (metricsHistory.length > 100) {
    metricsHistory.shift();
  }
}

/**
 * Check performance against thresholds
 */
function checkPerformanceThresholds(): void {
  if (currentFrameRate < performanceThresholds.minFrameRate) {
    reportPerformanceIssue("frameRate", currentFrameRate);
  } else if (currentFrameRate < performanceThresholds.warningFrameRate) {
    logPerformanceWarning("frameRate", currentFrameRate);
  }
}

/**
 * Report a performance issue
 */
function reportPerformanceIssue(metric: string, value: number): void {
  const issue = {
    metric,
    value,
    threshold:
      metric === "frameRate"
        ? performanceThresholds.minFrameRate
        : performanceThresholds.maxMemoryUsage,
    timestamp: Date.now(),
    deviceType: getDeviceType(),
  };

  // In production, you might send this to analytics
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `⚠️ Performance issue: ${metric} = ${value} (threshold: ${issue.threshold})`,
    );
  }

  // Trigger performance optimization
  optimizePerformance(metric, value);
}

/**
 * Log a performance warning
 */
function logPerformanceWarning(metric: string, value: number): void {
  if (process.env.NODE_ENV !== "production") {
    console.log(`ℹ️ Performance warning: ${metric} = ${value}`);
  }
}

/**
 * Optimize performance based on current metrics
 */
function optimizePerformance(metric: string, value: number): void {
  switch (metric) {
    case "frameRate":
      if (value < performanceThresholds.minFrameRate) {
        // Reduce animation complexity
        reduceAnimations();
      }
      break;
    case "memory":
      if (value > performanceThresholds.maxMemoryUsage) {
        // Clean up memory
        cleanupMemory();
      }
      break;
  }
}

/**
 * Reduce animation complexity for better performance
 */
function reduceAnimations(): void {
  // This would be implemented based on your animation system
  // For example, with Framer Motion:
  if (typeof window !== "undefined") {
    // Disable complex animations on mobile
    const isMobile = getDeviceType() === "mobile";
    if (isMobile) {
      // You could set a global flag or modify animation props
      document.body.classList.add("reduce-animations");
    }
  }
}

/**
 * Clean up memory
 */
function cleanupMemory(): void {
  if (typeof window !== "undefined") {
    // Trigger garbage collection hints
    if (window.gc) {
      window.gc();
    }

    // Clear caches, remove unused event listeners, etc.
    // This is application-specific
  }
}

/**
 * Get current device type
 */
function getDeviceType(): PerformanceMetrics["deviceType"] {
  if (typeof window === "undefined") return "unknown";

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (isTouch) {
    if (width <= 768) return "mobile";
    if (width <= 1024) return "tablet";
  }

  return "desktop";
}

/**
 * Get current connection type
 */
function getConnectionType(): PerformanceMetrics["connectionType"] {
  if (typeof window === "undefined") return "unknown";

  const navigator = window.navigator as any;
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) return "unknown";

  if (connection.effectiveType === "4g" || connection.effectiveType === "3g") {
    return "cellular";
  }

  if (connection.effectiveType === "wifi") {
    return "wifi";
  }

  return connection.onLine ? "wifi" : "offline";
}

/**
 * Get current frame rate
 */
export function getCurrentFrameRate(): number {
  return currentFrameRate;
}

/**
 * Get performance metrics history
 */
export function getPerformanceHistory(): PerformanceMetrics[] {
  return [...metricsHistory];
}

/**
 * Get average metrics
 */
export function getAverageMetrics(): PerformanceMetrics {
  if (metricsHistory.length === 0) {
    return {
      frameRate: 60,
      memoryUsage: 0,
      renderTime: 0,
      scriptTime: 0,
      paintTime: 0,
      loadTime: 0,
      timestamp: Date.now(),
      deviceType: getDeviceType(),
      connectionType: getConnectionType(),
    };
  }

  const sum = metricsHistory.reduce(
    (acc, metrics) => {
      return {
        frameRate: acc.frameRate + metrics.frameRate,
        memoryUsage: acc.memoryUsage + metrics.memoryUsage,
        renderTime: acc.renderTime + metrics.renderTime,
        scriptTime: acc.scriptTime + metrics.scriptTime,
        paintTime: acc.paintTime + metrics.paintTime,
        loadTime: acc.loadTime + metrics.loadTime,
        timestamp: acc.timestamp,
        deviceType: acc.deviceType,
        connectionType: acc.connectionType,
      };
    },
    {
      frameRate: 0,
      memoryUsage: 0,
      renderTime: 0,
      scriptTime: 0,
      paintTime: 0,
      loadTime: 0,
      timestamp: 0,
      deviceType: "unknown",
      connectionType: "unknown",
    },
  );

  return {
    frameRate: sum.frameRate / metricsHistory.length,
    memoryUsage: sum.memoryUsage / metricsHistory.length,
    renderTime: sum.renderTime / metricsHistory.length,
    scriptTime: sum.scriptTime / metricsHistory.length,
    paintTime: sum.paintTime / metricsHistory.length,
    loadTime: sum.loadTime / metricsHistory.length,
    timestamp: Date.now(),
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
  };
}

/**
 * Check if performance is acceptable
 */
export function isPerformanceAcceptable(): boolean {
  const avgMetrics = getAverageMetrics();

  return (
    avgMetrics.frameRate >= performanceThresholds.minFrameRate &&
    avgMetrics.memoryUsage <= performanceThresholds.maxMemoryUsage
  );
}

/**
 * Get performance score (0-100)
 */
export function getPerformanceScore(): number {
  const avgMetrics = getAverageMetrics();

  // Normalize metrics to 0-100 scale
  const frameRateScore = Math.min(100, (avgMetrics.frameRate / 60) * 100);
  const memoryScore = Math.max(
    0,
    100 - (avgMetrics.memoryUsage / performanceThresholds.maxMemoryUsage) * 100,
  );

  // Weighted average
  return Math.round(frameRateScore * 0.7 + memoryScore * 0.3);
}

/**
 * Performance optimization tips
 */
export function getPerformanceTips(): string[] {
  const tips: string[] = [];
  const avgMetrics = getAverageMetrics();

  if (avgMetrics.frameRate < performanceThresholds.warningFrameRate) {
    tips.push("Reduce animation complexity");
    tips.push("Simplify component rendering");
    tips.push("Use React.memo for expensive components");
  }

  if (avgMetrics.memoryUsage > performanceThresholds.warningMemoryUsage) {
    tips.push("Clean up unused event listeners");
    tips.push("Limit cached data");
    tips.push("Use lazy loading for non-critical components");
  }

  return tips;
}

// Auto-start monitoring in development
if (process.env.NODE_ENV !== "production") {
  startPerformanceMonitoring();
}
