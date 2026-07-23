"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";
import { migrateToShopSystem } from "@/shop/shop-migration";
import { useShopStore } from "@/shop/shop-store";
import { useTimelineStore } from "@/store/timeline-store";

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Eagerly initialize stores before first React render on the client.
 * This prevents GameClock and other components from showing skeleton states
 * when localStorage data is already available.
 */
if (typeof window !== "undefined") {
  // Synchronously hydrate all stores from localStorage on module load
  useSettingsStore.getState().initializeSettings();
  usePlayerStore.getState().initializePlayer();
  useTimelineStore.getState().initialize();
  migrateToShopSystem();
  useShopStore.getState().initializeInventory();
}

/**
 * AppProvider bootstraps the application on mount.
 * It initializes player identity and settings from LocalStorage.
 * Must wrap the entire application inside the root layout.
 */
export function AppProvider({ children }: AppProviderProps) {
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);
  const initializeSettings = useSettingsStore(
    (state) => state.initializeSettings,
  );
  const theme = useSettingsStore((state) => state.settings.theme);

  useEffect(() => {
    // Re-run initialization to catch any edge cases or updates
    initializeSettings();
    initializePlayer();
    useTimelineStore.getState().initialize();
    migrateToShopSystem();
    useShopStore.getState().initializeInventory();
  }, [initializeSettings, initializePlayer]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const isDark =
        theme === "system"
          ? mediaQuery.matches
          : theme === "dark";
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  return <>{children}</>;
}

