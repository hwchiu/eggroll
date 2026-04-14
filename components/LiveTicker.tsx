"use client";
import { useEffect, useState, useRef } from "react";
import { Timer } from "lucide-react";

const START_DATE = new Date("2026-04-01T03:00:00");
const HOURLY_RATE = 42.5; // USD per hour base rate

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatElapsed(seconds: number): { d: string; h: string; m: string; s: string } {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return {
    d: String(d),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function LiveTicker({ totalAmount = 0 }: { totalAmount?: number }) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setElapsed((Date.now() - START_DATE.getTime()) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const formatted = formatCurrency(totalAmount);
  const parts = formatted.split(".");
  const el = formatElapsed(elapsed > 0 ? elapsed : 0);

  return (
    <div className="w-full py-8 px-4 flex flex-col items-center">
      {/* Main ticker */}
      <div className="relative flex flex-col items-center w-full">
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

        {/* Separator */}
        <div
          className="mt-4 w-full h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* ── Elapsed — displayed prominently below total ── */}
        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-2">
            <Timer size={12} className="text-orange-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-medium">
              Elapsed Time
            </span>
          </div>
          <div className="flex items-end gap-2">
            {[
              { value: el.d, label: "Days" },
              { value: el.h, label: "Hours" },
              { value: el.m, label: "Min" },
              { value: el.s, label: "Sec" },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-end gap-2">
                {i > 0 && (
                  <span
                    className="font-mono font-bold text-orange-400 mb-1"
                    style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
                  >
                    :
                  </span>
                )}
                <div className="flex flex-col items-center">
                  <div
                    className="font-mono font-black text-orange-400"
                    style={{
                      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                      lineHeight: 1,
                      minWidth: "2ch",
                      textAlign: "center",
                    }}
                  >
                    {value}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mt-1">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div
          className="mt-5 w-3/4 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.2) 50%, transparent 100%)",
          }}
        />

        {/* Mini stats row: Rate/Hour, Rate/Second, Since */}
        <div className="mt-4 flex flex-wrap justify-center gap-8 text-center">
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
