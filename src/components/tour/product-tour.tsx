"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS, TooltipRenderProps, EventData } from "react-joyride";
import { X } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { useTranslation, type TranslationKey } from "@/i18n/use-translation";

function Tooltip({
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) {
  const { playSound } = useSound();
  const { t } = useTranslation();

  return (
    <div
      {...tooltipProps}
      className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-2xl shadow-xl w-72 md:w-80 flex flex-col overflow-hidden"
    >
      <div className="px-4 py-3 bg-slate-100/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        {step.title && (
          <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white truncate pr-2">
            {step.title}
          </h3>
        )}
        <button
          {...closeProps}
          onClick={(e) => {
            playSound("click");
            if (closeProps.onClick) {
              closeProps.onClick(e);
            }
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {step.content}
        </p>
      </div>

      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
          {t("tour.step_progress" as TranslationKey, { current: index + 1, total: size })}
        </div>
        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              onClick={(e) => {
                playSound("click");
                if (backProps.onClick) {
                  backProps.onClick(e);
                }
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors active:scale-95"
            >
              {t("tour.back" as TranslationKey)}
            </button>
          )}
          <button
            {...primaryProps}
            onClick={(e) => {
              playSound("click");
              if (primaryProps.onClick) {
                primaryProps.onClick(e);
              }
            }}
            className="px-3.5 py-1.5 text-xs font-black rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            {isLastStep ? t("tour.finish" as TranslationKey) : t("tour.next" as TranslationKey)}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductTourProps {
  run: boolean;
  onFinish: () => void;
}

export function ProductTour({ run, onFinish }: ProductTourProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      options={{
        showProgress: true,
        zIndex: 10000,
      }}
      steps={[
        {
          target: "body",
          placement: "center",
          title: t("tour.welcome.title" as TranslationKey),
          content: t("tour.welcome.content" as TranslationKey),
          skipBeacon: true,
        },
        {
          target: "#tour-game-stats",
          title: t("tour.clock.title" as TranslationKey),
          content: t("tour.clock.content" as TranslationKey),
        },
        {
          target: "#tour-health-status",
          title: t("tour.health.title" as TranslationKey),
          content: t("tour.health.content" as TranslationKey),
        },
        {
          target: "#tour-expenses",
          title: t("tour.expenses.title" as TranslationKey),
          content: t("tour.expenses.content" as TranslationKey),
        },
        {
          target: "#tour-daily-training",
          title: t("tour.training.title" as TranslationKey),
          content: t("tour.training.content" as TranslationKey),
        },
        {
          target: "#tour-race-calendar",
          title: t("tour.races.title" as TranslationKey),
          content: t("tour.races.content" as TranslationKey),
        },
        {
          target: "#tour-rest-controls",
          title: t("tour.rest.title" as TranslationKey),
          content: t("tour.rest.content" as TranslationKey),
        }
      ]}
      tooltipComponent={Tooltip}
      styles={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        }
      }}
    />
  );
}
