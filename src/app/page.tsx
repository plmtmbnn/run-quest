"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HomeScreen = dynamic(
  () => import("@/features/home/home-screen").then((mod) => mod.HomeScreen),
  { ssr: false },
);
const OnboardingScreen = dynamic(
  () =>
    import("@/features/onboarding/onboarding-screen").then(
      (mod) => mod.OnboardingScreen,
    ),
  { ssr: false },
);
const FocusRaceScreen = dynamic(
  () =>
    import("@/features/focus-race/focus-race-screen").then(
      (mod) => mod.FocusRaceScreen,
    ),
  { ssr: false },
);

import { useSettingsStore } from "@/store/settings-store";

type AppScreen = "loading" | "onboarding" | "home" | "focus";

/**
 * Root page — routes the player to the correct screen.
 *
 * Rendering is deferred to the client to avoid SSR/hydration mismatches
 * when reading from LocalStorage. We show nothing until the stores have
 * been initialized by AppProvider's useEffect.
 */
export default function Page() {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const gameMode = useSettingsStore((state) => state.settings.gameMode);
  const hasCompletedOnboarding = useSettingsStore(
    (state) => state.settings.hasCompletedOnboarding,
  );

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setScreen("onboarding");
    } else if (gameMode === "focus") {
      setScreen("focus");
    } else {
      setScreen("home");
    }
  }, [hasCompletedOnboarding, gameMode]);

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm animate-pulse">
          Loading RunQuest...
        </div>
      </div>
    );
  }

  if (screen === "onboarding") {
    return (
      <OnboardingScreen
        onComplete={() => {
          const currentMode = useSettingsStore.getState().settings.gameMode;
          setScreen(currentMode === "focus" ? "focus" : "home");
        }}
      />
    );
  }

  if (screen === "focus") {
    return <FocusRaceScreen />;
  }

  return <HomeScreen />;
}
