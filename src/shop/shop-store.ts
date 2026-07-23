// shop-store.ts
// Zustand store for inventory management and persistence

import { create } from "zustand";
import { storageRepository } from "@/storage/storage-repository";
import type { Shoe, Nutrition, Gear } from "@/types/engine";
import { processPurchase } from "./shop-engine";
import type {
  PlayerInventory,
  PurchaseResult,
  ShopCategory,
} from "./shop-types";

export const DEFAULT_INVENTORY: PlayerInventory = {
  shoes: { daily_trainer: true } as Record<Shoe, boolean>,
  nutrition: {} as Record<Nutrition, number>,
  gear: {} as Record<Gear, boolean>,
};

interface ShopState {
  inventory: PlayerInventory;
  isInitialized: boolean;

  // Initializer
  initializeInventory: () => void;

  // Query methods
  hasItem: (category: ShopCategory, itemId: string) => boolean;
  getItemQuantity: (category: "nutrition", itemId: string) => number;
  getOwnedShoes: () => Shoe[];
  getOwnedGear: () => Gear[];
  getAvailableNutrition: () => Nutrition[];

  // Mutation methods
  purchaseItem: (
    itemId: string,
    category: ShopCategory,
    currentBalance: number,
    playerLevel?: number,
    quantity?: number,
  ) => PurchaseResult;
  consumeNutrition: (nutritionId: Nutrition, amount?: number) => void;
  resetInventory: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  inventory: DEFAULT_INVENTORY,
  isInitialized: false,

  initializeInventory: () => {
    if (get().isInitialized) return;
    const stored = storageRepository.loadInventory();
    if (stored) {
      set({
        inventory: {
          shoes: (stored.shoes as Record<Shoe, boolean>) || { daily_trainer: true },
          nutrition: (stored.nutrition as Record<Nutrition, number>) || {},
          gear: (stored.gear as Record<Gear, boolean>) || {},
        },
        isInitialized: true,
      });
    } else {
      set({ inventory: DEFAULT_INVENTORY, isInitialized: true });
      storageRepository.saveInventory({
        version: 1,
        ...DEFAULT_INVENTORY,
      });
    }
  },

  hasItem: (category: ShopCategory, itemId: string) => {
    const { inventory } = get();
    if (category === "shoes") return Boolean(inventory.shoes[itemId as Shoe]);
    if (category === "gear") return Boolean(inventory.gear[itemId as Gear]);
    if (category === "nutrition") {
      return (inventory.nutrition[itemId as Nutrition] || 0) > 0;
    }
    return false;
  },

  getItemQuantity: (_category: "nutrition", itemId: string) => {
    const { inventory } = get();
    return inventory.nutrition[itemId as Nutrition] || 0;
  },

  getOwnedShoes: () => {
    const { inventory } = get();
    return Object.entries(inventory.shoes)
      .filter(([, owned]) => Boolean(owned))
      .map(([id]) => id as Shoe);
  },

  getOwnedGear: () => {
    const { inventory } = get();
    return Object.entries(inventory.gear)
      .filter(([, owned]) => Boolean(owned))
      .map(([id]) => id as Gear);
  },

  getAvailableNutrition: () => {
    const { inventory } = get();
    return Object.entries(inventory.nutrition)
      .filter(([, qty]) => (qty || 0) > 0)
      .map(([id]) => id as Nutrition);
  },

  purchaseItem: (
    itemId: string,
    category: ShopCategory,
    currentBalance: number,
    playerLevel: number = 1,
    quantity: number = 1,
  ): PurchaseResult => {
    const { inventory } = get();

    // Clone inventory to avoid mutating store prematurely
    const inventoryClone: PlayerInventory = {
      shoes: { ...inventory.shoes },
      nutrition: { ...inventory.nutrition },
      gear: { ...inventory.gear },
    };

    const result = processPurchase(
      itemId,
      category,
      currentBalance,
      inventoryClone,
      playerLevel,
      quantity,
    );

    if (result.success) {
      set({ inventory: inventoryClone });
      storageRepository.saveInventory({
        version: 1,
        ...inventoryClone,
      });
    }

    return result;
  },

  consumeNutrition: (nutritionId: Nutrition, amount: number = 1) => {
    const { inventory } = get();
    const currentQty = inventory.nutrition[nutritionId] || 0;
    if (currentQty <= 0) return;

    const newQty = Math.max(0, currentQty - amount);
    const updatedInventory: PlayerInventory = {
      ...inventory,
      nutrition: {
        ...inventory.nutrition,
        [nutritionId]: newQty,
      },
    };

    set({ inventory: updatedInventory });
    storageRepository.saveInventory({
      version: 1,
      ...updatedInventory,
    });
  },

  resetInventory: () => {
    set({ inventory: DEFAULT_INVENTORY, isInitialized: true });
    storageRepository.saveInventory({
      version: 1,
      ...DEFAULT_INVENTORY,
    });
  },
}));
