"use client";
import { useState } from "react";
import LiveTicker from "@/components/LiveTicker";
import RegistrationBlock from "@/components/RegistrationBlock";
import ShareRow from "@/components/ShareRow";
import EstimationHistory from "@/components/EstimationHistory";
import ContributionGraph from "@/components/ContributionGraph";
import { Activity, DollarSign, Zap, BarChart2 } from "lucide-react";

export default function Home() {
  const [extraCost, setExtraCost] = useState(0);

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a" }}
    >
      {/* Top nav */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", borderColor: "#1a1a1a" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <DollarSign size={16} className="text-red-400" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">Payment Tracker</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 uppercase tracking-wide">
              Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <Activity size={12} className="text-green-400 animate-pulse" />
              <span>Real-time</span>
            </div>
            <a
              href="https://github.com/hwchiu/eggroll"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero / Ticker section */}
      <div
        className="relative border-b overflow-hidden"
        style={{ borderColor: "#1a1a1a" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(239,68,68,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.4) 50%, transparent 100%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-4">
          <LiveTicker extraCost={extraCost} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Services", value: "3", icon: <Zap size={14} />, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Total Projects", value: "6", icon: <BarChart2 size={14} />, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Confidence", value: "82%", icon: <Activity size={14} />, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Net Estimate", value: "$264K", icon: <DollarSign size={14} />, color: "text-red-400", bg: "bg-red-500/10" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{ background: "#111827", borderColor: "#1f2937" }}
            >
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <div className={`font-mono font-bold text-base ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-4">
        {/* Registration block — ABOVE share row */}
        <RegistrationBlock onCostAdded={(c) => setExtraCost((prev) => prev + c)} />

        {/* Share row */}
        <ShareRow />

        {/* Contribution Graph */}
        <ContributionGraph />

        {/* Estimation History */}
        <EstimationHistory />
      </div>

      {/* Footer */}
      <div
        className="border-t py-6 text-center"
        style={{ borderColor: "#1a1a1a" }}
      >
        <div className="text-xs text-gray-600">
          Payment Tracker — Live AI cost monitoring •{" "}
          <span className="text-gray-500">Powered by Next.js</span>
        </div>
      </div>
    </div>
  );
}
