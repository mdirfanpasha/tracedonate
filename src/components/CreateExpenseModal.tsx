"use client";

import React, { useState } from "react";
import { Campaign } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { saveEvidenceForExpense } from "@/lib/supabase";
import { TransactionBadge } from "./TransactionBadge";
import {
  X,
  PlusCircle,
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Receipt,
} from "lucide-react";

interface CreateExpenseModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated?: () => void;
  onSuccess?: () => void;
}

export function CreateExpenseModal({
  campaign,
  isOpen,
  onClose,
  onExpenseCreated,
  onSuccess,
}: CreateExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [recipientSupplier, setRecipientSupplier] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState("invoice_supplier_receipt.pdf");

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipientSupplier || !description) return;

    try {
      const evidenceHash = `ipfs://bafybeicb${Math.random().toString(36).substring(2, 9)}/${evidenceFileName}`;

      saveEvidenceForExpense(0, {
        expenseId: 0,
        invoiceNumber: invoiceNumber || "INV-" + Math.floor(1000 + Math.random() * 9000),
        supplierName: supplierName || "Direct Supplier Vendor",
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
        fileName: evidenceFileName,
        notes: description,
      });

      writeContract({
        address: TRACEDONATE_CONTRACT_ADDRESS,
        abi: TRACEDONATE_ABI,
        functionName: "createExpense",
        args: [
          BigInt(campaign.id),
          parseEther(amount),
          recipientSupplier as `0x${string}`,
          category,
          description,
          evidenceHash,
        ],
      });
    } catch (err) {
      console.error("Expense creation error:", err);
    }
  };

  const isProcessing = isWritePending || isConfirming;

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
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Submit Expense Request
              </h3>
              <p className="text-xs text-slate-500">Campaign #{campaign.id}: {campaign.title}</p>
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

        {/* Success State */}
        {isConfirmed ? (
          <div className="space-y-4 py-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-900">
                Expense Submitted Successfully
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                The expense has been recorded on Monad. Once verified, funds will be released directly to the supplier wallet.
              </p>
            </div>

            {hash && <TransactionBadge txHash={hash} showFull />}

            <div className="pt-3">
              <button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  if (onExpenseCreated) onExpenseCreated();
                  handleModalClose();
                }}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
              >
                Close & Refresh
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Balance Status */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-emerald-800 font-medium">Available In Escrow:</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">
                {campaign.currentBalance} MON
              </span>
            </div>

            {/* Expense Amount */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Amount to Release (MON)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.25"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Recipient Supplier Wallet */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Recipient Supplier Address</label>
              <input
                type="text"
                required
                value={recipientSupplier}
                onChange={(e) => setRecipientSupplier(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Expenditure Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Food">Food & Rations</option>
                <option value="Medical">Medical & First Aid</option>
                <option value="Transport">Transport & Freight</option>
                <option value="Equipment">Equipment & Tools</option>
                <option value="Shelter">Shelter & Bedding</option>
                <option value="Logistics">Logistics & Operations</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Itemized Description</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 500 Grain kits and emergency water packs..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isWritePending
                    ? "Confirm in Wallet..."
                    : isConfirming
                    ? "Recording on Monad..."
                    : "Submit for Verifier Audit"}
                </span>
              </button>
            </div>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                Could not submit expense. Ensure you are the campaign organizer and have sufficient balance.
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
