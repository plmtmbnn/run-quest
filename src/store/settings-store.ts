import { create } from "zustand";
import type { CurrencyCode } from "@/economy/currency-config";
import type { Language } from "@/i18n/types";
import { clearAllPBs } from "@/runner/personal-best";
import { resetRunnerState } from "@/runner/runner-persistence";
import { useShopStore } from "@/shop/shop-store";
import { useSocialStore } from "@/social/social-store";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredSettings } from "@/storage/types";
import { useGameStore } from "@/store/game-store";
import { usePreparationStore } from "@/store/preparation-store";
import { useStoryStore } from "@/story/story-store";

const DEFAULT_SETTINGS: StoredSettings = {
  version: 1,
  theme: "system",
  language: "en",
  reducedMotion: false,
  sound: true,
  hapticFeedback: true,
  hasCompletedOnboarding: false,
  gameMode: "career",
  preferredCurrency: "USD",
  preferences: {
    preferredSurface: "any",
    preferredDistance: "any",
  },
  // New flag for Firebase sync
  syncWithFirebase: true,
  parallaxEnabled: true,
  weatherEffectsEnabled: true,
};

export interface SettingsState {
  settings: StoredSettings;
  /** Load settings from storage. Falls back to defaults if not found. */
  initializeSettings: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setReducedMotion: (value: boolean) => void;
  setParallaxEnabled: (value: boolean) => void;
  setWeatherEffectsEnabled: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setHapticFeedback: (value: boolean) => void;
  setPreferredCurrency: (currency: CurrencyCode) => void;
  setGameMode: (mode: "easy" | "career" | "focus" | "season") => void;
  setSyncEnabled: (enabled: boolean) => void;
  setPreferences: (prefs: StoredSettings["preferences"]) => void;
  completeOnboarding: () => void;
  resetAllData: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  initializeSettings() {
    const stored = storageRepository.loadSettings();
    if (stored) {
      set({ settings: stored });
    } else {
      storageRepository.saveSettings(DEFAULT_SETTINGS);
    }
  },

  setLanguage(language) {
    const updated = { ...get().settings, language };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setTheme(theme) {
    const updated = { ...get().settings, theme };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setReducedMotion(reducedMotion) {
    const updated = { ...get().settings, reducedMotion };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setParallaxEnabled(parallaxEnabled) {
    const updated = { ...get().settings, parallaxEnabled };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setWeatherEffectsEnabled(weatherEffectsEnabled) {
    const updated = { ...get().settings, weatherEffectsEnabled };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setSound(sound) {
    const updated = { ...get().settings, sound };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setHapticFeedback(hapticFeedback) {
    const updated = { ...get().settings, hapticFeedback };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setPreferredCurrency(preferredCurrency) {
    const updated = { ...get().settings, preferredCurrency };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setGameMode(gameMode: "easy" | "career" | "focus" | "season") {
    const updated = { ...get().settings, gameMode };
    storageRepository.saveSettings(updated);
    set({ settings: updated });

    if (gameMode === "easy" || gameMode === "focus") {
      import("@/shop/shop-store").then(({ useShopStore }) => {
        useShopStore.getState().unlockAllItems();
      });
    }
  },

  setSyncEnabled(enabled) {
    const updated = { ...get().settings, syncWithFirebase: enabled };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setPreferences(preferences) {
    const updated = { ...get().settings, preferences };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  completeOnboarding() {
    const updated = { ...get().settings, hasCompletedOnboarding: true };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  resetAllData() {
    const currentSettings = get().settings;

    // Preserve these user preferences across resets
    const preservedPreferences = {
      language: currentSettings.language,
      sound: currentSettings.sound,
      hapticFeedback: currentSettings.hapticFeedback,
      theme: currentSettings.theme,
      preferredCurrency: currentSettings.preferredCurrency,
    };

    // 1. Reset all in-memory sub-stores
    try {
      useShopStore.getState().resetInventory();
      usePreparationStore.getState().reset();
      useSocialStore.getState().resetSocial();
      useStoryStore.getState().resetStoryProgress();
      useGameStore.getState().clearState();
      resetRunnerState();
      clearAllPBs();
    } catch (e) {
      console.warn("Error resetting in-memory stores:", e);
    }

    // 2. Clear all game data from storage completely
    storageRepository.clearAll();

    // 3. Restore preserved preferences
    const restoredSettings: StoredSettings = {
      ...DEFAULT_SETTINGS,
      ...preservedPreferences,
      hasCompletedOnboarding: false,
    };
    storageRepository.saveSettings(restoredSettings);

    // 4. Redirect to root to reinitialize fresh game state
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
}));
