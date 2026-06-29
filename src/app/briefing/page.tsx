import type { Metadata } from "next";
import { BriefingScreen } from "@/features/briefing/briefing-screen";

export const metadata: Metadata = {
  title: "Daily Briefing | RunQuest",
  description:
    "Review today's running challenge details and target benchmarks.",
};

export default function Page() {
  return <BriefingScreen />;
}
