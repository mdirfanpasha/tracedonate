"use client";

import React, { useState } from "react";
import { formatAddress, getExplorerTxUrl } from "@/lib/utils";
import { ExternalLink, Check, Copy } from "lucide-react";

interface TransactionBadgeProps {
  txHash: string;
  label?: string;
  className?: string;
  showFull?: boolean;
}

export function TransactionBadge({
  txHash,
  label,
  className = "",
  showFull = false,
}: TransactionBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono transition-all hover:bg-slate-100 ${className}`}
    >
      {label && <span className="text-slate-500 text-[10px] uppercase font-bold">{label}:</span>}
      <a
        href={getExplorerTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
        title="View transaction on Monad Explorer"
      >
        <span>{showFull ? txHash : formatAddress(txHash, 5)}</span>
        <ExternalLink className="w-3 h-3 opacity-70" />
      </a>

      <button
        onClick={handleCopy}
        type="button"
        className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
        title="Copy Transaction Hash"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-600" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
