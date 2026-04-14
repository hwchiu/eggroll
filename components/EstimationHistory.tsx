"use client";
import { useState } from "react";
import { Clock, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

interface HistoryEntry {
  id: string;
  name: string;
  description: string;
  type: "add" | "deduct";
  amount: number;
  date: string;
  status: "Active" | "Completed" | "Pending";
  model: string;
  category: string;
}

const HISTORY: HistoryEntry[] = [
  {
    id: "h1",
    name: "GPT-4o Enterprise API Integration",
    description: "Full-stack integration of OpenAI GPT-4o for enterprise knowledge base with RAG pipeline, custom embeddings, and multi-tenant isolation.",
    type: "add",
    amount: 87500,
    date: "2026-04-14",
    status: "Active",
    model: "gpt-4o-2024-11-20",
    category: "AI/ML",
  },
  {
    id: "h2",
    name: "Autonomous AI Code Review Agent",
    description: "AI-powered code review system with GitHub integration, security scanning, style enforcement, and automated PR feedback generation.",
    type: "add",
    amount: 54200,
    date: "2026-03-28",
    status: "Active",
    model: "gpt-4-turbo-2024-04-09",
    category: "DevOps/AI",
  },
  {
    id: "h3",
    name: "AI-Powered Customer Support Platform",
    description: "Multi-channel customer support with LLM-based intent detection, ticket routing, automated response generation, and escalation logic.",
    type: "add",
    amount: 62800,
    date: "2026-03-15",
    status: "Completed",
    model: "claude-3-5-sonnet-20241022",
    category: "AI/ML",
  },
  {
    id: "h4",
    name: "Predictive Analytics Dashboard",
    description: "Business intelligence platform with ML forecasting, anomaly detection, real-time data pipelines, and interactive visualization.",
    type: "add",
    amount: 41000,
    date: "2026-02-20",
    status: "Completed",
    model: "gpt-4-0125-preview",
    category: "Data/ML",
  },
  {
    id: "h5",
    name: "Vendor Contract Optimization Discount",
    description: "Annual subscription discount applied for cloud services and API usage optimization through vendor negotiation.",
    type: "deduct",
    amount: 15000,
    date: "2026-02-01",
    status: "Completed",
    model: "gpt-4o-2024-11-20",
    category: "Finance",
  },
  {
    id: "h6",
    name: "AI Document Processing Pipeline",
    description: "Automated document ingestion, OCR, classification, extraction, and indexing pipeline for legal and financial documents.",
    type: "add",
    amount: 33500,
    date: "2026-01-18",
    status: "Completed",
    model: "gpt-4-turbo-2024-04-09",
    category: "AI/ML",
  },
];

function StatusBadge({ status }: { status: HistoryEntry["status"] }) {
  const styles = {
    Active: "text-green-400 bg-green-500/10 border-green-500/20",
    Completed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    Pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function EstimationHistory() {
  const [filter, setFilter] = useState<"all" | "add" | "deduct">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = HISTORY.filter((h) => filter === "all" || h.type === filter);
  const total = HISTORY.reduce((sum, h) => sum + (h.type === "add" ? h.amount : -h.amount), 0);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              <span className="font-semibold text-white">Estimation History</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">IT AI service project records</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Net Total</div>
            <div className={`font-mono font-bold text-lg ${total >= 0 ? "text-red-400" : "text-green-400"}`}>
              {total >= 0 ? "+" : ""}${Math.abs(total).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-2">
          {(["all", "add", "deduct"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-600"
              }`}
            >
              {f === "all" ? "All" : f === "add" ? "Additions" : "Deductions"}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-600">{filtered.length} records</span>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-800/50">
        {filtered.map((entry) => (
          <div key={entry.id}>
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  entry.type === "add"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                {entry.type === "add" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white truncate">{entry.name}</span>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">{entry.date}</span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500 font-mono">{entry.model}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{entry.category}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div
                  className={`font-mono font-bold text-sm ${
                    entry.type === "add" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {entry.type === "add" ? "+" : "-"}${entry.amount.toLocaleString()}
                </div>
                <ChevronRight
                  size={14}
                  className={`text-gray-600 transition-transform ${expanded === entry.id ? "rotate-90" : ""}`}
                />
              </div>
            </button>
            {expanded === entry.id && (
              <div className="px-4 pb-3 bg-gray-900/30 fade-in">
                <p className="text-xs text-gray-400 leading-relaxed pl-11">{entry.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
