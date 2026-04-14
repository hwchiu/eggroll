"use client";
import { useState, useEffect, useMemo } from "react";
import LiveTicker from "@/components/LiveTicker";
import RegistrationBlock from "@/components/RegistrationBlock";
import ShareRow from "@/components/ShareRow";
import EstimationHistory from "@/components/EstimationHistory";
import ContributionGraph from "@/components/ContributionGraph";
import { Activity, DollarSign, Zap, BarChart2, RotateCcw, X } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";

const STORAGE_TOTAL_KEY = "payment_tracker_total";
const STORAGE_HISTORY_KEY = "payment_tracker_history";
const RESET_PASSWORD = "長官是最棒的";

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [total, setTotal] = useState<number>(() =>
    readLocalStorage<number>(STORAGE_TOTAL_KEY, 0)
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readLocalStorage<HistoryEntry[]>(STORAGE_HISTORY_KEY, [])
  );

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStep, setPasswordStep] = useState<"input" | "success">("input");
  const [passwordError, setPasswordError] = useState(false);

  // Persist total to localStorage (effects only run on client)
  useEffect(() => {
    localStorage.setItem(STORAGE_TOTAL_KEY, JSON.stringify(total));
  }, [total]);

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleSubmit = (
    amount: number,
    isAdd: boolean,
    entryData: Omit<HistoryEntry, "id" | "date">
  ) => {
    const delta = isAdd ? amount : -amount;
    setTotal((prev) => prev + delta);
    const newEntry: HistoryEntry = {
      ...entryData,
      id: `h${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const handlePasswordSubmit = () => {
    if (password === RESET_PASSWORD) {
      setPasswordStep("success");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleResetConfirm = () => {
    setTotal(0);
    closeResetModal();
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setPassword("");
    setPasswordStep("input");
    setPasswordError(false);
  };

  // Quick stats derived from history
  const activeCount = useMemo(
    () => history.filter((h) => h.status === "Active").length,
    [history]
  );
  const projectCount = history.length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
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
            {/* Reset button */}
            <button
              onClick={() => setShowResetModal(true)}
              title="Reset total amount"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <RotateCcw size={14} />
            </button>
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
      <div className="relative border-b overflow-hidden" style={{ borderColor: "#1a1a1a" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(239,68,68,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.4) 50%, transparent 100%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-4">
          <LiveTicker total={total} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Active Services",
              value: String(activeCount),
              icon: <Zap size={14} />,
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              label: "Total Projects",
              value: String(projectCount),
              icon: <BarChart2 size={14} />,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Avg Confidence",
              value: "82%",
              icon: <Activity size={14} />,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
            {
              label: "Net Estimate",
              value: `${total < 0 ? "-" : "+"}$${Math.abs(total).toLocaleString()}`,
              icon: <DollarSign size={14} />,
              color: total < 0 ? "text-green-400" : "text-red-400",
              bg: total < 0 ? "bg-green-500/10" : "bg-red-500/10",
            },
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
        <RegistrationBlock onSubmit={handleSubmit} />
        <ShareRow />
        <ContributionGraph history={history} />
        <EstimationHistory history={history} />
      </div>

      {/* Footer */}
      <div className="border-t py-6 text-center" style={{ borderColor: "#1a1a1a" }}>
        <div className="text-xs text-gray-600">
          Payment Tracker — Live AI cost monitoring •{" "}
          <span className="text-gray-500">Powered by Next.js</span>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="rounded-2xl border p-6 w-full max-w-sm mx-4 shadow-2xl"
            style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-red-400" />
                <span className="font-semibold text-white">Reset Total Amount</span>
              </div>
              <button
                onClick={closeResetModal}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {passwordStep === "input" && (
              <>
                <p className="text-sm text-gray-400 mb-4">請輸入通關密碼以繼續重置操作。</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="通關密碼"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-600 border outline-none mb-1 transition-colors"
                  style={{
                    background: "#111827",
                    borderColor: passwordError ? "#ef4444" : "#1f2937",
                  }}
                />
                {passwordError && (
                  <p className="text-xs text-red-400 mb-3">密碼錯誤，請重試。</p>
                )}
                {!passwordError && <div className="mb-3" />}
                <button
                  onClick={handlePasswordSubmit}
                  className="w-full py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  確認
                </button>
              </>
            )}

            {passwordStep === "success" && (
              <div className="text-center py-2">
                <div className="text-3xl mb-3">🎉</div>
                <div className="text-green-400 font-bold text-xl mb-1">通關成功</div>
                <p className="text-sm text-gray-400 mb-6">確定要將總金額歸零嗎？此操作無法復原。</p>
                <div className="flex gap-3">
                  <button
                    onClick={closeResetModal}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
                  >
                    確定歸零
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
