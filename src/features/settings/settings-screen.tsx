"use client";

import { ArrowLeft, ShieldAlert, Trash2, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";

export function SettingsScreen() {
  const router = useRouter();
  const { settings, setSound, setPreferences, resetAllData } =
    useSettingsStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handlePreferencesChange = (
    key: "preferredSurface" | "preferredDistance",
    value: string,
  ) => {
    const updated = {
      ...settings.preferences,
      [key]: value,
    };
    setPreferences(updated);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-heading">
              Settings
            </h1>
            <p className="text-xs text-gray-500">
              Customize your preferences and app configurations
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col gap-8">
        {/* General Settings */}
        <section className="bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">
            General
          </h2>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Volume2 className="h-4.5 w-4.5 text-gray-550" /> Sound Effects
              </span>
              <span className="text-xs text-gray-400">
                Play sound indicators during race simulation
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSound(!settings.sound)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                settings.sound ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.sound ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <hr className="border-[#E5E7EB]" />

          {/* Language selection (English Only for now) */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">Language</span>
              <span className="text-xs text-gray-400">
                System and game interface translation language
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                className="bg-blue-50 border-2 border-blue-500 text-blue-700 text-sm font-bold py-3 rounded-2xl transition-all"
              >
                English (EN)
              </button>
              <button
                type="button"
                disabled
                className="bg-gray-50 border-2 border-gray-200 text-gray-450 text-sm font-bold py-3 rounded-2xl cursor-not-allowed opacity-60 flex items-center justify-center gap-1.5"
              >
                🔒 Bahasa Indonesia (ID)
              </button>
            </div>
          </div>
        </section>

        {/* Running Preferences */}
        <section className="bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">
            Race Preferences
          </h2>
          <p className="text-xs text-gray-400 -mt-2">
            Races matching these preferences will sort to the top of your Daily
            Race Board.
          </p>

          {/* Preferred Surface */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-900">
              Preferred Surface
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {["any", "road", "trail", "track"].map((surface) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() =>
                    handlePreferencesChange("preferredSurface", surface)
                  }
                  className={`text-xs font-bold py-3 rounded-2xl transition-all border-2 ${
                    settings.preferences.preferredSurface === surface
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {surface.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Distance */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-900">
              Preferred Distance
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {["any", "short", "medium", "long"].map((distance) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() =>
                    handlePreferencesChange("preferredDistance", distance)
                  }
                  className={`text-xs font-bold py-3 rounded-2xl transition-all border-2 ${
                    settings.preferences.preferredDistance === distance
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {distance === "short"
                    ? "5K"
                    : distance === "medium"
                      ? "10K"
                      : distance === "long"
                        ? "15K+"
                        : "ANY"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50/50 rounded-3xl border-2 border-red-200 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-red-650" /> Danger Zone
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex flex-col max-w-[70%]">
              <span className="text-sm font-bold text-gray-900">
                Reset All Data
              </span>
              <span className="text-xs text-gray-500 leading-relaxed">
                Permanently delete your profile, stats, run history, and reset
                your daily board entries. This cannot be undone.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Reset Data
            </button>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-red-200 p-6 max-w-sm w-full shadow-lg flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="bg-red-100 p-3 rounded-full text-red-650 mb-2">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 font-heading">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This will wipe all records of your running journey. All stats,
                completion histories, and preferences will be permanently
                destroyed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetAllData}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-sm"
              >
                Yes, WIPE ALL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
