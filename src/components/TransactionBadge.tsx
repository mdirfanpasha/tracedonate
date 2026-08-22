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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/80 border border-surface-border text-xs font-mono transition-all hover:border-brand-500/40 group ${className}`}
    >
      {label && <span className="text-text-muted text-[10px] uppercase">{label}:</span>}
      <a
        href={getExplorerTxUrl(txHash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-500 hover:underline flex items-center gap-1"
        title="View transaction on Monad Explorer"
      >
        <span>{showFull ? txHash : formatAddress(txHash, 5)}</span>
        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </a>

      <button
        onClick={handleCopy}
        type="button"
        className="p-0.5 text-text-muted hover:text-text-primary rounded transition-colors"
        title="Copy Transaction Hash"
      >
        {copied ? (
          <Check className="w-3 h-3 text-brand-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}
