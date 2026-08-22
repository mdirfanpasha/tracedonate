"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { DonationModal } from "@/components/DonationModal";
import { ImpactReceiptModal } from "@/components/ImpactReceiptModal";
import { Campaign } from "@/lib/types";
import { formatAddress } from "@/lib/utils";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAllCampaigns } from "@/hooks/useTraceDonateContract";
import { parseEther } from "viem";
import {
  Search,
  Filter,
  Plus,
  Coins,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastDonationTx, setLastDonationTx] = useState("");
  const [lastDonationAmount, setLastDonationAmount] = useState("0.05");

  // Create Campaign Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newGoal, setNewGoal] = useState("25");
  const [newCategory, setNewCategory] = useState("Disaster Relief");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80");

  const { isConnected } = useAccount();

  const {
    data: createHash,
    isPending: isCreatePending,
    error: createError,
    writeContract: writeCreateCampaign,
    reset: resetCreate,
  } = useWriteContract();

  const {
    isLoading: isCreateConfirming,
    isSuccess: isCreateSuccess,
  } = useWaitForTransactionReceipt({ hash: createHash });

  const { campaigns, refetch: refetchCampaigns } = useAllCampaigns();

  const categories = ["All", "Disaster Relief", "Clean Water", "Healthcare", "Infrastructure", "Education"];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newGoal) return;

    try {
      writeCreateCampaign({
        address: TRACEDONATE_CONTRACT_ADDRESS,
        abi: TRACEDONATE_ABI,
        functionName: "createCampaign",
        args: [
          newTitle,
          newDesc,
          parseEther(newGoal),
          newCategory,
          newImage,
        ],
      });
    } catch (err) {
      console.error("Create campaign error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              Fundraising Campaigns
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
              On-Chain Escrow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Select a campaign to inspect itemized spending proofs or contribute testnet MON.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 text-background font-bold text-xs shadow-md shadow-brand-500/10 hover:opacity-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search campaigns, causes, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/60 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500/20 text-brand-500 border border-brand-500/40 shadow-sm"
                  : "bg-surface text-text-secondary border border-surface-border hover:text-text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => {
          const pct = Math.min(
            100,
            Math.round((parseFloat(campaign.totalRaised) / parseFloat(campaign.goal)) * 100)
          );

          return (
            <div
              key={campaign.id}
              className="rounded-2xl bg-surface-card border border-surface-border hover:border-brand-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-surface">
                  <img
                    src={campaign.imageUri}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-surface-border text-[10px] font-mono text-brand-500">
                    {campaign.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-surface/90 text-text-muted text-[10px] font-mono border border-surface-border">
                    ID #{campaign.id}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-text-primary line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>

                  {/* Goal Progress */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-brand-500 font-bold">{campaign.totalRaised} MON</span>
                      <span className="text-text-muted">{campaign.goal} MON Goal</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface border border-surface-border overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-cyan rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Fund Allocation Stats */}
                  <div className="p-2.5 rounded-xl bg-surface/70 border border-surface-border flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Spent to Suppliers:</span>
                    <span className="text-brand-cyan font-bold">{campaign.totalSpent} MON</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-center text-xs font-semibold text-text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <span>Follow Money</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <button
                  onClick={() => {
                    setSelectedCampaign(campaign as unknown as Campaign);
                    setIsDonationOpen(true);
                  }}
                  type="button"
                  className="py-2.5 rounded-xl bg-brand-500 hover:opacity-95 text-background font-bold text-xs shadow-md shadow-brand-500/10 transition-all flex items-center justify-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Donate MON</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-50">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-surface-border p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-base text-text-primary">
                  Deploy New Campaign on Monad
                </h3>
              </div>
              <button
                onClick={() => {
                  resetCreate();
                  setIsCreateOpen(false);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isCreateSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto" />
                <h4 className="font-bold text-base text-text-primary">
                  Campaign Created on Monad!
                </h4>
                <p className="text-xs text-text-secondary">
                  Your smart contract campaign is now active and ready to receive testnet MON.
                </p>
                <button
                  onClick={() => {
                    resetCreate();
                    setIsCreateOpen(false);
                  }}
                  className="px-6 py-2 rounded-xl bg-brand-500 text-background font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Earthquake Emergency Relief 2026"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-brand-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Description & Objectives *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detailed explanation of the relief effort..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-brand-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Goal (MON) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="50"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary font-mono text-xs focus:outline-none focus:border-brand-500/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-text-secondary">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-text-primary text-xs focus:outline-none focus:border-brand-500/60"
                    >
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Clean Water">Clean Water</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>

                {createError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {createError.message?.slice(0, 150)}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-surface border border-surface-border text-text-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatePending || isCreateConfirming}
                    className="w-2/3 py-2.5 rounded-xl bg-brand-500 text-background font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isCreatePending || isCreateConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deploying on Monad...</span>
                      </>
                    ) : (
                      <span>Deploy Campaign</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Donation & Impact Modals */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          isOpen={isDonationOpen}
          onClose={() => setIsDonationOpen(false)}
          onDonationSuccess={(hash, amount) => {
            setLastDonationTx(hash);
            setLastDonationAmount(amount);
            setIsReceiptOpen(true);
          }}
        />
      )}

      {selectedCampaign && (
        <ImpactReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          campaign={selectedCampaign}
          donationAmount={lastDonationAmount}
          txHash={lastDonationTx}
        />
      )}
    </div>
  );
}
