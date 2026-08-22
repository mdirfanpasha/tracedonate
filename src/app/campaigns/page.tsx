"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAllCampaigns } from "@/hooks/useTraceDonateContract";
import { parseEther } from "viem";
import { Search, PlusCircle, ArrowRight, X } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, refetch: refetchCampaigns } = useAllCampaigns();
  const { isConnected } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for creating a campaign
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("Disaster Relief");
  const [imageUri, setImageUri] = useState("");

  const {
    data: createHash,
    writeContract: createCampaignContract,
    isPending: isCreatePending,
    error: createError,
  } = useWriteContract();

  const {
    isLoading: isCreateConfirming,
    isSuccess: isCreateSuccess,
  } = useWaitForTransactionReceipt({ hash: createHash });

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
    if (!title || !description || !goal) return;

    createCampaignContract({
      address: TRACEDONATE_CONTRACT_ADDRESS,
      abi: TRACEDONATE_ABI,
      functionName: "createCampaign",
      args: [
        title,
        description,
        parseEther(goal),
        category,
        imageUri || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
      ],
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Transparent Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select a campaign to donate and trace funds down to supplier invoices.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-surface border border-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => {
          const raised = parseFloat(campaign.totalRaised);
          const goal = parseFloat(campaign.goal);
          const percent = Math.min(100, Math.round((raised / (goal || 1)) * 100));

          return (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="group p-5 rounded-2xl bg-surface border border-white/[0.06] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-800">
                  <img
                    src={campaign.imageUri}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-white/10">
                    {campaign.category}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-bold">{campaign.totalRaised} MON</span>
                  <span className="text-slate-400">of {campaign.goal} MON</span>
                </div>

                <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{percent}% funded • 128 donors</span>
                  <span className="text-emerald-400 font-medium group-hover:underline flex items-center gap-1">
                    <span>View Campaign</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F1420] border border-white/[0.08] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="font-bold text-base text-white">Create New Campaign</h3>
                <p className="text-xs text-slate-400">Deploy a transparent escrow campaign on Monad</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flood Relief Emergency Fund"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the purpose and verified expenditure plan..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Goal (MON)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Clean Water">Clean Water</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Cover Image URL (optional)</label>
                <input
                  type="url"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-white/[0.08] text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatePending || isCreateConfirming}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {isCreatePending
                    ? "Confirm in Wallet..."
                    : isCreateConfirming
                    ? "Deploying on Monad..."
                    : "Deploy Campaign on Monad"}
                </button>
              </div>

              {isCreateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-medium">
                  ✓ Campaign deployed successfully on Monad!
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
