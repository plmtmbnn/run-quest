"use client";

import { motion } from "framer-motion";
import { ArrowRight, Compass, Flame, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import { storageRepository } from "@/storage/storage-repository";
import { useSettingsStore } from "@/store/settings-store";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t, language } = useTranslation();
  const { setLanguage } = useSettingsStore();
  const { playSound } = useSound();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      titleKey: "onboarding.slide_1.title",
      subtitleKey: "onboarding.slide_1.subtitle",
      contentKey: "onboarding.slide_1.content",
      icon: <Flame className="w-12 h-12 text-orange-500 animate-pulse" />,
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      titleKey: "onboarding.slide_2.title",
      subtitleKey: "onboarding.slide_2.subtitle",
      contentKey: "onboarding.slide_2.content",
      icon: <Compass className="w-12 h-12 text-blue-500" />,
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      titleKey: "onboarding.slide_3.title",
      subtitleKey: "onboarding.slide_3.subtitle",
      contentKey: "onboarding.slide_3.content",
      icon: <HelpCircle className="w-12 h-12 text-emerald-500" />,
      color: "from-emerald-500/20 to-teal-500/20",
    },
  ];

  const handleNext = () => {
    playSound("click");
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Save default settings (retaining chosen language) to mark onboarding as complete
      storageRepository.saveSettings({
        version: 1,
        theme: "system",
        language,
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col justify-between p-6"
    >
      {/* Header Info with Language Toggle */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full pt-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-650">
          {t("onboarding.header" as TranslationKey)}
        </span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full text-[10px]">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setLanguage("en");
            }}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              language === "en"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setLanguage("id");
            }}
            className={`px-3 py-1 rounded-full font-bold transition-all ${
              language === "id"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ID
          </button>
        </div>
      </header>

      {/* Main Slide Card Container */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5E7EB] dark:border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col min-h-[420px]">
          {/* Top visual graphic area */}
          <div
            className={`h-40 bg-gradient-to-br ${activeSlide.color} flex items-center justify-center border-b border-gray-100`}
          >
            {activeSlide.icon}
          </div>

          {/* Slide Text Content */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black font-heading text-gray-900 dark:text-gray-50 leading-tight">
                {t(activeSlide.titleKey as TranslationKey)}
              </h2>
              <p className="text-sm font-semibold text-gray-550 dark:text-gray-300 leading-snug">
                {t(activeSlide.subtitleKey as TranslationKey)}
              </p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {t(activeSlide.contentKey as TranslationKey)}
              </p>
            </div>

            {/* Carousel indicator dots */}
            <div className="flex gap-2 justify-center mt-6">
              {slides.map((slide, idx) => (
                <button
                  key={slide.titleKey}
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
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-base py-4 rounded-full transition duration-200 flex items-center justify-center gap-2"
        >
          <span>
            {currentSlide === slides.length - 1
              ? t("onboarding.start" as TranslationKey)
              : t("onboarding.next" as TranslationKey)}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </motion.div>
  );
}
