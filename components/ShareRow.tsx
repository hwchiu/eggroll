"use client";
import { useState } from "react";
import { Share2, Copy, Check, Link } from "lucide-react";

export default function ShareRow() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-3 px-5 py-3 rounded-xl border"
      style={{ background: "#111827", borderColor: "#1f2937" }}
    >
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Share2 size={14} className="text-gray-500" />
        <span>Share this tracker</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=Check+out+this+AI+Payment+Tracker!&url=${encodeURIComponent("https://payment-tracker.dev")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          𝕏 Tweet
        </a>
        <a
          href="#"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          <Link size={12} />
          Embed
        </a>
      </div>
    </div>
  );
}
