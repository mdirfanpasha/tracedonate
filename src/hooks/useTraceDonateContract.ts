"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, SEED_CAMPAIGNS } from "@/config/contracts";
import { Campaign, Expense, Donation } from "@/lib/types";
import { formatMon } from "@/lib/utils";
import { parseEther } from "viem";

export function useAllCampaigns() {
  const { data, isLoading, refetch, error } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getAllCampaigns",
  });

  const onChainCampaigns: Campaign[] = Array.isArray(data) && data.length > 0
    ? data.map((c: any) => ({
        id: Number(c.id),
        organization: c.organization,
        title: c.title,
        description: c.description,
        goal: formatMon(c.goal),
        goalWei: BigInt(c.goal),
        totalRaised: formatMon(c.totalRaised),
        totalRaisedWei: BigInt(c.totalRaised),
        currentBalance: formatMon(c.currentBalance),
        currentBalanceWei: BigInt(c.currentBalance),
        totalSpent: formatMon(c.totalSpent),
        totalSpentWei: BigInt(c.totalSpent),
        category: c.category || "General Relief",
        imageUri: c.imageUri || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
        active: Boolean(c.active),
        createdAt: Number(c.createdAt),
        expenses: [],
      }))
    : (SEED_CAMPAIGNS as unknown as Campaign[]);

  return {
    campaigns: onChainCampaigns,
    isLoading,
    refetch,
    error,
    isRealOnChain: Array.isArray(data) && data.length > 0,
  };
}

export function useCampaignDetails(campaignId: number) {
  const { data: campaignRaw, isLoading: isCampaignLoading, refetch: refetchCampaign } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaign",
    args: [BigInt(campaignId)],
  });

  const { data: expensesRaw, isLoading: isExpensesLoading, refetch: refetchExpenses } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaignExpenses",
    args: [BigInt(campaignId)],
  });

  const seedFallback = SEED_CAMPAIGNS.find((c) => c.id === campaignId) || SEED_CAMPAIGNS[0];

  const onChainExpenses: Expense[] = Array.isArray(expensesRaw)
    ? expensesRaw.map((e: any) => ({
        id: Number(e.id),
        campaignId: Number(e.campaignId),
        amount: formatMon(e.amount),
        amountWei: BigInt(e.amount),
        recipientSupplier: e.recipientSupplier,
        category: e.category,
        description: e.description,
        evidenceHash: e.evidenceHash,
        status: e.status === 3 ? "Executed" : e.status === 1 ? "Approved" : e.status === 2 ? "Rejected" : "Pending",
        createdAt: Number(e.createdAt),
        executedAt: Number(e.executedAt),
      }))
    : (seedFallback.expenses as unknown as Expense[]) || [];

  const campaign: Campaign = campaignRaw && (campaignRaw as any).id
    ? {
        id: Number((campaignRaw as any).id),
        organization: (campaignRaw as any).organization,
        title: (campaignRaw as any).title,
        description: (campaignRaw as any).description,
        goal: formatMon((campaignRaw as any).goal),
        goalWei: BigInt((campaignRaw as any).goal),
        totalRaised: formatMon((campaignRaw as any).totalRaised),
        totalRaisedWei: BigInt((campaignRaw as any).totalRaised),
        currentBalance: formatMon((campaignRaw as any).currentBalance),
        currentBalanceWei: BigInt((campaignRaw as any).currentBalance),
        totalSpent: formatMon((campaignRaw as any).totalSpent),
        totalSpentWei: BigInt((campaignRaw as any).totalSpent),
        category: (campaignRaw as any).category,
        imageUri: (campaignRaw as any).imageUri,
        active: Boolean((campaignRaw as any).active),
        createdAt: Number((campaignRaw as any).createdAt),
        expenses: onChainExpenses,
      }
    : {
        ...(seedFallback as unknown as Campaign),
        expenses: onChainExpenses.length > 0 ? onChainExpenses : (seedFallback.expenses as unknown as Expense[]),
      };

  return {
    campaign,
    isLoading: isCampaignLoading || isExpensesLoading,
    refetch: () => {
      refetchCampaign();
      refetchExpenses();
    },
  };
}

export function useDonorHistory(donorAddress?: string) {
  const { data: donationsRaw, isLoading, refetch } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getDonorDonations",
    args: donorAddress ? [donorAddress as `0x${string}`] : undefined,
  });

  const donations: Donation[] = Array.isArray(donationsRaw)
    ? donationsRaw.map((d: any) => ({
        campaignId: Number(d.campaignId),
        donor: d.donor,
        amount: formatMon(d.amount),
        amountWei: BigInt(d.amount),
        timestamp: Number(d.timestamp),
      }))
    : [];

  return {
    donations,
    isLoading,
    refetch,
  };
}

export function useGlobalStats() {
  const { data, isLoading, refetch } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getGlobalStats",
  });

  const stats = data
    ? {
        totalCampaigns: Number((data as any)[0]),
        totalDonated: formatMon((data as any)[1]),
        totalSpent: formatMon((data as any)[2]),
        totalDonations: Number((data as any)[3]),
        totalExpensesRecorded: Number((data as any)[4]),
      }
    : {
        totalCampaigns: 3,
        totalDonated: "164.600",
        totalSpent: "93.800",
        totalDonations: 42,
        totalExpensesRecorded: 7,
      };

  return {
    stats,
    isLoading,
    refetch,
  };
}
