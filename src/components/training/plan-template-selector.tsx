"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/use-translation";
import type { PlanTemplate } from "@/training/training-types";
import { PLAN_TEMPLATES } from "@/training/plan-templates";

interface PlanTemplateSelectorProps {
  currentFitness: number;
  currentFatigue: number;
  onSelectTemplate: (template: PlanTemplate) => void;
  selectedTemplateId?: string;
}

export function PlanTemplateSelector({
  currentFitness,
  currentFatigue,
  onSelectTemplate,
  selectedTemplateId,
}: PlanTemplateSelectorProps) {
  const { t } = useTranslation();

  // Determine recommended template based on fitness/fatigue
  const getRecommendedTemplate = () => {
    if (currentFatigue > 70) {
      return "recovery"; // High fatigue - recovery week
    }
    if (currentFitness < 30) {
      return "beginner"; // Low fitness - beginner template
    }
    if (currentFitness >= 60 && currentFatigue <= 50) {
      return "performance"; // High fitness - performance template
    }
    return "base"; // Default - base building
  };

  const recommendedTemplateId = getRecommendedTemplate();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">
        {t("training.quick_templates")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {PLAN_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const isRecommended = recommendedTemplateId === template.id;

          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col gap-2 cursor-pointer ${isSelected ? 'lg:col-span-1' : ''}`}
            >
              <div
                onClick={() => onSelectTemplate(template)}
                className={`
                  p-4 rounded-2xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400'
                    : isRecommended
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-700/30 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {template.difficulty}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  {template.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">📊</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Fitness: {template.targetFitness}+
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500">😓</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Fatigue: {template.maxFatigue}-
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-500">🏃</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {template.totalVolume} km
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {template.weeklyActivities.map((activity, index) => {
                    const activityMeta: Record<string, string> = {
                      "Recovery Run": "🚶",
                      "Easy Run": "🏃",
                      "Tempo Run": "⚡",
                      "Interval Training": "🔥",
                      "Long Run": "🏃♂️",
                      "Hill Repeats": "⛰️",
                      "Strength Training": "💪",
                      "Mobility Session": "🧘",
                      "Full Rest": "😴",
                    };
                    return (
                      <span
                        key={index}
                        className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
                        title={activity}
                      >
                        {activityMeta[activity] || "❓"}
                      </span>
                    );
                  })}
                </div>

                {isRecommended && !isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      ✅ {t("training.recommended")}
                    </span>
                  </div>
                )}

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      ✓ {t("training.selected")}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => onSelectTemplate({} as PlanTemplate)}
          className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {t("training.create_custom_plan")}
        </button>
      </div>
    </div>
  );
}