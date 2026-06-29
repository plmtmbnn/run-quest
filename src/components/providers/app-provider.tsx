"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/player-store";
import { useSettingsStore } from "@/store/settings-store";

interface AppProviderProps {
  children: React.ReactNode;
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
    initializeSettings();
    initializePlayer();
  }, [initializeSettings, initializePlayer]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
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
