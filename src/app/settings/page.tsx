import dynamic from "next/dynamic";

const SettingsScreen = dynamic(
  () => import("@/features/settings/settings-screen").then((mod) => mod.SettingsScreen),
);

export const metadata = {
  title: "RunQuest - Settings & Preferences",
  description:
    "Configure your language, sound, and running preference sorting settings.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
