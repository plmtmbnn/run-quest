"use client";

import { useTranslation } from "@/i18n/use-translation";
import type { TranslationKey } from "@/i18n/use-translation";

export interface BadgeProp {
  text: string;
  color: string;
}

export interface OptionCardProps {
  id: string;
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  badges?: BadgeProp[];
  isMultiSelect?: boolean;
  disabled?: boolean;
  className?: string;
  quantityControl?: {
    count: number;
    maxCount: number;
    onIncrease: () => void;
    onDecrease: () => void;
  };
}

export function OptionCard({
  id,
  selected,
  onClick,
  title,
  desc,
  badges = [],
  isMultiSelect = false,
  disabled = false,
  className = "",
  quantityControl,
}: OptionCardProps) {
  const { t } = useTranslation();
  return (
    <div
      id={id}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex w-full flex-col text-left rounded-[2rem] p-4 sm:p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.99] min-h-[120px] ${
        selected
          ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-500 dark:border-indigo-500 shadow-md shadow-indigo-500/10"
          : "bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
          : "cursor-pointer"
      } ${className}`}
    >
      <div className="flex w-full items-start justify-between mb-2 gap-2">
        <h3 className="font-heading font-black text-sm md:text-base text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        {/* Selection indicator */}
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-all mt-0.5 ${
            isMultiSelect ? "rounded-md" : "rounded-full"
          } ${
            selected
              ? "border-indigo-500 bg-indigo-500 text-white shadow-sm"
              : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-400"
          }`}
        >
          {selected && (
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Checked"
            >
              <title>Checked</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 flex-grow">
        {desc}
      </p>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {badges.map((badge) => (
            <span
              key={badge.text}
              className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${badge.color}`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      )}

      {selected && quantityControl && (
        <div
          className="mt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-3 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            {(t("preparation.qty_format" as TranslationKey) || "")
              .replace("{count}", String(quantityControl.count))
              .replace("{max}", String(quantityControl.maxCount))}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                quantityControl.onDecrease();
              }}
              disabled={quantityControl.count <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 disabled:opacity-40 font-mono font-bold text-base transition-all active:scale-95"
            >
              -
            </button>
            <span className="w-6 text-center font-mono font-bold text-sm text-slate-800 dark:text-white">
              {quantityControl.count}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                quantityControl.onIncrease();
              }}
              disabled={quantityControl.count >= quantityControl.maxCount || quantityControl.count >= 4}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 disabled:opacity-40 font-mono font-bold text-base transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
