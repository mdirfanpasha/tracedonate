import React from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { ShieldCheck, ExternalLink, Github } from "lucide-react";
import { formatAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="font-bold text-sm text-slate-900">
            Trace<span className="text-emerald-600">Donate</span>
          </span>
          <span className="text-xs text-slate-500">• Built on Monad</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <Link href="/campaigns" className="hover:text-slate-900 transition-colors">
            Campaigns
          </Link>
          <Link href="/dashboard/donor" className="hover:text-slate-900 transition-colors">
            My Donations
          </Link>
          <Link href="/dashboard/org" className="hover:text-slate-900 transition-colors">
            Org Console
          </Link>
          <a
            href="https://github.com/mdirfanpasha/tracedonate"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href={`${MONAD_EXPLORER_URL}/address/${TRACEDONATE_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-mono font-medium"
          >
            <span>Contract</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
