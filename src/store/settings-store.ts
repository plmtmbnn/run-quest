import { create } from "zustand";
import type { CurrencyCode } from "@/economy/currency-config";
import type { Language } from "@/i18n/types";
import { storageRepository } from "@/storage/storage-repository";
import type { StoredSettings } from "@/storage/types";

const DEFAULT_SETTINGS: StoredSettings = {
  version: 1,
  theme: "system",
  language: "en",
  reducedMotion: false,
  sound: true,
  preferredCurrency: "USD",
  preferences: {
    preferredSurface: "any",
    preferredDistance: "any",
  },
};

export interface SettingsState {
  settings: StoredSettings;
  /** Load settings from storage. Falls back to defaults if not found. */
  initializeSettings: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setReducedMotion: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setPreferredCurrency: (currency: CurrencyCode) => void;
  setPreferences: (prefs: StoredSettings["preferences"]) => void;
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

  setSound(sound) {
    const updated = { ...get().settings, sound };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setPreferredCurrency(preferredCurrency) {
    const updated = { ...get().settings, preferredCurrency };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  setPreferences(preferences) {
    const updated = { ...get().settings, preferences };
    storageRepository.saveSettings(updated);
    set({ settings: updated });
  },

  resetAllData() {
    storageRepository.clearAll();
    globalThis.location.reload();
  },
}));
