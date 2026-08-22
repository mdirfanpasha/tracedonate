"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

interface FlowStep {
  label: string;
  sub: string;
  tag: string;
  amount: string;
  color: string;
}

export function NetworkVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const steps: FlowStep[] = [
    { label: "DONOR", sub: "Wallet Deposit", tag: "0x3a79...a1b2", amount: "0.50 MON", color: "#0D9488" },
    { label: "CAMPAIGN VAULT", sub: "Smart Contract Escrow", tag: "TraceDonate.sol", amount: "100% Locked", color: "#059669" },
    { label: "AUDITED EXPENSE", sub: "Itemized Invoice", tag: "Food Supplies #104", amount: "0.25 MON", color: "#2563EB" },
    { label: "SUPPLIER RECIPIENT", sub: "Direct Payout", tag: "0x892a...1014", amount: "Instant Transfer", color: "#059669" },
    { label: "PUBLIC PROOF", sub: "Monad Block #184209", tag: "Immutable Tx", amount: "Verified ✓", color: "#10B981" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle flow
    const particles: { progress: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 24; i++) {
      particles.push({
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
        size: 2 + Math.random() * 1.5,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const count = steps.length;
      const padding = Math.min(60, width * 0.08);
      const availableWidth = width - padding * 2;
      const stepX = availableWidth / (count - 1);
      const centerY = height / 2;

      const nodePositions: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const nx = padding + i * stepX;
        const wave = Math.sin(time + i * 0.8) * 3;
        nodePositions.push({ x: nx, y: centerY + wave });
      }

      // Draw subtle connecting background curve
      ctx.beginPath();
      ctx.moveTo(nodePositions[0].x, nodePositions[0].y);
      for (let i = 1; i < count; i++) {
        const prev = nodePositions[i - 1];
        const curr = nodePositions[i];
        const cx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Flowing particles along track
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const totalSegments = count - 1;
        const currentSegment = Math.floor(p.progress * totalSegments);
        const segmentProgress = (p.progress * totalSegments) % 1;

        if (currentSegment < totalSegments) {
          const p1 = nodePositions[currentSegment];
          const p2 = nodePositions[currentSegment + 1];

          const cx = (p1.x + p2.x) / 2;
          const t = segmentProgress;
          const px = (1 - t) * (1 - t) * (1 - t) * p1.x + 3 * (1 - t) * (1 - t) * t * cx + 3 * (1 - t) * t * t * cx + t * t * t * p2.x;
          const py = (1 - t) * (1 - t) * (1 - t) * p1.y + 3 * (1 - t) * (1 - t) * t * p1.y + 3 * (1 - t) * t * t * p2.y + t * t * t * p2.y;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "#059669";
          ctx.fill();
        }
      });

      // Draw Nodes
      nodePositions.forEach((pos, idx) => {
        const isCurrentActive = Math.floor((time * 0.8) % count) === idx;

        // Outer ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isCurrentActive ? 16 : 10, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive ? "rgba(16, 185, 129, 0.15)" : "#F1F5F9";
        ctx.fill();
        ctx.strokeStyle = isCurrentActive ? "#10B981" : "#CBD5E1";
        ctx.lineWidth = isCurrentActive ? 2 : 1;
        ctx.stroke();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive ? "#059669" : "#64748B";
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [steps.length]);

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-card">
      {/* Visual Canvas */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Step Sequence Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 hover:bg-emerald-50/40 hover:border-emerald-200 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold text-slate-900 tracking-tight">{step.label}</span>
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                {idx + 1}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">{step.sub}</p>
            <div className="text-[11px] font-mono text-emerald-700 font-semibold truncate pt-0.5">
              {step.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
