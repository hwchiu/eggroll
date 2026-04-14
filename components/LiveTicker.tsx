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
        <h1
          className="font-black uppercase tracking-[0.18em] text-white mb-4 text-center"
          style={{ fontSize: "clamp(1rem, 3.5vw, 1.75rem)", letterSpacing: "0.18em" }}
        >
          SENTINELPAY : VIP SERVICE PAYMENT TRACKER
        </h1>
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

        {/* Elapsed time — individual unit boxes */}
        {(() => {
          const secs = elapsed > 0 ? elapsed : 0;
          const d = Math.floor(secs / 86400);
          const h = Math.floor((secs % 86400) / 3600);
          const m = Math.floor((secs % 3600) / 60);
          const s = Math.floor(secs % 60);
          const units = [
            { value: String(d).padStart(2, "0"), label: "Days" },
            { value: String(h).padStart(2, "0"), label: "Hours" },
            { value: String(m).padStart(2, "0"), label: "Minutes" },
            { value: String(s).padStart(2, "0"), label: "Seconds" },
          ];
          return (
            <div className="mt-6 flex items-center justify-center gap-2">
              {units.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-2">
                  <div
                    className="flex flex-col items-center rounded-lg px-4 py-3 min-w-[60px]"
                    style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <span
                      className="font-mono font-black leading-none"
                      style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#fb923c" }}
                    >
                      {unit.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                      {unit.label}
                    </span>
                  </div>
                  {i < units.length - 1 && (
                    <span
                      className="font-mono font-bold pb-4"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", color: "#4b5563" }}
                    >
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Stats row */}
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
