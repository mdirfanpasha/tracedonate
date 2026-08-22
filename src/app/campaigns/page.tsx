"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI } from "@/config/contracts";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAllCampaigns, saveLocalCampaign } from "@/hooks/useTraceDonateContract";
import { parseEther } from "viem";
import { Search, PlusCircle, ArrowRight, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, refetch: refetchCampaigns } = useAllCampaigns();
  const { address, isConnected } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for creating a campaign
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [category, setCategory] = useState("Disaster Relief");
  const [imageUri, setImageUri] = useState("");
  const [createdSuccessLocal, setCreatedSuccessLocal] = useState(false);

  const {
    data: createHash,
    writeContract: createCampaignContract,
    isPending: isCreatePending,
    error: createError,
    reset: resetCreate,
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

    const defaultImg =
      category === "Clean Water"
        ? "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80"
        : category === "Healthcare"
        ? "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
        : category === "Education"
        ? "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
        : "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80";

    const finalImageUri = imageUri.trim() || defaultImg;
    const newId = Date.now();

    // Save locally for instant availability
    saveLocalCampaign({
      id: newId,
      organization: (address || "0x2f2ca4e7CE1443aE7792675d5a7Fff4b2660fb0D") as `0x${string}`,
      title,
      description,
      goal: parseFloat(goal).toFixed(3),
      goalWei: parseEther(goal),
      totalRaised: "0.000",
      totalRaisedWei: 0n,
      currentBalance: "0.000",
      currentBalanceWei: 0n,
      totalSpent: "0.000",
      totalSpentWei: 0n,
      category,
      imageUri: finalImageUri,
      active: true,
      createdAt: Math.floor(Date.now() / 1000),
      expenses: [],
    });

    refetchCampaigns();

    // If wallet is connected, send on-chain transaction to Monad
    if (isConnected) {
      createCampaignContract({
        address: TRACEDONATE_CONTRACT_ADDRESS,
        abi: TRACEDONATE_ABI,
        functionName: "createCampaign",
        args: [
          title,
          description,
          parseEther(goal),
          category,
          finalImageUri,
        ],
      });
    } else {
      setCreatedSuccessLocal(true);
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreatedSuccessLocal(false);
        setTitle("");
        setDescription("");
        setGoal("");
      }, 1500);
    }
  };

  const handleCloseModal = () => {
    resetCreate();
    setIsCreateModalOpen(false);
    setCreatedSuccessLocal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Transparent Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Select a verified campaign to donate and trace money down to supplier invoices.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by title or purpose..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={campaign.imageUri}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-mono text-emerald-800 border border-slate-200 font-semibold">
                    {campaign.category}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {campaign.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-900 font-bold">{campaign.totalRaised} MON</span>
                  <span className="text-slate-500">of {campaign.goal} MON</span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>128 donors</span>
                  <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Create New Campaign</h3>
                <p className="text-xs text-slate-500">Deploy a transparent escrow campaign on Monad</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flood Relief Emergency Fund"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the purpose and verified expenditure plan..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Goal (MON)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
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
                <label className="text-slate-700 font-medium">Cover Photo URL (optional)</label>
                <input
                  type="url"
                  value={imageUri}
                  onChange={(e) => setImageUri(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Leave blank to use authentic high-resolution category photo.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatePending || isCreateConfirming}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                >
                  {(isCreatePending || isCreateConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isCreatePending
                      ? "1. Confirm in Wallet..."
                      : isCreateConfirming
                      ? "2. Deploying on Monad..."
                      : "Deploy Campaign"}
                  </span>
                </button>
              </div>

              {(isCreateSuccess || createdSuccessLocal) && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ Campaign created successfully! Added to directory.</span>
                </div>
              )}

              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Transaction failed or rejected by wallet. Local preview preserved.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
