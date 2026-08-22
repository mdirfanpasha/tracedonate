import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JudgeDemoGuide } from "@/components/JudgeDemoGuide";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceDonate | Transparent Charitable Giving on Monad",
  description:
    "Every donation. Every payment. Every proof. TraceDonate is a transparent Web3 charitable giving platform built on Monad where money is held in smart contract escrow and traced to verified supplier settlements.",
  keywords: ["Monad", "Web3", "Charity", "Transparency", "Blockchain Donations", "Smart Contracts", "Escrow", "DeFi"],
  openGraph: {
    title: "TraceDonate | Transparent Charitable Giving on Monad",
    description: "Every donation. Every payment. Every proof. Follow your money on-chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary antialiased flex flex-col min-h-screen">
        <Providers>
          <JudgeDemoGuide />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
