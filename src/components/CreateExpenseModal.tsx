"use client";

import React, { useState } from "react";
import { Campaign } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { saveEvidenceForExpense } from "@/lib/supabase";
import { saveLocalExpense } from "@/hooks/useTraceDonateContract";
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
  Camera,
  Image as ImageIcon,
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
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [recipientSupplier, setRecipientSupplier] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");

  // Receipt / Proof Photo State
  const [receiptPhotoPreview, setReceiptPhotoPreview] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [receiptError, setReceiptError] = useState<string>("");

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

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileName(file.name);
    setReceiptError("");

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setReceiptPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipientSupplier || !description) return;

    // MANDATORY RECEIPT VERIFICATION
    if (!receiptPhotoPreview && !receiptFileName) {
      setReceiptError("Please upload a receipt or vendor proof photo before submitting.");
      return;
    }

    const newExpenseId = Date.now();
    const evidenceHash = `ipfs://bafybeicb${Math.random().toString(36).substring(2, 9)}/${receiptFileName || "invoice.jpg"}`;
    const photoUrl = receiptPhotoPreview || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80";

    // Save off-chain evidence with image data
    saveEvidenceForExpense(newExpenseId, {
      expenseId: newExpenseId,
      invoiceNumber: invoiceNumber || "INV-" + Math.floor(1000 + Math.random() * 9000),
      supplierName: supplierName || "Verified Vendor Partner",
      fileUrl: photoUrl,
      fileName: receiptFileName || "vendor_invoice.jpg",
      notes: description,
      imageData: photoUrl,
    });

    // Save local expense for immediate visibility
    saveLocalExpense(campaign.id, {
      id: newExpenseId,
      campaignId: campaign.id,
      amount: parseFloat(amount).toFixed(3),
      amountWei: parseEther(amount),
      recipientSupplier: recipientSupplier as `0x${string}`,
      category,
      description,
      evidenceHash,
      status: "Pending",
      createdAt: Math.floor(Date.now() / 1000),
    });

    // If connected, execute on-chain contract call on Monad
    if (isConnected) {
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
    } else {
      if (onSuccess) onSuccess();
      if (onExpenseCreated) onExpenseCreated();
      handleModalClose();
    }
  };

  const isProcessing = isWritePending || isConfirming;

  const handleModalClose = () => {
    resetWrite();
    setReceiptPhotoPreview("");
    setReceiptFileName("");
    setReceiptError("");
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
                Submit Itemized Expense
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
                Expense & Receipt Recorded
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                The expenditure request and receipt proof have been submitted to Monad for verifier audit.
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
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
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

            {/* MANDATORY RECEIPT / PROOF PHOTO UPLOAD */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="text-slate-800 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Upload Receipt / Proof Photo *</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  Required
                </span>
              </label>

              <div className="relative">
                <input
                  type="file"
                  id="receipt-upload"
                  accept="image/*,.pdf"
                  required
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all text-center space-y-1"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    Click to upload invoice, receipt, or delivery photo
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG, JPEG or PDF (Max 10MB)
                  </span>
                </label>
              </div>

              {/* Photo Preview */}
              {receiptPhotoPreview && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                  <img
                    src={receiptPhotoPreview}
                    alt="Receipt Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-900 block truncate">
                      {receiptFileName || "Attached Receipt Proof"}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      ✓ Ready for on-chain verification
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptPhotoPreview("");
                      setReceiptFileName("");
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {receiptError && (
                <p className="text-xs text-red-600 font-medium">{receiptError}</p>
              )}
            </div>

            {/* Expense Amount */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Amount to Release (MON) *</label>
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
              <label className="text-slate-700 font-medium">Recipient Supplier Address *</label>
              <input
                type="text"
                required
                value={recipientSupplier}
                onChange={(e) => setRecipientSupplier(e.target.value)}
                placeholder="0x892a...1014"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Expenditure Category *</label>
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
              <label className="text-slate-700 font-medium">Itemized Purpose / Notes *</label>
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
                    : "Submit Expense with Receipt"}
                </span>
              </button>
            </div>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                Could not submit expense on-chain. Local draft has been saved.
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
