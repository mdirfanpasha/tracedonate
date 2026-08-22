import React from "react";
import Link from "next/link";
import { TRACEDONATE_CONTRACT_ADDRESS, MONAD_EXPLORER_URL } from "@/config/contracts";
import { ShieldCheck, ExternalLink, Github, HeartHandshake, FileCode2 } from "lucide-react";
import { formatAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
              </div>
              <span className="font-bold text-base tracking-tight text-text-primary">
                Trace<span className="text-brand-500">Donate</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-monad/10 text-monad-light border border-monad/30">
                Monad Testnet
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-md leading-relaxed">
              Every donation. Every payment. Every proof. TraceDonate eliminates blind faith in charity by locking donations in on-chain smart contract escrow on Monad and routing spending directly to verified supplier addresses.
            </p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Chain ID: 10143 (Monad Testnet)
              </span>
              <span>•</span>
              <a
                href={`${MONAD_EXPLORER_URL}/address/${TRACEDONATE_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-500 transition-colors flex items-center gap-1 font-mono"
              >
                Contract: {formatAddress(TRACEDONATE_CONTRACT_ADDRESS)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link href="/campaigns" className="hover:text-brand-500 transition-colors">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-brand-500 transition-colors">
                  Where Does The Money Go?
                </Link>
              </li>
              <li>
                <Link href="/dashboard/donor" className="hover:text-brand-500 transition-colors">
                  Donor Dashboard & Receipts
                </Link>
              </li>
              <li>
                <Link href="/dashboard/org" className="hover:text-brand-500 transition-colors">
                  Organization & Verification Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Monad */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              Monad Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <a
                  href="https://docs.monad.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 transition-colors flex items-center gap-1"
                >
                  Monad Documentation <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.monad.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 transition-colors flex items-center gap-1"
                >
                  Monad Official Faucet <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://testnet.monadvision.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 transition-colors flex items-center gap-1"
                >
                  MonadVision Explorer <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://testnet.monadscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 transition-colors flex items-center gap-1"
                >
                  MonadScan <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted">
          <div>
            Built for the Monad Hackathon. Empowered by 10,000 TPS on-chain settlement.
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by Monad Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
