import { describe, expect, it } from "vitest";
import { getItemById, getItemsByCategory } from "../shop-catalog";
import { canAffordItem, processPurchase, validatePurchase } from "../shop-engine";
import type { PlayerInventory } from "../shop-types";

describe("Shop Item Catalog", () => {
  it("should contain 12 shoes, 13 nutrition, and 12 gear items", () => {
    expect(getItemsByCategory("shoes").length).toBe(12);
    expect(getItemsByCategory("nutrition").length).toBe(13);
    expect(getItemsByCategory("gear").length).toBe(12);
  });

  it("should retrieve items by ID correctly", () => {
    const shoe = getItemById("daily_trainer");
    expect(shoe).toBeDefined();
    expect(shoe?.category).toBe("shoes");
    expect(shoe?.price).toBe(120);

    const gel = getItemById("energy_gel");
    expect(gel).toBeDefined();
    expect(gel?.category).toBe("nutrition");
    expect(gel?.price).toBe(3);

    const beetroot = getItemById("beetroot_juice");
    expect(beetroot).toBeDefined();
    expect(beetroot?.category).toBe("nutrition");
    expect(beetroot?.price).toBe(45);

    const supershoe = getItemById("plated_supershoe");
    expect(supershoe).toBeDefined();
    expect(supershoe?.category).toBe("shoes");
    expect(supershoe?.price).toBe(350);

    const backpack = getItemById("running_backpack");
    expect(backpack).toBeDefined();
    expect(backpack?.category).toBe("gear");
    expect(backpack?.price).toBe(140);
  });
});

describe("Shop Engine Purchase Validation", () => {
  const emptyInventory: PlayerInventory = {
    shoes: { daily_trainer: true } as any,
    nutrition: {} as any,
    gear: {} as any,
  };

  it("should fail validation for invalid item ID", () => {
    const res = validatePurchase("non_existent", "shoes", 500, emptyInventory, 1);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("INVALID_ITEM");
  });

  it("should fail validation if level is lower than required unlock level", () => {
    // aggressive_trail requires level 8
    const res = validatePurchase("aggressive_trail", "shoes", 500, emptyInventory, 2);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("LOCKED");
  });

  it("should fail validation if shoe is already owned", () => {
    const res = validatePurchase("daily_trainer", "shoes", 500, emptyInventory, 1);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("ALREADY_OWNED");
  });

  it("should fail validation if funds are insufficient", () => {
    const res = validatePurchase("carbon_racer", "shoes", 50, emptyInventory, 5);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("INSUFFICIENT_FUNDS");
  });

  it("should pass validation for valid unowned item with sufficient funds and level", () => {
    const res = validatePurchase("carbon_racer", "shoes", 300, emptyInventory, 5);
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });
});

describe("Shop Engine Purchase Processing", () => {
  it("should successfully process purchase of a non-consumable gear item", () => {
    const inventory: PlayerInventory = {
      shoes: { daily_trainer: true } as any,
      nutrition: { water: 5 } as any,
      gear: {} as any,
    };

    const result = processPurchase("cap", "gear", 100, inventory, 1);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(75); // $100 - $25 cap price
    expect(inventory.gear.cap).toBe(true);
  });

  it("should successfully process purchase of nutrition consumables and update quantity", () => {
    const inventory: PlayerInventory = {
      shoes: { daily_trainer: true } as any,
      nutrition: { water: 5 } as any,
      gear: {} as any,
    };

    const result = processPurchase("energy_gel", "nutrition", 50, inventory, 1, 3);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(41); // $50 - ($3 * 3)
    expect(inventory.nutrition.energy_gel).toBe(3);
  });

  it("should test canAffordItem helper", () => {
    expect(canAffordItem(100, 150)).toBe(true);
    expect(canAffordItem(100, 50)).toBe(false);
  });
});
