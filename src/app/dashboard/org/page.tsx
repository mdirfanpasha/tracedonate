"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { CreateExpenseModal } from "@/components/CreateExpenseModal";
import { VerifyExpenseModal } from "@/components/VerifyExpenseModal";
import { TransactionBadge } from "@/components/TransactionBadge";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress, getCategoryColor, getExplorerAddressUrl } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useAllCampaigns } from "@/hooks/useTraceDonateContract";
import {
  Building2,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coins,
  Receipt,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function OrgDashboardPage() {
  const { address, isConnected } = useAccount();
  const { campaigns, refetch: refetchCampaigns } = useAllCampaigns();
  const [selectedCampaignForExpense, setSelectedCampaignForExpense] = useState<Campaign | null>(null);
  const [selectedExpenseToVerify, setSelectedExpenseToVerify] = useState<Expense | null>(null);

  // Aggregate pending and executed expenses across all campaigns
  const allExpenses = campaigns.flatMap((c) => c.expenses || []);
  const pendingExpenses = allExpenses.filter((e) => e.status === "Pending");
  const executedExpenses = allExpenses.filter((e) => e.status === "Executed");

  const totalRaisedAcross = campaigns.reduce((acc, c) => acc + parseFloat(c.totalRaised), 0).toFixed(3);
  const totalSpentAcross = campaigns.reduce((acc, c) => acc + parseFloat(c.totalSpent), 0).toFixed(3);
  const totalInEscrow = campaigns.reduce((acc, c) => acc + parseFloat(c.currentBalance), 0).toFixed(3);

  const handleVerificationComplete = () => {
    refetchCampaigns();
    setSelectedExpenseToVerify(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Organization & Verifier Hub
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              Direct Payout Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage campaigns, submit itemized vendor expenses, and execute verified on-chain settlements on Monad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/campaigns"
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-text-primary transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-brand-500" />
            <span>Launch Campaign</span>
          </Link>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Total Managed</span>
          <div className="text-2xl font-bold font-mono text-brand-500">
            {totalRaisedAcross} <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-text-secondary">{campaigns.length} Active Campaigns</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Locked In Escrow</span>
          <div className="text-2xl font-bold font-mono text-monad-light">
            {totalInEscrow} <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-text-secondary">Safe contract custody</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Direct Supplier Payouts</span>
          <div className="text-2xl font-bold font-mono text-brand-cyan">
            {totalSpentAcross} <span className="text-xs text-text-muted">MON</span>
          </div>
          <p className="text-[11px] text-text-secondary">{executedExpenses.length} Settled Transactions</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-surface-border shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-muted">Pending Audits</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {pendingExpenses.length}
          </div>
          <p className="text-[11px] text-text-secondary">Awaiting release authorization</p>
        </div>
      </div>

      {/* Pending Verifications Queue */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Verifier Action Queue ({pendingExpenses.length})</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Review invoice evidence and release locked escrow funds directly to supplier addresses.
            </p>
          </div>
        </div>

        {pendingExpenses.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            All expense requests have been audited and settled on Monad.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-text-muted font-mono text-[10px] uppercase">
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Supplier Wallet</th>
                  <th className="pb-3 text-right">Audit & Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {pendingExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 font-mono text-text-muted">Campaign #{exp.campaignId}</td>
                    <td className="py-3.5">
                      <span className="font-medium text-text-primary">{exp.category}</span>
                    </td>
                    <td className="py-3.5 text-text-secondary max-w-xs truncate">{exp.description}</td>
                    <td className="py-3.5 font-mono font-bold text-brand-500">{exp.amount} MON</td>
                    <td className="py-3.5 font-mono text-text-secondary">
                      {formatAddress(exp.recipientSupplier, 4)}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedExpenseToVerify(exp)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-sm hover:opacity-95 transition-all"
                      >
                        Audit & Release Funds
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaigns Managed Table */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              <span>Active Organization Campaigns</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Track available escrow balances and submit new spending requests.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-500 uppercase">{c.category}</span>
                  <span className="text-[10px] font-mono text-text-muted">ID #{c.id}</span>
                </div>
                <h4 className="font-bold text-sm text-text-primary line-clamp-1">{c.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                  <span className="text-[10px] text-text-muted block">Raised</span>
                  <span className="font-bold text-text-primary">{c.totalRaised} MON</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                  <span className="text-[10px] text-text-muted block">In Escrow</span>
                  <span className="font-bold text-brand-500">{c.currentBalance} MON</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href={`/campaigns/${c.id}`}
                  className="py-2 rounded-lg bg-surface-hover text-center text-xs font-semibold text-text-primary border border-surface-border hover:border-surface-active transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setSelectedCampaignForExpense(c)}
                  className="py-2 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan text-xs font-semibold border border-brand-cyan/30 transition-colors"
                >
                  + Add Expense
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedCampaignForExpense && (
        <CreateExpenseModal
          campaign={selectedCampaignForExpense}
          isOpen={!!selectedCampaignForExpense}
          onClose={() => setSelectedCampaignForExpense(null)}
          onExpenseCreated={() => {
            setSelectedCampaignForExpense(null);
          }}
        />
      )}

      <VerifyExpenseModal
        expense={selectedExpenseToVerify}
        isOpen={!!selectedExpenseToVerify}
        onClose={() => setSelectedExpenseToVerify(null)}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}
