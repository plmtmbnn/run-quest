import type { Metadata } from "next";
import { ShopScreen } from "@/features/shop/shop-screen";

export const metadata: Metadata = {
  title: "Shop | RunQuest",
  description: "Purchase running gear, nutrition, and shoes in RunQuest.",
};

export default function ShopPage() {
  return <ShopScreen />;
}
