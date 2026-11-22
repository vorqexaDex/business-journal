import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { HapticsListener } from "@/components/haptics-listener";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Business Journal", template: "%s | Business Journal" },
  description: "See your revenue, profit and stock clearly.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} dark`}>
      <body className="min-h-screen antialiased">
        <HapticsListener />
        {children}
      </body>
    </html>
  );
}
