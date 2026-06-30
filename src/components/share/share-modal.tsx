import { Check, Copy, Download, Share2, X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl relative flex flex-col gap-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">
            Share Your Journey
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Let others know about your choices and results!
          </p>
        </div>

        {/* Card Preview Container */}
        <div className="flex justify-center bg-slate-950 rounded-2xl p-4 overflow-hidden border border-slate-800 shadow-inner">
          <div className="origin-center scale-[0.45] sm:scale-[0.6] md:scale-[0.65] my-[-110px] sm:my-[-75px] md:my-[-65px] transition-transform duration-200">
            {/* The actual high-res card that will be screenshotted */}
            <div ref={cardRef} className="shadow-2xl">
              {children}
            </div>
          </div>
        </div>

        {/* Sharing Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => copyText(shareText)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            {copied ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {copied
                ? t("share.copied" as TranslationKey)
                : t("share.button.copy_text" as TranslationKey)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => downloadPng(cardRef, fileName)}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t("share.button.download" as TranslationKey)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => nativeShare(cardRef, shareText, shareTitle)}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t("share.button.share" as TranslationKey)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
