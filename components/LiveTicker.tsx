"use client";
import { useEffect, useState } from "react";

const START_DATE = new Date("2026-04-01T03:00:00");

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export default function LiveTicker({ extraCost = 0 }: { extraCost?: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      const real = (Date.now() - START_DATE.getTime()) / 1000;
      setElapsed(real > 0 ? real : 0);
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const totalCost = extraCost;
  const formatted = formatCurrency(totalCost);
  const sign = totalCost < 0 ? "-" : "";
  const secs = elapsed > 0 ? elapsed : 0;
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const timerText = `${String(d).padStart(2, "0")}:${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className="w-full py-8 px-4 flex flex-col items-center">
      <div className="relative flex flex-col items-center w-full">
        <div className="header text-center">
          <h1>SENTINELPAY : VIP SERVICE PAYMENT TRACKER</h1>
          <div className="sub">Creditor Sherry Spending</div>
        </div>

        <div
          className="mt-4 w-full max-w-4xl rounded-2xl border px-5 py-7 md:px-8 md:py-10 flex flex-col items-center gap-5"
          style={{
            background: "linear-gradient(180deg, #121212 0%, #0b0b0b 100%)",
            borderColor: "#2b2b2b",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.45)",
          }}
        >
          <div
            className="font-mono font-black tabular-nums select-none text-center"
            style={{
              fontSize: "clamp(2.2rem, 9vw, 6.6rem)",
              color: "#f87171",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              textShadow: "0 0 24px rgba(248,113,113,0.4)",
            }}
          >
            {sign}${formatted}
          </div>

          <div className="text-center">
            <div
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: "clamp(1.2rem, 3.8vw, 2.5rem)", color: "#fb923c", lineHeight: 1.1 }}
            >
              {timerText}
            </div>
            <div
              className="font-mono uppercase tracking-[0.2em] mt-2"
              style={{ fontSize: "11px", color: "#6b7280" }}
            >
              Days : Hours : Minutes : Seconds
            </div>
          </div>

          <div
            className="font-mono"
            style={{
              fontSize: "clamp(0.72rem, 1.5vw, 0.9rem)",
              color: "#6b7280",
              letterSpacing: "0.08em",
            }}
          >
            Since 2026/04/01 03:00:00
          </div>
        </div>
      </div>
    </div>
  );
}
