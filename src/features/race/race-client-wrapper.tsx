"use client";

import dynamic from "next/dynamic";

export const RaceScreenClient = dynamic(
  () => import("./race-screen").then((mod) => mod.RaceScreen),
  { ssr: false },
);
