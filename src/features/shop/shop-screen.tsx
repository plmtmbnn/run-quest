"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Flame,
  Footprints,
  Lock,
  Package,
  Plus,
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
import {
  GEAR_CATALOG,
  NUTRITION_CATALOG,
  SHOES_CATALOG,
  getItemsByCategory,
} from "@/shop/shop-catalog";
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

  const handleBuy = (item: ShopItem, quantity = 1) => {
    if (!gameState) return;

    const result = purchaseItem(
      item.id,
      item.category,
      currentBalance,
      playerLevel,
      quantity,
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
      const qtyStr = quantity > 1 ? ` (+${quantity})` : "";
      const successText = `${item.name[lang] || item.name.en}${qtyStr} ${t("shop.purchase_success" as TranslationKey)}`;
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

  // Compute inventory summary statistics
  const ownedShoesCount = SHOES_CATALOG.filter((s) =>
    hasItem("shoes", s.id)
  ).length;
  const ownedGearCount = GEAR_CATALOG.filter((g) =>
    hasItem("gear", g.id)
  ).length;
  const totalNutritionStock = NUTRITION_CATALOG.reduce(
    (total, n) => total + getItemQuantity("nutrition", n.id),
    0
  );

  const categoryIcons: Record<ShopCategory, React.ReactNode> = {
    shoes: <Footprints className="h-4 w-4 shrink-0" />,
    nutrition: <Flame className="h-4 w-4 shrink-0" />,
    gear: <Package className="h-4 w-4 shrink-0" />,
  };

  const categoryEmoji: Record<ShopCategory, string> = {
    shoes: "👟",
    nutrition: "⚡",
    gear: "🧢",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold shadow-xl border backdrop-blur-md flex items-center gap-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-600/95 border-emerald-400 text-white"
              : "bg-rose-600/95 border-rose-400 text-white"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </motion.div>
      )}

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 md:px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                router.push("/");
              }}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-500 shrink-0" />
                <h1 className="font-heading text-lg md:text-xl font-black text-slate-900 dark:text-white truncate">
                  {t("shop.title" as TranslationKey)}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {t("shop.subtitle" as TranslationKey)}
              </p>
            </div>
          </div>

          {/* Level & Balance Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden xs:inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Lvl {playerLevel}
            </span>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 md:px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
                {t("shop.balance" as TranslationKey)}:
              </span>
              <span className="font-mono font-black text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
                {formatCurrency(currentBalance, preferredCurrency)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 md:px-6 pt-5 flex flex-col gap-5">
        {/* Quick Inventory Summary Cards */}
        {isMounted && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setActiveCategory("shoes");
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2.5 ${
                activeCategory === "shoes"
                  ? "bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-base shrink-0">
                👟
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  {t("shop.category.shoes" as TranslationKey)}
                </span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  {ownedShoesCount} / {SHOES_CATALOG.length}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("click");
                setActiveCategory("nutrition");
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2.5 ${
                activeCategory === "nutrition"
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base shrink-0">
                ⚡
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  {t("shop.category.nutrition" as TranslationKey)}
                </span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  {totalNutritionStock} items
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound("click");
                setActiveCategory("gear");
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2.5 ${
                activeCategory === "gear"
                  ? "bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-base shrink-0">
                🧢
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                  {t("shop.category.gear" as TranslationKey)}
                </span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  {ownedGearCount} / {GEAR_CATALOG.length}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs transition-all whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? cat === "shoes"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : cat === "nutrition"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{categoryEmoji[cat]}</span>
                <span>{t(`shop.category.${cat}` as TranslationKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((item) => {
            const isOwned =
              isMounted &&
              item.category !== "nutrition" &&
              hasItem(item.category, item.id);
            const isLocked =
              isMounted &&
              Boolean(item.unlockLevel) &&
              playerLevel < (item.unlockLevel || 1);
            const canAffordOne = currentBalance >= item.price;
            const canAffordFive = currentBalance >= item.price * 5;
            const quantity =
              isMounted && item.category === "nutrition"
                ? getItemQuantity("nutrition", item.id)
                : 0;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col justify-between rounded-2xl border p-4 md:p-5 bg-white dark:bg-slate-900 shadow-sm transition-all relative overflow-hidden ${
                  isOwned
                    ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20"
                    : isLocked
                      ? "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50"
                      : "border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        {categoryEmoji[item.category]}
                      </div>
                      <h3 className="font-heading font-black text-sm md:text-base text-slate-900 dark:text-white truncate">
                        {item.name[lang] || item.name.en}
                      </h3>
                    </div>

                    {isOwned ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                        <Check className="h-3 w-3" />
                        {t("shop.owned" as TranslationKey)}
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        <Lock className="h-3 w-3" />
                        Lvl {item.unlockLevel}
                      </span>
                    ) : item.category === "nutrition" && quantity > 0 ? (
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-1 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 shrink-0 border border-indigo-200 dark:border-indigo-800">
                        Qty: {quantity}
                      </span>
                    ) : null}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
                    {item.description[lang] || item.description.en}
                  </p>

                  {/* Stat Chips */}
                  {item.stats && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.stats.paceBonus ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                          <Zap className="h-3 w-3" />+{item.stats.paceBonus}% Pace
                        </span>
                      ) : null}
                      {item.stats.staminaBonus ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                          <Flame className="h-3 w-3" />+{item.stats.staminaBonus} Stamina
                        </span>
                      ) : null}
                      {item.stats.hydrationBonus ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                          <Sparkles className="h-3 w-3" />+{item.stats.hydrationBonus} Hydration
                        </span>
                      ) : null}
                      {item.stats.willpowerBonus ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                          ⚡+{item.stats.willpowerBonus} Willpower
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Footer Action & Price */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">
                      Price
                    </span>
                    <span className="font-mono font-black text-sm md:text-base text-slate-900 dark:text-white">
                      {item.price === 0
                        ? "FREE"
                        : formatCurrency(item.price, preferredCurrency)}
                    </span>
                  </div>

                  {isOwned ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs cursor-default min-h-[44px]"
                    >
                      {t("shop.owned" as TranslationKey)}
                    </button>
                  ) : isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs cursor-not-allowed flex items-center gap-1 min-h-[44px]"
                    >
                      <Lock className="h-3 w-3" />
                      Lvl {item.unlockLevel}
                    </button>
                  ) : item.category === "nutrition" ? (
                    /* Nutrition Batch Buying Controls (+1, +5) */
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => handleBuy(item, 1)}
                        disabled={!canAffordOne}
                        aria-label={`Buy 1 ${item.name[lang] || item.name.en}`}
                        className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 min-h-[44px] flex items-center gap-1 ${
                          canAffordOne
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>1</span>
                      </button>

                      {item.price > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBuy(item, 5)}
                          disabled={!canAffordFive}
                          aria-label={`Buy 5 ${item.name[lang] || item.name.en}`}
                          className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 min-h-[44px] flex items-center gap-1 ${
                            canAffordFive
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>5</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(item, 1)}
                      disabled={!canAffordOne}
                      aria-label={`Buy ${item.name[lang] || item.name.en}`}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 min-h-[44px] ${
                        canAffordOne
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {item.price === 0
                        ? t("shop.buy" as TranslationKey)
                        : canAffordOne
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
