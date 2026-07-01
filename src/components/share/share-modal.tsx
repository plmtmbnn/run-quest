import { motion } from "framer-motion";
import { Check, Copy, Download, Share2, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useShareCard } from "@/hooks/use-share-card";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";

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

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
        className="bg-slate-900/95 border border-slate-800 max-w-lg w-full p-6 rounded-3xl shadow-2xl relative flex flex-col gap-6 overflow-hidden shadow-blue-500/5 animate-in zoom-in-95 duration-200"
      >
        {/* Glow Aura Background Effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="p-2.5 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-black font-heading bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Share Your Journey
          </h3>
          <p className="text-xs text-slate-400 text-center max-w-[280px] leading-relaxed">
            Let others know about your choices and results!
          </p>
        </div>

        {/* Card Preview Container */}
        <div className="relative group bg-slate-950/80 rounded-2xl p-5 overflow-hidden border border-slate-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex justify-center">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)] opacity-30 pointer-events-none" />

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
        <div className="grid grid-cols-3 gap-3 mt-1">
          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyText(shareText)}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <div className="p-1 rounded-lg bg-slate-950 group-hover:scale-110 transition-transform duration-200">
              {copied ? (
                <Check className="h-4.5 w-4.5 text-emerald-400" />
              ) : (
                <Copy className="h-4.5 w-4.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              )}
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
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
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="p-1 rounded-lg bg-slate-950 group-hover:scale-110 transition-transform duration-200">
              <Download className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              {t("share.button.download" as TranslationKey)}
            </span>
          </button>

          {/* Share Button (Primary) */}
          <button
            type="button"
            onClick={() => nativeShare(cardRef, shareText, shareTitle)}
            disabled={isSharing}
            className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            <div className="p-1 rounded-lg bg-white/10 group-hover:scale-110 transition-transform duration-200">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
              {t("share.button.share" as TranslationKey)}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
