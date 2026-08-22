export type ExpenseStatus = "Pending" | "Approved" | "Rejected" | "Executed";

export interface Campaign {
  id: number;
  organization: `0x${string}`;
  title: string;
  description: string;
  goal: string; // in MON
  goalWei: bigint;
  totalRaised: string; // in MON
  totalRaisedWei: bigint;
  currentBalance: string; // in MON
  currentBalanceWei: bigint;
  totalSpent: string; // in MON
  totalSpentWei: bigint;
  category: string;
  imageUri: string;
  active: boolean;
  createdAt: number;
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  campaignId: number;
  amount: string; // in MON
  amountWei: bigint;
  recipientSupplier: `0x${string}`;
  category: string;
  description: string;
  evidenceHash: string;
  status: ExpenseStatus;
  createdAt: number;
  executedAt?: number;
  txHash?: string;
}

export interface Donation {
  campaignId: number;
  campaignTitle?: string;
  donor: `0x${string}`;
  amount: string; // in MON
  amountWei: bigint;
  timestamp: number;
  txHash?: string;
}

export interface GlobalStats {
  totalCampaigns: number;
  totalDonated: string;
  totalSpent: string;
  totalDonations: number;
  totalExpensesRecorded: number;
  fundsTracedPercentage: number;
}

export interface CategoryAllocation {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
