// shop-catalog.ts
// Master Item Database for the Centralized Shop System

import type { ShopCategory, ShopItem } from "./shop-types";

export const SHOES_CATALOG: ShopItem[] = [
  {
    id: "daily_trainer",
    category: "shoes",
    name: { en: "Daily Trainer", id: "Sepatu Latihan Harian" },
    description: {
      en: "Versatile all-around training shoe suitable for daily runs.",
      id: "Sepatu latihan serbaguna yang cocok untuk lari harian.",
    },
    price: 120,
    unlockLevel: 1,
    stats: { paceBonus: 0 },
  },
  {
    id: "lightweight",
    category: "shoes",
    name: { en: "Lightweight Speedster", id: "Sepatu Ringan Speedster" },
    description: {
      en: "Responsive and light, designed for tempo runs and quick 5Ks.",
      id: "Responsif dan ringan, dirancang untuk lari tempo dan 5K cepat.",
    },
    price: 180,
    unlockLevel: 1,
    stats: { paceBonus: 1 },
  },
  {
    id: "stability",
    category: "shoes",
    name: { en: "Stability Support", id: "Sepatu Stabilitas" },
    description: {
      en: "Provides extra guidance and ankle stability over longer distances.",
      id: "Memberikan dukungan ekstra dan stabilitas pergelangan kaki untuk jarak jauh.",
    },
    price: 150,
    unlockLevel: 1,
    stats: { staminaBonus: 1 },
  },
  {
    id: "trail",
    category: "shoes",
    name: { en: "All-Terrain Trail Runner", id: "Sepatu Lari Trail" },
    description: {
      en: "Lugged outsole for grip on unpaved paths and dirt trails.",
      id: "Sol luar bergerigi untuk cengkeraman di jalur tanah dan trail.",
    },
    price: 160,
    unlockLevel: 3,
    stats: { paceBonus: 0, staminaBonus: 1 },
  },
  {
    id: "max_cushion",
    category: "shoes",
    name: { en: "Max Cushion Cruiser", id: "Sepatu Max Cushion" },
    description: {
      en: "Maximum foam stack height to absorb impact and reduce fatigue.",
      id: "Ketebalan busa maksimal untuk menyerap benturan dan mengurangi lelah.",
    },
    price: 200,
    unlockLevel: 3,
    stats: { staminaBonus: 2 },
  },
  {
    id: "minimalist_trail",
    category: "shoes",
    name: { en: "Minimalist Trail", id: "Sepatu Trail Minimalis" },
    description: {
      en: "Low drop, agile feel for technical trail routes.",
      id: "Drop rendah, gesit untuk rute trail teknis.",
    },
    price: 140,
    unlockLevel: 5,
    stats: { paceBonus: 1 },
  },
  {
    id: "carbon_racer",
    category: "shoes",
    name: { en: "Carbon Racer Pro", id: "Sepatu Carbon Racer Pro" },
    description: {
      en: "Full carbon plate with superfoam for peak race-day performance.",
      id: "Plat karbon penuh dengan superfoam untuk performa balap maksimal.",
    },
    price: 280,
    unlockLevel: 5,
    stats: { paceBonus: 3 },
  },
  {
    id: "aggressive_trail",
    category: "shoes",
    name: { en: "Aggressive Trail Beast", id: "Sepatu Trail Mud & Rock" },
    description: {
      en: "Heavy-duty deep lugs engineered for extreme mud, steep ascents, and mountain races.",
      id: "Cengkeraman ekstra dalam untuk lumpur ekstrem, tanjakan terjal, dan balap gunung.",
    },
    price: 220,
    unlockLevel: 8,
    stats: { paceBonus: 2, staminaBonus: 1 },
  },
];

export const NUTRITION_CATALOG: ShopItem[] = [
  {
    id: "water",
    category: "nutrition",
    name: { en: "Purified Water", id: "Air Mineral" },
    description: {
      en: "Essential hydration for any race distance.",
      id: "Hidrasi esensial untuk semua jarak lari.",
    },
    price: 0,
    unlockLevel: 1,
    stats: { hydrationBonus: 1 },
  },
  {
    id: "energy_bar",
    category: "nutrition",
    name: { en: "Oatmeal Energy Bar", id: "Energy Bar Gandum" },
    description: {
      en: "Slow-release complex carbs to maintain stamina early in the race.",
      id: "Karbohidrat kompleks untuk menjaga stamina di awal lari.",
    },
    price: 2,
    unlockLevel: 1,
    stats: { staminaBonus: 1 },
  },
  {
    id: "electrolyte",
    category: "nutrition",
    name: { en: "Electrolyte Drink", id: "Minuman Elektrolit" },
    description: {
      en: "Replenishes vital minerals lost through sweat.",
      id: "Mengganti mineral penting yang hilang melalui keringat.",
    },
    price: 2,
    unlockLevel: 1,
    stats: { hydrationBonus: 2 },
  },
  {
    id: "salt_tablets",
    category: "nutrition",
    name: { en: "Salt Tablets", id: "Tablet Garam" },
    description: {
      en: "Prevents cramping in hot weather conditions.",
      id: "Mencegah kram pada cuaca panas.",
    },
    price: 3,
    unlockLevel: 1,
    stats: { hydrationBonus: 1, staminaBonus: 1 },
  },
  {
    id: "energy_gel",
    category: "nutrition",
    name: { en: "Fast-Fuel Energy Gel", id: "Energy Gel Cepat Serap" },
    description: {
      en: "Quick sugar shot for mid-race energy spikes.",
      id: "Asupan gula cepat untuk dorongan energi di tengah balapan.",
    },
    price: 3,
    unlockLevel: 1,
    stats: { staminaBonus: 2 },
  },
  {
    id: "caffeine",
    category: "nutrition",
    name: { en: "Caffeine Shot", id: "Kopi Caffeine Shot" },
    description: {
      en: "Boosts alertness and mental willpower when hitting the wall.",
      id: "Meningkatkan kewaspadaan dan mental saat menghadapi kelelahan.",
    },
    price: 4,
    unlockLevel: 3,
    stats: { willpowerBonus: 2 },
  },
  {
    id: "hydration_mix",
    category: "nutrition",
    name: { en: "Pro Hydration Mix", id: "Campuran Hidrasi Pro" },
    description: {
      en: "High-sodium carbohydrate drink mix for long endurance efforts.",
      id: "Campuran minuman karbohidrat tinggi natrium untuk lari jarak jauh.",
    },
    price: 5,
    unlockLevel: 3,
    stats: { hydrationBonus: 3, staminaBonus: 1 },
  },
  {
    id: "caffeine_gum",
    category: "nutrition",
    name: { en: "Rapid Caffeine Gum", id: "Permen Karet Kafein" },
    description: {
      en: "Absorbs quickly through buccal tissue for immediate surge.",
      id: "Diserap cepat melalui mulut untuk dorongan kafein instan.",
    },
    price: 2,
    unlockLevel: 1,
    stats: { paceBonus: 1, willpowerBonus: 1 },
  },
];

export const GEAR_CATALOG: ShopItem[] = [
  {
    id: "cap",
    category: "gear",
    name: { en: "Breathable Running Cap", id: "Topi Lari Ringan" },
    description: {
      en: "Shields face from sun and sweat.",
      id: "Melindungi wajah dari sinar matahari dan keringat.",
    },
    price: 25,
    unlockLevel: 1,
    stats: { hydrationBonus: 1 },
  },
  {
    id: "arm_sleeves",
    category: "gear",
    name: { en: "UV Arm Sleeves", id: "Sleeve Tangan UV" },
    description: {
      en: "Temperature regulation and UV protection.",
      id: "Pengatur suhu dan perlindungan dari sinar UV.",
    },
    price: 35,
    unlockLevel: 1,
    stats: { staminaBonus: 1 },
  },
  {
    id: "compression_socks",
    category: "gear",
    name: { en: "Compression Socks", id: "Kaos Kaki Kompresi" },
    description: {
      en: "Improves venous return and reduces calf muscle vibration.",
      id: "Meningkatkan sirkulasi darah dan mengurangi getaran otot betis.",
    },
    price: 40,
    unlockLevel: 1,
    stats: { staminaBonus: 1, paceBonus: 1 },
  },
  {
    id: "trail_gaiters",
    category: "gear",
    name: { en: "Trail Gaiters", id: "Gaiter Trail Pelindung" },
    description: {
      en: "Keeps gravel, sand, and debris out of shoes.",
      id: "Mencegah kerikil, pasir, dan kotoran masuk ke sepatu.",
    },
    price: 45,
    unlockLevel: 3,
    stats: { staminaBonus: 1 },
  },
  {
    id: "moisture_wicking_shirt",
    category: "gear",
    name: { en: "Pro Technical Tee", id: "Kaos Lari Teknikal Pro" },
    description: {
      en: "Ultra-lightweight mesh for optimal airflow.",
      id: "Bahan mesh ultra-ringan untuk sirkulasi udara optimal.",
    },
    price: 50,
    unlockLevel: 3,
    stats: { hydrationBonus: 2 },
  },
  {
    id: "sunglasses",
    category: "gear",
    name: { en: "Polarized Sport Sunglasses", id: "Kacamata Olahraga Polarized" },
    description: {
      en: "Reduces glare and eye strain in direct sunlight.",
      id: "Mengurangi silau dan ketegangan mata di bawah terik matahari.",
    },
    price: 60,
    unlockLevel: 3,
    stats: { willpowerBonus: 1 },
  },
  {
    id: "hydration_vest",
    category: "gear",
    name: { en: "Hydration Race Vest", id: "Rompi Lari Hidrasi" },
    description: {
      en: "Ergonomic vest carrying extra fluids comfortably.",
      id: "Rompi ergonomis untuk membawa cairan tambahan dengan nyaman.",
    },
    price: 80,
    unlockLevel: 5,
    stats: { hydrationBonus: 3 },
  },
  {
    id: "lightweight_jacket",
    category: "gear",
    name: { en: "Windproof Running Jacket", id: "Jaket Lari Tahan Angin" },
    description: {
      en: "Shields against harsh winds and rain.",
      id: "Melindungi dari angin kencang dan hujan.",
    },
    price: 120,
    unlockLevel: 5,
    stats: { staminaBonus: 2 },
  },
];

export const FULL_CATALOG: ShopItem[] = [
  ...SHOES_CATALOG,
  ...NUTRITION_CATALOG,
  ...GEAR_CATALOG,
];

export function getItemById(id: string): ShopItem | undefined {
  return FULL_CATALOG.find((item) => item.id === id);
}

export function getItemsByCategory(category: ShopCategory): ShopItem[] {
  return FULL_CATALOG.filter((item) => item.category === category);
}
