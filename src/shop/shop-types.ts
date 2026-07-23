// shop-types.ts
// Type definitions for the Centralized Shop System

import type { Shoe, Nutrition, Gear } from "@/types/engine";

export type ShopCategory = "shoes" | "nutrition" | "gear";

export interface LocalizedText {
  en: string;
  id: string;
}

export interface ShopItemStats {
  paceBonus?: number;
  staminaBonus?: number;
  hydrationBonus?: number;
  willpowerBonus?: number;
}

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: LocalizedText;
  description: LocalizedText;
  price: number; // Base price in USD
  unlockLevel?: number; // Minimum player level required
  image?: string;
  stats?: ShopItemStats;
}

export interface PlayerInventory {
  shoes: Record<Shoe, boolean>; // One-time boolean purchase
  nutrition: Record<Nutrition, number>; // Consumable quantity tracking
  gear: Record<Gear, boolean>; // One-time boolean purchase
}

export type PurchaseErrorCode =
  | "INSUFFICIENT_FUNDS"
  | "ALREADY_OWNED"
  | "LOCKED"
  | "INVALID_ITEM";

export interface PurchaseResult {
  success: boolean;
  error?: PurchaseErrorCode;
  newBalance?: number;
  newQuantity?: number;
}
