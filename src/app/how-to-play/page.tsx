import dynamic from "next/dynamic";

const HowToPlayScreen = dynamic(
  () =>
    import("@/features/how-to-play/how-to-play-screen").then(
      (mod) => mod.HowToPlayScreen,
    ),
);

export const metadata = {
  title: "RunQuest - How to Play",
  description:
    "Learn how to play RunQuest: Race Scheduling, Work Economy, Training, Shop & Nutrition, and Pacing Strategy.",
};

export default function HowToPlayPage() {
  return <HowToPlayScreen />;
}
