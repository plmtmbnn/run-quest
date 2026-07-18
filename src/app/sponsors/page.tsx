"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SponsorshipScreen } from "@/components/economy/sponsorship-screen";
import { recordTransaction } from "@/economy/earning-engine";
import {
  claimMonthlyStipend,
  getAvailableSponsors,
  getCurrentSponsor,
  rejectOffer,
  signSponsor,
} from "@/economy/sponsorship-engine";
import { useSound } from "@/hooks/use-sound";
import { useTimelineStore } from "@/store/timeline-store";

export default function SponsorsPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { gameState, setGameState } = useTimelineStore();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin text-indigo-500 text-3xl">🔄</div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm">Loading Sponsors...</p>
        </div>
      </div>
    );
  }

  const sponsorshipState = gameState.sponsorship;
  const currentSponsor = getCurrentSponsor(sponsorshipState);
  const availableSponsors = getAvailableSponsors(sponsorshipState, gameState);

  const handleSignSponsor = (sponsorId: string) => {
    playSound("click");
    const updatedSponsorship = signSponsor(
      sponsorshipState,
      sponsorId,
      gameState.dayIndex,
    );
    setGameState((prev) => ({ ...prev!, sponsorship: updatedSponsorship }));
  };

  const handleRejectSponsor = (sponsorId: string) => {
    playSound("click");
    const updatedSponsorship = rejectOffer(sponsorshipState, sponsorId);
    setGameState((prev) => ({ ...prev!, sponsorship: updatedSponsorship }));
  };

  const handleClaimStipend = () => {
    playSound("success");
    const { sponsorshipState: updatedSponsorship, amount } =
      claimMonthlyStipend(sponsorshipState, gameState.dayIndex);
    if (amount > 0) {
      const { economy: updatedEconomy } = recordTransaction(
        gameState.economy,
        "earn",
        "sponsor",
        amount,
        gameState.dayIndex,
        `Monthly stipend from ${currentSponsor?.name}`,
      );
      setGameState((prev) => ({
        ...prev!,
        sponsorship: updatedSponsorship,
        economy: updatedEconomy,
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col pb-16"
    >
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-[#E5E7EB] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.back();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 transition hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-heading font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          🤝 Sponsors
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        <SponsorshipScreen
          sponsorshipState={sponsorshipState}
          availableSponsors={availableSponsors}
          currentSponsor={currentSponsor}
          onSignSponsor={handleSignSponsor}
          onRejectOffer={handleRejectSponsor}
          onClaimStipend={handleClaimStipend}
          dayIndex={gameState.dayIndex}
        />
      </main>
    </motion.div>
  );
}

