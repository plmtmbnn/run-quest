import { motion } from "framer-motion";
import { Check, Copy, Download, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useShareCard } from "@/hooks/use-share-card";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const { isSharing, copied, copyText, downloadPng, nativeShare } =
    useShareCard();

  // Prevent background scrolling when open + Escape to close
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/75 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
        id={MODAL_ID}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 md:p-8 rounded-[2rem] shadow-2xl relative flex flex-col gap-6 md:gap-8 overflow-hidden shadow-blue-500/5 animate-in zoom-in-95 duration-200"
      >
        {/* Glow Aura Background Effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="p-3 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-pulse" />
          </div>
          <h3
            id={MODAL_TITLE_ID}
            className="text-2xl md:text-3xl font-black font-heading tracking-tight bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent mt-2"
          >
            {t("share.modal.title" as TranslationKey)}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center max-w-[280px] leading-relaxed">
            {t("share.modal.subtitle" as TranslationKey)}
          </p>
        </div>

        {/* Card Preview Container */}
        <div className="relative group bg-slate-100/80 dark:bg-slate-950/80 rounded-2xl p-6 overflow-hidden border border-[#E5E7EB] dark:border-slate-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex justify-center">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] opacity-60 dark:opacity-30 pointer-events-none" />

          {/* Interactive Card scaler */}
          <div className="origin-center scale-[0.45] sm:scale-[0.55] md:scale-[0.6] my-[-115px] sm:my-[-90px] md:my-[-75px] transition-transform duration-300 hover:scale-[0.48] sm:hover:scale-[0.58] md:hover:scale-[0.63]">
            {/* The actual high-res card that will be screenshotted */}
            <div
              ref={cardRef}
              className="shadow-[0_0_50px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden border border-slate-800"
            >
              {children}
            </div>
          </div>
        </div>

        {/* Sharing Actions */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyText(shareText)}
            className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm"
          >
            <div className="p-1.5 md:p-2 rounded-xl bg-slate-100 dark:bg-slate-950 group-hover:scale-110 transition-transform duration-200">
              {copied ? (
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 md:h-5 md:w-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <span className="text-[9px] md:text-[10px] text-center font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              {copied
                ? t("share.copied" as TranslationKey)
                : t("share.button.copy_text" as TranslationKey)}
            </span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={() => downloadPng(cardRef, fileName)}
            disabled={isSharing}
            className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <div className="p-1.5 md:p-2 rounded-xl bg-slate-100 dark:bg-slate-950 group-hover:scale-110 transition-transform duration-200">
              <Download className="h-4 w-4 md:h-5 md:w-5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <span className="text-[9px] md:text-[10px] text-center font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              {t("share.button.download" as TranslationKey)}
            </span>
          </button>

          {/* Share Button (Primary) */}
          <button
            type="button"
            onClick={() => nativeShare(cardRef, shareText, shareTitle)}
            disabled={isSharing}
            className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(59,130,246,0.2)] dark:shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] cursor-pointer border border-blue-400/50 dark:border-blue-500/30"
          >
            <div className="p-1.5 md:p-2 rounded-xl bg-white/20 group-hover:scale-110 transition-transform duration-200 border border-white/20">
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <span className="text-[9px] md:text-[10px] text-center font-black uppercase tracking-wider text-white/90 group-hover:text-white">
              {t("share.button.share" as TranslationKey)}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
