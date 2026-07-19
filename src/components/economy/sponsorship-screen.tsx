/**
 * Sponsorship Screen Component (Sprint 26 - Task 6 / Sprint 27 Integration)
 *
 * Displays current sponsor, pending offers, available opportunities, and cooldowns.
 * Revamped to match UI/UX guidelines from social-screen.tsx
 */

"use client";

import { formatCurrency } from "@/economy/currency-converter";
import { useSettingsStore } from "@/store/settings-store";
import { type TranslationKey, useTranslation } from "@/i18n/use-translation";
import type { Sponsor, SponsorshipState } from "../../economy/sponsorship-types";
import { SPONSOR_TIER_ORDER, SPONSORS } from "../../economy/sponsorship-types";

// Interpolate {placeholder} tokens in translation strings.
function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

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
  const { t } = useTranslation();

  // Generate a flat list of all sponsors with their resolved status
  const allSponsors = Object.values(SPONSORS).map((sponsor) => {
    let status: "active" | "pending" | "available" | "cooldown" | "locked" =
      "locked";
    let cooldownDays: number | undefined;
    let isNextUpgrade = false;

    if (currentSponsor?.id === sponsor.id) {
      status = "active";
    } else if (sponsorshipState.pendingOffers?.includes(sponsor.id)) {
      status = "pending";
    } else if (availableSponsors.some((s) => s.id === sponsor.id)) {
      // Exclude from available if it's currently pending (to avoid duplicate actions)
      if (!sponsorshipState.pendingOffers?.includes(sponsor.id)) {
        status = "available";
        isNextUpgrade =
          currentSponsor !== null &&
          SPONSOR_TIER_ORDER.indexOf(sponsor.tier) >
            SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier);
      } else {
        status = "pending";
      }
    } else {
      // Check cooldown
      const receivedDay = sponsorshipState.offerReceivedDay?.[sponsor.id];
      const isRejected = sponsorshipState.rejectedOffers?.includes(sponsor.id);
      if (receivedDay !== undefined && isRejected) {
        const daysRemaining = 30 - (dayIndex - receivedDay);
        if (daysRemaining > 0) {
          status = "cooldown";
          cooldownDays = daysRemaining;
        }
      }
    }

    return { sponsor, status, cooldownDays, isNextUpgrade };
  });

  return (
    <div className="space-y-6">
      {/* Current Sponsor */}
      {currentSponsor && (
        <section className="space-y-4">
          <h2 className="text-lg font-black font-heading text-slate-800 dark:text-white tracking-tight flex items-center gap-2 px-6">
            <span aria-hidden="true">🤝</span>{" "}
            {t("sponsors.active_heading" as TranslationKey)}
          </h2>
          <SponsorCard
            sponsor={currentSponsor}
            status="active"
            signedDay={sponsorshipState.signedAtDay}
            onClaimStipend={onClaimStipend}
            lifetimeEarnings={sponsorshipState.lifetimeSponsorEarnings}
          />
        </section>
      )}

      {/* Sponsor Tier Progress */}
      <section className="space-y-4 px-6">
        <h2 className="text-lg font-black font-heading text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <span aria-hidden="true">📈</span>{" "}
          {t("sponsors.progression_heading" as TranslationKey)}
        </h2>
        <div className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
          <div
            className="flex items-center justify-between mb-4 relative z-0"
            role="img"
            aria-label={interpolate(
              t("sponsors.progression_heading" as TranslationKey),
              {},
            )}
          >
            {SPONSOR_TIER_ORDER.map((tier, idx) => {
              const completed = currentSponsor
                ? SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) >= idx
                : false;
              const isCurrent = currentSponsor?.tier === tier;
              const tierLabel = t(
                `sponsors.tiers.${tier}` as TranslationKey,
              );

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
                          ? "bg-slate-100 dark:bg-slate-800 text-green-400 border-green-500/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                    }`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {completed ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {tierLabel}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner mt-4"
            role="progressbar"
            aria-valuenow={
              currentSponsor
                ? SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) + 1
                : 0
            }
            aria-valuemin={0}
            aria-valuemax={SPONSOR_TIER_ORDER.length}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-1000 ease-out"
              style={{
                width: `${
                  currentSponsor
                    ? ((SPONSOR_TIER_ORDER.indexOf(currentSponsor.tier) + 1) /
                        SPONSOR_TIER_ORDER.length) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Sponsor Directory */}
      <section className="space-y-6 px-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-black font-heading text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <span aria-hidden="true">✨</span>{" "}
            {t("sponsors.directory_heading" as TranslationKey)}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("sponsors.directory_desc" as TranslationKey)}
          </p>
        </div>

        <div className="space-y-8">
          {SPONSOR_TIER_ORDER.map((tier) => {
            const tierSponsors = allSponsors.filter(
              (s) => s.sponsor.tier === tier,
            );
            if (tierSponsors.length === 0) return null;

            return (
              <div key={tier} className="space-y-4 relative">
                {/* Tier Separator Header */}
                <div className="flex items-center gap-4">
                  <h3 className="font-heading font-black text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t(`sponsors.tiers.${tier}` as TranslationKey)} Tier
                  </h3>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="grid gap-4">
                  {tierSponsors.map(
                    ({ sponsor, status, cooldownDays, isNextUpgrade }) => (
                      <SponsorCard
                        key={sponsor.id}
                        sponsor={sponsor}
                        status={status}
                        cooldownDays={cooldownDays}
                        isNextUpgrade={isNextUpgrade}
                        onSign={
                          status === "available" || status === "pending"
                            ? () => onSignSponsor(sponsor.id)
                            : undefined
                        }
                        onReject={
                          status === "pending" && onRejectOffer
                            ? () => onRejectOffer(sponsor.id)
                            : undefined
                        }
                      />
                    ),
                  )}
                </div>
              </div>
            );
          })}
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
  const { t } = useTranslation();
  const preferredCurrency =
    useSettingsStore((state) => state.settings.preferredCurrency) || "USD";

  const tierColors: Record<string, string> = {
    local: "border-green-100/30 dark:border-green-950/30 bg-green-50/40 dark:bg-green-950/10",
    regional:
      "border-blue-100/30 dark:border-blue-950/30 bg-blue-50/40 dark:bg-blue-950/10",
    national:
      "border-purple-100/30 dark:border-purple-950/30 bg-purple-50/40 dark:bg-purple-950/10",
  };

  const badgeColors: Record<string, string> = {
    local: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    regional:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    national:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <div
      className={`rounded-[2rem] border border-[#E5E7EB] dark:border-slate-800 p-5 transition-transform hover:scale-[1.01] duration-300 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6
      ${
        status === "active"
          ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30"
          : status === "available"
            ? tierColors[sponsor.tier] ??
              "bg-slate-50/50 dark:bg-slate-900/40 border-[#E5E7EB] dark:border-slate-800/50"
            : status === "pending"
              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 shadow-[0_0_15px_rgba(99,102,241,0.08)] animate-[pulse_3s_infinite]"
              : status === "cooldown"
                ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100/30 dark:border-amber-950/30 opacity-70"
                : "bg-slate-50/20 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/80 grayscale-[0.6] opacity-70" // locked
      } ${isNextUpgrade ? "ring-2 ring-blue-500/40" : ""}`}
    >
      {/* Decorative colored glow on card side */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 ${
          status === "active"
            ? "bg-green-500"
            : status === "pending"
              ? "bg-indigo-500"
              : "bg-transparent"
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-0 md:pl-2 w-full">
        {/* Sponsor Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white leading-none">
              {sponsor.name}
            </h3>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeColors[sponsor.tier] || "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}
            >
              {t(`sponsors.tiers.${sponsor.tier}` as TranslationKey)}
            </span>
            {status === "active" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10">
                {t("sponsors.status.active" as TranslationKey)}
              </span>
            )}
            {status === "pending" && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 animate-bounce">
                {t("sponsors.status.offer" as TranslationKey)}
              </span>
            )}
            {status === "locked" && (
              <span className="text-[10px] flex items-center gap-1 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/10">
                <span aria-hidden="true">🔒</span>{" "}
                {t("sponsors.status.locked" as TranslationKey)}
              </span>
            )}
            {isNextUpgrade && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                ↑ {t("sponsors.status.next_upgrade" as TranslationKey)}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {sponsor.description}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-medium italic">
            &quot;{sponsor.signature}&quot;
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/50">
            <BenefitItem
              label={t("sponsors.benefits.training_bonus" as TranslationKey)}
              value={`+${formatCurrency(sponsor.benefits.trainingBonus, preferredCurrency)}${t("sponsors.benefits.per_session" as TranslationKey)}`}
            />
            <BenefitItem
              label={t("sponsors.benefits.race_bonus" as TranslationKey)}
              value={`+${formatCurrency(sponsor.benefits.raceCompletionBonus, preferredCurrency)}${t("sponsors.benefits.per_race" as TranslationKey)}`}
            />
            <BenefitItem
              label={t("sponsors.benefits.win_bonus" as TranslationKey)}
              value={`+${formatCurrency(sponsor.benefits.winBonus, preferredCurrency)}${t("sponsors.benefits.per_win" as TranslationKey)}`}
            />
            <BenefitItem
              label={t("sponsors.benefits.monthly_stipend" as TranslationKey)}
              value={`${formatCurrency(sponsor.benefits.monthlyStipend, preferredCurrency)}${t("sponsors.benefits.per_month" as TranslationKey)}`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 md:text-right flex flex-row md:flex-col justify-end items-end gap-2">
          {status === "active" && (
            <div className="flex flex-row md:flex-col items-end gap-3 w-full">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  {interpolate(t("sponsors.signed" as TranslationKey), {
                    day: signedDay ?? 0,
                  })}
                </div>
                {lifetimeEarnings !== undefined && (
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {interpolate(t("sponsors.earned" as TranslationKey), {
                      amount: formatCurrency(lifetimeEarnings, preferredCurrency),
                    })}
                  </div>
                )}
              </div>
              {onClaimStipend && (
                <button
                  type="button"
                  onClick={onClaimStipend}
                  className="min-h-[44px] bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  {t("sponsors.actions.claim_stipend" as TranslationKey)}
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
                  className="min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold transition-colors text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  {t("sponsors.actions.decline" as TranslationKey)}
                </button>
              )}
              {onSign && (
                <button
                  type="button"
                  onClick={onSign}
                  className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold transition-colors text-xs cursor-pointer shadow-md shadow-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  {t("sponsors.actions.accept_offer" as TranslationKey)}
                </button>
              )}
            </div>
          )}

          {status === "available" && onSign && (
            <button
              type="button"
              onClick={onSign}
              className="min-h-[44px] bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-xs cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {t("sponsors.actions.sign_contract" as TranslationKey)}
            </button>
          )}

          {status === "cooldown" && cooldownDays !== undefined && (
            <div className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-950/30 px-3 py-2 rounded-xl flex items-center gap-1">
              <span aria-hidden="true">⏳</span>{" "}
              {interpolate(t("sponsors.status.cooldown" as TranslationKey), {
                days: cooldownDays,
              })}
            </div>
          )}

          {status === "locked" && (
            <div className="flex flex-col gap-1 items-end mt-4 md:mt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("sponsors.unlock_requirements" as TranslationKey)}
              </span>
              <div className="flex flex-wrap md:flex-col justify-end gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                {sponsor.requirements.minWins && (
                  <span className="bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span aria-hidden="true">🏆</span>{" "}
                    {interpolate(t("sponsors.req_wins" as TranslationKey), {
                      count: sponsor.requirements.minWins,
                    })}
                  </span>
                )}
                {sponsor.requirements.minRating && (
                  <span className="bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span aria-hidden="true">⭐</span>{" "}
                    {interpolate(t("sponsors.req_rating" as TranslationKey), {
                      rating: sponsor.requirements.minRating,
                    })}
                  </span>
                )}
                {sponsor.requirements.previousSponsor && (
                  <span className="bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span aria-hidden="true">🤝</span>{" "}
                    {t("sponsors.req_prev_sponsor" as TranslationKey)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs flex items-center justify-between gap-2 border-b border-slate-100/50 dark:border-slate-800/50 pb-1 md:pb-0 md:border-0 md:justify-start">
      <span className="text-slate-500 dark:text-slate-400 font-medium">
        {label}:{" "}
      </span>
      <span className="text-green-600 dark:text-green-400 font-bold ml-1">
        {value}
      </span>
    </div>
  );
}
