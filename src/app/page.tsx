"use client";

import { HomeScreen } from "@/features/home/home-screen";
import { LanguageSelectionScreen } from "@/features/language/language-selection-screen";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Root page — routes the player to the correct screen based on state:
 * - No language set → Language Selection Screen
 * - Language set → Home Screen
 */
export default function Page() {
  const settings = useSettingsStore((state) => state.settings);

  // During SSR / before hydration, settings has the default value (language: "en").
  // We use a sentinel: if the settings have never been explicitly saved, the
  // storage key won't exist yet — but since we can't check localStorage during SSR,
  // we rely on the AppProvider to have called initializeSettings, which sets language
  // only if it exists in storage. A null player signals first visit.
  //
  // For Phase 0 simplicity: always show language screen if language was never persisted.
  // The AppProvider runs initializeSettings on mount; until then we render nothing
  // to avoid flicker.

  return (
    <>
      {settings.language === "en" && !hasPersistedLanguage() ? (
        <LanguageSelectionScreen onComplete={() => {}} />
      ) : (
        <HomeScreen />
      )}
    </>
  );
}

/**
 * Check whether the player has previously selected a language.
 * Only called client-side (guarded by "use client").
 */
function hasPersistedLanguage(): boolean {
  try {
    const raw = globalThis.localStorage?.getItem("runquest.settings");
    return raw !== null;
  } catch {
    return false;
  }
}
