"use client";

import React, { useState } from "react";
import { Campaign } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, MONAD_EXPLORER_URL } from "@/config/contracts";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { TransactionBadge } from "./TransactionBadge";
import {
  X,
  Coins,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Receipt,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface DonationModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onDonationSuccess: (txHash: string, amountMon: string) => void;
}

export function DonationModal({
  campaign,
  isOpen,
  onClose,
  onDonationSuccess,
}: DonationModalProps) {
  const [amount, setAmount] = useState("0.05");
  const [customAmount, setCustomAmount] = useState("");
  const { isConnected, address } = useAccount();

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

  const activeAmount = customAmount || amount;

  const presets = ["0.01", "0.05", "0.1", "0.5", "1.0"];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAmount || parseFloat(activeAmount) <= 0) return;

    try {
      writeContract({
        address: TRACEDONATE_CONTRACT_ADDRESS,
        abi: TRACEDONATE_ABI,
        functionName: "donate",
        args: [BigInt(campaign.id)],
        value: parseEther(activeAmount),
      });
    } catch (err) {
      console.error("Donation execution error:", err);
    }
  };

  const handleModalClose = () => {
    resetWrite();
    onClose();
  };

  const isProcessing = isWritePending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-50">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">
                Donate to Campaign
              </h3>
              <p className="text-xs text-text-muted">Monad Testnet Escrow</p>
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

        {/* Campaign Info */}
        <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-1">
          <span className="text-[10px] font-mono uppercase text-brand-500">
            {campaign.category}
          </span>
          <h4 className="font-semibold text-sm text-text-primary line-clamp-1">
            {campaign.title}
          </h4>
          <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
            <span>Goal: {campaign.goal} MON</span>
            <span className="font-mono text-brand-500">
              {campaign.totalRaised} MON Raised
            </span>
          </div>
        </div>

        {/* Success State */}
        {isConfirmed ? (
          <div className="space-y-4 py-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-brand-500/20 text-brand-500 border border-brand-500/40 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-text-primary">
                Donation Verified on Monad!
              </h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your <span className="font-mono text-brand-500 font-bold">{activeAmount} MON</span> has been locked into the campaign escrow contract. You can now follow every subsequent supplier payout.
              </p>
            </div>

            {hash && (
              <div className="pt-2">
                <TransactionBadge txHash={hash} label="Monad Tx Hash" showFull />
              </div>
            )}

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (hash) onDonationSuccess(hash, activeAmount);
                  handleModalClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                Generate Impact Receipt
              </button>
            </div>
          </div>
        ) : (
          /* Input & Form */
          <form onSubmit={handleDonate} className="space-y-5">
            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
                <span>Select Contribution Amount (MON)</span>
                <span className="text-[11px] font-mono text-text-muted">
                  Chain: Monad Testnet (10143)
                </span>
              </label>

              {/* Preset Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setAmount(p);
                      setCustomAmount("");
                    }}
                    className={`py-2 rounded-lg font-mono text-xs font-semibold border transition-all ${
                      amount === p && !customAmount
                        ? "bg-brand-500/20 border-brand-500 text-brand-500 shadow-sm"
                        : "bg-surface border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-active"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative pt-1">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="Or enter custom MON amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-mono font-bold text-text-muted">
                  MON
                </span>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-3 rounded-xl bg-monad/5 border border-monad/20 text-xs text-text-secondary space-y-1">
              <div className="flex items-center gap-1.5 text-monad-light font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Private Pocket Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Funds are sent directly to <span className="font-mono text-text-primary">TraceDonate.sol</span>. The campaign organizer cannot cash out without submitting an approved supplier expense.
              </p>
            </div>

            {/* Error Message */}
            {(writeError || receiptError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Transaction Error</span>
                  <p className="text-[11px] text-red-200">
                    {(writeError || receiptError)?.message?.slice(0, 150) || "User rejected or insufficient gas."}
                  </p>
                </div>
              </div>
            )}

            {/* Transaction Pending State */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-surface border border-brand-500/30 space-y-2 text-center animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto" />
                <div className="text-xs font-semibold text-text-primary">
                  {isWritePending
                    ? "Waiting for wallet confirmation..."
                    : "Confirming on Monad Testnet..."}
                </div>
                <p className="text-[11px] text-text-secondary font-mono">
                  {hash ? `Broadcasting: ${hash.slice(0, 16)}...` : "Please approve the prompt in your wallet"}
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
                disabled={!isConnected || isProcessing || !activeAmount || parseFloat(activeAmount) <= 0}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-md shadow-brand-500/10 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Monad Tx...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Confirm & Donate {activeAmount} MON</span>
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
