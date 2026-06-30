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
      icon: <Flame className="w-16 h-16 text-orange-500 animate-pulse" />,
      color: "from-orange-500/10 via-orange-100/20 to-amber-200/10",
      accent: "border-orange-200",
    },
    {
      titleKey: "onboarding.slide_2.title",
      subtitleKey: "onboarding.slide_2.subtitle",
      contentKey: "onboarding.slide_2.content",
      icon: <Compass className="w-16 h-16 text-blue-500 animate-bounce" style={{ animationDuration: '3s' }} />,
      color: "from-blue-500/10 via-blue-100/20 to-indigo-200/10",
      accent: "border-blue-200",
    },
    {
      titleKey: "onboarding.slide_3.title",
      subtitleKey: "onboarding.slide_3.subtitle",
      contentKey: "onboarding.slide_3.content",
      icon: <HelpCircle className="w-16 h-16 text-emerald-500" />,
      color: "from-emerald-500/10 via-emerald-100/20 to-teal-200/10",
      accent: "border-emerald-200",
    },
  ];

  const handleNext = () => {
    playSound("click");
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      storageRepository.saveSettings({
        version: 1,
        theme: "light", // Forced light theme globally
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
      className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-100 to-zinc-50 flex flex-col justify-between p-6 relative overflow-hidden"
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />

      {/* Header Info with Language Toggle */}
      <header className="flex justify-between items-center max-w-md mx-auto w-full pt-8 z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-800">
            RunQuest
          </span>
        </div>

        <div className="flex gap-0.5 bg-gray-200/70 p-1 rounded-full text-[10px] border border-gray-300/30">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              setLanguage("en");
            }}
            className={`px-3.5 py-1 rounded-full font-black transition-all ${
              language === "en"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
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
            className={`px-3.5 py-1 rounded-full font-black transition-all ${
              language === "id"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            ID
          </button>
        </div>
      </header>

      {/* Main Slide Card Container */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8 z-10">
        <div className={`bg-white rounded-3xl border-2 shadow-[0_20px_50px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col min-h-[440px] transition-all duration-300 border-[#E5E7EB]`}>
          
          {/* Top visual graphic area */}
          <div
            className={`h-48 bg-gradient-to-b ${activeSlide.color} flex items-center justify-center border-b border-gray-150`}
          >
            <motion.div
              key={currentSlide}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 120 }}
            >
              {activeSlide.icon}
            </motion.div>
          </div>

          {/* Slide Text Content */}
          <div className="flex-1 p-8 flex flex-col justify-between">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-2.5"
            >
              <h2 className="text-2xl font-black font-heading text-gray-900 leading-tight">
                {t(activeSlide.titleKey as TranslationKey)}
              </h2>
              <p className="text-sm font-bold text-blue-600 leading-snug">
                {t(activeSlide.subtitleKey as TranslationKey)}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {t(activeSlide.contentKey as TranslationKey)}
              </p>
            </motion.div>

            {/* Carousel indicator dots */}
            <div className="flex gap-2 justify-center mt-6">
              {slides.map((slide, idx) => (
                <button
                  key={slide.titleKey}
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setCurrentSlide(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "bg-blue-600 w-7"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Actions footer */}
      <footer className="max-w-md mx-auto w-full pb-8 z-10">
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-750 active:scale-[0.98] text-white font-bold text-base py-4 rounded-full transition duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <span>
            {currentSlide === slides.length - 1
              ? t("onboarding.start" as TranslationKey)
              : t("onboarding.next" as TranslationKey)}
          </span>
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </button>
      </footer>
    </motion.div>
  );
}
