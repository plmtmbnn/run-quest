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

  useEffect(() => {
    initializeSettings();
    initializePlayer();
  }, [initializeSettings, initializePlayer]);

  return <>{children}</>;
}
