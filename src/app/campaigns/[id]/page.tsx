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
  CheckCircle2,
  HeartHandshake,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back Navigation */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaigns</span>
      </Link>

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
                <span>{percent}% of target goal</span>
                <span>128 verified donors</span>
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
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10"
            >
              <Coins className="w-4 h-4" />
              <span>DONATE MON NOW</span>
            </button>

            {/* Secondary Action */}
            <a
              href="#follow-the-money"
              className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
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
        </div>
      </div>

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
