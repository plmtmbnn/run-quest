import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/components/providers/app-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "RunQuest — Daily Running Decision Game",
  description:
    "A daily running strategy game. Build your race plan. Discover the outcome. Come back tomorrow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-gray-900 dark:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
