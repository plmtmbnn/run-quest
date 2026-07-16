"use client";

import { SponsorshipScreen } from "@/components/economy/sponsorship-screen";
import { getAvailableSponsors, getCurrentSponsor, signSponsor, claimMonthlyStipend } from "@/economy/sponsorship-engine";
import { useTimelineStore } from "@/store/timeline-store";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/use-sound";
import { recordTransaction } from "@/economy/earning-engine";

export default function SponsorsPage() {
  const router = useRouter();
  const { playSound } = useSound();
  const { gameState, setGameState } = useTimelineStore();

  if (!gameState) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading Sponsors...</div>;
  }

  const sponsorshipState = gameState.sponsorship;
  const currentSponsor = getCurrentSponsor(sponsorshipState);
  const availableSponsors = getAvailableSponsors(sponsorshipState, gameState);

  const handleSignSponsor = (sponsorId: string) => {
    playSound("click");
    const updatedSponsorship = signSponsor(sponsorshipState, sponsorId, gameState.dayIndex);
    setGameState(prev => ({ ...prev!, sponsorship: updatedSponsorship }));
  };

  const handleClaimStipend = () => {
    playSound("success");
    const { sponsorshipState: updatedSponsorship, amount } = claimMonthlyStipend(sponsorshipState, gameState.dayIndex);
    if (amount > 0) {
        const { economy: updatedEconomy } = recordTransaction(
            gameState.economy, 
            "earn", 
            "sponsor", 
            amount, 
            gameState.dayIndex, 
            `Monthly stipend from ${currentSponsor?.name}`
        );
        setGameState(prev => ({ ...prev!, sponsorship: updatedSponsorship, economy: updatedEconomy }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-background flex flex-col pb-12"
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            router.back();
          }}
          className="rounded-full p-2.5 bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          🤝 Sponsors
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-1 px-6 py-4">
        <SponsorshipScreen
          sponsorshipState={sponsorshipState}
          availableSponsors={availableSponsors}
          currentSponsor={currentSponsor}
          onSignSponsor={handleSignSponsor}
          onClaimStipend={handleClaimStipend}
        />
      </main>
    </motion.div>
  );
}
