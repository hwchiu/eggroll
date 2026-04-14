"use client";
import { useState, useRef } from "react";
import {
  Plus,
  Minus,
  Paperclip,
  Play,
  X,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  Wand2,
} from "lucide-react";
import AIBreakdown from "./AIBreakdown";
import ModelVersionPanel from "./ModelVersionPanel";
import type { HistoryEntry } from "@/lib/storage";

const AI_TOTAL_ESTIMATE = 87500; // from SAMPLE_ANALYSIS
const MODEL_VERSION = "gpt-4o-2024-11-20";

function formatWithCommas(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("en-US");
}

function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/,/g, ""), 10) || 0;
}

export default function RegistrationBlock({
  onSubmit,
}: {
  onSubmit?: (entry: Omit<HistoryEntry, "id">) => void;
}) {
  const [isAdd, setIsAdd] = useState(true);
  const [text, setText] = useState("提供一個 Common KM generator AI Agent with AI Chatbot feature");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "analyzing" | "done">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [taskIsAdd, setTaskIsAdd] = useState(true);
  const [amountInput, setAmountInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStartTask = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult("analyzing");
    setSubmitted(false);
    setTaskIsAdd(isAdd);
    await new Promise((r) => setTimeout(r, 2200));
    setLoading(false);
    setResult("done");
  };

  const handleFillAIAmount = () => {
    setAmountInput(formatWithCommas(String(AI_TOTAL_ESTIMATE)));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(formatWithCommas(e.target.value));
  };

  const handleSubmit = () => {
    const amount = parseAmount(amountInput);
    if (onSubmit) {
      onSubmit({
        name: text.slice(0, 60) || "Unnamed Service",
        description: text,
        type: taskIsAdd ? "add" : "deduct",
        amount,
        date: new Date().toISOString().split("T")[0],
        status: "Active",
        model: MODEL_VERSION,
        category: "AI/ML",
      });
    }
    setSubmitted(true);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Register New Payment Item</span>
        </div>
        {/* Toggle: Add / Deduct */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-700 p-0.5">
          <button
            onClick={() => setIsAdd(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              isAdd ? "bg-green-500 text-white shadow" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Plus size={12} /> Add
          </button>
          <button
            onClick={() => setIsAdd(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              !isAdd ? "bg-red-500 text-white shadow" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Minus size={12} /> Deduct
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="p-4">
        <div
          className="rounded-lg border overflow-hidden transition-all focus-within:border-blue-500/50"
          style={{ background: "#111827", borderColor: "#1f2937" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the service or item to register… (e.g. 'AI-powered customer support chatbot with RAG')"
            rows={4}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none outline-none"
          />

          {/* File chips */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-700 text-xs text-gray-300"
                >
                  <FileText size={10} />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="hover:text-red-400">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all"
              >
                <Paperclip size={13} />
                Attach file
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              onClick={handleStartTask}
              disabled={loading || !text.trim()}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                loading || !text.trim()
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-500/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Play size={13} /> Start Task
                </>
              )}
            </button>
          </div>
        </div>

        {/* Amount input row — shown when analysis is done */}
        {result === "done" && (
          <div className="mt-3 flex items-center gap-2 fade-in">
            <label className="text-xs text-gray-400 font-medium whitespace-nowrap">Amount (USD)</label>
            <div
              className="flex flex-1 items-center rounded-lg border overflow-hidden transition-all focus-within:border-blue-500/50"
              style={{ background: "#111827", borderColor: "#1f2937" }}
            >
              <span className="pl-3 text-gray-500 text-sm font-mono">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={handleAmountChange}
                placeholder="0"
                className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none font-mono"
              />
              <button
                onClick={handleFillAIAmount}
                title="Fill with AI estimated total"
                className="flex items-center gap-1 px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all border-l border-gray-700"
              >
                <Wand2 size={13} />
                <span className="hidden sm:inline">AI Estimate</span>
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitted || !amountInput}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                submitted || !amountInput
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500 text-white shadow shadow-green-500/20"
              }`}
            >
              <CheckCircle2 size={14} />
              {submitted ? "Submitted" : "Submit"}
            </button>
          </div>
        )}

        {/* Type indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isAdd ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-xs text-gray-500">
            This item will{" "}
            <span className={isAdd ? "text-green-400" : "text-red-400"}>
              {isAdd ? "add to" : "deduct from"}
            </span>{" "}
            the total cost
          </span>
        </div>
      </div>

      {/* Analyzing state */}
      {result === "analyzing" && (
        <div className="mx-4 mb-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 fade-in">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-blue-400" />
            <div>
              <div className="text-sm text-blue-300 font-semibold">AI is analyzing your request…</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Breaking down the scope, estimating costs, and assigning confidence levels
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Parsing description",
              "Identifying components",
              "Estimating costs",
              "Assigning confidence",
              "Gathering references",
            ].map((step, i) => (
              <span
                key={step}
                className="text-xs px-2 py-0.5 rounded border border-blue-500/20 text-blue-300 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result === "done" && (
        <div className="px-4 pb-4 space-y-3 fade-in">
          <div className="h-px bg-gray-800" />
          <ModelVersionPanel />
          <AIBreakdown modelVersion={MODEL_VERSION} />
        </div>
      )}
    </div>
  );
}
