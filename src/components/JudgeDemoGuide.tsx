"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { formatAddress } from "@/lib/utils";
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function JudgeDemoGuide() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-surface-border bg-gradient-to-r from-surface/90 via-surface-hover/80 to-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-brand-500/20 text-brand-500 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-text-primary">
              Monad Hackathon Judge Quick-Guide
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 font-medium">
              60-Second Demo
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>{expanded ? "Hide Guide" : "Show 60s Demo Flow"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-surface-border grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-2.5 rounded-lg bg-surface/50 border border-surface-border space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 font-medium text-[11px]">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Get Testnet MON</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Need test tokens on Monad Testnet (Chain ID 10143)?
              </p>
              <a
                href="https://faucet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-500 hover:underline text-[11px] pt-1"
              >
                Official Faucet <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-lg bg-surface/50 border border-surface-border space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 font-medium text-[11px]">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Donate to Campaign</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Send 0.05 MON. Funds are locked in smart contract escrow.
              </p>
              <Link
                href="/campaigns/1"
                className="inline-flex items-center gap-1 text-brand-500 hover:underline text-[11px] pt-1"
              >
                Test Flood Relief Demo <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-lg bg-surface/50 border border-surface-border space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 font-medium text-[11px]">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Follow The Money Flow</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                See spending routed to verified supplier wallets with proof.
              </p>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-1 text-brand-500 hover:underline text-[11px] pt-1"
              >
                Explore Live Trace <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-lg bg-surface/50 border border-surface-border space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 font-medium text-[11px]">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px]">4</span>
                <span>Verify on Monad Explorer</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Every payout is an immutable on-chain event.
              </p>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${TRACEDONATE_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-500 hover:underline text-[11px] pt-1 font-mono"
              >
                Contract ({formatAddress(TRACEDONATE_CONTRACT_ADDRESS)}) <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
