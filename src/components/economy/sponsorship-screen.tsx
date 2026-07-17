/**
 * Sponsorship Screen Component (Sprint 26 - Task 6 / Sprint 27 Integration)
 *
 * Displays current sponsor, pending offers, available opportunities, and cooldowns.
 */

"use client";

import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";
import type {
  Sponsor,
  SponsorshipState,
} from "../../economy/sponsorship-types";
import { SPONSOR_TIER_ORDER, SPONSORS } from "../../economy/sponsorship-types";

interface SponsorshipScreenProps {
  sponsorshipState: SponsorshipState;
  availableSponsors: Sponsor[];
  currentSponsor: Sponsor | null;
  onSignSponsor: (sponsorId: string) => void;
  onRejectOffer?: (sponsorId: string) => void;
  onClaimStipend: () => void;
  dayIndex?: number;
}

export function SponsorshipScreen({
  sponsorshipState,
  availableSponsors,
  currentSponsor,
  onSignSponsor,
  onRejectOffer,
  onClaimStipend,
  dayIndex = 0,
}: SponsorshipScreenProps) {
  // Resolve pending offers from state
  const pendingSponsors = (sponsorshipState.pendingOffers || [])
    .map((id) => SPONSORS[id])
    .filter(Boolean) as Sponsor[];

  // Filter available sponsors to exclude pending ones
  const displayAvailableSponsors = availableSponsors.filter(
    (sponsor) => !sponsorshipState.pendingOffers?.includes(sponsor.id),
  );

  // Identify rejected sponsors currently on cooldown
  const cooldownSponsors = Object.entries(
    sponsorshipState.offerReceivedDay || {},
  )
    .filter(([sponsorId, receivedDay]) => {
      if (!sponsorshipState.rejectedOffers?.includes(sponsorId)) return false;
      const daysRemaining = 30 - (dayIndex - receivedDay);
      return daysRemaining > 0;
    })
    .map(([sponsorId, receivedDay]) => {
      const sponsor = SPONSORS[sponsorId];
      const daysRemaining = 30 - (dayIndex - receivedDay);
      return { sponsor, daysRemaining };
    })
    .filter((item) => item.sponsor !== undefined) as {
    sponsor: Sponsor;
    daysRemaining: number;
  }[];

  return (
    <div className="space-y-6">
      {/* Current Sponsor */}
      {currentSponsor ? (
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>🤝</span> Current Sponsor
          </h2>
          <SponsorCard
            sponsor={currentSponsor}
            status="active"
            signedDay={sponsorshipState.signedAtDay}
            onClaimStipend={onClaimStipend}
            lifetimeEarnings={sponsorshipState.lifetimeSponsorEarnings}
          />
        </section>
      ) : (
        <section>
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 text-center">
            <p className="text-xl mb-2">🤝</p>
            <h3 className="font-bold text-white mb-1">No Sponsor Yet</h3>
            <p className="text-sm text-gray-400 mb-3">
              Win races and build your reputation to attract sponsors
            </p>
          </div>
        </section>
      )}

      {/* Pending Offers Section */}
      {pendingSponsors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>📬</span> Pending Offers
          </h2>
          <div className="grid gap-3">
            {pendingSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                status="pending"
                onSign={() => onSignSponsor(sponsor.id)}
                onReject={
                  onRejectOffer ? () => onRejectOffer(sponsor.id) : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Available Sponsors */}
      {displayAvailableSponsors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>✨</span> Available Sponsors
          </h2>
          <div className="grid gap-3">
            {displayAvailableSponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                status="available"
                onSign={() => onSignSponsor(sponsor.id)}
                isNextUpgrade={
                  currentSponsor !== null &&
                  SPONSOR_TIER_ORDER.indexOf(sponsor.tier) >
                    SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Cooldown Sponsors Section */}
      {cooldownSponsors.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span>⏳</span> Sponsor Cooldowns
          </h2>
          <div className="grid gap-3">
            {cooldownSponsors.map(({ sponsor, daysRemaining }) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                status="cooldown"
                cooldownDays={daysRemaining}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sponsor Tier Progress */}
      <section>
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span>📈</span> Sponsor Progression
        </h2>
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
          <div className="flex items-center justify-between mb-3">
            {SPONSOR_TIER_ORDER.map((tier, idx) => {
              const tiers = ["🏪 Local", "📱 Regional", "🏭 National"];
              const completed = currentSponsor
                ? SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) >= idx
                : false;
              const isCurrent = currentSponsor?.tier === tier;

              return (
                <div
                  key={tier}
                  className={`flex flex-col items-center gap-1 ${
                    completed ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      isCurrent
                        ? "bg-green-500 text-white"
                        : completed
                          ? "bg-green-500/30 text-green-400"
                          : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {completed ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs text-gray-400">{tiers[idx]}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all"
              style={{
                width: `${
                  currentSponsor
                    ? (
                        (SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) + 1) /
                          SPONSOR_TIER_ORDER.length
                      ) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SponsorCard({
  sponsor,
  status,
  signedDay,
  onSign,
  onReject,
  onClaimStipend,
  lifetimeEarnings,
  isNextUpgrade,
  cooldownDays,
}: {
  sponsor: Sponsor;
  status: "active" | "available" | "pending" | "cooldown" | "locked";
  signedDay?: number;
  onSign?: () => void;
  onReject?: () => void;
  onClaimStipend?: () => void;
  lifetimeEarnings?: number;
  isNextUpgrade?: boolean;
  cooldownDays?: number;
}) {
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  const tierColors: Record<string, string> = {
    local: "border-green-500/30 bg-green-500/5",
    regional: "border-blue-500/30 bg-blue-500/5",
    national: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        status === "active"
          ? "border-green-500/50 bg-green-500/10"
          : status === "available"
            ? (tierColors[sponsor.tier] ?? "border-gray-600 bg-gray-800/50")
            : status === "pending"
              ? "border-blue-500/40 bg-blue-500/5 animate-pulse"
              : status === "cooldown"
                ? "border-amber-500/20 bg-amber-500/5 opacity-80"
                : "border-gray-700 bg-gray-800/30 opacity-60"
      } ${isNextUpgrade ? "ring-2 ring-blue-500/50" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Sponsor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">{sponsor.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full capitalize bg-blue-500/20 text-blue-400">
              {sponsor.tier}
            </span>
            {status === "active" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                ACTIVE
              </span>
            )}
            {status === "pending" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-450 animate-bounce">
                OFFER
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mt-1">{sponsor.description}</p>
          <p className="text-xs text-gray-500 italic mt-1">
            "{sponsor.signature}"
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <BenefitItem
              label="Training Bonus"
              value={`+${formatCurrency(sponsor.benefits.trainingBonus, preferredCurrency)}/session`}
            />
            <BenefitItem
              label="Race Bonus"
              value={`+${formatCurrency(sponsor.benefits.raceCompletionBonus, preferredCurrency)}/race`}
            />
            <BenefitItem
              label="Win Bonus"
              value={`+${formatCurrency(sponsor.benefits.winBonus, preferredCurrency)}/win`}
            />
            <BenefitItem
              label="Monthly Stipend"
              value={`${formatCurrency(sponsor.benefits.monthlyStipend, preferredCurrency)}/month`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 text-right">
          {status === "active" && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400">
                Signed: Day {signedDay}
              </div>
              {lifetimeEarnings !== undefined && (
                <div className="text-sm font-semibold text-green-400">
                  +{formatCurrency(lifetimeEarnings, preferredCurrency)} earned
                </div>
              )}
              {onClaimStipend && (
                <button
                  type="button"
                  onClick={onClaimStipend}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                >
                  Claim Stipend
                </button>
              )}
            </div>
          )}

          {status === "pending" && (
            <div className="flex gap-2">
              {onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs"
                >
                  Decline
                </button>
              )}
              {onSign && (
                <button
                  type="button"
                  onClick={onSign}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs"
                >
                  Accept Offer
                </button>
              )}
            </div>
          )}

          {status === "available" && onSign && (
            <button
              type="button"
              onClick={onSign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold transition-colors text-sm"
            >
              Sign Contract
            </button>
          )}

          {status === "cooldown" && cooldownDays !== undefined && (
            <div className="text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded">
              ⏳ Cooldown: {cooldownDays}d
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <span className="text-gray-500">{label}: </span>
      <span className="text-green-400 font-medium">{value}</span>
    </div>
  );
}
