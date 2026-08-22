"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { CreateExpenseModal } from "@/components/CreateExpenseModal";
import { VerifyExpenseModal } from "@/components/VerifyExpenseModal";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress, getCategoryColor } from "@/lib/utils";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Organization & Verifier Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit itemized vendor invoices and execute direct on-chain settlements on Monad.
          </p>
        </div>

        <button
          onClick={() => setSelectedCampaignForExpense(campaigns[0])}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Total Raised</span>
          <div className="text-2xl font-bold font-mono text-white">
            {totalRaisedAcross} <span className="text-xs text-slate-400">MON</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Total Spent</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalSpentAcross} <span className="text-xs text-slate-400">MON</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-1">
          <span className="text-xs text-slate-400">Available in Escrow</span>
          <div className="text-2xl font-bold font-mono text-white">
            {totalInEscrow} <span className="text-xs text-slate-400">MON</span>
          </div>
        </div>
      </div>

      {/* Recent Expenses & Payout Queue */}
      <div className="p-6 rounded-2xl bg-surface border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h3 className="font-bold text-base text-white">Expenditure & Audit Queue</h3>
          <span className="text-xs text-slate-400 font-mono">{allExpenses.length} Records</span>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {allExpenses.map((expense) => {
            const isExecuted = expense.status === "Executed";

            return (
              <div
                key={expense.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{expense.category}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isExecuted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {isExecuted ? "✓ Verified" : "Pending Audit"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{expense.description}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Supplier: {formatAddress(expense.recipientSupplier, 4)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {expense.amount} MON
                  </span>

                  {!isExecuted ? (
                    <button
                      onClick={() => setSelectedExpenseToVerify(expense)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Audit & Release</span>
                    </button>
                  ) : (
                    <a
                      href={`${MONAD_EXPLORER_URL}/address/${expense.recipientSupplier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1"
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
