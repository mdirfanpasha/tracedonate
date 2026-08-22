"use client";

import React, { useState, useEffect } from "react";
import { Campaign } from "@/lib/types";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, MONAD_EXPLORER_URL } from "@/config/contracts";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { recordLocalDonation } from "@/hooks/useTraceDonateContract";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Heart,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Receipt,
  AlertCircle,
} from "lucide-react";

interface DonationModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string, amount: string) => void;
}

export function DonationModal({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}: DonationModalProps) {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
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

  // When donation confirms on Monad blockchain:
  // 1. Record donation
  // 2. Invalidate TanStack query cache
  // 3. Dispatch global sync event
  // 4. Staged refetches for RPC block propagation
  useEffect(() => {
    if (isConfirmed && hash) {
      recordLocalDonation(campaign.id, amount, address, hash);
      queryClient.invalidateQueries();
      window.dispatchEvent(new Event("tracedonate_update"));

      const t1 = setTimeout(() => {
        queryClient.invalidateQueries();
        window.dispatchEvent(new Event("tracedonate_update"));
      }, 1000);

      const t2 = setTimeout(() => {
        queryClient.invalidateQueries();
        window.dispatchEvent(new Event("tracedonate_update"));
      }, 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isConfirmed, hash, campaign.id, amount, address, queryClient]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-slate-900">Support Campaign</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{campaign.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Input & Donate */}
        {!hash && !isConfirmed && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">
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
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                      amount === amt
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% held in smart contract escrow until invoices are verified.</span>
            </div>

            <button
              onClick={handleDonate}
              disabled={!isConnected || !amount || parseFloat(amount) <= 0 || isWalletPending}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/10"
            >
              {isWalletPending ? "1. Confirm in wallet..." : "DONATE NOW"}
            </button>

            {writeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Transaction cancelled or failed. Please check your Monad Testnet balance.</span>
              </div>
            )}
          </div>
        )}

        {/* State 2: Transaction Pending */}
        {hash && isConfirming && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900">2. Processing on Monad...</h4>
              <p className="text-xs text-slate-500">
                Locking {amount} MON into smart contract escrow.
              </p>
            </div>
            <a
              href={`${MONAD_EXPLORER_URL}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-mono"
            >
              <span>View pending tx</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* State 3: Donation Confirmed */}
        {hash && isConfirmed && (
          <div className="py-4 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-900">✓ Donation confirmed</h4>
              <p className="text-xs text-slate-600">
                Your donation of {amount} MON is now recorded on Monad.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1 text-left">
              <span className="text-[10px] text-slate-400 block font-bold">TRANSACTION HASH</span>
              <div className="text-slate-700 truncate">{hash}</div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={`${MONAD_EXPLORER_URL}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  onSuccess(hash, amount);
                  handleClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
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
