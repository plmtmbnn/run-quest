/**
 * Sponsor Notification (Sprint 26.5 - Task 2.4)
 *
 * Toast/banner notification when a new sponsor offer arrives.
 */

"use client";

import type { Sponsor } from "@/economy/sponsorship-types";

interface SponsorNotificationProps {
  sponsor: Sponsor;
  onView: () => void;
  onDismiss: () => void;
}

export function SponsorNotification({
  sponsor,
  onView,
  onDismiss,
}: SponsorNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className="bg-gray-900 rounded-lg shadow-2xl border-2 max-w-md overflow-hidden"
        style={{ borderColor: sponsor.colors.primary }}
      >
        {/* Header */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${sponsor.colors.primary}30 0%, ${sponsor.colors.secondary}30 100%)`,
          }}
        >
          <span className="text-2xl">🤝</span>
          <span className="text-sm font-semibold text-white">
            New Sponsorship Offer
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <h3 className="text-lg font-bold text-white mb-1">{sponsor.name}</h3>
          <p className="text-sm text-gray-400 mb-3">{sponsor.description}</p>

          {/* Quick Benefits */}
          <div className="flex gap-2 text-xs mb-3">
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
              +${sponsor.benefits.trainingBonus}/train
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
              +${sponsor.benefits.raceCompletionBonus}/race
            </span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
              ${sponsor.benefits.monthlyStipend}/month
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              className="flex-1 px-3 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={onView}
              className="flex-1 px-3 py-2 text-sm rounded font-medium text-white transition-colors"
              style={{
                backgroundColor: sponsor.colors.primary,
                boxShadow: `0 0 15px ${sponsor.colors.primary}40`,
              }}
            >
              View Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Badge component for showing pending offer count.
 */
export function SponsorOfferBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse">
      <span className="text-xs font-bold text-white">{count}</span>
    </div>
  );
}
