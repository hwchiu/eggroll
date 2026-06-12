// components/api-crawler/EndpointBar.tsx
"use client";

import type { HttpMethod } from "@/lib/types";
import { Send } from "lucide-react";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "#22c55e",
  POST:   "#f59e0b",
  PUT:    "#3b82f6",
  PATCH:  "#a855f7",
  DELETE: "#ef4444",
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface EndpointBarProps {
  method: HttpMethod;
  url: string;
  loading: boolean;
  onMethodChange: (m: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function EndpointBar({ method, url, loading, onMethodChange, onUrlChange, onSend }: EndpointBarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: METHOD_COLORS[method],
          fontWeight: 700,
          fontSize: 13,
          padding: "0 10px",
          cursor: "pointer",
          minWidth: 90,
        }}
      >
        {METHODS.map((m) => (
          <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
            {m}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="https://api.example.com/endpoint"
        style={{
          flex: 1,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: "var(--text-primary)",
          fontSize: 13,
          padding: "0 12px",
          fontFamily: "monospace",
          outline: "none",
        }}
      />

      <button
        onClick={onSend}
        disabled={loading || !url.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 18px",
          background: loading || !url.trim() ? "var(--border)" : "var(--accent)",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          cursor: loading || !url.trim() ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        <Send size={14} />
        {loading ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
