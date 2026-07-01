"use client";

import dynamic from "next/dynamic";

const PreparationScreen = dynamic(
  () =>
    import("@/features/preparation/preparation-screen").then(
      (mod) => mod.PreparationScreen,
    ),
  { ssr: false },
);

export default function PreparationPage() {
  return <PreparationScreen />;
}
