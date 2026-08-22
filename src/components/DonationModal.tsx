"use client";

import React, { useState } from "react";
import { Campaign } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, MONAD_EXPLORER_URL } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import {
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Loader2,
} from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onSuccess: (txHash: string, amount: string) => void;
}

export function DonationModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: DonationModalProps) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("0.1");

  const quickAmounts = ["0.01", "0.05", "0.1", "0.5", "1"];

  const {
    data: hash,
    writeContract,
    isPending: isWalletPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  if (!isOpen) return null;

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    writeContract({
      address: TRACEDONATE_CONTRACT_ADDRESS,
      abi: TRACEDONATE_ABI,
      functionName: "donate",
      args: [BigInt(campaign.id)],
      value: parseEther(amount),
    });
  };

  const handleClose = () => {
    resetWrite();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#0D111A] border border-white/[0.08] p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-white">Donate to Campaign</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{campaign.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Input & Donate */}
        {!hash && !isConfirmed && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Select or Enter Amount (MON)
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.1"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-white/[0.08] text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-semibold">
                  MON
                </span>
              </div>

              {/* Quick Options */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      amount === amt
                        ? "bg-emerald-500 text-black font-bold"
                        : "bg-surface border border-white/[0.06] text-slate-300 hover:text-white hover:bg-surface-hover"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface/60 border border-white/[0.05] flex items-center gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% held in smart contract escrow until invoices are verified.</span>
            </div>

            <button
              onClick={handleDonate}
              disabled={!isConnected || !amount || parseFloat(amount) <= 0 || isWalletPending}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/10"
            >
              {isWalletPending ? "Waiting for wallet confirmation..." : "Donate Now"}
            </button>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                Your donation could not be completed. Your wallet may have rejected the transaction or you may need testnet MON.
              </div>
            )}
          </div>
        )}

        {/* State 2: Transaction Pending */}
        {hash && isConfirming && (
          <div className="py-6 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white">Transaction pending on Monad...</h4>
              <p className="text-xs text-slate-400">
                Locking {amount} MON into smart contract escrow.
              </p>
            </div>
            <a
              href={`${MONAD_EXPLORER_URL}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-mono"
            >
              <span>View pending tx</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* State 3: Donation Confirmed */}
        {hash && isConfirmed && (
          <div className="py-4 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-white">Donation Confirmed ✓</h4>
              <p className="text-xs text-slate-400">
                {amount} MON is now recorded on Monad and traceable in real-time.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-white/[0.06] text-xs font-mono space-y-1 text-left">
              <span className="text-[10px] text-slate-500 block">TRANSACTION HASH</span>
              <div className="text-slate-300 truncate">{hash}</div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={`${MONAD_EXPLORER_URL}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-surface border border-white/[0.08] text-white hover:bg-surface-hover font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View on Monad Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  onSuccess(hash, amount);
                  handleClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Impact Receipt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
