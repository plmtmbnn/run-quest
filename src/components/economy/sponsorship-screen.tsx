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
    <div className="space-y-8">
      {/* Current Sponsor */}
      {currentSponsor ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>🤝</span> Active Sponsorship
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
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-8 text-center shadow-lg">
            <span className="text-4xl p-3 bg-slate-850 rounded-2xl inline-block mb-3">🤝</span>
            <h3 className="font-bold text-white text-lg mb-1 leading-tight">No Active Sponsor</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mb-4">
              Win races, build your reputation, and scale the ranks to attract corporate partnerships.
            </p>
          </div>
        </section>
      )}

      {/* Pending Offers Section */}
      {pendingSponsors.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>📬</span> Pending Offers
          </h2>
          <div className="grid gap-4">
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
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>✨</span> Available Sponsors
          </h2>
          <div className="grid gap-4">
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
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>⏳</span> Sponsor Cooldowns
          </h2>
          <div className="grid gap-4">
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
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>📈</span> Sponsor Progression Map
        </h2>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 relative z-0">
            {SPONSOR_TIER_ORDER.map((tier, idx) => {
              const tiers = ["🏪 Local", "📱 Regional", "🏭 National"];
              const completed = currentSponsor
                ? SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) >= idx
                : false;
              const isCurrent = currentSponsor?.tier === tier;

              return (
                <div
                  key={tier}
                  className={`flex flex-col items-center gap-2 relative z-10 transition-all ${
                    completed ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all shadow-md
                    ${
                      isCurrent
                        ? "bg-green-500 text-white border-green-400 ring-4 ring-green-500/20"
                        : completed
                          ? "bg-slate-800 text-green-400 border-green-500/40"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}
                  >
                    {completed ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-300">{tiers[idx]}</span>
                </div>
              );
            })}
          </div>
          <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-500"
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
    local: "border-green-500/20 bg-green-950/5 hover:border-green-500/30",
    regional: "border-blue-500/20 bg-blue-950/5 hover:border-blue-500/30",
    national: "border-purple-500/20 bg-purple-950/5 hover:border-purple-500/30",
  };

  const badgeColors: Record<string, string> = {
    local: "bg-green-500/10 text-green-400 border-green-500/20",
    regional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    national: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-350 shadow-md relative overflow-hidden backdrop-blur-md
      ${
        status === "active"
          ? "border-green-500/40 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.05)]"
          : status === "available"
            ? (tierColors[sponsor.tier] ?? "border-slate-800 bg-slate-900/40")
            : status === "pending"
              ? "border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)] animate-[pulse_3s_infinite]"
              : status === "cooldown"
                ? "border-amber-500/10 bg-amber-500/5 opacity-70"
                : "border-slate-800 bg-slate-900/20 opacity-50"
      } ${isNextUpgrade ? "ring-2 ring-blue-500/40" : ""}`}
    >
      {/* Decorative colored glow on card side */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
        status === "active" ? "bg-green-500" : status === "pending" ? "bg-indigo-500" : "bg-slate-700"
      }`} />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
        {/* Sponsor Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-heading font-extrabold text-lg text-white leading-none">{sponsor.name}</h3>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeColors[sponsor.tier] || "bg-slate-800 text-slate-400"}`}>
              {sponsor.tier}
            </span>
            {status === "active" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/10">
                ACTIVE
              </span>
            )}
            {status === "pending" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 animate-bounce">
                OFFER
              </span>
            )}
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{sponsor.description}</p>
          <p className="text-xs text-slate-500 font-medium italic">
            "{sponsor.signature}"
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-3 border-t border-slate-800/80">
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
        <div className="shrink-0 md:text-right flex flex-row md:flex-col justify-end items-end gap-2">
          {status === "active" && (
            <div className="flex flex-row md:flex-col items-end gap-3 w-full">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Signed: Day {signedDay}
                </div>
                {lifetimeEarnings !== undefined && (
                  <div className="text-xs font-semibold text-green-400">
                    +{formatCurrency(lifetimeEarnings, preferredCurrency)} earned
                  </div>
                )}
              </div>
              {onClaimStipend && (
                <button
                  type="button"
                  onClick={onClaimStipend}
                  className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
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
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3.5 py-2 rounded-xl font-bold transition-colors text-xs cursor-pointer"
                >
                  Decline
                </button>
              )}
              {onSign && (
                <button
                  type="button"
                  onClick={onSign}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl font-bold transition-colors text-xs cursor-pointer"
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs cursor-pointer active:scale-95"
            >
              Sign Contract
            </button>
          )}

          {status === "cooldown" && cooldownDays !== undefined && (
            <div className="text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-1">
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
    <div className="text-xs flex items-center justify-between gap-2 border-b border-slate-900 pb-1 md:pb-0 md:border-0 md:justify-start">
      <span className="text-slate-500 font-medium">{label}: </span>
      <span className="text-green-400 font-bold ml-1">{value}</span>
    </div>
  );
}
