import { toPng } from "html-to-image";
import { useState } from "react";

export function useShareCard() {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
    return false;
  };

  const downloadPng = async (
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string,
  ) => {
    if (!ref.current) return false;
    setIsSharing(true);
    try {
      // Small delay to ensure styles are evaluated
      await new Promise((resolve) => setTimeout(resolve, 100));
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        style: {
          transform: "scale(1)",
        },
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      return true;
    } catch (error) {
      console.error("Failed to generate PNG:", error);
    } finally {
      setIsSharing(false);
    }
    return false;
  };

  const nativeShare = async (
    ref: React.RefObject<HTMLDivElement | null>,
    text: string,
    title: string,
  ) => {
    if (!ref.current) return false;
    setIsSharing(true);
    try {
      if (navigator.share) {
        const dataUrl = await toPng(ref.current, {
          cacheBust: true,
          style: { transform: "scale(1)" },
        });

        // Convert dataUrl to File object
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "runquest-share.png", {
          type: "image/png",
        });

        // Check if Web Share API supports file sharing
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title,
            text,
            files: [file],
          });
          return true;
        } else {
          // Fallback to text-only native sharing
          await navigator.share({
            title,
            text,
          });
          return true;
        }
      }
    } catch (err) {
      console.error("Native share failed:", err);
    } finally {
      setIsSharing(false);
    }
    return false;
  };

  return {
    isSharing,
    copied,
    copyText,
    downloadPng,
    nativeShare,
  };
}
