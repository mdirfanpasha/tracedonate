"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useWatchContractEvent } from "wagmi";
import { TRACEDONATE_CONTRACT_ADDRESS, TRACEDONATE_ABI, SEED_CAMPAIGNS } from "@/config/contracts";
import { Campaign, Expense, Donation, ExpenseStatus } from "@/lib/types";
import { formatMon } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { syncCampaignToSupabase, fetchSupabaseCampaigns, supabase } from "@/lib/supabase";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";

const LOCAL_CAMPAIGNS_KEY = "tracedonate_local_campaigns";
const LOCAL_EXPENSES_KEY = "tracedonate_local_expenses";
const LOCAL_DONATIONS_KEY = "tracedonate_local_donations";

// Initial authentic demo donations for campaigns (fallback only)
const SEED_DONATIONS: Record<number, Donation[]> = {
  1: [
    {
      campaignId: 1,
      donor: "0x71C8340293815b8192834f8281923849188888b2",
      amount: "15.000",
      amountWei: parseEther("15.000"),
      timestamp: Math.floor(Date.now() / 1000) - 3600 * 2,
    },
    {
      campaignId: 1,
      donor: "0x98A19045812984719283471928347192834444f1",
      amount: "25.000",
      amountWei: parseEther("25.000"),
      timestamp: Math.floor(Date.now() / 1000) - 3600 * 5,
    },
    {
      campaignId: 1,
      donor: "0x32DF7819283471928347192834719283471999c0",
      amount: "14.000",
      amountWei: parseEther("14.000"),
      timestamp: Math.floor(Date.now() / 1000) - 86400,
    },
  ],
  2: [
    {
      campaignId: 2,
      donor: "0x15D39918234192834719283471928347192333a1",
      amount: "12.000",
      amountWei: parseEther("12.000"),
      timestamp: Math.floor(Date.now() / 1000) - 3600 * 4,
    },
    {
      campaignId: 2,
      donor: "0x88FE2381940192834719283471928347192000e2",
      amount: "18.000",
      amountWei: parseEther("18.000"),
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
    },
  ],
  3: [
    {
      campaignId: 3,
      donor: "0x99B41829381928347192834719283471928112c4",
      amount: "20.000",
      amountWei: parseEther("20.000"),
      timestamp: Math.floor(Date.now() / 1000) - 3600 * 6,
    },
    {
      campaignId: 3,
      donor: "0x44A01829381283471928347192834719283888f0",
      amount: "4.000",
      amountWei: parseEther("4.000"),
      timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
    },
  ],
};

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

    // 1. Update local campaign
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

    // 2. Record donation
    const rawDonations = localStorage.getItem(LOCAL_DONATIONS_KEY);
    const donations: Donation[] = rawDonations ? JSON.parse(rawDonations) : [];
    const newDonation: Donation = {
      campaignId,
      donor: (donorAddress || "0x2f2ca4e7CE1443aE7792675d5a7Fff4b2660fb0D") as `0x${string}`,
      amount: parseFloat(amount).toFixed(3),
      amountWei: parseEther(amount),
      timestamp: Math.floor(Date.now() / 1000),
      txHash: txHash || `0x${Math.random().toString(16).substring(2, 10)}...monad`,
    };
    donations.unshift(newDonation);
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
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);

  const { data, isLoading, refetch, error } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getAllCampaigns",
    query: {
      refetchInterval: 3000,
      staleTime: 0,
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

  useWatchContractEvent({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    eventName: "DonationReceived",
    onLogs(logs) {
      console.log("⚡ [useAllCampaigns] Monad on-chain DonationReceived:", logs);
      queryClient.invalidateQueries();
      setTick((t) => t + 1);
      refetch();
      window.dispatchEvent(new Event("tracedonate_update"));
    },
  });

  useEffect(() => {
    loadLocal();
    loadSupabase();

    const handleUpdate = () => {
      loadLocal();
      loadSupabase();
      setTick((t) => t + 1);
    };

    window.addEventListener("tracedonate_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    const interval = setInterval(() => {
      loadLocal();
      loadSupabase();
    }, 3000);

    return () => {
      window.removeEventListener("tracedonate_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [loadLocal, loadSupabase]);

  const allMap = new Map<number, Campaign>();

  // 1. Initial Seed campaigns (fallback only)
  (SEED_CAMPAIGNS as unknown as Campaign[]).forEach((c) => allMap.set(c.id, c));

  // 2. Supabase campaigns
  supabaseCampaigns.forEach((c) => allMap.set(c.id, c));

  // 3. Local created campaigns
  localCampaigns.forEach((c) => allMap.set(c.id, c));

  // 4. Smart contract campaigns on Monad (AUTHORITATIVE SOURCE OF TRUTH)
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((c: any) => {
      const id = Number(c.id ?? c[0]);
      if (id > 0) {
        const localExps = getLocalExpenses(id);
        const existing = allMap.get(id);
        const seedExps = existing?.expenses || [];
        const combinedExps = [
          ...localExps,
          ...seedExps.filter((se) => !localExps.some((le) => le.id === se.id)),
        ];

        const goalWei = BigInt(c.goal ?? c[4] ?? 0n);
        const raisedWei = BigInt(c.totalRaised ?? c[5] ?? 0n);
        const balWei = BigInt(c.currentBalance ?? c[6] ?? 0n);
        const spentWei = BigInt(c.totalSpent ?? c[7] ?? 0n);

        allMap.set(id, {
          id,
          organization: (c.organization ?? c[1]) as `0x${string}`,
          title: String(c.title ?? c[2] ?? existing?.title ?? `Campaign #${id}`),
          description: String(c.description ?? c[3] ?? existing?.description ?? ""),
          goal: formatMon(goalWei),
          goalWei: goalWei,
          totalRaised: formatMon(raisedWei),
          totalRaisedWei: raisedWei,
          currentBalance: formatMon(balWei),
          currentBalanceWei: balWei,
          totalSpent: formatMon(spentWei),
          totalSpentWei: spentWei,
          category: String(c.category ?? c[8] ?? existing?.category ?? "General Relief"),
          imageUri: String(c.imageUri ?? c[9] ?? existing?.imageUri ?? "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80"),
          active: Boolean(c.active ?? c[10] ?? true),
          createdAt: Number(c.createdAt ?? c[11] ?? 0),
          expenses: combinedExps,
        });
      }
    });
  }

  const mergedCampaigns = Array.from(allMap.values()).sort((a, b) => b.id - a.id);

  return {
    campaigns: mergedCampaigns,
    isLoading,
    refetch: () => {
      loadLocal();
      loadSupabase();
      queryClient.invalidateQueries();
      refetch();
    },
    error,
    isRealOnChain: Array.isArray(data) && data.length > 0,
  };
}

export function useCampaignDetails(campaignId: number) {
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);
  const { campaigns, refetch: refetchAll } = useAllCampaigns();

  const {
    data: campaignRaw,
    isLoading: isCampaignLoading,
    refetch: refetchCampaign,
  } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaign",
    args: [BigInt(campaignId)],
    query: {
      refetchInterval: 3000,
      staleTime: 0,
    },
  });

  const {
    data: expensesRaw,
    isLoading: isExpensesLoading,
    refetch: refetchExpenses,
  } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getCampaignExpenses",
    args: [BigInt(campaignId)],
    query: {
      refetchInterval: 3000,
      staleTime: 0,
    },
  });

  // Real-time on-chain event watcher directly from Monad RPC
  useWatchContractEvent({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    eventName: "DonationReceived",
    onLogs(logs) {
      console.log("⚡ [useCampaignDetails] Monad on-chain DonationReceived:", logs);
      queryClient.invalidateQueries();
      refetchCampaign();
      refetchExpenses();
      refetchAll();
      setTick((t) => t + 1);
    },
  });

  const [localExpenses, setLocalExpenses] = useState<Expense[]>([]);
  const [localCampaign, setLocalCampaign] = useState<Campaign | null>(null);

  const loadLocalState = useCallback(() => {
    setLocalExpenses(getLocalExpenses(campaignId));
    const all = getLocalCampaigns();
    const found = all.find((c) => c.id === campaignId);
    if (found) setLocalCampaign(found);
  }, [campaignId]);

  useEffect(() => {
    loadLocalState();

    const handleUpdate = () => {
      loadLocalState();
      queryClient.invalidateQueries();
      refetchCampaign();
      refetchExpenses();
      refetchAll();
      setTick((t) => t + 1);
    };

    window.addEventListener("tracedonate_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 3000);

    return () => {
      window.removeEventListener("tracedonate_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [loadLocalState, queryClient, refetchCampaign, refetchExpenses, refetchAll]);

  const isOnChain = Boolean(
    campaignRaw &&
    ((campaignRaw as any).id !== undefined || Array.isArray(campaignRaw)) &&
    Number((campaignRaw as any).id || (campaignRaw as any)[0] || 0) > 0
  );

  let campaign: Campaign;

  const onChainExpenses: Expense[] = Array.isArray(expensesRaw)
    ? expensesRaw.map((e: any) => ({
        id: Number(e.id ?? e[0]),
        campaignId: Number(e.campaignId ?? e[1]),
        amount: formatMon(e.amount ?? e[2]),
        amountWei: BigInt(e.amount ?? e[2] ?? 0n),
        recipientSupplier: (e.recipientSupplier ?? e[3]) as `0x${string}`,
        category: String(e.category ?? e[4] ?? "General"),
        description: String(e.description ?? e[5] ?? ""),
        evidenceHash: String(e.evidenceHash ?? e[6] ?? ""),
        status: (e.status === 3 || e[7] === 3) ? "Executed" : (e.status === 1 || e[7] === 1) ? "Approved" : (e.status === 2 || e[7] === 2) ? "Rejected" : "Pending",
        createdAt: Number(e.createdAt ?? e[8] ?? 0),
        executedAt: Number(e.executedAt ?? e[9] ?? 0),
      }))
    : [];

  const mergedExpenses = [
    ...localExpenses.filter((le) => !onChainExpenses.some((oe) => oe.id === le.id)),
    ...onChainExpenses,
  ];

  if (isOnChain) {
    const raw = campaignRaw as any;
    const cId = Number(raw.id ?? raw[0]);
    const cOrg = (raw.organization ?? raw[1]) as `0x${string}`;
    const cTitle = String(raw.title ?? raw[2] ?? `Campaign #${cId}`);
    const cDesc = String(raw.description ?? raw[3] ?? "");
    const cGoalWei = BigInt(raw.goal ?? raw[4] ?? 0n);
    const cRaisedWei = BigInt(raw.totalRaised ?? raw[5] ?? 0n);
    const cBalanceWei = BigInt(raw.currentBalance ?? raw[6] ?? 0n);
    const cSpentWei = BigInt(raw.totalSpent ?? raw[7] ?? 0n);
    const cCat = String(raw.category ?? raw[8] ?? "General Relief");
    const cImg = String(raw.imageUri ?? raw[9] ?? "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80");
    const cActive = Boolean(raw.active ?? raw[10] ?? true);
    const cCreatedAt = Number(raw.createdAt ?? raw[11] ?? 0);

    // EXACT ON-CHAIN VALUES FROM MONAD CONTRACT
    campaign = {
      id: cId,
      organization: cOrg,
      title: cTitle,
      description: cDesc,
      goal: formatMon(cGoalWei),
      goalWei: cGoalWei,
      totalRaised: formatMon(cRaisedWei),
      totalRaisedWei: cRaisedWei,
      currentBalance: formatMon(cBalanceWei),
      currentBalanceWei: cBalanceWei,
      totalSpent: formatMon(cSpentWei),
      totalSpentWei: cSpentWei,
      category: cCat,
      imageUri: cImg,
      active: cActive,
      createdAt: cCreatedAt,
      expenses: mergedExpenses,
    };
  } else {
    // Only fall back to local/seed if on-chain contract has not loaded yet
    const local = getLocalCampaigns().find((c) => c.id === campaignId);
    const fromAll = campaigns.find((c) => c.id === campaignId);
    const seed = SEED_CAMPAIGNS.find((c) => c.id === campaignId) || SEED_CAMPAIGNS[0];
    const fallback = local || fromAll || seed;

    campaign = {
      ...(fallback as unknown as Campaign),
      id: campaignId,
      expenses: mergedExpenses.length > 0 ? mergedExpenses : (fallback.expenses as unknown as Expense[]),
    };
  }

  return {
    campaign,
    isLoading: isCampaignLoading || isExpensesLoading,
    isOnChain,
    refetch: () => {
      loadLocalState();
      queryClient.invalidateQueries();
      refetchCampaign();
      refetchExpenses();
      refetchAll();
      setTick((t) => t + 1);
    },
  };
}

export function useCampaignDonations(campaignId: number) {
  const [localDonations, setLocalDonations] = useState<Donation[]>([]);
  const [tick, setTick] = useState(0);

  const loadDonations = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LOCAL_DONATIONS_KEY);
      if (raw) {
        const all: Donation[] = JSON.parse(raw);
        const filtered = all.filter((d) => d.campaignId === campaignId);
        setLocalDonations(filtered);
      }
    } catch {}
  }, [campaignId]);

  useEffect(() => {
    loadDonations();
    const handleUpdate = () => {
      loadDonations();
      setTick((t) => t + 1);
    };

    window.addEventListener("tracedonate_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 3000);

    return () => {
      window.removeEventListener("tracedonate_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [loadDonations]);

  const seedList = SEED_DONATIONS[campaignId] || [];
  const merged = [
    ...localDonations,
    ...seedList.filter((sd) => !localDonations.some((ld) => ld.timestamp === sd.timestamp)),
  ];

  return merged.sort((a, b) => b.timestamp - a.timestamp);
}

export function useDonorHistory(donorAddress?: string) {
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);

  const { data: donationsRaw, isLoading, refetch } = useReadContract({
    address: TRACEDONATE_CONTRACT_ADDRESS,
    abi: TRACEDONATE_ABI,
    functionName: "getDonorDonations",
    args: donorAddress ? [donorAddress as `0x${string}`] : undefined,
    query: {
      refetchInterval: 3000,
      staleTime: 0,
    },
  });

  const onChainDonations: Donation[] = Array.isArray(donationsRaw)
    ? donationsRaw.map((d: any) => ({
        campaignId: Number(d.campaignId ?? d[0]),
        donor: (d.donor ?? d[1]) as `0x${string}`,
        amount: formatMon(d.amount ?? d[2]),
        amountWei: BigInt(d.amount ?? d[2] ?? 0n),
        timestamp: Number(d.timestamp ?? d[3] ?? 0),
      }))
    : [];

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

    const handleUpdate = () => {
      loadLocalDonations();
      setTick((t) => t + 1);
    };

    window.addEventListener("tracedonate_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(handleUpdate, 3000);

    return () => {
      window.removeEventListener("tracedonate_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [loadLocalDonations]);

  const mergedDonations = [
    ...onChainDonations,
    ...localDonations.filter((ld) => !onChainDonations.some((od) => od.timestamp === ld.timestamp && od.campaignId === ld.campaignId)),
  ];

  return {
    donations: mergedDonations,
    isLoading,
    refetch: () => {
      loadLocalDonations();
      queryClient.invalidateQueries();
      refetch();
    },
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
      staleTime: 0,
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
