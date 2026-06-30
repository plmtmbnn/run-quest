import type { Metadata } from "next";
import { RaceAnalysisScreen } from "@/features/briefing/race-analysis-screen";

export const metadata: Metadata = {
  title: "Race Analysis | RunQuest",
  description:
    "Review today's running challenge details, course segments, and dynamic weather timeline.",
};

export default function Page() {
  return <RaceAnalysisScreen />;
}
