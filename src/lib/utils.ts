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
    return isNaN(formatted) ? "0.000" : formatted.toFixed(decimals);
  } catch {
    return "0.000";
  }
}

export function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("food")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (c.includes("med") || c.includes("health")) return "text-blue-700 bg-blue-50 border-blue-200";
  if (c.includes("water")) return "text-cyan-700 bg-cyan-50 border-cyan-200";
  if (c.includes("transport") || c.includes("logistics")) return "text-purple-700 bg-purple-50 border-purple-200";
  if (c.includes("shelter")) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-slate-700 bg-slate-50 border-slate-200";
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
