"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MONAD_EXPLORER_URL } from "@/config/contracts";
import { MoneyFlowGraph } from "@/components/MoneyFlowGraph";
import { DonationModal } from "@/components/DonationModal";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { useCampaignDetails, useCampaignDonations } from "@/hooks/useTraceDonateContract";
import { formatAddress } from "@/lib/utils";
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  Receipt,
  ExternalLink,
  Lock,
  CheckCircle2,
  HeartHandshake,
  Home,
  Layers,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params?.id) || 1;

  const { campaign, refetch: refetchCampaign } = useCampaignDetails(campaignId);
  const donations = useCampaignDonations(campaignId);

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastDonationTx, setLastDonationTx] = useState("");
  const [lastDonationAmount, setLastDonationAmount] = useState("0.1");

  const raised = parseFloat(campaign.totalRaised) || 0;
  const goal = parseFloat(campaign.goal) || 1;
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  const remaining = Math.max(0, goal - raised).toFixed(3);

  const handleDonationSuccess = (hash: string, amount: string) => {
    setLastDonationTx(hash);
    setLastDonationAmount(amount);
    setIsReceiptOpen(true);
    refetchCampaign();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link
            href="/"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/campaigns"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campaigns</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-sm">
            {campaign.title}
          </span>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Image, Story, Impact, Follow My Money */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Campaign Cover Image */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={campaign.imageUri}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-mono font-bold text-emerald-800 border border-slate-200">
              {campaign.category}
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-mono text-slate-700 border border-slate-200">
              Org: {formatAddress(campaign.organization, 4)}
            </div>
          </div>

          {/* Title & Story */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {campaign.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Impact Guarantee Card */}
          <div className="p-6 rounded-2xl bg-[#EEF7F4] border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Smart Contract Escrow Guarantee</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Funds donated to this campaign are locked in the TraceDonate smart contract on Monad. They cannot be transferred to private organizer accounts and are only released upon audited proof of supplier invoices.
            </p>
          </div>

          {/* SIGNATURE SECTION: FOLLOW THE MONEY */}
          <section id="follow-the-money" className="space-y-6 pt-4 scroll-mt-24">
            <MoneyFlowGraph campaign={campaign} />
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Fintech Donation Component */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-elevated space-y-6">
            {/* Raised & Goal */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Total Raised</span>
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {campaign.totalRaised} <span className="text-sm font-normal text-slate-500">MON</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">Target Goal</span>
                  <span className="text-lg font-bold font-mono text-slate-600">
                    {campaign.goal} MON
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>{percent}% of target ({remaining} MON left)</span>
                <span>{donations.length} verified donor{donations.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            {/* Escrow & Spent Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Available In Escrow</span>
                <span className="text-emerald-700 font-bold text-sm">
                  {campaign.currentBalance} MON
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Verified Released</span>
                <span className="text-slate-900 font-bold text-sm">
                  {campaign.totalSpent} MON
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsDonationOpen(true)}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>DONATE MON NOW</span>
            </button>

            {/* Secondary Action */}
            <a
              href="#follow-the-money"
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Follow the Money Trail</span>
            </a>

            {/* Verification Guarantee */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Monad Contract</span>
              </span>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${campaign.organization}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-0.5 font-mono"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Monad Chain Badge */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono">
                MON
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Monad Testnet Native</h4>
                <p className="text-[11px] text-slate-500">Chain ID: 10143 • Instant Finality</p>
              </div>
            </div>
            <a
              href={MONAD_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Network</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        campaign={campaign}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        onSuccess={handleDonationSuccess}
      />

      {/* Impact Receipt Modal */}
      <ImpactReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        campaign={campaign}
        donationAmount={lastDonationAmount}
        txHash={lastDonationTx}
      />
    </div>
  );
}
