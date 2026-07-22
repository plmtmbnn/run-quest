import { useCallback } from "react";
import { useSettingsStore } from "@/store/settings-store";

export type HapticPattern =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning"
  | "endorphinRush";

/**
 * Custom hook for haptic feedback
 * Provides tactile feedback on mobile devices
 */
export function useHaptic() {
  const hapticEnabled =
    useSettingsStore((state) => state.settings.hapticFeedback) ?? true;

  const triggerHaptic = useCallback(
    (pattern: HapticPattern = "medium") => {
      if (!hapticEnabled) return;

      // Check if vibration API is available
      if (
        typeof window === "undefined" ||
        !window.navigator ||
        !window.navigator.vibrate
      ) {
        return;
      }

      try {
        switch (pattern) {
          case "light":
            // Quick tap
            window.navigator.vibrate(10);
            break;

          case "medium":
            // Standard tap
            window.navigator.vibrate(20);
            break;

          case "heavy":
            // Strong tap
            window.navigator.vibrate(30);
            break;

          case "success":
            // Double tap pattern
            window.navigator.vibrate([10, 50, 20]);
            break;

          case "error":
            // Triple buzz pattern
            window.navigator.vibrate([20, 100, 20, 100, 20]);
            break;

          case "warning":
            // Single strong buzz
            window.navigator.vibrate([30, 100, 30]);
            break;

          case "endorphinRush":
            // Escalating pattern for endorphin rush
            window.navigator.vibrate([30, 50, 40, 50, 50]);
            break;

          default:
            window.navigator.vibrate(20);
        }
      } catch (e) {
        // Silently fail if vibration fails
        console.debug("Haptic feedback failed:", e);
      }
    },
    [hapticEnabled],
  );

  return { triggerHaptic, hapticEnabled };
}
