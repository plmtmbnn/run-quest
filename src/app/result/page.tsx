import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ResultScreen = dynamic(() =>
  import("@/features/result/result-screen").then((mod) => mod.ResultScreen),
);

export const metadata: Metadata = {
  title: "Race Results | RunQuest",
  description:
    "Review your race outcome and read your personalized story logs.",
};

export default function Page() {
  return <ResultScreen />;
}
