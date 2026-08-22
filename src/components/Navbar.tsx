"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { MONAD_TESTNET_CHAIN_ID } from "@/config/contracts";
import {
  Activity,
  Layers,
  Search,
  ShieldCheck,
  Building2,
  User,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== MONAD_TESTNET_CHAIN_ID;

  const navLinks = [
    { href: "/campaigns", label: "Campaigns", icon: Search },
    { href: "/transparency", label: "Follow The Money", icon: Activity },
    { href: "/dashboard/donor", label: "Donor Dashboard", icon: User },
    { href: "/dashboard/org", label: "Org & Verifier", icon: Building2 },
  ];

  return (
    <>
      {/* Wrong Network Banner */}
      {isWrongNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs sm:text-sm text-amber-300 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>You are connected to an unsupported network. Please switch to Monad Testnet.</span>
          <button
            onClick={() => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })}
            className="ml-2 px-2.5 py-0.5 rounded bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-colors"
          >
            Switch to Monad Testnet
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 via-brand-400 to-brand-cyan p-[1px] flex items-center justify-center shadow-lg shadow-brand-500/10 group-hover:shadow-brand-500/25 transition-all">
                <div className="w-full h-full bg-background rounded-[7px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-text-primary">
                    Trace<span className="text-brand-500">Donate</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-monad/10 text-monad-light border border-monad/30">
                    Monad
                  </span>
                </div>
                <span className="text-[10px] text-text-muted hidden sm:block">
                  Verified On-Chain Giving
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-surface text-brand-500 border border-surface-border shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-500" : "text-text-muted"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Monad Faucet link */}
            <a
              href="https://faucet.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-[11px] font-medium text-text-secondary hover:text-brand-500 hover:border-brand-500/30 transition-all"
              title="Get testnet MON tokens from the official Monad faucet"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Get Testnet MON</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Web3 Connect Button */}
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
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 text-background font-semibold text-xs hover:opacity-95 shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-xs hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-xs text-text-secondary hover:text-text-primary hover:border-surface-active transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="font-mono text-[11px]">Monad Testnet</span>
                          </button>

                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-text-primary font-mono transition-all flex items-center gap-2 shadow-sm"
                          >
                            <span className="text-brand-500 font-semibold">{account.displayBalance ? `${account.displayBalance}` : ""}</span>
                            <span className="text-surface-border">|</span>
                            <span>{account.displayName}</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-surface border border-surface-border text-text-secondary hover:text-text-primary"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-surface text-brand-500 border border-surface-border"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-500" />
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://faucet.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-brand-500 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Get Testnet MON</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        )}
      </header>
    </>
  );
}
