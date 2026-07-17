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
      <div className="flex items-center justify-center min-h-screen text-white bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin text-purple-500 text-3xl">🔄</div>
          <p className="text-gray-400">Loading Sponsors...</p>
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
      className="min-h-screen bg-slate-950 text-white flex flex-col pb-16"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.back();
          }}
          className="rounded-full p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 shadow-sm transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
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

