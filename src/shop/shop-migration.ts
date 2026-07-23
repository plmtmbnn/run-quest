// shop-migration.ts
// Data migration from Runner Coins (RC) system to Centralized Shop System

import { loadRunnerState, saveRunnerState } from "@/runner/runner-persistence";
import { storageRepository } from "@/storage/storage-repository";
import { DEFAULT_INVENTORY } from "./shop-store";

let isMigrationComplete = false;

export function migrateToShopSystem(): void {
  if (isMigrationComplete) return;

  try {
    // 1. Load and initialize inventory if missing
    let inventory = storageRepository.loadInventory();
    if (!inventory) {
      inventory = {
        version: 1,
        ...DEFAULT_INVENTORY,
      };
      storageRepository.saveInventory(inventory);
    }

    // 2. Remove legacy coins field from runner profile if present
    const runnerState = loadRunnerState();
    const profile = runnerState?.profile as unknown as Record<string, unknown> | undefined;

    if (profile && "coins" in profile) {
      delete profile.coins;
      saveRunnerState(runnerState);
    }

    isMigrationComplete = true;
    console.log("✅ Centralized Shop System migration complete");
  } catch (error) {
    console.error("Failed to execute shop system migration:", error);
  }
}
