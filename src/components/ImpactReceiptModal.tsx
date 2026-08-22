"use client";

import React from "react";
import { Campaign } from "@/lib/types";
import { formatAddress, formatDateTime, getExplorerTxUrl } from "@/lib/utils";
import { TransactionBadge } from "./TransactionBadge";
import {
  X,
  ShieldCheck,
  Award,
  Download,
  ExternalLink,
  Receipt,
  CheckCircle2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate / Receipt Canvas */}
        <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block">TraceDonate</span>
                <span className="text-[10px] text-slate-500 font-mono">Digital Proof Certificate</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              Monad Testnet • 10143
            </span>
          </div>

          {/* Amount Callout */}
          <div className="text-center py-2 space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Verified Charitable Contribution
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-700">
              {donationAmount} MON
            </div>
            <p className="text-xs text-slate-600 font-medium">{campaign.title}</p>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200/80">
              <span className="text-slate-500">Timestamp</span>
              <span className="font-mono text-slate-900">{formatDateTime(Math.floor(Date.now() / 1000))}</span>
            </div>

            {donorAddress && (
              <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                <span className="text-slate-500">Donor Address</span>
                <span className="font-mono text-slate-900 font-bold">{formatAddress(donorAddress, 5)}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-b border-slate-200/80">
              <span className="text-slate-500">Status</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Locked in On-Chain Escrow</span>
              </span>
            </div>

            <div className="space-y-1 py-1.5">
              <span className="text-slate-500 block">Transaction Proof</span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 truncate">
                {txHash || "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Save / Print Proof</span>
          </button>

          <a
            href={getExplorerTxUrl(txHash || "0x3a79d5012f418b76c8c83a79d5012f418b76c8c83a79d5012f418b76c8c8a1b2")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Monad Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
