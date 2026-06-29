import type { Metadata } from "next";
import { ResultScreen } from "@/features/result/result-screen";

export const metadata: Metadata = {
  title: "Race Results | RunQuest",
  description:
    "Review your race outcome and read your personalized story logs.",
};

export default function Page() {
  return <ResultScreen />;
}
