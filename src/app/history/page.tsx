import dynamic from "next/dynamic";

const HistoryScreen = dynamic(() =>
  import("@/features/history/history-screen").then((mod) => mod.HistoryScreen),
);

export const metadata = {
  title: "RunQuest - Race History",
  description: "View your past challenge outcomes, records, and training logs.",
};

export default function HistoryPage() {
  return <HistoryScreen />;
}
