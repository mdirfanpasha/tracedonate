"use client";

import React from "react";
import Link from "next/link";
import { NetworkVisualizer3D } from "@/components/NetworkVisualizer3D";
import { useAllCampaigns, useGlobalStats } from "@/hooks/useTraceDonateContract";
import {
  ShieldCheck,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Zap,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const { campaigns } = useAllCampaigns();
  const { stats } = useGlobalStats();

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monad Testnet • Direct Escrow Transparency</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Know{" "}
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-8">
              where your money goes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-normal">
            Trace every donation. Follow every payment. Verify every transaction on Monad.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/campaigns"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Explore Campaigns</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
          >
            How It Works
          </a>
        </div>

        {/* Hero Visual */}
        <div className="pt-6">
          <NetworkVisualizer3D />
        </div>
      </section>

      {/* Global Transparency Metric Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Total Donated</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.totalDonated} <span className="text-xs text-slate-500 font-normal">MON</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Verified Payouts</span>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              {stats.totalSpent} <span className="text-xs text-slate-500 font-normal">MON</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Active Campaigns</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {campaigns.length}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Transparency Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              100% On-Chain
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How TraceDonate Works
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Traditional charities give annual PDF reports. TraceDonate records every transaction in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Donate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose a campaign and donate testnet MON directly with your wallet.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Funds Secured</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The smart contract locks campaign funds in escrow until verified.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Money Spent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verified vendor expenses are approved and paid directly through contract.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">Traceable</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every invoice and payment transaction is publicly recorded on Monad.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center">
              05
            </div>
            <h3 className="text-sm font-bold text-slate-900">You Verify</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect receipt proofs and supplier settlements on the block explorer.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Pillars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#EEF7F4] border border-emerald-200/60 space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Built for Transparency</h2>
            <p className="text-xs sm:text-sm text-slate-600">The three pillars ensuring verifiable charitable impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                ON-CHAIN ESCROW
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All financial transfers are custody-locked and executed strictly through smart contract invariants.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                PUBLICLY VERIFIABLE
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anyone can inspect immutable block transactions, recipient wallet addresses, and timestamps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                AUDITED EVIDENCE
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vendor invoices, delivery manifests, and itemized receipts accompany every release of funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by Monad Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#F1F7FF] border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-700 font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>High Performance Settlement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Powered by Monad</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              TraceDonate uses Monad to make donation and payment tracking fast, transparent, and practical on-chain with instant finality and minimal gas fees.
            </p>
          </div>
          <div className="shrink-0 p-4 rounded-2xl bg-white border border-blue-100 shadow-sm text-center">
            <div className="text-2xl font-bold font-mono text-slate-900">10,000 TPS</div>
            <div className="text-[11px] text-slate-500 font-medium">Monad Testnet • 10143</div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Active Campaigns</h2>
            <p className="text-xs text-slate-500">Discover transparent initiatives open for support</p>
          </div>
          <Link
            href="/campaigns"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.slice(0, 3).map((campaign) => {
            const raised = parseFloat(campaign.totalRaised);
            const goal = parseFloat(campaign.goal);
            const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-card transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={campaign.imageUri}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-mono text-emerald-800 border border-slate-200 font-semibold">
                      {campaign.category}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {campaign.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-900 font-bold">{campaign.totalRaised} MON</span>
                    <span className="text-slate-500">of {campaign.goal} MON</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>128 donors</span>
                    <span className="text-emerald-700 font-semibold group-hover:underline">
                      View Campaign →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
