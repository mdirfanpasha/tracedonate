"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatAddress, formatDateTime } from "@/lib/utils";
import { TransactionBadge } from "@/components/TransactionBadge";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { SEED_CAMPAIGNS } from "@/config/contracts";
import { Campaign } from "@/lib/types";
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Layers,
  Award,
  ExternalLink,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Clock,
  Building2,
  User,
} from "lucide-react";

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount();
  const [selectedReceiptCampaign, setSelectedReceiptCampaign] = useState<Campaign | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState("");
  const [receiptAmt, setReceiptAmt] = useState("0.5");

  // Sample personal donation activity
  const donorDonations = [
    {
      id: "don-1",
      campaignId: 1,
      campaignTitle: "Flood Relief 2026: Direct Emergency Response",
      amount: "0.500",
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
      txHash: "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2",
      tracedItems: [
        { cat: "Food", amt: "0.250 MON", recipient: "0x892a...1014" },
        { cat: "Medical", amt: "0.150 MON", recipient: "0x28a1...05f2" },
        { cat: "In Escrow", amt: "0.100 MON", recipient: "TraceDonate.sol" },
      ],
    },
    {
      id: "don-2",
      campaignId: 2,
      campaignTitle: "Solar Water Purification Micro-Wells",
      amount: "0.250",
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      tracedItems: [
        { cat: "Equipment", amt: "0.180 MON", recipient: "0x7099...79c8" },
        { cat: "In Escrow", amt: "0.070 MON", recipient: "TraceDonate.sol" },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Donor Financial Trail
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
              Personal Portfolio
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Follow the exact journey of your donated testnet MON down to individual vendor invoices.
          </p>
        </div>

        {isConnected && address && (
          <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-text-muted">Donor:</span>
            <span className="text-brand-500 font-semibold">{formatAddress(address, 6)}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Total MON Donated</span>
          <div className="text-2xl font-bold font-mono text-brand-500">
            0.750 <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-text-secondary">2 Campaigns Supported</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Funds Traced</span>
          <div className="text-2xl font-bold font-mono text-brand-cyan">
            96.4%
          </div>
          <p className="text-[11px] text-text-secondary">0.723 MON in Verified Flow</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Verified Spent</span>
          <div className="text-2xl font-bold font-mono text-text-primary">
            0.580 <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-brand-500">Paid to audited suppliers</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">In Contract Escrow</span>
          <div className="text-2xl font-bold font-mono text-monad-light">
            0.170 <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-text-secondary">Awaiting next batch audit</p>
        </div>
      </div>

      {/* "I Can Follow My Money" Timeline */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
              <span>Your Live Money Trail</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Chronological proof of deposits and subsequent releases from contract to suppliers.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {donorDonations.map((don) => (
            <div
              key={don.id}
              className="p-5 rounded-xl bg-surface/60 border border-surface-border space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary">
                      {don.campaignTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                      ID #{don.campaignId}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono">
                    Donated: {formatDateTime(don.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-mono font-bold text-brand-500">
                    {don.amount} MON
                  </span>

                  <button
                    onClick={() => {
                      const c = SEED_CAMPAIGNS.find((sc) => sc.id === don.campaignId);
                      if (c) {
                        setSelectedReceiptCampaign(c as unknown as Campaign);
                        setReceiptTx(don.txHash);
                        setReceiptAmt(don.amount);
                        setIsReceiptOpen(true);
                      }
                    }}
                    type="button"
                    className="px-3 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-brand-500 font-medium transition-colors flex items-center gap-1"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {don.tracedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-card border border-surface-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{item.cat}</span>
                      <span className="font-mono text-brand-500 font-bold">{item.amt}</span>
                    </div>
                    <div className="text-[11px] text-text-muted font-mono truncate">
                      To: {item.recipient}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transaction Link */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">Deposit Transaction:</span>
                <TransactionBadge txHash={don.txHash} />
              </div>
            </div>
          ))}
        </div>
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
