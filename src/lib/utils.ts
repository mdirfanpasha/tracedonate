import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatMon(valueWei?: bigint | string | number, decimals = 3): string {
  if (valueWei === undefined || valueWei === null) return "0.000";
  try {
    const weiBigInt = typeof valueWei === "bigint" ? valueWei : BigInt(valueWei.toString());
    const formatted = parseFloat(formatEther(weiBigInt));
    return formatted.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0.000";
  }
}

export function formatTimestamp(timestampInSeconds?: number): string {
  if (!timestampInSeconds) return "Just now";
  const date = new Date(timestampInSeconds * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(timestampInSeconds?: number): string {
  if (!timestampInSeconds) return "Just now";
  const date = new Date(timestampInSeconds * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const MONAD_EXPLORER_BASE = "https://testnet.monadvision.com";

export function getExplorerTxUrl(txHash?: string): string {
  if (!txHash) return `${MONAD_EXPLORER_BASE}`;
  return `${MONAD_EXPLORER_BASE}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address?: string): string {
  if (!address) return `${MONAD_EXPLORER_BASE}`;
  return `${MONAD_EXPLORER_BASE}/address/${address}`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "#00F5A0",
  Medical: "#00D2FF",
  Transport: "#F59E0B",
  Equipment: "#A855F7",
  Shelter: "#EC4899",
  Logistics: "#6366F1",
  "Clean Water": "#06B6D4",
  Education: "#10B981",
  Other: "#94A3B8",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#00F5A0";
}
