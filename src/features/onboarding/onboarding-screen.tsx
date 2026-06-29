"use client";

import { ArrowRight, Compass, Flame, HelpCircle } from "lucide-react";
import { useState } from "react";
import { storageRepository } from "@/storage/storage-repository";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to RunQuest",
      subtitle: "Your daily offline-first running simulation game.",
      content:
        "Every day presents a brand new, procedurally generated running challenge. Step into the shoes of a runner preparing for the ultimate run.",
      icon: <Flame className="w-12 h-12 text-orange-500 animate-pulse" />,
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      title: "How to Play",
      subtitle: "Manage your assets, mindset, and physical thresholds.",
      content:
        "Choose the perfect shoes for the weather and road surfaces. Pack nutrition, pick your pacing strategy, and maintain focus to finish under target time.",
      icon: <Compass className="w-12 h-12 text-blue-500" />,
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      title: "What to Expect",
      subtitle: "Deterministic physics, story events, and results sharing.",
      content:
        "Watch the race unfold live. Read the dynamic story narrative generated from your decisions. Download your beautiful Share Card to show off your rank!",
      icon: <HelpCircle className="w-12 h-12 text-emerald-500" />,
      color: "from-emerald-500/20 to-teal-500/20",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Save default settings (English theme/etc.) to mark onboarding as complete
      storageRepository.saveSettings({
        version: 1,
        theme: "system",
        language: "en",
        reducedMotion: false,
        sound: true,
        preferences: {
          preferredSurface: "any",
          preferredDistance: "any",
        },
      });
      onComplete();
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col justify-between p-6">
      {/* Header Info */}
      <header className="text-center pt-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-650">
          RunQuest Onboarding
        </span>
      </header>

      {/* Main Slide Card Container */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8">
        <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col min-h-[420px]">
          {/* Top visual graphic area */}
          <div
            className={`h-40 bg-gradient-to-br ${activeSlide.color} flex items-center justify-center border-b border-gray-100`}
          >
            {activeSlide.icon}
          </div>

          {/* Slide Text Content */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black font-heading text-gray-900 leading-tight">
                {activeSlide.title}
              </h2>
              <p className="text-sm font-semibold text-gray-505 leading-snug">
                {activeSlide.subtitle}
              </p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {activeSlide.content}
              </p>
            </div>

            {/* Carousel indicator dots */}
            <div className="flex gap-2 justify-center mt-6">
              {slides.map((slide, idx) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "bg-indigo-600 w-6" : "bg-gray-200"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Actions footer */}
      <footer className="max-w-md mx-auto w-full pb-8">
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-base py-4 rounded-full transition duration-200 flex items-center justify-center gap-2"
        >
          <span>
            {currentSlide === slides.length - 1 ? "Start Running" : "Next"}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
