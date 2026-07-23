"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Flame,
  Footprints,
  Lock,
  Package,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/economy/currency-converter";
import { useSound } from "@/hooks/use-sound";
import type { TranslationKey } from "@/i18n/use-translation";
import { useTranslation } from "@/i18n/use-translation";
import { useRunnerStore } from "@/runner/runner-store";
import { getItemsByCategory } from "@/shop/shop-catalog";
import { migrateToShopSystem } from "@/shop/shop-migration";
import { useShopStore } from "@/shop/shop-store";
import type { ShopCategory, ShopItem } from "@/shop/shop-types";
import { useSettingsStore } from "@/store/settings-store";
import { useTimelineStore } from "@/store/timeline-store";

export function ShopScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = (language === "id" ? "id" : "en") as "en" | "id";
  const { playSound } = useSound();

  const [isMounted, setIsMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("shoes");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { settings } = useSettingsStore();
  const preferredCurrency = settings.preferredCurrency || "USD";

  const { gameState, setGameState } = useTimelineStore();
  const { runnerState } = useRunnerStore();
  const {
    inventory,
    initializeInventory,
    hasItem,
    getItemQuantity,
    purchaseItem,
  } = useShopStore();

  useEffect(() => {
    setIsMounted(true);
    migrateToShopSystem();
    initializeInventory();
  }, [initializeInventory]);

  const currentBalance = gameState?.economy?.currentBalance ?? 0;
  const playerLevel = runnerState?.profile?.level ?? 1;

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleBuy = (item: ShopItem) => {
    if (!gameState) return;

    const result = purchaseItem(
      item.id,
      item.category,
      currentBalance,
      playerLevel,
      1,
    );

    if (result.success && result.newBalance !== undefined) {
      // Update economy balance in timeline store
      setGameState((prev) => ({
        ...prev,
        economy: {
          ...prev.economy,
          currentBalance: result.newBalance!,
        },
      }));

      playSound("success");
      const successText =
        item.category === "nutrition"
          ? `${item.name[lang]} (+1) ${t("shop.purchase_success" as TranslationKey)}`
          : `${item.name[lang]} ${t("shop.purchase_success" as TranslationKey)}`;
      showToast(successText, "success");
    } else {
      playSound("alert");
      const errorMsg =
        result.error === "INSUFFICIENT_FUNDS"
          ? t("shop.insufficient_funds" as TranslationKey)
          : result.error === "LOCKED"
            ? (t("shop.locked" as TranslationKey) || "").replace(
                "{level}",
                String(item.unlockLevel || 1),
              )
            : t("shop.purchase_failed" as TranslationKey);
      showToast(errorMsg, "error");
    }
  };

  const items = getItemsByCategory(activeCategory);

  const categoryIcons: Record<ShopCategory, React.ReactNode> = {
    shoes: <Footprints className="h-4 w-4" />,
    nutrition: <Flame className="h-4 w-4" />,
    gear: <Package className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white pb-20"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-semibold shadow-xl transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-rose-600 text-white dark:bg-rose-500"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 transition hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                  {t("shop.title" as TranslationKey)}
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("shop.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          {/* Balance Pill */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t("shop.balance" as TranslationKey)}:
            </span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 text-sm">
              {formatCurrency(currentBalance, preferredCurrency)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-6">
        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
          {(["shoes", "nutrition", "gear"] as ShopCategory[]).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playSound("click");
                  setActiveCategory(cat);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 capitalize ${
                  isActive
                    ? cat === "shoes"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : cat === "nutrition"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {categoryIcons[cat]}
                <span>{t(`shop.category.${cat}` as TranslationKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isOwned =
              isMounted &&
              item.category !== "nutrition" &&
              hasItem(item.category, item.id);
            const isLocked =
              isMounted &&
              Boolean(item.unlockLevel) && playerLevel < (item.unlockLevel || 1);
            const canAfford = currentBalance >= item.price;
            const quantity =
              isMounted && item.category === "nutrition"
                ? getItemQuantity("nutrition", item.id)
                : 0;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col justify-between rounded-2xl border p-5 bg-white dark:bg-slate-900 shadow-sm transition-all ${
                  isOwned
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : isLocked
                      ? "border-gray-200 dark:border-gray-800 opacity-60"
                      : "border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div>
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                      {item.name[lang] || item.name.en}
                    </h3>
                    {isOwned ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        {t("shop.owned" as TranslationKey)}
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <Lock className="h-3 w-3" />
                        Lvl {item.unlockLevel}
                      </span>
                    ) : item.category === "nutrition" && quantity > 0 ? (
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 font-mono">
                        Qty: {quantity}
                      </span>
                    ) : null}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {item.description[lang] || item.description.en}
                  </p>

                  {/* Stat Badges */}
                  {item.stats && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.stats.paceBonus ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                          <Zap className="h-3 w-3" />+{item.stats.paceBonus}% Pace
                        </span>
                      ) : null}
                      {item.stats.staminaBonus ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                          <Flame className="h-3 w-3" />+{item.stats.staminaBonus} Stamina
                        </span>
                      ) : null}
                      {item.stats.hydrationBonus ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-200/50 dark:border-cyan-800/50">
                          <Sparkles className="h-3 w-3" />+{item.stats.hydrationBonus} Hydration
                        </span>
                      ) : null}
                      {item.stats.willpowerBonus ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200/50 dark:border-purple-800/50">
                          ⚡+{item.stats.willpowerBonus} Willpower
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Footer Action & Price */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                      Price
                    </span>
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      {item.price === 0
                        ? "FREE"
                        : formatCurrency(item.price, preferredCurrency)}
                    </span>
                  </div>

                  {isOwned ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-xs cursor-default"
                    >
                      {t("shop.owned" as TranslationKey)}
                    </button>
                  ) : isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-semibold text-xs cursor-not-allowed flex items-center gap-1"
                    >
                      <Lock className="h-3 w-3" />
                      Lvl {item.unlockLevel}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        canAfford
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {item.price === 0
                        ? t("shop.buy" as TranslationKey)
                        : canAfford
                          ? t("shop.buy" as TranslationKey)
                          : t("shop.insufficient_funds" as TranslationKey)}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
}
