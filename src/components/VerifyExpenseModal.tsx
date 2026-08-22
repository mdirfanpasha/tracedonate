"use client";

import React, { useState } from "react";
import { Expense } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatAddress, formatDateTime } from "@/lib/utils";
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
  FileText,
} from "lucide-react";

interface VerifyExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete?: () => void;
  onSuccess?: () => void;
}

export function VerifyExpenseModal({
  expense,
  isOpen,
  onClose,
  onVerificationComplete,
  onSuccess,
}: VerifyExpenseModalProps) {
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
  } = useWaitForTransactionReceipt({ hash });

  if (!isOpen || !expense) return null;

  const handleApproveAndExecute = () => {
    writeContract({
      address: TRACEDONATE_CONTRACT_ADDRESS,
      abi: TRACEDONATE_ABI,
      functionName: "approveAndExecuteExpense",
      args: [BigInt(expense.id)],
    });
  };

  const handleModalClose = () => {
    resetWrite();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Audit & Release Payment
              </h3>
              <p className="text-xs text-slate-500">Expenditure #{expense.id} • {expense.category}</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation State */}
        {isConfirmed ? (
          <div className="space-y-4 py-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-900">
                Payment Released on Monad
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {expense.amount} MON was transferred directly from contract custody to supplier {formatAddress(expense.recipientSupplier, 4)}.
              </p>
            </div>

            {hash && <TransactionBadge txHash={hash} showFull />}

            <div className="pt-3">
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  if (onVerificationComplete) onVerificationComplete();
                  handleModalClose();
                }}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Payment Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Settlement Amount:</span>
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {expense.amount} MON
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Recipient Supplier:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatAddress(expense.recipientSupplier, 5)}
                </span>
              </div>
            </div>

            {/* Spending Details */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-500 font-medium block">Spending Description:</span>
              <p className="text-slate-800">{expense.description}</p>
            </div>

            {/* Evidence Proof */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-500 block">Attached Invoice Hash:</span>
              <div className="text-slate-700 truncate">{expense.evidenceHash || "ipfs://bafybeicb...invoice.pdf"}</div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={handleApproveAndExecute}
                disabled={isWritePending || isConfirming}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                {(isWritePending || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isWritePending
                    ? "Confirm in Wallet..."
                    : isConfirming
                    ? "Executing Transfer on Monad..."
                    : "Authorize & Execute Direct Payout"}
                </span>
              </button>
            </div>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                Only authorized verifier addresses can release contract payments.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
