import type { Metadata } from "next";
import { RaceScreen } from "@/features/race/race-screen";

export const metadata: Metadata = {
  title: "Live Simulation | RunQuest",
  description: "Live physics and stats simulation of today's race.",
};

export default function Page() {
  return <RaceScreen />;
}
