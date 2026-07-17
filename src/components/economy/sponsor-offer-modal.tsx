/**
 * Sponsor Offer Modal (Sprint 26.5 - Task 2.3)
 *
 * UI for reviewing and accepting/rejecting sponsor offers.
 */

"use client";

import type { Sponsor } from "@/economy/sponsorship-types";

interface SponsorOfferModalProps {
  sponsor: Sponsor;
  onAccept: () => void;
  onReject: () => void;
  onDefer: () => void;
}

export function SponsorOfferModal({
  sponsor,
  onAccept,
  onReject,
  onDefer,
}: SponsorOfferModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-gray-700">
        {/* Header with sponsor branding */}
        <div
          className="px-6 py-8 text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${sponsor.colors.primary}20 0%, ${sponsor.colors.secondary}20 100%)`,
            borderBottom: `3px solid ${sponsor.colors.primary}`,
          }}
        >
          <div className="relative z-10">
            <div className="text-5xl mb-3">🤝</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Sponsorship Offer!
            </h2>
            <div
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: `${sponsor.colors.primary}30`,
                color: sponsor.colors.primary,
                border: `2px solid ${sponsor.colors.primary}`,
              }}
            >
              {sponsor.tier.toUpperCase()} TIER
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Sponsor Info */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {sponsor.name}
            </h3>
            <p className="text-gray-300 text-lg italic mb-3">
              "{sponsor.signature}"
            </p>
            <p className="text-gray-400">{sponsor.description}</p>
          </div>

          {/* Benefits Grid */}
          <div className="bg-gray-800 rounded-lg p-5">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>💰</span> Contract Benefits
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-750 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Per Training</div>
                <div className="text-xl font-bold text-green-400">
                  +${sponsor.benefits.trainingBonus}
                </div>
              </div>

              <div className="bg-gray-750 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Per Race</div>
                <div className="text-xl font-bold text-blue-400">
                  +${sponsor.benefits.raceCompletionBonus}
                </div>
              </div>

              <div className="bg-gray-750 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">Per Victory</div>
                <div className="text-xl font-bold text-yellow-400">
                  +${sponsor.benefits.winBonus}
                </div>
              </div>

              <div className="bg-gray-750 rounded p-3">
                <div className="text-sm text-gray-400 mb-1">
                  Monthly Stipend
                </div>
                <div className="text-xl font-bold text-purple-400">
                  ${sponsor.benefits.monthlyStipend}/mo
                </div>
              </div>
            </div>
          </div>

          {/* Example Earnings */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm text-blue-300">
              <span className="font-semibold">💡 Example:</span> With 10
              trainings, 3 races, and 1 win this month, you'd earn:
            </div>
            <div className="text-lg font-bold text-blue-400 mt-2">
              ${sponsor.benefits.trainingBonus * 10} + $
              {sponsor.benefits.raceCompletionBonus * 3} + $
              {sponsor.benefits.winBonus} + ${sponsor.benefits.monthlyStipend} =
              $
              {sponsor.benefits.trainingBonus * 10 +
                sponsor.benefits.raceCompletionBonus * 3 +
                sponsor.benefits.winBonus +
                sponsor.benefits.monthlyStipend}
            </div>
          </div>

          {/* Decision Info */}
          <div className="text-center text-sm text-gray-400">
            <p>You can accept, reject, or review this offer later.</p>
            <p className="mt-1">
              Rejected sponsors may approach you again after 30 days.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            ❌ Reject Offer
          </button>

          <button
            onClick={onDefer}
            className="flex-1 px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            ⏰ Review Later
          </button>

          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 rounded font-medium transition-colors text-white"
            style={{
              backgroundColor: sponsor.colors.primary,
              boxShadow: `0 0 20px ${sponsor.colors.primary}40`,
            }}
          >
            ✅ Sign Contract
          </button>
        </div>
      </div>
    </div>
  );
}
