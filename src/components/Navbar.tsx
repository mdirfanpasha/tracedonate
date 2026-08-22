"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { MONAD_TESTNET_CHAIN_ID } from "@/config/contracts";
import { ShieldCheck, Menu, X, AlertTriangle } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== MONAD_TESTNET_CHAIN_ID;

  const navLinks = [
    { href: "/campaigns", label: "Campaigns" },
    { href: "/dashboard/donor", label: "My Donations" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  return (
    <>
      {/* Wrong Network Warning Banner */}
      {isWrongNetwork && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Please switch to Monad Testnet to interact with smart contracts.</span>
          <button
            onClick={() => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })}
            className="ml-2 px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
          >
            Switch to Monad
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Trace<span className="text-emerald-600">Donate</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold hidden sm:inline-block">
                Monad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Wallet */}
          <div className="hidden md:flex items-center gap-3">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{chain.name || "Monad"}</span>
                          </button>

                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-medium text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-100">
              <ConnectButton showBalance={false} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
