"use client";

import React, { useEffect } from "react";
import { Expense } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, MONAD_EXPLORER_URL } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getEvidenceForExpense, OffChainEvidence } from "@/lib/supabase";
import { updateLocalExpenseStatus } from "@/hooks/useTraceDonateContract";
import { TransactionBadge } from "./TransactionBadge";
import { formatAddress } from "@/lib/utils";
import {
  X,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Receipt,
  Camera,
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
  } = useWaitForTransactionReceipt({
    hash,
  });

  // When payment is confirmed on-chain, automatically update the expense status in real time
  useEffect(() => {
    if (isConfirmed && expense) {
      updateLocalExpenseStatus(expense.campaignId, expense.id, "Executed", hash);
    }
  }, [isConfirmed, expense, hash]);

  if (!isOpen || !expense) return null;

  const evidence: OffChainEvidence | null = getEvidenceForExpense(expense.id);

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
        className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
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
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
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

            {/* Attached Receipt / Proof Photo */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Audited Receipt / Invoice Photo:</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  {evidence?.invoiceNumber || "INV-PROOF"}
                </span>
              </div>

              {evidence?.imageData || evidence?.fileUrl ? (
                <div className="relative h-60 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                  <img
                    src={evidence.imageData || evidence.fileUrl}
                    alt="Receipt Evidence"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-900/80 text-white text-[10px] font-mono backdrop-blur-sm">
                    {evidence.supplierName || "Verified Supplier"}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded bg-white border border-slate-200 text-center text-slate-400">
                  No visual receipt attached
                </div>
              )}
            </div>

            {/* Description & Invoice Hash */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-slate-500 font-medium">Spending Purpose:</span>
              <p className="text-slate-900 font-medium">{expense.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
              <span className="text-slate-500 block">EVIDENCE HASH (IPFS/STORAGE):</span>
              <div className="text-slate-700 truncate">{expense.evidenceHash}</div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveAndExecute}
                disabled={isWritePending || isConfirming}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {(isWritePending || isConfirming) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {isWritePending
                    ? "Sign in Wallet..."
                    : isConfirming
                    ? "Executing on Monad..."
                    : "Approve & Execute Payout"}
                </span>
              </button>
            </div>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                Could not execute payout on Monad. Ensure you are connected with an authorized verifier or owner account.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
