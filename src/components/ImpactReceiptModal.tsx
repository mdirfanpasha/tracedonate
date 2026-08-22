"use client";

import React from "react";
import { Campaign, Expense } from "@/lib/types";
import { formatAddress, formatDateTime, getCategoryColor, getExplorerTxUrl } from "@/lib/utils";
import { TransactionBadge } from "./TransactionBadge";
import {
  X,
  ShieldCheck,
  Award,
  Download,
  Share2,
  ExternalLink,
  Receipt,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";

interface ImpactReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  donationAmount: string;
  txHash: string;
  donorAddress?: string;
}

export function ImpactReceiptModal({
  isOpen,
  onClose,
  campaign,
  donationAmount,
  txHash,
  donorAddress,
}: ImpactReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const executedExpenses = campaign.expenses?.filter((e) => e.status === "Executed") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-surface-card border border-surface-border p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate / Receipt Canvas */}
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-surface via-surface-card to-surface border border-brand-500/30 shadow-inner relative overflow-hidden space-y-6">
          
          {/* Subtle Watermark */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-brand-500" />
          </div>

          {/* Receipt Header */}
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-text-primary">
                    TraceDonate Verified Impact Receipt
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/30">
                    On-Chain
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  Cryptographically Proven Settlement on Monad Testnet
                </span>
              </div>
            </div>
          </div>

          {/* Contribution Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-surface-card/90 border border-surface-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-muted">
                Contribution
              </span>
              <div className="text-xl font-bold font-mono text-brand-500">
                {donationAmount} <span className="text-xs text-text-muted">MON</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-card/90 border border-surface-border space-y-1">
              <span className="text-[10px] uppercase font-mono text-text-muted">
                Status
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Escrow</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-card/90 border border-surface-border space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-text-muted">
                Network
              </span>
              <div className="text-xs font-mono text-text-primary">
                Monad (10143)
              </div>
            </div>
          </div>

          {/* Campaign & Donor Metadata */}
          <div className="p-3.5 rounded-xl bg-surface-card/70 border border-surface-border text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Campaign:</span>
              <span className="font-semibold text-text-primary text-right max-w-[240px] truncate">
                {campaign.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Donor Address:</span>
              <span className="font-mono text-text-secondary">
                {donorAddress ? formatAddress(donorAddress, 6) : "Anonymous Benefactor"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Timestamp:</span>
              <span className="font-mono text-text-secondary">
                {formatDateTime(Math.floor(Date.now() / 1000))}
              </span>
            </div>
          </div>

          {/* Current Money Flow Allocation Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-cyan" />
                Live Campaign Fund Tracing
              </span>
              <span className="text-[10px] font-mono text-brand-500">
                {campaign.totalSpent} / {campaign.totalRaised} MON Spent
              </span>
            </div>

            <div className="space-y-1.5">
              {executedExpenses.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-surface/50 border border-surface-border text-center text-xs text-text-muted">
                  100% of funds currently held in smart contract escrow.
                </div>
              ) : (
                executedExpenses.slice(0, 3).map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface/60 border border-surface-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(exp.category) }}
                      />
                      <span className="font-medium text-text-primary">{exp.category}</span>
                      <span className="text-[11px] text-text-muted truncate max-w-[150px]">
                        → {formatAddress(exp.recipientSupplier, 4)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-text-primary">
                      {exp.amount} MON
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monad Explorer Verification Hash */}
          <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-text-muted">Monad Blockchain Proof:</span>
            {txHash && <TransactionBadge txHash={txHash} showFull />}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
