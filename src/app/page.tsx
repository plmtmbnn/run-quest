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
    // After hydration, check whether the player has completed onboarding (has saved settings).
    const hasSavedSettings =
      globalThis.localStorage?.getItem("runquest.settings") !== null;

    setScreen(hasSavedSettings ? "home" : "onboarding");
  }, []);

  if (screen === "loading") {
    // Render nothing until the client has checked localStorage.
    // This avoids the SSR/client hydration mismatch.
    return null;
  }

  if (screen === "onboarding") {
    return <OnboardingScreen onComplete={() => setScreen("home")} />;
  }

  return <HomeScreen />;
}
