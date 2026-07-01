import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RaceAnalysisScreen = dynamic(() =>
  import("@/features/briefing/race-analysis-screen").then(
    (mod) => mod.RaceAnalysisScreen,
  ),
);

export const metadata: Metadata = {
  title: "Race Analysis | RunQuest",
  description:
    "Review today's running challenge details, course segments, and dynamic weather timeline.",
};

export default function Page() {
  return <RaceAnalysisScreen />;
}
