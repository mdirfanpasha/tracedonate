"use client";

import React, { useState } from "react";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { TransactionBadge } from "@/components/TransactionBadge";
import { formatAddress, formatDateTime, getCategoryColor, getExplorerAddressUrl } from "@/lib/utils";
import { useAllCampaigns } from "@/hooks/useTraceDonateContract";
import {
  Activity,
  ShieldCheck,
  Building2,
  ExternalLink,
  Receipt,
  FileCheck,
  CheckCircle2,
  Lock,
  Coins,
  ArrowRight,
  TrendingUp,
  Layers,
  Search,
} from "lucide-react";

export default function TransparencyPage() {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("All");
  const { campaigns } = useAllCampaigns();

  const allExpenses = campaigns.flatMap((c) =>
    (c.expenses || []).map((e) => ({
      ...e,
      campaignTitle: c.title,
    }))
  );

  const executedExpenses = allExpenses.filter((e) => e.status === "Executed");

  const filteredExpenses = executedExpenses.filter((e) => {
    return selectedFilterCategory === "All" || e.category === selectedFilterCategory;
  });

  const totalSettled = executedExpenses.reduce((acc, e) => acc + parseFloat(e.amount), 0).toFixed(3);

  const categories = ["All", "Food", "Medical", "Transport", "Equipment", "Logistics", "Shelter"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-mono text-brand-500">
          <Activity className="w-3.5 h-3.5" />
          <span>Public Verified Ledger</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
          Where Does The Money Go?
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Every single Monad token donated on TraceDonate is permanently indexed. Trace every payment from the public escrow down to specific verified vendors.
        </p>
      </div>

      {/* Visual Global Financial Graph Pipeline */}
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              <span>Full Financial Graph Architecture</span>
            </h3>
            <p className="text-xs text-text-secondary">
              The continuous immutable money pipeline on Monad Testnet.
            </p>
          </div>

          <div className="p-2 rounded-xl bg-surface border border-surface-border text-xs font-mono">
            <span className="text-text-muted">Global Direct Settlement: </span>
            <span className="font-bold text-brand-500">{totalSettled} MON</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
            <span className="text-[10px] font-mono text-brand-500 uppercase">Stage 1</span>
            <h4 className="font-bold text-sm text-text-primary">1. Benefactors & Donors</h4>
            <p className="text-xs text-text-secondary">
              Community donates MON directly to verified campaigns.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-monad/10 border border-monad/30 space-y-2">
            <span className="text-[10px] font-mono text-monad-light uppercase">Stage 2</span>
            <h4 className="font-bold text-sm text-text-primary">2. Contract Escrow</h4>
            <p className="text-xs text-text-secondary">
              Funds locked in <span className="font-mono text-monad-light">TraceDonate.sol</span>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
            <span className="text-[10px] font-mono text-brand-cyan uppercase">Stage 3</span>
            <h4 className="font-bold text-sm text-text-primary">3. Category Expense</h4>
            <p className="text-xs text-text-secondary">
              Itemized needs submitted with off-chain invoice docs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-2">
            <span className="text-[10px] font-mono text-amber-400 uppercase">Stage 4</span>
            <h4 className="font-bold text-sm text-text-primary">4. Verifier Audit</h4>
            <p className="text-xs text-text-secondary">
              Auditors confirm legitimacy before unlocking funds.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 space-y-2">
            <span className="text-[10px] font-mono text-brand-500 uppercase">Stage 5</span>
            <h4 className="font-bold text-sm text-text-primary">5. Direct Settlement</h4>
            <p className="text-xs text-text-secondary">
              Exact MON sent to vendor address with block explorer link.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Payouts Ledger Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <h3 className="font-bold text-base text-text-primary">
              Public On-Chain Settlement Ledger ({filteredExpenses.length} Records)
            </h3>
            <p className="text-xs text-text-secondary">
              Real transactions executed directly to verified suppliers.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFilterCategory === cat
                    ? "bg-brand-500/20 text-brand-500 border border-brand-500/30"
                    : "bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border text-text-muted font-mono text-[10px] uppercase">
                <th className="pb-3 font-semibold">Payment ID</th>
                <th className="pb-3 font-semibold">Campaign</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Itemized Goods</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Supplier Wallet</th>
                <th className="pb-3 font-semibold text-right">Blockchain Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredExpenses.map((exp) => {
                const color = getCategoryColor(exp.category);

                return (
                  <tr key={exp.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 font-mono text-text-muted">#{exp.id}</td>
                    <td className="py-4 font-medium text-text-primary max-w-xs truncate">
                      {exp.campaignTitle}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 text-text-secondary max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-4 font-mono font-bold text-brand-500">
                      {exp.amount} MON
                    </td>
                    <td className="py-4 font-mono">
                      <a
                        href={getExplorerAddressUrl(exp.recipientSupplier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-brand-500 transition-colors flex items-center gap-1"
                      >
                        {formatAddress(exp.recipientSupplier, 4)}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </td>
                    <td className="py-4 text-right">
                      {exp.txHash && <TransactionBadge txHash={exp.txHash} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
