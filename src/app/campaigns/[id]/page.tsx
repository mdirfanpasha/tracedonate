"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SEED_CAMPAIGNS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { MoneyFlowGraph } from "@/components/MoneyFlowGraph";
import { DonationModal } from "@/components/DonationModal";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { CreateExpenseModal } from "@/components/CreateExpenseModal";
import { VerifyExpenseModal } from "@/components/VerifyExpenseModal";
import { TransactionBadge } from "@/components/TransactionBadge";
import { Campaign, Expense } from "@/lib/types";
import {
  formatAddress,
  formatDateTime,
  getCategoryColor,
  getExplorerAddressUrl,
} from "@/lib/utils";
import { getEvidenceForExpense } from "@/lib/supabase";
import {
  ShieldCheck,
  Coins,
  ArrowLeft,
  Share2,
  ExternalLink,
  Layers,
  FileCheck,
  CheckCircle2,
  Receipt,
  PlusCircle,
  Eye,
  X,
  Lock,
} from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = Number(params?.id) || 1;

  const campaignData =
    SEED_CAMPAIGNS.find((c) => c.id === campaignId) || SEED_CAMPAIGNS[0];
  const [campaign, setCampaign] = useState<Campaign>(campaignData as unknown as Campaign);

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedExpenseToVerify, setSelectedExpenseToVerify] = useState<Expense | null>(null);
  const [selectedEvidenceExpense, setSelectedEvidenceExpense] = useState<Expense | null>(null);

  const [lastDonationTx, setLastDonationTx] = useState("");
  const [lastDonationAmount, setLastDonationAmount] = useState("0.1");

  const pct = Math.min(
    100,
    Math.round((parseFloat(campaign.totalRaised) / parseFloat(campaign.goal)) * 100)
  );

  const expenses = campaign.expenses || [];
  const totalRaisedNum = parseFloat(campaign.totalRaised) || 0.01;
  const currentBalanceNum = parseFloat(campaign.currentBalance) || 0;
  const totalSpentNum = parseFloat(campaign.totalSpent) || 0;

  // Calculate Category Allocations
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
  });

  const allocations = Object.entries(categoryTotals).map(([cat, amt]) => ({
    category: cat,
    amount: amt,
    percentage: Math.round((amt / totalRaisedNum) * 100),
    color: getCategoryColor(cat),
  }));

  if (currentBalanceNum > 0) {
    allocations.push({
      category: "In Contract Escrow",
      amount: currentBalanceNum,
      percentage: Math.max(1, Math.round((currentBalanceNum / totalRaisedNum) * 100)),
      color: "#836EF9",
    });
  }

  const handleDonationSuccess = (hash: string, amount: string) => {
    setLastDonationTx(hash);
    setLastDonationAmount(amount);
    setIsReceiptOpen(true);

    // Update local state to reflect donation
    const newRaised = (parseFloat(campaign.totalRaised) + parseFloat(amount)).toFixed(3);
    const newBal = (parseFloat(campaign.currentBalance) + parseFloat(amount)).toFixed(3);
    setCampaign({
      ...campaign,
      totalRaised: newRaised,
      currentBalance: newBal,
    });
  };

  const handleVerificationComplete = () => {
    if (!selectedExpenseToVerify) return;
    const updatedExpenses = (campaign.expenses || []).map((exp) => {
      if (exp.id === selectedExpenseToVerify.id) {
        return {
          ...exp,
          status: "Executed" as const,
          executedAt: Math.floor(Date.now() / 1000),
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        };
      }
      return exp;
    });

    const expAmt = parseFloat(selectedExpenseToVerify.amount);
    const newBal = Math.max(0, parseFloat(campaign.currentBalance) - expAmt).toFixed(3);
    const newSpent = (parseFloat(campaign.totalSpent) + expAmt).toFixed(3);

    setCampaign({
      ...campaign,
      currentBalance: newBal,
      totalSpent: newSpent,
      expenses: updatedExpenses,
    });
    setSelectedExpenseToVerify(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back link & Category */}
      <div className="flex items-center justify-between">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all campaigns</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-brand-500/10 text-brand-500 border border-brand-500/30">
            {campaign.category}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-surface-border text-text-muted">
            Monad Testnet
          </span>
        </div>
      </div>

      {/* Main Campaign Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Media & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-surface border border-surface-border shadow-2xl">
            <img
              src={campaign.imageUri}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                {campaign.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 max-w-xl">
                {campaign.description}
              </p>
            </div>
          </div>

          {/* Fund Allocation Bar */}
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <span>Fund Allocation Breakdown</span>
              </h3>
              <span className="text-xs font-mono text-text-muted">
                {campaign.totalSpent} / {campaign.totalRaised} MON Allocated
              </span>
            </div>

            {/* Stacked multi-color allocation bar */}
            <div className="w-full h-3 rounded-full bg-surface-hover overflow-hidden flex">
              {allocations.map((alloc, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${alloc.percentage}%`,
                    backgroundColor: alloc.color,
                  }}
                  className="h-full transition-all duration-500 hover:opacity-80"
                  title={`${alloc.category}: ${alloc.amount} MON (${alloc.percentage}%)`}
                />
              ))}
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              {allocations.map((alloc, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-mono">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: alloc.color }}
                  />
                  <span className="text-text-secondary">{alloc.category}</span>
                  <span className="text-text-primary font-bold">({alloc.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Funding Card & Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-2xl space-y-6 sticky top-24">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-text-muted">
                Escrow Raised
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-brand-500">
                  {campaign.totalRaised}
                </span>
                <span className="text-sm font-mono text-text-muted">
                  / {campaign.goal} MON
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface border border-surface-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-cyan rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-1">
                <span className="text-text-muted text-[10px]">Unspent In Escrow</span>
                <div className="font-bold text-monad-light text-sm">
                  {campaign.currentBalance} MON
                </div>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-1">
                <span className="text-text-muted text-[10px]">Verified Spent</span>
                <div className="font-bold text-brand-500 text-sm">
                  {campaign.totalSpent} MON
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDonationOpen(true)}
              type="button"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-400 to-brand-cyan text-background font-bold text-sm shadow-xl shadow-brand-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              <span>Donate Testnet MON</span>
            </button>

            <div className="p-3.5 rounded-xl bg-surface/70 border border-surface-border text-xs text-text-secondary space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Organization:</span>
                <a
                  href={getExplorerAddressUrl(campaign.organization)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-brand-500 hover:underline flex items-center gap-1"
                >
                  {formatAddress(campaign.organization, 4)}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Smart Contract:</span>
                <span className="font-mono text-text-primary">TraceDonate.sol</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature "Follow My Money" Interactive Visual Flow */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text-primary">
            Interactive Money Trail
          </h2>
          <p className="text-xs text-text-secondary">
            Inspect the live path of funds from donor wallet through the Monad contract into verified supplier settlements.
          </p>
        </div>

        <MoneyFlowGraph
          campaign={campaign}
          onOpenEvidence={(exp) => setSelectedEvidenceExpense(exp)}
        />
      </section>

      {/* Itemized Expenses & Verified Payouts Table */}
      <section className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <h3 className="font-bold text-base text-text-primary">
              Itemized Campaign Expenses & Proofs ({expenses.length})
            </h3>
            <p className="text-xs text-text-secondary">
              Every expense requires verifier approval before transferring funds to the supplier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateExpenseOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs font-medium text-text-primary transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Submit Expense</span>
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            No expenses submitted yet for this campaign.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-border text-text-muted font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold">Expense ID</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Supplier Wallet</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions / Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {expenses.map((exp) => {
                  const isExecuted = exp.status === "Executed";
                  const color = getCategoryColor(exp.category);

                  return (
                    <tr key={exp.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 font-mono text-text-muted">#{exp.id}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-text-secondary max-w-xs truncate">
                        {exp.description}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-text-primary">
                        {exp.amount} MON
                      </td>
                      <td className="py-3.5 font-mono">
                        <a
                          href={getExplorerAddressUrl(exp.recipientSupplier)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:underline flex items-center gap-1"
                        >
                          {formatAddress(exp.recipientSupplier, 4)}
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </td>
                      <td className="py-3.5">
                        {isExecuted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 font-mono text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px]">
                            Pending Audit
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {isExecuted && exp.txHash ? (
                          <TransactionBadge txHash={exp.txHash} />
                        ) : (
                          <button
                            onClick={() => setSelectedExpenseToVerify(exp)}
                            className="px-2.5 py-1 rounded bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 border border-brand-500/30 text-[11px] font-semibold transition-colors"
                          >
                            Verify & Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals */}
      <DonationModal
        campaign={campaign}
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        onDonationSuccess={handleDonationSuccess}
      />

      <ImpactReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        campaign={campaign}
        donationAmount={lastDonationAmount}
        txHash={lastDonationTx}
      />

      <CreateExpenseModal
        campaign={campaign}
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        onExpenseCreated={() => {
          setIsCreateExpenseOpen(false);
        }}
      />

      <VerifyExpenseModal
        expense={selectedExpenseToVerify}
        isOpen={!!selectedExpenseToVerify}
        onClose={() => setSelectedExpenseToVerify(null)}
        onVerificationComplete={handleVerificationComplete}
      />

      {/* Evidence View Drawer */}
      {selectedEvidenceExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-50">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-base text-text-primary">
                  Supporting Evidence & Invoice
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceExpense(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Expense Purpose:</span>
                  <span className="font-semibold text-text-primary">{selectedEvidenceExpense.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Settlement Amount:</span>
                  <span className="font-mono text-brand-500 font-bold">{selectedEvidenceExpense.amount} MON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Vendor Wallet:</span>
                  <span className="font-mono text-text-secondary">{formatAddress(selectedEvidenceExpense.recipientSupplier, 6)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-hover/60 border border-dashed border-surface-border text-center space-y-2">
                <FileCheck className="w-8 h-8 text-brand-500 mx-auto" />
                <div className="text-xs font-semibold text-text-primary">Invoice Verified</div>
                <p className="text-[11px] text-text-secondary">
                  Audited against supplier catalog. Hash: {selectedEvidenceExpense.evidenceHash || "ipfs://Qm..."}
                </p>
              </div>

              {selectedEvidenceExpense.txHash && (
                <div className="pt-2">
                  <TransactionBadge txHash={selectedEvidenceExpense.txHash} label="On-Chain Settlement" showFull />
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvidenceExpense(null)}
              className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold border border-surface-border transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
