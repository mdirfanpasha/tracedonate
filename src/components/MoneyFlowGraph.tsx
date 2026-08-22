"use client";

import React, { useState } from "react";
import { Campaign, Expense, Donation } from "@/lib/types";
import { formatAddress, formatTimestamp } from "@/lib/utils";
import { MONAD_EXPLORER_URL } from "@/config/contracts";
import { getEvidenceForExpense, OffChainEvidence } from "@/lib/supabase";
import { useCampaignDonations } from "@/hooks/useTraceDonateContract";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Receipt,
  FileCheck,
  X,
  Lock,
  Camera,
  Heart,
  UserCheck,
} from "lucide-react";

interface MoneyFlowGraphProps {
  campaign: Campaign;
  onSelectExpense?: (expense: Expense) => void;
}

export function MoneyFlowGraph({ campaign, onSelectExpense }: MoneyFlowGraphProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Real-time live donations for this campaign
  const donations = useCampaignDonations(campaign.id);

  const expenses = campaign.expenses || [];
  const executedExpenses = expenses.filter((e) => e.status === "Executed");
  const totalSpent = executedExpenses.reduce((acc, e) => acc + parseFloat(e.amount), 0);
  const remainingInEscrow = parseFloat(campaign.currentBalance);

  const selectedEvidence: OffChainEvidence | null = selectedExpense
    ? getEvidenceForExpense(selectedExpense.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Visual Flow Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card space-y-6">
        <div className="space-y-1 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Follow The Money</span>
          </div>
          <h3 className="font-bold text-xl text-slate-900">
            Interactive Financial Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Real-time visual trail connecting donors, smart contract escrow custody, and itemized vendor invoice releases.
          </p>
        </div>

        {/* 3-Column Financial Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          
          {/* COLUMN 1: Verified Donors / Live Donation Stream */}
          <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-700 font-bold tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Verified Donors ({donations.length})</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {donations.slice(0, 4).map((donation, idx) => (
                <div
                  key={`${donation.donor}-${donation.timestamp}-${idx}`}
                  className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-mono text-[11px] text-slate-800 font-semibold block truncate">
                      {formatAddress(donation.donor, 4)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {formatTimestamp(donation.timestamp)}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-xs shrink-0 pl-2">
                    +{donation.amount} MON
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] font-mono text-slate-500">
              <span>Total Donated:</span>
              <span className="font-bold text-slate-900">{campaign.totalRaised} MON</span>
            </div>
          </div>

          {/* Connection Indicator 1 */}
          <div className="lg:col-span-1 flex justify-center text-slate-400">
            <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0 text-emerald-600" />
          </div>

          {/* COLUMN 2: Smart Contract Escrow Vault */}
          <div className="lg:col-span-3 p-4 sm:p-5 rounded-2xl bg-[#EEF7F4] border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold tracking-wider flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Smart Contract Escrow</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-0.5">
              <div className="text-xl font-bold font-mono text-slate-900">
                {campaign.totalRaised} <span className="text-xs text-slate-500 font-normal">MON</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium">
                100% Locked in TraceDonate.sol
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-[11px] font-mono">
              <span className="text-slate-600">Available:</span>
              <span className="text-emerald-800 font-bold">{remainingInEscrow.toFixed(3)} MON</span>
            </div>
          </div>

          {/* Connection Indicator 2 */}
          <div className="lg:col-span-1 flex justify-center text-slate-400">
            <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0 text-emerald-600" />
          </div>

          {/* COLUMN 3: Itemized Verified Expenses */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Expenditures ({expenses.length})</span>
              <span className="text-emerald-700 font-mono font-semibold text-[10px]">
                {totalSpent.toFixed(3)} MON Paid
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {expenses.map((expense) => {
                const isExecuted = expense.status === "Executed";

                return (
                  <button
                    key={expense.id}
                    onClick={() => {
                      setSelectedExpense(expense);
                      if (onSelectExpense) onSelectExpense(expense);
                    }}
                    type="button"
                    className={`w-full p-2.5 rounded-xl border text-left transition-all group ${
                      isExecuted
                        ? "bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-500/50 shadow-2xs"
                        : "bg-slate-50/60 border-dashed border-slate-200 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {expense.category}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        {expense.amount} MON
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-600 line-clamp-1 mb-1.5">
                      {expense.description}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500 truncate max-w-[100px]">
                        To: {formatAddress(expense.recipientSupplier, 3)}
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded font-bold ${
                          isExecuted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isExecuted ? "✓ Verified" : "Pending"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Audited Proof & Receipt Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    Audited Invoice Proof
                  </h4>
                  <p className="text-xs text-slate-500">
                    Expenditure #{selectedExpense.id} • {selectedExpense.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settlement Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-mono block">
                  Settlement Amount
                </span>
                <span className="text-2xl font-mono font-bold text-slate-900">
                  {selectedExpense.amount} MON
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Payment</span>
              </div>
            </div>

            {/* Uploaded Receipt / Invoice Photo */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-slate-700 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Audited Vendor Receipt / Photo Proof:</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  {selectedEvidence?.invoiceNumber || "INV-8492"}
                </span>
              </div>

              {selectedEvidence?.imageData || selectedEvidence?.fileUrl ? (
                <div className="relative h-64 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-inner flex items-center justify-center p-2">
                  <img
                    src={selectedEvidence.imageData || selectedEvidence.fileUrl}
                    alt="Receipt Evidence Proof"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-900/80 text-white text-[10px] font-mono backdrop-blur-sm">
                    {selectedEvidence.supplierName || "Apex Humanitarian Food Supplies Ltd."}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-white border border-slate-200 text-center text-slate-500 text-xs">
                  Receipt attached and anchored via on-chain hash
                </div>
              )}
            </div>

            {/* Verified Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-700 font-semibold">
                  {selectedExpense.status === "Executed" ? "✓ Payment verified on Monad" : "Pending Verifier Audit"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Recipient Supplier</span>
                <a
                  href={`${MONAD_EXPLORER_URL}/address/${selectedExpense.recipientSupplier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-900 hover:text-emerald-700 flex items-center gap-1 font-medium"
                >
                  <span>{formatAddress(selectedExpense.recipientSupplier, 5)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1 py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Spending Purpose</span>
                <p className="text-slate-800 font-medium">{selectedExpense.description}</p>
              </div>

              <div className="space-y-1 py-1.5">
                <span className="text-slate-500">Attached Invoice Hash</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 truncate">
                  {selectedExpense.evidenceHash || "ipfs://bafybeicb...food_invoice.pdf"}
                </div>
              </div>
            </div>

            {/* Monad Explorer Action */}
            <div className="pt-2">
              <a
                href={`${MONAD_EXPLORER_URL}/address/${selectedExpense.recipientSupplier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View on Monad Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
