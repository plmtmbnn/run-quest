import type { Metadata } from "next";
import { RaceScreenClient } from "@/features/race/race-client-wrapper";

export const metadata: Metadata = {
  title: "Live Simulation | RunQuest",
  description: "Live physics and stats simulation of today's race.",
};

export default function Page() {
  return <RaceScreenClient />;
}
