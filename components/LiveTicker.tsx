"use client";
import { useEffect, useState, useRef } from "react";

const START_DATE = new Date("2026-04-01T03:00:00");
const HOURLY_RATE = 42.5; // USD per hour base rate

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatElapsed(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export default function LiveTicker({ extraCost = 0 }: { extraCost?: number }) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setElapsed((prev) => {
        const real = (Date.now() - START_DATE.getTime()) / 1000;
        return real > 0 ? real : prev + delta;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formatted = formatCurrency(extraCost);
  const parts = formatted.split(".");

  return (
    <div className="w-full py-8 px-4 flex flex-col items-center">
      {/* Main ticker */}
      <div className="relative flex flex-col items-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 font-medium">
          Total Live Cost (USD)
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold mt-1" style={{ color: "#F87171" }}>$</span>
          <span
            className="font-mono font-black ticker-glow"
            style={{
              fontSize: "clamp(3rem, 8vw, 7rem)",
              color: "#F87171",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {parts[0]}
          </span>
          <span
            className="font-mono font-black"
            style={{ fontSize: "clamp(1.5rem, 4vw, 3.5rem)", lineHeight: 1, color: "#F87171" }}
          >
            .{parts[1]}
          </span>
        </div>

        {/* Pulsing border under ticker */}
        <div
          className="mt-4 w-full h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* Stats row */}
        <div className="mt-6 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Elapsed</div>
            <div className="font-mono text-sm text-orange-400 font-semibold">
              {formatElapsed(elapsed > 0 ? elapsed : 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Rate / Hour</div>
            <div className="font-mono text-sm text-green-400 font-semibold">
              ${HOURLY_RATE.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Rate / Second</div>
            <div className="font-mono text-sm text-blue-400 font-semibold">
              ${(HOURLY_RATE / 3600).toFixed(6)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Since</div>
            <div className="font-mono text-sm text-purple-400 font-semibold">
              2026/04/01 03:00:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
