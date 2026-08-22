"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MONAD_EXPLORER_URL } from "@/config/contracts";
import { MoneyFlowGraph } from "@/components/MoneyFlowGraph";
import { DonationModal } from "@/components/DonationModal";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { useCampaignDetails } from "@/hooks/useTraceDonateContract";
import { formatAddress } from "@/lib/utils";
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  Receipt,
  ExternalLink,
  Lock,
  Layers,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params?.id) || 1;

  const { campaign, refetch: refetchCampaign } = useCampaignDetails(campaignId);

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastDonationTx, setLastDonationTx] = useState("");
  const [lastDonationAmount, setLastDonationAmount] = useState("0.1");

  const raised = parseFloat(campaign.totalRaised);
  const goal = parseFloat(campaign.goal);
  const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));

  const handleDonationSuccess = (hash: string, amount: string) => {
    setLastDonationTx(hash);
    setLastDonationAmount(amount);
    setIsReceiptOpen(true);
    refetchCampaign();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Back Navigation */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaigns</span>
      </Link>

      {/* Campaign Header & Overview */}
      <div className="space-y-6">
        {/* Cover Image & Category */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-white/[0.08]">
          <img
            src={campaign.imageUri}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-mono text-emerald-400 border border-white/10">
            {campaign.category}
          </div>
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-mono text-slate-300 border border-white/10">
            Org: {formatAddress(campaign.organization, 4)}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {campaign.title}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {campaign.description}
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="p-6 rounded-2xl bg-surface border border-white/[0.08] space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Total Raised</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {campaign.totalRaised} <span className="text-sm text-slate-400">/ {campaign.goal} MON</span>
              </div>
            </div>
            <div className="text-sm font-mono text-emerald-400 font-semibold">
              {percent}% Funded • 128 Donors
            </div>
          </div>

          <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono border-t border-white/[0.05]">
            <div>
              <span className="text-slate-500 block">AVAILABLE IN ESCROW</span>
              <span className="text-emerald-400 font-bold text-sm">
                {campaign.currentBalance} MON
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">TOTAL SPENT</span>
              <span className="text-white font-bold text-sm">
                {campaign.totalSpent} MON
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block">SMART CONTRACT</span>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${campaign.organization}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 font-mono text-xs pt-0.5"
              >
                <span>Monad Verified</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* TWO PRIMARY ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => setIsDonationOpen(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Coins className="w-4 h-4" />
              <span>DONATE MON</span>
            </button>

            <a
              href="#follow-the-money"
              className="w-full py-3.5 rounded-xl bg-surface border border-white/[0.12] text-white hover:bg-surface-hover font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FOLLOW THE MONEY</span>
            </a>
          </div>
        </div>
      </div>

      {/* SIGNATURE SECTION: FOLLOW THE MONEY */}
      <section id="follow-the-money" className="space-y-6 pt-4 scroll-mt-24">
        <MoneyFlowGraph campaign={campaign} />
      </section>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        campaign={campaign}
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
