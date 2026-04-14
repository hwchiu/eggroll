"use client";
import { useEffect, useState, useRef } from "react";

const START_DATE = new Date("2026-04-01T03:00:00");
const HOURLY_RATE = 42.5;

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatElapsed(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function LiveTicker({ total = 0 }: { total?: number }) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const real = (Date.now() - START_DATE.getTime()) / 1000;
      setElapsed(real > 0 ? real : 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formatted = formatCurrency(total);
  const parts = formatted.split(".");
  const et = formatElapsed(elapsed > 0 ? elapsed : 0);

  return (
    <div className="w-full py-8 px-4 flex flex-col items-center">
      <div className="relative flex flex-col items-center w-full">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 font-medium">
          Total Live Cost (USD)
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold mt-1" style={{ color: "#F87171" }}>
            $
          </span>
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

        {/* Gradient divider */}
        <div
          className="mt-4 w-full h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* Elapsed — prominent block directly below the total */}
        <div className="mt-6 flex flex-col items-center w-full">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3 font-medium">
            Elapsed
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { val: et.d, unit: "D" },
              { val: et.h, unit: "H" },
              { val: et.m, unit: "M" },
              { val: et.s, unit: "S" },
            ].map(({ val, unit }, i) => (
              <div key={unit} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="font-mono font-bold text-xl text-gray-600 select-none">
                    :
                  </span>
                )}
                <div
                  className="flex flex-col items-center px-3 py-2 rounded-lg"
                  style={{
                    background: "#111827",
                    border: "1px solid #1f2937",
                    minWidth: 56,
                  }}
                >
                  <span className="font-mono font-black text-2xl text-orange-400 leading-none tabular-nums">
                    {val}
                  </span>
                  <span className="text-[10px] text-gray-600 font-semibold mt-1 uppercase tracking-widest">
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary stats row */}
        <div className="mt-6 flex flex-wrap justify-center gap-8 text-center">
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
