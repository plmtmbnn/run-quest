"use client";

import { motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useShareCard } from "@/hooks/use-share-card";
import { useSound } from "@/hooks/use-sound";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

const MODAL_ID = "share-modal";
const MODAL_TITLE_ID = "share-modal-title";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  shareTitle: string;
  fileName: string;
  children: React.ReactNode;
}

export function ShareModal({
  isOpen,
  onClose,
  shareText,
  shareTitle,
  fileName,
  children,
}: ShareModalProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const cardRef = useRef<HTMLDivElement>(null);
  const { isSharing, copied, copyText, downloadPng, nativeShare } =
    useShareCard();

  // Prevent background scrolling when open + Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    playSound("click");
    copyText(shareText);
  };

  const handleDownload = () => {
    playSound("click");
    downloadPng(cardRef, fileName);
  };

  const handleNativeShare = () => {
    playSound("click");
    nativeShare(cardRef, shareText, shareTitle);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
        id={MODAL_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 sm:p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative flex flex-col gap-5 md:gap-6 max-h-[92dvh] overflow-y-auto scrollbar-none"
      >
        {/* Glow Aura Background Effect */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row & Close Button */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-blue-500/15 rounded-2xl border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 shrink-0 shadow-sm">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3
                id={MODAL_TITLE_ID}
                className="text-lg sm:text-xl font-black font-heading tracking-tight text-slate-900 dark:text-white truncate"
              >
                {t("share.modal.title" as TranslationKey)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t("share.modal.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Preview Container */}
        <div className="flex flex-col gap-2 w-full relative z-10">
          <div className="flex items-center gap-2 justify-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <span className="h-px bg-slate-200 dark:border-slate-800 dark:bg-slate-800 flex-1" />
            <span>Victory Card Preview</span>
            <span className="h-px bg-slate-200 dark:border-slate-800 dark:bg-slate-800 flex-1" />
          </div>

          <div className="relative group bg-slate-950 rounded-2xl sm:rounded-3xl p-3 sm:p-5 overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-inner flex justify-center w-full">
            {/* Subtle Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

            {/* Interactive Card Scaler */}
            <div className="origin-center scale-[0.42] xs:scale-[0.48] sm:scale-[0.56] md:scale-[0.62] my-[-125px] xs:my-[-105px] sm:my-[-85px] md:my-[-70px] transition-transform duration-300 z-10">
              {/* High-resolution screenshot card container */}
              <div
                ref={cardRef}
                className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900 transition-shadow duration-300"
              >
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Sharing Actions Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 relative z-10 pt-1">
          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`group flex flex-col items-center justify-center gap-1.5 p-3 sm:p-3.5 rounded-2xl border transition-all active:scale-95 min-h-[54px] ${
              copied
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 group-hover:scale-110 transition-transform shadow-xs">
              {copied ? (
                <Check className="h-4.5 w-4.5 text-emerald-500" />
              ) : (
                <Copy className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
              )}
            </div>
            <span className="text-[10px] text-center font-black uppercase tracking-wider block truncate max-w-full">
              {copied
                ? t("share.copied" as TranslationKey)
                : t("share.button.copy_text" as TranslationKey)}
            </span>
          </button>

          {/* Download PNG Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isSharing}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[54px]"
          >
            <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 group-hover:scale-110 transition-transform shadow-xs">
              {isSharing ? (
                <Loader2 className="h-4.5 w-4.5 text-indigo-500 animate-spin" />
              ) : (
                <Download className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
              )}
            </div>
            <span className="text-[10px] text-center font-black uppercase tracking-wider block truncate max-w-full">
              {t("share.button.download" as TranslationKey)}
            </span>
          </button>

          {/* Native Share Button (Primary) */}
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={isSharing}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 border border-indigo-400/40 min-h-[54px]"
          >
            <div className="p-1.5 rounded-xl bg-white/20 group-hover:scale-110 transition-transform border border-white/20">
              <Share2 className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-[10px] text-center font-black uppercase tracking-wider text-white block truncate max-w-full">
              {t("share.button.share" as TranslationKey)}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
