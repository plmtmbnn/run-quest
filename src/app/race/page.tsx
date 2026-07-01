import type { Metadata } from "next";
import dynamic from "next/dynamic";

const RaceScreen = dynamic(() =>
  import("@/features/race/race-screen").then((mod) => mod.RaceScreen),
);

export const metadata: Metadata = {
  title: "Live Simulation | RunQuest",
  description: "Live physics and stats simulation of today's race.",
};

export default function Page() {
  return <RaceScreen />;
}
