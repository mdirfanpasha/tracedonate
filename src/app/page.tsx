"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SEED_CAMPAIGNS, TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { NetworkVisualizer3D } from "@/components/NetworkVisualizer3D";
import { DonationModal } from "@/components/DonationModal";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { Campaign } from "@/lib/types";
import { formatAddress, getCategoryColor } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  Activity,
  Layers,
  FileCheck,
  ExternalLink,
  Coins,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  Lock,
  Eye,
} from "lucide-react";

export default function HomePage() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastDonationTx, setLastDonationTx] = useState("");
  const [lastDonationAmount, setLastDonationAmount] = useState("0.05");

  const handleQuickDonate = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDonationOpen(true);
  };

  const handleDonationSuccess = (txHash: string, amount: string) => {
    setLastDonationTx(txHash);
    setLastDonationAmount(amount);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Copy */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-surface-border text-xs font-mono text-text-secondary backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Built Natively on Monad Testnet</span>
              <span className="text-surface-border">|</span>
              <span className="text-brand-500 font-semibold">10,000 TPS Settlement</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
              Know where your <br />
              <span className="bg-gradient-to-r from-text-primary via-brand-500 to-brand-cyan bg-clip-text text-transparent">
                money really goes.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              TraceDonate makes charitable giving transparent by putting donations and spending on-chain. Follow every payment. Verify every transaction.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/campaigns"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-cyan text-background font-bold text-sm shadow-lg shadow-brand-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Active Campaigns</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/transparency"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-text-primary font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4 text-brand-500" />
                <span>Follow The Money Flow</span>
              </Link>
            </div>
          </div>

          {/* 3D Financial Flow Network Visualizer Centerpiece */}
          <div className="max-w-5xl mx-auto pt-4">
            <NetworkVisualizer3D />
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-surface-border shadow-xl">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Total Raised</span>
            <div className="text-2xl font-bold font-mono text-brand-500">164.600 <span className="text-xs text-text-muted">MON</span></div>
            <p className="text-[11px] text-text-secondary">Across 3 active campaigns</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Verified Payouts</span>
            <div className="text-2xl font-bold font-mono text-brand-cyan">93.800 <span className="text-xs text-text-muted">MON</span></div>
            <p className="text-[11px] text-text-secondary">Direct vendor settlement</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Funds Traced</span>
            <div className="text-2xl font-bold font-mono text-text-primary">100.0%</div>
            <p className="text-[11px] text-brand-500 font-medium">Zero opaque leakage</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Settlement Speed</span>
            <div className="text-2xl font-bold font-mono text-monad-light">&lt; 1 sec</div>
            <p className="text-[11px] text-text-secondary">Monad parallel execution</p>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM VS SOLUTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="p-8 rounded-3xl bg-surface/40 border border-red-500/20 space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">The Traditional Charity Problem</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                When people donate to traditional charities, their money vanishes into an opaque organizational account. Donors are forced to rely on unverified PDF annual reports published months later.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-red-300/80 pt-2 font-mono">
              <li className="flex items-center gap-2">✕ Donors cannot trace where their specific funds went</li>
              <li className="flex items-center gap-2">✕ Organizations can withdraw lump sums arbitrarily</li>
              <li className="flex items-center gap-2">✕ No cryptographic verification of supplier payments</li>
            </ul>
          </div>

          {/* Solution */}
          <div className="p-8 rounded-3xl bg-surface/40 border border-brand-500/30 space-y-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">The TraceDonate Solution</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                All donations are locked in the <span className="font-mono text-brand-500">TraceDonate.sol</span> smart contract on Monad. Funds are only unlocked when paid directly to audited supplier wallets with accompanying invoice proofs.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-brand-300 pt-2 font-mono">
              <li className="flex items-center gap-2">✓ Contract holds funds in automated escrow</li>
              <li className="flex items-center gap-2">✓ Direct settlement to verified vendor addresses</li>
              <li className="flex items-center gap-2">✓ Every payment links directly to Monad Explorer</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase text-brand-500 tracking-wider">
            Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-text-primary">
            How TraceDonate Enforces Integrity
          </h2>
          <p className="text-sm text-text-secondary">
            A 5-step cryptographic pipeline ensuring 100% financial accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: "01",
              title: "Donate MON",
              desc: "Donor connects wallet and contributes testnet MON to an active campaign.",
              icon: Coins,
            },
            {
              step: "02",
              title: "Escrow Lock",
              desc: "TraceDonate.sol locks the deposit. Organizers cannot withdraw directly.",
              icon: Lock,
            },
            {
              step: "03",
              title: "Submit Expense",
              desc: "Organization submits itemized vendor invoice and supplier Monad wallet.",
              icon: FileCheck,
            },
            {
              step: "04",
              title: "Verifier Audit",
              desc: "Authorized auditor inspects evidence and triggers on-chain release.",
              icon: ShieldCheck,
            },
            {
              step: "05",
              title: "Direct Payout",
              desc: "Contract executes direct transfer to supplier with immutable Monad tx hash.",
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-surface border border-surface-border hover:border-brand-500/40 transition-all space-y-3 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-brand-500 font-bold">
                      {item.step}
                    </span>
                    <Icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary">{item.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FEATURED CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-brand-500 tracking-wider">
              Active Fundraisers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Live Verifiable Campaigns
            </h2>
            <p className="text-xs text-text-secondary">
              Every campaign is an independent smart contract state on Monad Testnet.
            </p>
          </div>

          <Link
            href="/campaigns"
            className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEED_CAMPAIGNS.map((campaign) => {
            const pct = Math.min(
              100,
              Math.round((parseFloat(campaign.totalRaised) / parseFloat(campaign.goal)) * 100)
            );

            return (
              <div
                key={campaign.id}
                className="rounded-2xl bg-surface-card border border-surface-border hover:border-brand-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group"
              >
                <div className="space-y-4">
                  {/* Campaign Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-surface">
                    <img
                      src={campaign.imageUri}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-surface-border text-[10px] font-mono text-brand-500">
                      {campaign.category}
                    </div>
                  </div>

                  {/* Campaign Text */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-text-primary line-clamp-1">
                      {campaign.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-brand-500 font-bold">{campaign.totalRaised} MON</span>
                        <span className="text-text-muted">{campaign.goal} MON Goal</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface border border-surface-border overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-cyan rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Money Traced Pill */}
                    <div className="p-2.5 rounded-xl bg-surface/70 border border-surface-border flex items-center justify-between text-xs font-mono">
                      <span className="text-text-muted">Spent to Suppliers:</span>
                      <span className="text-brand-cyan font-bold">{campaign.totalSpent} MON</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-center text-xs font-semibold text-text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Follow Money</span>
                  </Link>

                  <button
                    onClick={() => handleQuickDonate(campaign as unknown as Campaign)}
                    type="button"
                    className="py-2.5 rounded-xl bg-brand-500 hover:opacity-95 text-background font-bold text-xs shadow-md shadow-brand-500/10 transition-all flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Donate MON</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. WHY MONAD SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface via-surface-card to-monad-dark/20 border border-monad/30 shadow-2xl relative overflow-hidden space-y-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-monad/20 text-monad-light border border-monad/30 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Why Monad Blockchain?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              High-throughput settlement makes micro-expense tracking practical.
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Tracking every purchase of bread, medical bandages, or fuel on traditional blockchains would cost more in gas fees than the items themselves. Monad&apos;s parallel execution engine and sub-cent fees make true itemized financial transparency possible for the first time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-surface-border text-xs">
            <div className="space-y-1">
              <span className="font-mono text-brand-500 font-bold">10,000 TPS</span>
              <p className="text-text-secondary">Instant parallel state updates for large aid operations.</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-brand-cyan font-bold">&lt; $0.001 Fees</span>
              <p className="text-text-secondary">100% of donation value reaches suppliers without gas loss.</p>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-monad-light font-bold">100% EVM Compatible</span>
              <p className="text-text-secondary">Seamless wallet support across MetaMask, Rabby, and Phantom.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          Give with proof. Follow every payment.
        </h2>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Try donating 0.05 testnet MON to inspect the real-time money flow and generate your cryptographic impact receipt.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/campaigns/1"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-sm shadow-xl shadow-brand-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span>Try Flood Relief Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Modals */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      {selectedCampaign && (
        <ImpactReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          campaign={selectedCampaign}
          donationAmount={lastDonationAmount}
          txHash={lastDonationTx}
        />
      )}
    </div>
  );
}
