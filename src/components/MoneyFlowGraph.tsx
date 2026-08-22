"use client";

import React, { useState } from "react";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress, formatMon, getCategoryColor, getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/utils";
import { TransactionBadge } from "@/components/TransactionBadge";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Receipt,
  FileCheck,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
  Layers,
} from "lucide-react";

interface MoneyFlowGraphProps {
  campaign: Campaign;
  userDonationAmount?: string;
  onOpenEvidence?: (expense: Expense) => void;
}

export function MoneyFlowGraph({
  campaign,
  userDonationAmount,
  onOpenEvidence,
}: MoneyFlowGraphProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(
    campaign.expenses && campaign.expenses.length > 0 ? campaign.expenses[0] : null
  );

  const expenses = campaign.expenses || [];
  const executedExpenses = expenses.filter((e) => e.status === "Executed");
  const pendingExpenses = expenses.filter((e) => e.status === "Pending");

  const totalRaisedNum = parseFloat(campaign.totalRaised) || 0.001;
  const currentBalanceNum = parseFloat(campaign.currentBalance) || 0;
  const totalSpentNum = parseFloat(campaign.totalSpent) || 0;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface/50 border border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-sm text-text-primary">
              Signature Money Flow: "Follow Every MON"
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Funds never enter private pockets. TraceDonate enforces that spending is sent directly to verified supplier wallets with on-chain receipts.
          </p>
        </div>

        {userDonationAmount && (
          <div className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs">
            <span className="text-text-muted">Your Contribution: </span>
            <span className="font-mono font-bold text-brand-500">{userDonationAmount} MON</span>
          </div>
        )}
      </div>

      {/* Visual Pipeline Graph */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl overflow-x-auto">
        <div className="min-w-[700px] flex items-stretch justify-between gap-4 relative">
          
          {/* Column 1: Source (Donors / You) */}
          <div className="w-1/4 flex flex-col justify-center space-y-3">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-500" />
              <span>1. Inflow</span>
            </div>
            
            <div className="p-4 rounded-xl bg-surface border border-surface-border/80 hover:border-brand-500/40 transition-all space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">Total Donated</span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              </div>
              <div className="text-xl font-mono font-bold text-brand-500">
                {campaign.totalRaised} <span className="text-xs text-text-muted">MON</span>
              </div>
              <div className="text-[11px] text-text-secondary font-mono">
                Goal: {campaign.goal} MON
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex items-center justify-center text-text-muted">
            <ArrowRight className="w-5 h-5 opacity-40 animate-pulse" />
          </div>

          {/* Column 2: Escrow Smart Contract */}
          <div className="w-1/4 flex flex-col justify-center space-y-3">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-monad-light" />
              <span>2. Monad Escrow</span>
            </div>

            <div className="p-4 rounded-xl bg-monad-dark/40 border border-monad/30 hover:border-monad/60 transition-all space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">TraceDonate.sol</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-monad/20 text-monad-light">
                  LOCKED
                </span>
              </div>
              
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">Executed:</span>
                  <span className="text-brand-500 font-bold">{campaign.totalSpent} MON</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">In Escrow:</span>
                  <span className="text-monad-light font-bold">{campaign.currentBalance} MON</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex items-center justify-center text-text-muted">
            <ArrowRight className="w-5 h-5 opacity-40 animate-pulse" />
          </div>

          {/* Column 3: Verified Categorized Expenses */}
          <div className="w-2/5 flex flex-col justify-center space-y-3">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-brand-cyan" />
              <span>3. Verified Vendor Payouts ({executedExpenses.length})</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface/50 border border-surface-border text-center text-xs text-text-muted">
                  No spending records submitted yet.
                </div>
              ) : (
                expenses.map((expense) => {
                  const isSelected = selectedExpense?.id === expense.id;
                  const isExecuted = expense.status === "Executed";
                  const color = getCategoryColor(expense.category);

                  return (
                    <button
                      key={expense.id}
                      onClick={() => setSelectedExpense(expense)}
                      type="button"
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-surface-hover border-brand-500/60 shadow-md shadow-brand-500/5"
                          : "bg-surface/60 border-surface-border hover:border-surface-active"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-7 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {expense.category}
                            </span>
                            {isExecuted ? (
                              <span className="text-[9px] font-mono px-1 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                                ✓ Paid
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Pending
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-secondary truncate max-w-[170px]">
                            {expense.description}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-text-primary">
                          {expense.amount} MON
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Expense Deep-Dive Drawer */}
      {selectedExpense && (
        <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-4 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(selectedExpense.category) }}
              />
              <span className="font-semibold text-sm text-text-primary">
                Expense #{selectedExpense.id}: {selectedExpense.category} ({selectedExpense.amount} MON)
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                  selectedExpense.status === "Executed"
                    ? "bg-brand-500/10 text-brand-500 border border-brand-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {selectedExpense.status}
              </span>
            </div>

            {selectedExpense.txHash && (
              <TransactionBadge txHash={selectedExpense.txHash} label="On-Chain Settlement" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Vendor Recipient */}
            <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
              <span className="text-text-muted text-[10px] uppercase font-mono">
                Direct Recipient Supplier
              </span>
              <div className="flex items-center justify-between">
                <a
                  href={getExplorerAddressUrl(selectedExpense.recipientSupplier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-brand-500 hover:underline flex items-center gap-1"
                >
                  {formatAddress(selectedExpense.recipientSupplier, 6)}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <span className="text-[10px] text-text-muted">Vendor Wallet</span>
              </div>
            </div>

            {/* Description & Goods */}
            <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1">
              <span className="text-text-muted text-[10px] uppercase font-mono">
                Itemized Purpose
              </span>
              <p className="text-text-secondary text-xs line-clamp-2">
                {selectedExpense.description}
              </p>
            </div>

            {/* Supporting Evidence Proof */}
            <div className="p-3 rounded-lg bg-surface-card border border-surface-border space-y-1 flex flex-col justify-between">
              <span className="text-text-muted text-[10px] uppercase font-mono">
                Invoice / Supporting Evidence
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-secondary truncate max-w-[140px]">
                  {selectedExpense.evidenceHash || "Verified Off-Chain Doc"}
                </span>
                {onOpenEvidence && (
                  <button
                    onClick={() => onOpenEvidence(selectedExpense)}
                    type="button"
                    className="px-2 py-1 rounded bg-surface hover:bg-surface-hover text-brand-500 text-[11px] font-medium border border-surface-border transition-colors flex items-center gap-1"
                  >
                    <Receipt className="w-3 h-3" />
                    Inspect Proof
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
