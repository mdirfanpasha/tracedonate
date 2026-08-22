"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  label: string;
  sublabel: string;
  type: "donor" | "vault" | "category" | "supplier" | "proof";
  color: string;
  size: number;
  pulse: number;
}

interface Particle {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

export function NetworkVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left - width / 2) * 0.05;
      targetMouseY = (e.clientY - rect.top - height / 2) * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let nodes: Node[] = [];
    let connections: [number, number][] = [];
    let particles: Particle[] = [];

    const initNodes = () => {
      const cx = width / 2;
      const cy = height / 2;
      const scaleX = Math.min(width / 900, 1);
      const scaleY = Math.min(height / 450, 1);

      nodes = [
        // 0: Donor
        {
          x: cx - 340 * scaleX,
          y: cy,
          z: 0,
          baseX: cx - 340 * scaleX,
          baseY: cy,
          label: "DONOR",
          sublabel: "1.00 MON",
          type: "donor",
          color: "#00F5A0",
          size: 26,
          pulse: 0,
        },
        // 1: Campaign Vault (Escrow)
        {
          x: cx - 120 * scaleX,
          y: cy,
          z: 0,
          baseX: cx - 120 * scaleX,
          baseY: cy,
          label: "MONAD ESCROW",
          sublabel: "TraceDonate.sol",
          type: "vault",
          color: "#836EF9",
          size: 32,
          pulse: 0,
        },
        // 2: Food Expense
        {
          x: cx + 110 * scaleX,
          y: cy - 90 * scaleY,
          z: 0,
          baseX: cx + 110 * scaleX,
          baseY: cy - 90 * scaleY,
          label: "FOOD RELIEF",
          sublabel: "0.45 MON",
          type: "category",
          color: "#00F5A0",
          size: 22,
          pulse: 0,
        },
        // 3: Medical Supplies
        {
          x: cx + 110 * scaleX,
          y: cy + 90 * scaleY,
          z: 0,
          baseX: cx + 110 * scaleX,
          baseY: cy + 90 * scaleY,
          label: "MEDICAL AID",
          sublabel: "0.35 MON",
          type: "category",
          color: "#00D2FF",
          size: 22,
          pulse: 0,
        },
        // 4: Supplier Wallet 1
        {
          x: cx + 330 * scaleX,
          y: cy - 90 * scaleY,
          z: 0,
          baseX: cx + 330 * scaleX,
          baseY: cy - 90 * scaleY,
          label: "VENDOR 0x892...1014",
          sublabel: "Direct Settlement",
          type: "supplier",
          color: "#00F5A0",
          size: 24,
          pulse: 0,
        },
        // 5: Supplier Wallet 2
        {
          x: cx + 330 * scaleX,
          y: cy + 90 * scaleY,
          z: 0,
          baseX: cx + 330 * scaleX,
          baseY: cy + 90 * scaleY,
          label: "CLINIC 0x28a...05f2",
          sublabel: "Direct Settlement",
          type: "supplier",
          color: "#00D2FF",
          size: 24,
          pulse: 0,
        },
      ];

      connections = [
        [0, 1], // Donor -> Escrow
        [1, 2], // Escrow -> Food
        [1, 3], // Escrow -> Medical
        [2, 4], // Food -> Supplier 1
        [3, 5], // Medical -> Supplier 2
      ];

      particles = [
        { fromNode: 0, toNode: 1, progress: 0.1, speed: 0.008, color: "#00F5A0" },
        { fromNode: 0, toNode: 1, progress: 0.6, speed: 0.008, color: "#00F5A0" },
        { fromNode: 1, toNode: 2, progress: 0.2, speed: 0.009, color: "#836EF9" },
        { fromNode: 1, toNode: 3, progress: 0.7, speed: 0.009, color: "#836EF9" },
        { fromNode: 2, toNode: 4, progress: 0.4, speed: 0.010, color: "#00F5A0" },
        { fromNode: 3, toNode: 5, progress: 0.5, speed: 0.010, color: "#00D2FF" },
      ];
    };

    initNodes();

    let time = 0;

    const render = () => {
      time += 0.02;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update node positions with gentle floating and mouse parallax
      nodes.forEach((node, i) => {
        const floatX = Math.sin(time + i * 1.5) * 3;
        const floatY = Math.cos(time + i * 1.2) * 4;
        node.x = node.baseX + floatX + mouseX * (1 + (i % 3) * 0.3);
        node.y = node.baseY + floatY + mouseY * (1 + (i % 3) * 0.3);
        node.pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
      });

      // Draw Connections with glowing gradient lines
      connections.forEach(([fromIdx, toIdx]) => {
        const from = nodes[fromIdx];
        const to = nodes[toIdx];

        const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        grad.addColorStop(0, `${from.color}44`);
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        grad.addColorStop(1, `${to.color}44`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw moving money flow particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        // Glow
        const radGrad = ctx.createRadialGradient(px, py, 1, px, py, 8);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach((node) => {
        // Outer glowing pulse
        const pulseSize = node.size + node.pulse * 8;
        const glowGrad = ctx.createRadialGradient(node.x, node.y, node.size * 0.6, node.x, node.y, pulseSize + 12);
        glowGrad.addColorStop(0, `${node.color}33`);
        glowGrad.addColorStop(1, "transparent");

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 12, 0, Math.PI * 2);
        ctx.fill();

        // Base card/circle
        ctx.fillStyle = "#0F1420";
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = `${node.color}22`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Node Label
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = "bold 10px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(node.label, node.x, node.y + node.size + 14);

        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(node.sublabel, node.x, node.y + node.size + 26);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden bg-surface-card/70 border border-surface-border backdrop-blur-md shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Live state badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/90 border border-surface-border text-[11px] font-mono text-text-secondary backdrop-blur-md shadow-sm">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        <span className="text-text-primary font-medium">Live Monad Execution Trail</span>
      </div>

      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-text-muted bg-surface/80 px-2.5 py-1 rounded border border-surface-border">
        Smart Contract Escrow Protected
      </div>
    </div>
  );
}
