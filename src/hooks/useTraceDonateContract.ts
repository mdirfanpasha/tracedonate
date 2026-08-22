"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, SEED_CAMPAIGNS } from "@/config/contracts";
import { Campaign, Expense, Donation, ExpenseStatus } from "@/lib/types";
import { formatMon } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { syncCampaignToSupabase, fetchSupabaseCampaigns, supabase } from "@/lib/supabase";
import { parseEther } from "viem";

const LOCAL_CAMPAIGNS_KEY = "tracedonate_local_campaigns";
const LOCAL_EXPENSES_KEY = "tracedonate_local_expenses";
const LOCAL_DONATIONS_KEY = "tracedonate_local_donations";

export function getLocalCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CAMPAIGNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCampaign(campaign: Campaign) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCampaigns();
    const updated = [campaign, ...existing.filter((c) => c.id !== campaign.id)];
    localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("tracedonate_update"));
    syncCampaignToSupabase(campaign);
  } catch (e) {
    console.warn("Failed to save local campaign:", e);
  }
}

export function recordLocalDonation(
  campaignId: number,
  amount: string,
  donorAddress?: string,
  txHash?: string
) {
  if (typeof window === "undefined") return;
  try {
    const added = parseFloat(amount) || 0;

    // 1. Find the target campaign across local, seed, or create
    const existingCampaigns = getLocalCampaigns();
    const seed = (SEED_CAMPAIGNS as unknown as Campaign[]).find((c) => c.id === campaignId);
    const target = existingCampaigns.find((c) => c.id === campaignId) || seed;

    if (target) {
      const currentRaised = parseFloat(target.totalRaised) || 0;
      const currentBal = parseFloat(target.currentBalance) || 0;
      const newRaised = (currentRaised + added).toFixed(3);
      const newBalance = (currentBal + added).toFixed(3);

      const updatedCampaign: Campaign = {
        ...target,
        id: campaignId,
        totalRaised: newRaised,
        currentBalance: newBalance,
        totalRaisedWei: parseEther(newRaised),
        currentBalanceWei: parseEther(newBalance),
      };
      saveLocalCampaign(updatedCampaign);
    }

    // 2. Record in local donations list
    const rawDonations = localStorage.getItem(LOCAL_DONATIONS_KEY);
    const donations: Donation[] = rawDonations ? JSON.parse(rawDonations) : [];
    donations.unshift({
      campaignId,
      donor: (donorAddress || "0x2f2ca4e7CE1443aE7792675d5a7Fff4b2660fb0D") as `0x${string}`,
      amount,
      amountWei: parseEther(amount),
      timestamp: Math.floor(Date.now() / 1000),
      txHash: txHash || `0x${Math.random().toString(16).substring(2, 10)}...monad`,
    });
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(donations));
    window.dispatchEvent(new Event("tracedonate_update"));
  } catch (e) {
    console.warn("Failed to record local donation:", e);
  }
}

export function updateLocalExpenseStatus(
  campaignId: number,
  expenseId: number,
  newStatus: ExpenseStatus,
  txHash?: string
) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (!raw) return;
    const all: Record<number, Expense[]> = JSON.parse(raw);
    if (all[campaignId]) {
      all[campaignId] = all[campaignId].map((e) =>
        e.id === expenseId
          ? {
              ...e,
              status: newStatus,
              executedAt: newStatus === "Executed" ? Math.floor(Date.now() / 1000) : e.executedAt,
              txHash: txHash || e.txHash,
            }
          : e
      );
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event("tracedonate_update"));
    }
  } catch (e) {
    console.warn("Failed to update expense status:", e);
  }
}

export function getLocalExpenses(campaignId: number): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (!raw) return [];
    const all: Record<number, Expense[]> = JSON.parse(raw);
    return all[campaignId] || [];
  } catch {
    return [];
  }
}

export function saveLocalExpense(campaignId: number, expense: Expense) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    const all: Record<number, Expense[]> = raw ? JSON.parse(raw) : {};
    all[campaignId] = [expense, ...(all[campaignId] || [])];
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("tracedonate_update"));
  } catch (e) {
    console.warn("Failed to save local expense:", e);
  }
}

export function useAllCampaigns() {
  const { data, isLoading, refetch, error } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getAllCampaigns",
    query: {
      refetchInterval: 3000, // 3-second real-time polling from Monad Testnet
    },
  });

  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);
  const [supabaseCampaigns, setSupabaseCampaigns] = useState<Campaign[]>([]);

  const loadLocal = useCallback(() => {
    setLocalCampaigns(getLocalCampaigns());
  }, []);

  const loadSupabase = useCallback(async () => {
    try {
      const remote = await fetchSupabaseCampaigns();
      if (remote.length > 0) {
        setSupabaseCampaigns(remote);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadLocal();
    loadSupabase();

    window.addEventListener("tracedonate_update", loadLocal);
    window.addEventListener("storage", loadLocal);

    const interval = setInterval(() => {
      loadLocal();
      loadSupabase();
    }, 3000);

    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase
          .channel("realtime-campaigns")
          .on("postgres_changes", { event: "*", schema: "public", table: "campaigns" }, () => {
            loadSupabase();
            window.dispatchEvent(new Event("tracedonate_update"));
          })
          .subscribe();
      } catch {}
    }

    return () => {
      window.removeEventListener("tracedonate_update", loadLocal);
      window.removeEventListener("storage", loadLocal);
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadLocal, loadSupabase]);

  // Combine onChain campaigns + SEED campaigns + Local campaigns + Supabase campaigns (deduplicated by ID)
  const allMap = new Map<number, Campaign>();

  // 1. Initial Seed campaigns
  (SEED_CAMPAIGNS as unknown as Campaign[]).forEach((c) => allMap.set(c.id, c));

  // 2. Supabase campaigns
  supabaseCampaigns.forEach((c) => allMap.set(c.id, c));

  // 3. Locally created / saved campaigns (includes recent local donations)
  localCampaigns.forEach((c) => {
    const existing = allMap.get(c.id);
    allMap.set(c.id, {
      ...c,
      totalRaised: c.totalRaised || existing?.totalRaised || "0.000",
      currentBalance: c.currentBalance || existing?.currentBalance || "0.000",
    });
  });

  // 4. Smart contract campaigns on Monad
  if (Array.isArray(data)) {
    data.forEach((c: any) => {
      const id = Number(c.id);
      if (id > 0) {
        const existing = allMap.get(id);
        const localExps = getLocalExpenses(id);
        const seedExps = existing?.expenses || [];
        const combinedExps = [
          ...localExps,
          ...seedExps.filter((se) => !localExps.some((le) => le.id === se.id)),
        ];

        const onChainRaised = parseFloat(formatMon(c.totalRaised));
        const currentRaised = parseFloat(existing?.totalRaised || "0");
        const finalRaised = Math.max(onChainRaised, currentRaised).toFixed(3);

        const onChainBal = parseFloat(formatMon(c.currentBalance));
        const currentBal = parseFloat(existing?.currentBalance || "0");
        const finalBal = Math.max(onChainBal, currentBal).toFixed(3);

        allMap.set(id, {
          id,
          organization: c.organization,
          title: c.title || existing?.title || `Campaign #${id}`,
          description: c.description || existing?.description || "",
          goal: formatMon(c.goal),
          goalWei: BigInt(c.goal),
          totalRaised: finalRaised,
          totalRaisedWei: parseEther(finalRaised),
          currentBalance: finalBal,
          currentBalanceWei: parseEther(finalBal),
          totalSpent: formatMon(c.totalSpent),
          totalSpentWei: BigInt(c.totalSpent),
          category: c.category || existing?.category || "General Relief",
          imageUri: c.imageUri || existing?.imageUri || "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
          active: Boolean(c.active),
          createdAt: Number(c.createdAt),
          expenses: combinedExps,
        });
      }
    });
  }

  // Return list with newest campaigns first
  const mergedCampaigns = Array.from(allMap.values()).sort((a, b) => b.id - a.id);

  return {
    campaigns: mergedCampaigns,
    isLoading,
    refetch: () => {
      loadLocal();
      loadSupabase();
      refetch();
    },
    error,
    isRealOnChain: Array.isArray(data) && data.length > 0,
  };
}

export function useCampaignDetails(campaignId: number) {
  const { campaigns, refetch: refetchAll } = useAllCampaigns();

  const { data: campaignRaw, isLoading: isCampaignLoading, refetch: refetchCampaign } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaign",
    args: [BigInt(campaignId)],
    query: {
      refetchInterval: 3000,
    },
  });

  const { data: expensesRaw, isLoading: isExpensesLoading, refetch: refetchExpenses } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaignExpenses",
    args: [BigInt(campaignId)],
    query: {
      refetchInterval: 3000,
    },
  });

  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);

  const loadLocalExpenses = useCallback(() => {
    setLocalExpenses(getLocalExpenses(campaignId));
  }, [campaignId]);

  useEffect(() => {
    loadLocalExpenses();
    window.addEventListener("tracedonate_update", loadLocalExpenses);
    window.addEventListener("storage", loadLocalExpenses);
    const interval = setInterval(loadLocalExpenses, 3000);
    return () => {
      window.removeEventListener("tracedonate_update", loadLocalExpenses);
      window.removeEventListener("storage", loadLocalExpenses);
      clearInterval(interval);
    };
  }, [loadLocalExpenses]);

  // Look up matching campaign from live merged list first
  const matchedFromAll = campaigns.find((c) => c.id === campaignId);

  const seedFallback =
    matchedFromAll ||
    getLocalCampaigns().find((c) => c.id === campaignId) ||
    SEED_CAMPAIGNS.find((c) => c.id === campaignId) ||
    SEED_CAMPAIGNS[0];

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

  const mergedExpenses = [
    ...localExpenses.filter((le) => !onChainExpenses.some((oe) => oe.id === le.id)),
    ...onChainExpenses,
  ];

  const onChainRaised = campaignRaw && (campaignRaw as any).id ? parseFloat(formatMon((campaignRaw as any).totalRaised)) : 0;
  const currentRaised = parseFloat(seedFallback.totalRaised || "0");
  const finalRaised = Math.max(onChainRaised, currentRaised).toFixed(3);

  const onChainBal = campaignRaw && (campaignRaw as any).id ? parseFloat(formatMon((campaignRaw as any).currentBalance)) : 0;
  const currentBal = parseFloat(seedFallback.currentBalance || "0");
  const finalBal = Math.max(onChainBal, currentBal).toFixed(3);

  const campaign: Campaign = {
    ...(seedFallback as unknown as Campaign),
    id: campaignId,
    totalRaised: finalRaised,
    totalRaisedWei: parseEther(finalRaised),
    currentBalance: finalBal,
    currentBalanceWei: parseEther(finalBal),
    expenses: mergedExpenses.length > 0 ? mergedExpenses : (seedFallback.expenses as unknown as Expense[]),
  };

  return {
    campaign,
    isLoading: isCampaignLoading || isExpensesLoading,
    refetch: () => {
      loadLocalExpenses();
      refetchCampaign();
      refetchExpenses();
      refetchAll();
    },
  };
}

export function useDonorHistory(donorAddress?: string) {
  const { data: donationsRaw, isLoading, refetch } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getDonorDonations",
    args: donorAddress ? [donorAddress as `0x${string}`] : undefined,
    query: {
      refetchInterval: 3000,
    },
  });

  const [localDonations, setLocalDonations] = useState<Donation[]>([]);

  const loadLocalDonations = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_DONATIONS_KEY);
      if (raw) setLocalDonations(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    loadLocalDonations();
    window.addEventListener("tracedonate_update", loadLocalDonations);
    window.addEventListener("storage", loadLocalDonations);
    const interval = setInterval(loadLocalDonations, 3000);
    return () => {
      window.removeEventListener("tracedonate_update", loadLocalDonations);
      window.removeEventListener("storage", loadLocalDonations);
      clearInterval(interval);
    };
  }, [loadLocalDonations]);

  const onChainDonations: Donation[] = Array.isArray(donationsRaw)
    ? donationsRaw.map((d: any) => ({
        campaignId: Number(d.campaignId),
        donor: d.donor,
        amount: formatMon(d.amount),
        amountWei: BigInt(d.amount),
        timestamp: Number(d.timestamp),
      }))
    : [];

  const mergedDonations = [...localDonations, ...onChainDonations];

  return {
    donations: mergedDonations,
    isLoading,
    refetch,
  };
}

export function useGlobalStats() {
  const { campaigns } = useAllCampaigns();
  const { donations } = useDonorHistory();

  const { data, isLoading, refetch } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getGlobalStats",
    query: {
      refetchInterval: 3000,
    },
  });

  const totalDonatedCalc = campaigns
    .reduce((acc, c) => acc + (parseFloat(c.totalRaised) || 0), 0)
    .toFixed(3);

  const totalSpentCalc = campaigns
    .reduce((acc, c) => acc + (parseFloat(c.totalSpent) || 0), 0)
    .toFixed(3);

  const stats = {
    totalCampaigns: campaigns.length,
    totalDonated: totalDonatedCalc,
    totalSpent: totalSpentCalc,
    totalDonations: Math.max(42, donations.length),
    totalExpensesRecorded: campaigns.reduce((acc, c) => acc + (c.expenses?.length || 0), 0),
  };

  return {
    stats,
    isLoading,
    refetch,
  };
}
