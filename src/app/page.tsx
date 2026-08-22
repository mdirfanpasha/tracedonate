"use client";

import React from "react";
import Link from "next/link";
import { NetworkVisualizer3D } from "@/components/NetworkVisualizer3D";
import { useAllCampaigns, useGlobalStats } from "@/hooks/useTraceDonateContract";
import { formatAddress } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Lock,
  Layers,
  Search,
} from "lucide-react";

export default function HomePage() {
  const { campaigns } = useAllCampaigns();
  const { stats } = useGlobalStats();

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monad Testnet • Real-Time Public Auditing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Know where your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-emerald-400">
              money goes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-normal">
            Trace every donation. Verify every payment. Built on Monad.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/campaigns"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Explore Campaigns</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface border border-white/[0.08] text-slate-300 font-medium text-sm hover:bg-surface-hover hover:text-white transition-colors flex items-center justify-center"
          >
            See How It Works
          </a>
        </div>

        {/* Hero Visual */}
        <div className="pt-6">
          <NetworkVisualizer3D />
        </div>
      </section>

      {/* Global Metric Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface/60 border border-white/[0.06]">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Total Donated</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {stats.totalDonated} <span className="text-xs text-slate-400">MON</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Verified Payouts</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {stats.totalSpent} <span className="text-xs text-slate-400">MON</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Active Campaigns</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {campaigns.length}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Transparency Rate</span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              100% On-Chain
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How TraceDonate Works
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Traditional charities give reports months later. TraceDonate records every transaction live on Monad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">1. Smart Contract Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Donations are locked directly into smart contract custody. Organizations cannot arbitrarily withdraw funds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">2. Itemized Invoices</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To spend funds, organizations submit audited vendor requests with invoices, categories, and supplier wallets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">3. Direct Supplier Payout</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon verifier approval, funds transfer directly to the supplier's wallet on Monad with public transaction proof.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Campaigns</h2>
            <p className="text-xs text-slate-400">Discover transparent initiatives open for support</p>
          </div>
          <Link
            href="/campaigns"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
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
                className="group p-5 rounded-2xl bg-surface border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-800">
                    <img
                      src={campaign.imageUri}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-white/10">
                      {campaign.category}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {campaign.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-bold">{campaign.totalRaised} MON</span>
                    <span className="text-slate-400">of {campaign.goal} MON</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{percent}% funded</span>
                    <span className="text-emerald-400 font-medium group-hover:underline">
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
