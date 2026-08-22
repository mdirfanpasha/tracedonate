"use client";

import React, { useEffect, useRef, useState } from "react";

interface FlowStep {
  label: string;
  tag: string;
  desc: string;
  amount: string;
}

export function NetworkVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps: FlowStep[] = [
    { label: "DONOR", tag: "0x3a79...a1b2", desc: "0.50 MON sent directly", amount: "0.50 MON" },
    { label: "CAMPAIGN", tag: "TraceDonate.sol", desc: "Locked in smart contract escrow", amount: "100% On-Chain" },
    { label: "PAYMENT", tag: "Verified Expense", desc: "Audited invoice released", amount: "0.25 MON" },
    { label: "RECIPIENT", tag: "0x892a...1014", desc: "Supplier receives funds instantly", amount: "Direct Payout" },
    { label: "PROOF", tag: "Monad Block #184209", desc: "Immutable public verification", amount: "Verified ✓" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle flow
    const particles: { x: number; y: number; progress: number; speed: number }[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: 0,
        y: 0,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Node positions
      const count = steps.length;
      const padding = Math.min(60, width * 0.08);
      const availableWidth = width - padding * 2;
      const stepX = availableWidth / (count - 1);
      const centerY = height / 2;

      const nodePositions: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const nx = padding + i * stepX;
        const wave = Math.sin(time + i * 0.8) * 4;
        nodePositions.push({ x: nx, y: centerY + wave });
      }

      // Draw subtle connecting background track
      ctx.beginPath();
      ctx.moveTo(nodePositions[0].x, nodePositions[0].y);
      for (let i = 1; i < count; i++) {
        const prev = nodePositions[i - 1];
        const curr = nodePositions[i];
        const cx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Flowing glowing particles along track
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const totalSegments = count - 1;
        const currentSegment = Math.floor(p.progress * totalSegments);
        const segmentProgress = (p.progress * totalSegments) % 1;

        if (currentSegment < totalSegments) {
          const p1 = nodePositions[currentSegment];
          const p2 = nodePositions[currentSegment + 1];

          // Cubic bezier interpolation
          const cx = (p1.x + p2.x) / 2;
          const t = segmentProgress;
          const px = (1 - t) * (1 - t) * (1 - t) * p1.x + 3 * (1 - t) * (1 - t) * t * cx + 3 * (1 - t) * t * t * cx + t * t * t * p2.x;
          const py = (1 - t) * (1 - t) * (1 - t) * p1.y + 3 * (1 - t) * (1 - t) * t * p1.y + 3 * (1 - t) * t * t * p2.y + t * t * t * p2.y;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      nodePositions.forEach((pos, idx) => {
        const isCurrentActive = Math.floor((time * 0.8) % count) === idx;

        // Outer subtle pulse ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isCurrentActive ? 18 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.03)";
        ctx.fill();
        ctx.strokeStyle = isCurrentActive ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentActive ? "#10b981" : "#e2e8f0";
        if (isCurrentActive) {
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
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
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0C0F17]/80 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-2xl">
      {/* Visual Canvas */}
      <div className="relative w-full h-36 md:h-44 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Step Sequence Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3 pt-2 border-t border-white/[0.06]">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="p-3 rounded-xl bg-surface/50 border border-white/[0.05] space-y-1 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold text-white tracking-wider">{step.label}</span>
              <span className="text-emerald-400 font-bold">{idx + 1}</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{step.desc}</p>
            <div className="text-[10px] font-mono text-emerald-400 font-medium truncate pt-0.5">
              {step.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
