import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceDonate | Transparent Giving on Monad",
  description:
    "Know where your money goes. Trace every donation. Follow every payment. Verify every transaction on Monad.",
  keywords: ["Monad", "Web3", "Charity", "Transparency", "Donations", "Smart Contracts", "Escrow"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
