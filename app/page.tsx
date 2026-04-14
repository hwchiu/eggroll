"use client";
import { useState, useEffect, useRef } from "react";
import LiveTicker from "@/components/LiveTicker";
import RegistrationBlock from "@/components/RegistrationBlock";
import ShareRow from "@/components/ShareRow";
import EstimationHistory from "@/components/EstimationHistory";
import ContributionGraph from "@/components/ContributionGraph";
import {
  Activity,
  DollarSign,
  Zap,
  BarChart2,
  RotateCcw,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getTotalAmount,
  setTotalAmount as persistTotal,
  getHistoryEntries,
  addHistoryEntry,
  type HistoryEntry,
} from "@/lib/storage";

// ── Reset Password Dialog ──────────────────────────────────────────────────

function ResetDialog({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [stage, setStage] = useState<"input" | "success" | "error">("input");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const SECRET = "\u9577\u5B98\u662F\u6700\u68D2\u7684"; // 長官是最棒的

  const handleCheck = () => {
    if (password === SECRET) {
      setStage("success");
    } else {
      setStage("error");
    }
  };

  const handleConfirmReset = () => {
    persistTotal(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <RotateCcw size={16} className="text-red-400" />
          </div>
          <span className="font-semibold text-white text-sm">Reset Total Amount</span>
        </div>

        {stage === "input" && (
          <>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Enter the secret password to proceed with resetting the total amount to zero.
            </p>
            <div
              className="flex items-center rounded-lg border overflow-hidden"
              style={{ background: "#111827", borderColor: "#1f2937" }}
            >
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="Secret password"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                className="px-3 py-2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              onClick={handleCheck}
              disabled={!password}
              className={`mt-4 w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                password
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Verify
            </button>
          </>
        )}

        {stage === "error" && (
          <>
            <p className="text-sm text-red-400 mb-4">Incorrect password. Please try again.</p>
            <button
              onClick={() => { setPassword(""); setStage("input"); }}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all"
            >
              Try Again
            </button>
          </>
        )}

        {stage === "success" && (
          <>
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-400 font-semibold">通關成功</p>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to reset the total amount to zero? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
              >
                Confirm Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [totalAmount, setTotalAmountState] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showReset, setShowReset] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted data client-side only
  useEffect(() => {
    setTotalAmountState(getTotalAmount());
    setHistory(getHistoryEntries());
    setHydrated(true);
  }, []);

  const handleSubmit = (entry: Omit<HistoryEntry, "id">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `h-${Date.now()}`,
    };
    const updated = addHistoryEntry(newEntry);
    setHistory(updated);

    const delta = entry.type === "add" ? entry.amount : -entry.amount;
    const next = totalAmount + delta;
    setTotalAmountState(next);
    persistTotal(next);
  };

  const handleCloseReset = () => {
    // Re-read total in case it was reset
    setTotalAmountState(getTotalAmount());
    setShowReset(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Reset Dialog */}
      {showReset && <ResetDialog onClose={handleCloseReset} />}

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
            <div className="hidden sm:flex items-center gap-3">
              {/* Reset icon button */}
              <button
                onClick={() => setShowReset(true)}
                title="Reset total amount"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <RotateCcw size={14} />
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Activity size={12} className="text-green-400 animate-pulse" />
                <span>Real-time</span>
              </div>
            </div>
            {/* Mobile: show both */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setShowReset(true)}
                title="Reset total amount"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <RotateCcw size={14} />
              </button>
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
          <LiveTicker totalAmount={hydrated ? totalAmount : 0} />
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
        {/* Registration block */}
        <RegistrationBlock onSubmit={handleSubmit} />

        {/* Share row */}
        <ShareRow />

        {/* Contribution Graph */}
        <ContributionGraph entries={history} />

        {/* Estimation History */}
        <EstimationHistory entries={history} />
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
