// shop-engine.ts
// Validation and processing engine for Centralized Shop purchases

import { getItemById } from "./shop-catalog";
import type {
  PlayerInventory,
  PurchaseErrorCode,
  PurchaseResult,
  ShopCategory,
} from "./shop-types";
import type { Shoe, Nutrition, Gear } from "@/types/engine";

export function validatePurchase(
  itemId: string,
  category: ShopCategory,
  currentBalance: number,
  inventory: PlayerInventory,
  playerLevel: number = 1,
): { valid: boolean; error?: PurchaseErrorCode } {
  const item = getItemById(itemId);
  if (!item || item.category !== category) {
    return { valid: false, error: "INVALID_ITEM" };
  }

  // Check level lock
  if (item.unlockLevel && playerLevel < item.unlockLevel) {
    return { valid: false, error: "LOCKED" };
  }

  // Check if item is already owned (shoes & gear are non-consumable)
  if (category === "shoes" && inventory.shoes[itemId as Shoe]) {
    return { valid: false, error: "ALREADY_OWNED" };
  }
  if (category === "gear" && inventory.gear[itemId as Gear]) {
    return { valid: false, error: "ALREADY_OWNED" };
  }

  // Check funds (base prices and economy balance are stored in USD)
  if (currentBalance < item.price) {
    return { valid: false, error: "INSUFFICIENT_FUNDS" };
  }

  return { valid: true };
}

export function canAffordItem(
  price: number,
  currentBalance: number,
): boolean {
  return currentBalance >= price;
}

export function processPurchase(
  itemId: string,
  category: ShopCategory,
  currentBalance: number,
  inventory: PlayerInventory,
  playerLevel: number = 1,
  quantity: number = 1,
): PurchaseResult {
  const validation = validatePurchase(
    itemId,
    category,
    currentBalance,
    inventory,
    playerLevel,
  );

  if (!validation.valid || validation.error) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const item = getItemById(itemId)!;
  const totalPrice = item.price * (category === "nutrition" ? quantity : 1);

  if (currentBalance < totalPrice) {
    return {
      success: false,
      error: "INSUFFICIENT_FUNDS",
    };
  }

  const newBalance = currentBalance - totalPrice;
  let newQuantity: number | undefined = undefined;

  if (category === "shoes") {
    inventory.shoes[itemId as Shoe] = true;
  } else if (category === "gear") {
    inventory.gear[itemId as Gear] = true;
  } else if (category === "nutrition") {
    const currentQty = inventory.nutrition[itemId as Nutrition] || 0;
    newQuantity = currentQty + quantity;
    inventory.nutrition[itemId as Nutrition] = newQuantity;
  }

  return {
    success: true,
    newBalance,
    newQuantity,
  };
}
