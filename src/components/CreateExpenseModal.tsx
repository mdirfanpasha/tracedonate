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
  Building2,
  Receipt,
  HelpCircle,
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

  const categories = ["Food", "Medical", "Transport", "Equipment", "Shelter", "Logistics", "Clean Water", "Education", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipientSupplier || !description) return;

    try {
      const evidenceHash = `ipfs://bafybei${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

      // Save off-chain evidence reference
      saveEvidenceForExpense(Date.now(), {
        expenseId: Date.now(),
        fileName: evidenceFileName,
        fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
        invoiceNumber: invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName: supplierName || "Direct Registered Vendor",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">
                Submit Expense Request
              </h3>
              <p className="text-xs text-text-muted">Campaign #{campaign.id}: {campaign.title}</p>
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
            <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-500 border border-brand-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-text-primary">
                Expense Submitted On-Chain!
              </h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
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
                className="px-6 py-2 rounded-xl bg-brand-500 text-background font-bold text-xs hover:opacity-95 transition-all"
              >
                Close & Refresh
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Balance Status */}
            <div className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between">
              <span className="text-text-muted">Available In Escrow:</span>
              <span className="font-mono font-bold text-brand-500 text-sm">
                {campaign.currentBalance} MON
              </span>
            </div>

            {/* Expense Amount */}
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">
                Amount to Pay Vendor (MON) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  placeholder="0.05"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
                />
                <span className="absolute right-3.5 top-3 text-xs font-mono text-text-muted">
                  MON
                </span>
              </div>
            </div>

            {/* Vendor / Supplier Address */}
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary flex items-center justify-between">
                <span>Vendor / Supplier Monad Wallet Address *</span>
                <span className="text-[10px] text-text-muted">Direct Recipient</span>
              </label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={recipientSupplier}
                onChange={(e) => setRecipientSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary font-mono text-xs placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            {/* Category & Vendor Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-brand-500/60 transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-surface-card">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Medical Supply"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Itemized Description */}
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">
                Itemized Description of Goods/Services *
              </label>
              <textarea
                required
                rows={2}
                placeholder="500 high-protein food packets, dry storage and transport..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            {/* Supporting Evidence File Upload Simulation */}
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary flex items-center justify-between">
                <span>Attach Invoice / Receipt / Proof</span>
                <span className="text-[10px] text-brand-500">Off-Chain Storage</span>
              </label>
              <div className="p-3 rounded-xl bg-surface border border-dashed border-surface-border hover:border-brand-500/40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-brand-500" />
                  <span className="font-mono text-[11px] text-text-secondary">
                    {evidenceFileName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEvidenceFileName(`receipt_${Math.floor(1000 + Math.random() * 9000)}.pdf`)}
                  className="px-2 py-1 rounded bg-surface-hover text-text-primary text-[10px] border border-surface-border hover:text-brand-500 transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(writeError || receiptError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  {(writeError || receiptError)?.message?.slice(0, 150) || "Error submitting expense."}
                </p>
              </div>
            )}

            {/* Actions */}
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
                type="submit"
                disabled={isProcessing || !amount || !recipientSupplier || !description}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-500 text-background font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming on Monad...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Expense On-Chain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
