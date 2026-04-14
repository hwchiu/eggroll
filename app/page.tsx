"use client";
import { useState } from "react";
import LiveTicker from "@/components/LiveTicker";
import RegistrationBlock from "@/components/RegistrationBlock";
import ShareRow from "@/components/ShareRow";
import EstimationHistory from "@/components/EstimationHistory";
import ContributionGraph from "@/components/ContributionGraph";
import { Activity, DollarSign, Zap, BarChart2, KeyRound, X, CheckCircle2, AlertCircle } from "lucide-react";

const RESET_PASSWORD = "長官是最棒的";

export default function Home() {
  const [extraCost, setExtraCost] = useState(0);

  // Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<"input" | "success">("input");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const openResetModal = () => {
    setResetStep("input");
    setPasswordInput("");
    setPasswordError(false);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setPasswordInput("");
    setPasswordError(false);
    setResetStep("input");
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === RESET_PASSWORD) {
      setPasswordError(false);
      setResetStep("success");
    } else {
      setPasswordError(true);
    }
  };

  const handleResetConfirm = () => {
    setExtraCost(0);
    closeResetModal();
  };

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
            <button
              onClick={openResetModal}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
              title="Reset total"
            >
              <KeyRound size={14} />
              Reset
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

      {/* Reset Modal */}
      {showResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onKeyDown={(e) => e.key === "Escape" && closeResetModal()}
        >
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl border p-6 shadow-2xl"
            style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
          >
            {/* Close button */}
            <button
              onClick={closeResetModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <KeyRound size={18} className="text-orange-400" />
              </div>
              <div>
                <div id="reset-modal-title" className="text-sm font-semibold text-white">Reset Total</div>
                <div className="text-xs text-gray-500 mt-0.5">Enter the secret password to proceed</div>
              </div>
            </div>

            {resetStep === "input" && (
              <>
                <label className="block text-xs text-gray-400 mb-2">通關密碼</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="請輸入通關密碼…"
                  className="w-full rounded-lg border px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-blue-500/60 transition-colors"
                  style={{ background: "#111827", borderColor: passwordError ? "#ef4444" : "#1f2937" }}
                  autoFocus
                />
                {passwordError && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                    <AlertCircle size={12} />
                    密碼錯誤，請再試一次
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={closeResetModal}
                    className="px-4 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!passwordInput}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !passwordInput
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    確認
                  </button>
                </div>
              </>
            )}

            {resetStep === "success" && (
              <>
                <div className="flex flex-col items-center gap-3 py-2">
                  <CheckCircle2 size={40} className="text-green-400" />
                  <div className="text-lg font-bold text-green-400">通關成功</div>
                  <div className="text-xs text-gray-500 text-center">確定要將總金額歸零嗎？</div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button
                    onClick={closeResetModal}
                    className="px-4 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all"
                  >
                    確定歸零
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
