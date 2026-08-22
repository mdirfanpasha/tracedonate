"use client";

import React, { useState } from "react";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress, getCategoryColor, getExplorerAddressUrl } from "@/lib/utils";
import { MONAD_EXPLORER_URL } from "@/config/contracts";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Receipt,
  FileCheck,
  X,
  Lock,
} from "lucide-react";

interface MoneyFlowGraphProps {
  campaign: Campaign;
  onSelectExpense?: (expense: Expense) => void;
}

export function MoneyFlowGraph({ campaign, onSelectExpense }: MoneyFlowGraphProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const expenses = campaign.expenses || [];
  const executedExpenses = expenses.filter((e) => e.status === "Executed");
  const pendingExpenses = expenses.filter((e) => e.status === "Pending");

  const totalSpent = executedExpenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const remainingInEscrow = parseFloat(campaign.currentBalance);

  return (
    <div className="space-y-6">
      {/* Visual Flow Pipeline */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0D111A] border border-white/[0.08] space-y-8 shadow-xl">
        <div className="space-y-1 border-b border-white/[0.06] pb-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Live Financial Trail</span>
          </h3>
          <p className="text-xs text-slate-400">
            Click any verified expense to view audited invoice proof and on-chain Monad settlement.
          </p>
        </div>

        {/* 3-Column Interactive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Node 1: Escrow Vault */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-surface border border-white/[0.08] space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                Smart Contract Escrow
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-white">
                {campaign.totalRaised} <span className="text-xs text-slate-400">MON</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Locked in TraceDonate.sol
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.05] flex justify-between text-xs font-mono">
              <span className="text-slate-400">Remaining Balance:</span>
              <span className="text-emerald-400 font-bold">{remainingInEscrow.toFixed(3)} MON</span>
            </div>
          </div>

          {/* Flow Indicator Arrow */}
          <div className="md:col-span-1 flex justify-center text-slate-500">
            <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 text-emerald-400/60" />
          </div>

          {/* Node 2: Itemized Verified Expenses */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Itemized Expenditures ({expenses.length})</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {totalSpent.toFixed(3)} MON Released
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenses.map((expense) => {
                const isExecuted = expense.status === "Executed";

                return (
                  <button
                    key={expense.id}
                    onClick={() => {
                      setSelectedExpense(expense);
                      if (onSelectExpense) onSelectExpense(expense);
                    }}
                    type="button"
                    className={`p-4 rounded-xl border text-left transition-all group ${
                      isExecuted
                        ? "bg-surface hover:bg-surface-hover border-white/[0.08] hover:border-emerald-500/40"
                        : "bg-surface/40 border-dashed border-white/[0.08] hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {expense.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {expense.amount} MON
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                      {expense.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/[0.04]">
                      <span className="text-slate-500 truncate max-w-[120px]">
                        To: {formatAddress(expense.recipientSupplier, 3)}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          isExecuted
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {isExecuted ? "✓ Verified" : "Pending"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0D111A] border border-white/[0.08] p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                  {selectedExpense.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Expense #{selectedExpense.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Expense Amount */}
            <div className="p-4 rounded-xl bg-surface border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-400">Payment Amount</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {selectedExpense.amount} MON
              </span>
            </div>

            {/* Verification & Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedExpense.status === "Executed" ? "✓ Verified on Monad" : "Pending Audit"}
                  </span>
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-slate-400">Recipient Supplier</span>
                <a
                  href={`${MONAD_EXPLORER_URL}/address/${selectedExpense.recipientSupplier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-300 hover:text-emerald-400 flex items-center gap-1"
                >
                  <span>{formatAddress(selectedExpense.recipientSupplier, 6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1 py-1.5 border-b border-white/[0.04]">
                <span className="text-slate-400">Purpose</span>
                <p className="text-slate-200">{selectedExpense.description}</p>
              </div>

              <div className="space-y-1 py-1.5">
                <span className="text-slate-400">Audited Evidence Hash</span>
                <div className="p-2.5 rounded-lg bg-surface border border-white/[0.05] font-mono text-[11px] text-slate-300 truncate">
                  {selectedExpense.evidenceHash || "ipfs://bafybeicb...food_invoice.pdf"}
                </div>
              </div>
            </div>

            {/* Monad Explorer Link */}
            <div className="pt-2">
              <a
                href={`${MONAD_EXPLORER_URL}/address/${selectedExpense.recipientSupplier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Settlement on Monad Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
