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
      console.error(
        "Failed to copy text via clipboard API, trying fallback:",
        err,
      );
    }

    // Fallback copy method for non-HTTPS or legacy environments
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // avoid page scrolling
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
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
      // Small delay to ensure styles and layouts are fully parsed
      await new Promise((resolve) => setTimeout(resolve, 150));
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(ref.current, {
        cacheBust: true,
        pixelRatio: 2, // High-DPI output for premium look
        backgroundColor: "#000000",
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
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(ref.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#000000",
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
      } else {
        // Fallback: copy to clipboard and alert the user
        const didCopy = await copyText(text);
        if (didCopy) {
          alert(
            "Sharing is not supported on this browser. The text results have been copied to your clipboard!",
          );
        } else {
          alert("Sharing is not supported on this browser.");
        }
        return true;
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
