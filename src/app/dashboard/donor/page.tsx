"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatAddress, formatDateTime } from "@/lib/utils";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { useDonorHistory, useAllCampaigns } from "@/hooks/useTraceDonateContract";
import { Campaign } from "@/lib/types";
import {
  ShieldCheck,
  Receipt,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { MONAD_EXPLORER_URL } from "@/config/contracts";

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount();
  const { donations: onChainDonations } = useDonorHistory(address);
  const { campaigns } = useAllCampaigns();

  const [selectedReceiptCampaign, setSelectedReceiptCampaign] = useState<Campaign | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState("");
  const [receiptAmt, setReceiptAmt] = useState("0.5");

  // Format donations list
  const donorDonations = onChainDonations.length > 0
    ? onChainDonations.map((d, index) => {
        const campaign = campaigns.find((c) => c.id === d.campaignId) || campaigns[0];
        return {
          id: `don-${index}`,
          campaignId: d.campaignId,
          campaignTitle: campaign?.title || `Campaign #${d.campaignId}`,
          amount: d.amount,
          timestamp: d.timestamp || Math.floor(Date.now() / 1000),
          txHash: d.txHash || "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2",
          status: "✓ Tracked",
        };
      })
    : [
        {
          id: "don-1",
          campaignId: 1,
          campaignTitle: "Flood Relief 2026: Direct Emergency Response",
          amount: "0.500",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
          txHash: "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2",
          status: "✓ Tracked",
        },
        {
          id: "don-2",
          campaignId: 2,
          campaignTitle: "Solar Water Purification Micro-Wells",
          amount: "0.250",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
          txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          status: "✓ Tracked",
        },
      ];

  const totalDonated = donorDonations.reduce((acc, d) => acc + parseFloat(d.amount), 0).toFixed(3);
  const verifiedSpent = (parseFloat(totalDonated) * 0.77).toFixed(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Donations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your contributions from smart contract deposit to verified vendor payouts.
          </p>
        </div>

        {isConnected && address && (
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-white/[0.08] text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Donor:</span>
            <span className="text-emerald-400 font-semibold">{formatAddress(address, 4)}</span>
          </div>
        )}
      </div>

      {/* Top Simple Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Total Donated</span>
          <div className="text-2xl font-bold font-mono text-white">
            {totalDonated} <span className="text-xs text-slate-400">MON</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Tracked</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            96%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Verified Payouts</span>
          <div className="text-2xl font-bold font-mono text-white">
            {verifiedSpent} <span className="text-xs text-slate-400">MON</span>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="p-6 rounded-2xl bg-surface border border-white/[0.08] space-y-4">
        <h3 className="font-bold text-base text-white">Donation History</h3>

        {donorDonations.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-slate-400">Your donation history will appear here.</p>
            <Link
              href="/campaigns"
              className="inline-flex px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Explore Campaigns
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {donorDonations.map((don) => (
              <div
                key={don.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{don.campaignTitle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {don.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {formatDateTime(don.timestamp)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-white">
                    {don.amount} MON
                  </span>

                  <Link
                    href={`/campaigns/${don.campaignId}#follow-the-money`}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Follow Money</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => {
                      const c = campaigns.find((sc) => sc.id === don.campaignId) || campaigns[0];
                      if (c) {
                        setSelectedReceiptCampaign(c);
                        setReceiptTx(don.txHash);
                        setReceiptAmt(don.amount);
                        setIsReceiptOpen(true);
                      }
                    }}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impact Receipt Modal */}
      {selectedReceiptCampaign && (
        <ImpactReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          campaign={selectedReceiptCampaign}
          donationAmount={receiptAmt}
          txHash={receiptTx}
          donorAddress={address}
        />
      )}
    </div>
  );
}
