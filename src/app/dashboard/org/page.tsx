"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { CreateExpenseModal } from "@/components/CreateExpenseModal";
import { VerifyExpenseModal } from "@/components/VerifyExpenseModal";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useAllCampaigns } from "@/hooks/useTraceDonateContract";
import {
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Receipt,
  Building2,
} from "lucide-react";

export default function OrgDashboardPage() {
  const { address, isConnected } = useAccount();
  const { campaigns, refetch: refetchCampaigns } = useAllCampaigns();
  const [selectedCampaignForExpense, setSelectedCampaignForExpense] = useState<Campaign | null>(null);
  const [selectedExpenseToVerify, setSelectedExpenseToVerify] = useState<Expense | null>(null);

  // Aggregate pending and executed expenses across all campaigns
  const allExpenses = campaigns.flatMap((c) => c.expenses || []);

  const totalRaisedAcross = campaigns.reduce((acc, c) => acc + parseFloat(c.totalRaised), 0).toFixed(3);
  const totalSpentAcross = campaigns.reduce((acc, c) => acc + parseFloat(c.totalSpent), 0).toFixed(3);
  const totalInEscrow = campaigns.reduce((acc, c) => acc + parseFloat(c.currentBalance), 0).toFixed(3);

  const handleVerificationComplete = () => {
    refetchCampaigns();
    setSelectedExpenseToVerify(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Organization & Verifier Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Manage your campaigns, submit itemized vendor invoices with receipts, and execute verified Monad payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/campaigns"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            All Campaigns
          </Link>
          <button
            onClick={() => setSelectedCampaignForExpense(campaigns[0])}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Raised</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
            {totalRaisedAcross} <span className="text-xs text-slate-500 font-normal">MON</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Spent</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
            {totalSpentAcross} <span className="text-xs text-slate-500 font-normal">MON</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-1">
          <span className="text-xs text-slate-500 font-medium">Available in Escrow</span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
            {totalInEscrow} <span className="text-xs text-slate-500 font-normal">MON</span>
          </div>
        </div>
      </div>

      {/* Your Managed Campaigns */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-lg text-slate-900">Your Managed Campaigns ({campaigns.length})</h3>
          </div>
          <Link
            href="/campaigns"
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>+ Create New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {camp.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                    {camp.title}
                  </h4>
                </div>
                <Link
                  href={`/campaigns/${camp.id}`}
                  className="text-xs text-slate-500 hover:text-slate-900 p-1 font-mono"
                  title="View campaign page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-white border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Raised</span>
                  <span className="font-bold text-slate-900">{camp.totalRaised} M</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Escrow</span>
                  <span className="font-bold text-emerald-700">{camp.currentBalance} M</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Spent</span>
                  <span className="font-bold text-slate-700">{camp.totalSpent} M</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Link
                  href={`/campaigns/${camp.id}#follow-the-money`}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  {camp.expenses?.length || 0} Expenses
                </Link>
                <button
                  onClick={() => setSelectedCampaignForExpense(camp)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses & Payout Queue */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-lg text-slate-900">Expenditure & Audit Queue</h3>
          <span className="text-xs text-slate-500 font-mono">{allExpenses.length} Records</span>
        </div>

        <div className="divide-y divide-slate-100">
          {allExpenses.map((expense) => {
            const isExecuted = expense.status === "Executed";

            return (
              <div
                key={expense.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{expense.category}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isExecuted
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isExecuted ? "✓ Verified" : "Pending Audit"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{expense.description}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Supplier: {formatAddress(expense.recipientSupplier, 4)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-mono font-bold text-emerald-700">
                    {expense.amount} MON
                  </span>

                  {!isExecuted ? (
                    <button
                      onClick={() => setSelectedExpenseToVerify(expense)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Audit & Release</span>
                    </button>
                  ) : (
                    <a
                      href={`${MONAD_EXPLORER_URL}/address/${expense.recipientSupplier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Expense Modal */}
      {selectedCampaignForExpense && (
        <CreateExpenseModal
          isOpen={!!selectedCampaignForExpense}
          onClose={() => setSelectedCampaignForExpense(null)}
          campaign={selectedCampaignForExpense}
          onSuccess={() => {
            refetchCampaigns();
            setSelectedCampaignForExpense(null);
          }}
        />
      )}

      {/* Verify Expense Modal */}
      {selectedExpenseToVerify && (
        <VerifyExpenseModal
          isOpen={!!selectedExpenseToVerify}
          onClose={() => setSelectedExpenseToVerify(null)}
          expense={selectedExpenseToVerify}
          onSuccess={handleVerificationComplete}
        />
      )}
    </div>
  );
}
