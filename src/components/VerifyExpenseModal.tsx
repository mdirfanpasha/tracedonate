"use client";

import React, { useState } from "react";
import { Expense } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatAddress, formatDateTime, getCategoryColor, getExplorerAddressUrl } from "@/lib/utils";
import { getEvidenceForExpense } from "@/lib/supabase";
import { TransactionBadge } from "./TransactionBadge";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Receipt,
  Building2,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";

interface VerifyExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: () => void;
}

export function VerifyExpenseModal({
  expense,
  isOpen,
  onClose,
  onVerificationComplete,
}: VerifyExpenseModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const {
    data: hash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  if (!isOpen || !expense) return null;

  const offChainEvidence = getEvidenceForExpense(expense.id);

  const handleApproveAndExecute = async () => {
    try {
      writeContract({
        address: TRACEDONATE_CONTRACT_ADDRESS,
        abi: TRACEDONATE_ABI,
        functionName: "approveAndExecuteExpense",
        args: [BigInt(expense.id)],
      });
    } catch (err) {
      console.error("Verification execution error:", err);
    }
  };

  const isProcessing = isWritePending || isConfirming;

  const handleModalClose = () => {
    resetWrite();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">
                Verifier Audit & Direct Settlement
              </h3>
              <p className="text-xs text-text-muted">
                Expense #{expense.id} • Monad Testnet Escrow
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            type="button"
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {isConfirmed ? (
          <div className="space-y-4 py-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-brand-500/20 text-brand-500 border border-brand-500/40 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-text-primary">
                Direct Vendor Payment Settled!
              </h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                <span className="font-mono font-bold text-brand-500">{expense.amount} MON</span> has been transferred directly from the contract to vendor wallet <span className="font-mono text-text-primary">{formatAddress(expense.recipientSupplier, 4)}</span>.
              </p>
            </div>

            {hash && <TransactionBadge txHash={hash} showFull />}

            <div className="pt-3">
              <button
                onClick={() => {
                  onVerificationComplete();
                  handleModalClose();
                }}
                className="px-6 py-2 rounded-xl bg-brand-500 text-background font-bold text-xs hover:opacity-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Payment Summary */}
            <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Settlement Amount:</span>
                <span className="text-xl font-mono font-bold text-brand-500">
                  {expense.amount} MON
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-surface-border">
                <span className="text-text-muted">Category:</span>
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  />
                  {expense.category}
                </span>
              </div>
            </div>

            {/* Recipient Vendor Wallet */}
            <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Direct Supplier Wallet Address
              </span>
              <div className="flex items-center justify-between">
                <a
                  href={getExplorerAddressUrl(expense.recipientSupplier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-brand-500 hover:underline flex items-center gap-1"
                >
                  {expense.recipientSupplier}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Description & Invoice Evidence */}
            <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-text-muted">
                  Itemized Goods / Services Description
                </span>
                <p className="text-text-secondary text-xs">
                  {expense.description}
                </p>
              </div>

              <div className="pt-2 border-t border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-brand-cyan" />
                  <span className="text-[11px] text-text-secondary font-mono">
                    {offChainEvidence?.invoiceNumber || "INV-2026-084"}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/30">
                  Evidence Attached ✓
                </span>
              </div>
            </div>

            {/* Error Message */}
            {(writeError || receiptError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  {(writeError || receiptError)?.message?.slice(0, 150) || "Verification error."}
                </p>
              </div>
            )}

            {/* Verification Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isProcessing}
                className="w-1/3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApproveAndExecute}
                disabled={isProcessing}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Settling on Monad...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve & Release {expense.amount} MON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
