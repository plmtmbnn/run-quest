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

type AppScreen = "loading" | "onboarding" | "home";

/**
 * Root page — routes the player to the correct screen.
 *
 * Rendering is deferred to the client to avoid SSR/hydration mismatches
 * when reading from LocalStorage. We show nothing until the stores have
 * been initialized by AppProvider's useEffect.
 */
export default function Page() {
  const [screen, setScreen] = useState<AppScreen>("loading");

  useEffect(() => {
    // After hydration, check whether the player has completed onboarding.
    const stored = globalThis.localStorage?.getItem("runquest.settings");
    let hasCompleted = false;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        hasCompleted = parsed.hasCompletedOnboarding === true;
      } catch {
        hasCompleted = false;
      }
    }

    setScreen(hasCompleted ? "home" : "onboarding");
  }, []);

  if (screen === "loading") {
    // Render a minimal skeleton loader until the client has checked localStorage.
    // This avoids the SSR/client hydration mismatch while providing visual feedback.
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm animate-pulse">Loading RunQuest...</div>
      </div>
    );
  }

  if (screen === "onboarding") {
    return <OnboardingScreen onComplete={() => setScreen("home")} />;
  }

  return <HomeScreen />;
}
