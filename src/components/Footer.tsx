import React from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { formatAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#080B11] mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm text-white">
            Trace<span className="text-emerald-400">Donate</span>
          </span>
          <span className="text-xs text-slate-500">• Built on Monad</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link href="/campaigns" className="hover:text-white transition-colors">
            Campaigns
          </Link>
          <Link href="/dashboard/donor" className="hover:text-white transition-colors">
            My Donations
          </Link>
          <a
            href={`${MONAD_EXPLORER_URL}/address/${TRACEDONATE_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono"
          >
            <span>Contract</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
