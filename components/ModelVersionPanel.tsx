"use client";
import { useState } from "react";
import { ChevronDown, GitBranch, Cpu, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ModelVersion {
  id: string;
  name: string;
  date: string;
  totalEstimate: number;
  avgConfidence: number;
  notes: string;
}

const MODEL_HISTORY: ModelVersion[] = [
  {
    id: "v3",
    name: "gpt-4o-2024-11-20",
    date: "2026-04-14",
    totalEstimate: 87500,
    avgConfidence: 82,
    notes: "Latest model. Improved cost breakdown granularity. Added security compliance scope.",
  },
  {
    id: "v2",
    name: "gpt-4-turbo-2024-04-09",
    date: "2026-03-22",
    totalEstimate: 79200,
    avgConfidence: 78,
    notes: "Added data pipeline estimation. Revised infrastructure costs upward by 15%.",
  },
  {
    id: "v1",
    name: "gpt-4-0125-preview",
    date: "2026-02-10",
    totalEstimate: 65000,
    avgConfidence: 72,
    notes: "Initial baseline estimate. Missing security and compliance scope.",
  },
];

function DeltaBadge({ current, previous }: { current: number; previous?: number }) {
  if (!previous) return null;
  const delta = current - previous;
  const pct = ((delta / previous) * 100).toFixed(1);
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-red-400 ml-2">
        <TrendingUp size={10} /> +{pct}%
      </span>
    );
  } else if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-green-400 ml-2">
        <TrendingDown size={10} /> {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 ml-2">
      <Minus size={10} /> 0%
    </span>
  );
}

export default function ModelVersionPanel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(MODEL_HISTORY[0].id);

  const current = MODEL_HISTORY.find((m) => m.id === selected)!;
  const currentIndex = MODEL_HISTORY.findIndex((m) => m.id === selected);
  const previous = MODEL_HISTORY[currentIndex + 1];

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-purple-500/10">
            <Cpu size={16} className="text-purple-400" />
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Estimation Model</div>
            <div className="text-sm font-mono text-purple-300 font-semibold">{current.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{MODEL_HISTORY.length} versions</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-4 fade-in">
          <div className="space-y-2">
            {MODEL_HISTORY.map((model, idx) => (
              <button
                key={model.id}
                onClick={() => setSelected(model.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected === model.id
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <GitBranch size={12} className="text-purple-400" />
                      <span className="font-mono text-sm text-white font-semibold">{model.name}</span>
                      {idx === 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{model.date}</div>
                    <div className="text-xs text-gray-400 mt-1.5">{model.notes}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-mono text-sm font-bold text-green-400">
                      ${model.totalEstimate.toLocaleString()}
                      {idx > 0 && (
                        <DeltaBadge
                          current={MODEL_HISTORY[idx - 1].totalEstimate}
                          previous={model.totalEstimate}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Confidence: {model.avgConfidence}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {previous && (
            <div className="mt-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Comparison vs Previous Version
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Estimate Δ</div>
                  <div className={`font-mono text-sm font-bold ${current.totalEstimate > previous.totalEstimate ? "text-red-400" : "text-green-400"}`}>
                    {current.totalEstimate > previous.totalEstimate ? "+" : ""}
                    ${(current.totalEstimate - previous.totalEstimate).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Confidence Δ</div>
                  <div className={`font-mono text-sm font-bold ${current.avgConfidence > previous.avgConfidence ? "text-green-400" : "text-red-400"}`}>
                    {current.avgConfidence > previous.avgConfidence ? "+" : ""}
                    {current.avgConfidence - previous.avgConfidence}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
