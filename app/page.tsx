"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CalendarClock, CheckCircle2, Filter, Search } from "lucide-react";
import {
  monitoringRecords,
  type CompanyMonitoringRecord,
  type OverallReadiness,
  type ReportStatus,
} from "@/data/monitoring";

const READINESS_LABEL: Record<OverallReadiness, string> = {
  fully_ready: "Fully Ready",
  partial_ready: "Partial Ready",
  not_ready: "Not Ready",
};

const REPORT_LABEL: Record<ReportStatus, string> = {
  fully_reported: "Fully Reported",
  partial_ready: "Partial",
  not_published: "Not Published",
};

const READINESS_COLOR: Record<OverallReadiness, string> = {
  fully_ready: "#10b981",
  partial_ready: "#f59e0b",
  not_ready: "#ef4444",
};

function formatDateTime(input: string | null): string {
  if (!input) return "Not announced";
  const dt = new Date(input);
  if (Number.isNaN(dt.getTime())) return "Unknown";
  return dt.toLocaleString("en-US", { hour12: false });
}

function toPct(value: number, total: number): string {
  if (total === 0) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function weeklyBuckets(records: CompanyMonitoringRecord[]) {
  const map = new Map<string, { total: number; full: number; partial: number; notReady: number }>();
  for (const row of records) {
    const date = row.earningsEventDatetime ? new Date(row.earningsEventDatetime) : null;
    const key = date
      ? `W${Math.ceil((date.getUTCDate() + (date.getUTCMonth() === 7 ? 31 : 0) - 9) / 7)}`
      : "W0";
    if (!map.has(key)) {
      map.set(key, { total: 0, full: 0, partial: 0, notReady: 0 });
    }
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (row.readiness === "fully_ready") bucket.full += 1;
    if (row.readiness === "partial_ready") bucket.partial += 1;
    if (row.readiness === "not_ready") bucket.notReady += 1;
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, values]) => ({ week, ...values }));
}

function statusDot(status: ReportStatus) {
  if (status === "fully_reported") return "#10b981";
  if (status === "partial_ready") return "#f59e0b";
  return "#ef4444";
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [readiness, setReadiness] = useState<"all" | OverallReadiness>("all");

  const sectors = useMemo(
    () => ["all", ...Array.from(new Set(monitoringRecords.map((item) => item.sector))).sort()],
    []
  );

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return monitoringRecords.filter((row) => {
      if (sector !== "all" && row.sector !== sector) return false;
      if (readiness !== "all" && row.readiness !== readiness) return false;
      if (!lowered) return true;
      return (
        row.companyName.toLowerCase().includes(lowered) ||
        row.ticker.toLowerCase().includes(lowered) ||
        row.region.toLowerCase().includes(lowered)
      );
    });
  }, [query, sector, readiness]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const full = filtered.filter((row) => row.readiness === "fully_ready").length;
    const partial = filtered.filter((row) => row.readiness === "partial_ready").length;
    const notReady = filtered.filter((row) => row.readiness === "not_ready").length;
    const earningsPublished = filtered.filter((row) => row.earningsPublished).length;
    const segmentMissing = filtered.filter(
      (row) => row.segmentReportStatus === "not_published"
    ).length;
    return { total, full, partial, notReady, earningsPublished, segmentMissing };
  }, [filtered]);

  const topRisks = useMemo(
    () => filtered.filter((row) => row.readiness !== "fully_ready").slice(0, 12),
    [filtered]
  );

  const buckets = useMemo(() => weeklyBuckets(filtered), [filtered]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 10%, rgba(37,99,235,0.25), transparent 40%), radial-gradient(circle at 90% 0%, rgba(180,83,9,0.2), transparent 38%), #020617",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 20px 40px" }}>
        <header
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            background: "rgba(15,23,42,0.75)",
            borderRadius: 18,
            padding: "20px 22px",
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 12, color: "#93c5fd", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Eggroll · Financial / Marketing Intelligence
          </div>
          <h1 style={{ margin: "8px 0 6px", fontSize: 30, color: "#f8fafc" }}>
            2026 Q2 Earnings & Segment Report Monitoring
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
            Flattened sourcing pipeline with sesame-style anomaly highlighting for data sourcing owners.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.7)",
              borderRadius: 14,
              padding: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Search size={15} color="#93c5fd" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company / ticker / region"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                fontSize: 14,
              }}
            />
          </div>
          <label
            style={{
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.7)",
              borderRadius: 14,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Filter size={15} color="#93c5fd" />
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                height: 40,
              }}
            >
              {sectors.map((item) => (
                <option key={item} value={item} style={{ color: "#020617" }}>
                  {item === "all" ? "All sectors" : item}
                </option>
              ))}
            </select>
          </label>
          <label
            style={{
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.7)",
              borderRadius: 14,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BarChart3 size={15} color="#93c5fd" />
            <select
              value={readiness}
              onChange={(e) => setReadiness(e.target.value as "all" | OverallReadiness)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e2e8f0",
                height: 40,
              }}
            >
              <option value="all" style={{ color: "#020617" }}>
                All readiness
              </option>
              <option value="fully_ready" style={{ color: "#020617" }}>
                Fully Ready
              </option>
              <option value="partial_ready" style={{ color: "#020617" }}>
                Partial Ready
              </option>
              <option value="not_ready" style={{ color: "#020617" }}>
                Not Ready
              </option>
            </select>
          </label>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          {[
            {
              label: "Companies in scope",
              value: stats.total,
              helper: `${toPct(stats.total, monitoringRecords.length)} of ${monitoringRecords.length}`,
              icon: CalendarClock,
              color: "#38bdf8",
            },
            {
              label: "Earnings announced",
              value: stats.earningsPublished,
              helper: toPct(stats.earningsPublished, stats.total),
              icon: CheckCircle2,
              color: "#34d399",
            },
            {
              label: "Fully ready",
              value: stats.full,
              helper: toPct(stats.full, stats.total),
              icon: CheckCircle2,
              color: "#22c55e",
            },
            {
              label: "Partial ready",
              value: stats.partial,
              helper: toPct(stats.partial, stats.total),
              icon: BarChart3,
              color: "#f59e0b",
            },
            {
              label: "Critical gaps",
              value: stats.notReady,
              helper: `${stats.segmentMissing} segment missing`,
              icon: AlertTriangle,
              color: "#ef4444",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                border: "1px solid rgba(148,163,184,0.2)",
                background: "rgba(15,23,42,0.72)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{card.label}</div>
                <card.icon size={14} color={card.color} />
              </div>
              <div style={{ marginTop: 7, fontSize: 28, fontWeight: 800, color: "#f8fafc" }}>{card.value}</div>
              <div style={{ fontSize: 12, color: card.color }}>{card.helper}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(148,163,184,0.2)",
              background: "rgba(15,23,42,0.72)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 10 }}>Readiness by earnings week</div>
            <div style={{ display: "grid", gap: 8 }}>
              {buckets.map((bucket) => {
                const scale = Math.max(bucket.total, 1);
                const fullWidth = (bucket.full / scale) * 100;
                const partialWidth = (bucket.partial / scale) * 100;
                const notWidth = (bucket.notReady / scale) * 100;
                return (
                  <div key={bucket.week} style={{ display: "grid", gridTemplateColumns: "58px 1fr 60px", gap: 10 }}>
                    <div style={{ fontSize: 12, color: "#cbd5e1" }}>{bucket.week}</div>
                    <div
                      style={{
                        height: 14,
                        background: "rgba(51,65,85,0.45)",
                        borderRadius: 99,
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      <div style={{ width: `${fullWidth}%`, background: READINESS_COLOR.fully_ready }} />
                      <div style={{ width: `${partialWidth}%`, background: READINESS_COLOR.partial_ready }} />
                      <div style={{ width: `${notWidth}%`, background: READINESS_COLOR.not_ready }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "#94a3b8" }}>{bucket.total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(248,113,113,0.4)",
              background: "rgba(127,29,29,0.15)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, color: "#fca5a5", marginBottom: 10 }}>
              Sesame alerts · top unresolved companies
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {topRisks.length === 0 ? (
                <div style={{ color: "#86efac", fontSize: 13 }}>No unresolved items.</div>
              ) : (
                topRisks.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      border: "1px solid rgba(248,113,113,0.35)",
                      borderRadius: 10,
                      padding: "7px 8px",
                      background: "rgba(15,23,42,0.6)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>{row.companyName}</div>
                      <div style={{ fontSize: 11, color: "#fca5a5" }}>{row.ticker}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#fecaca", marginTop: 4 }}>{row.issueTags.join(" · ")}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section
          style={{
            border: "1px solid rgba(148,163,184,0.2)",
            background: "rgba(15,23,42,0.72)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 14px", fontSize: 12, color: "#93c5fd", borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
            Monitoring table ({filtered.length} rows)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
              <thead>
                <tr style={{ background: "rgba(30,41,59,0.65)", textAlign: "left" }}>
                  {[
                    "Company",
                    "Ticker",
                    "Sector",
                    "Region",
                    "2026 Q2 earnings event",
                    "Financial report",
                    "Segment report",
                    "Overall",
                    "Issue highlights",
                  ].map((head) => (
                    <th key={head} style={{ padding: "10px 12px", fontSize: 12, color: "#cbd5e1", whiteSpace: "nowrap" }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderTop: "1px solid rgba(148,163,184,0.12)",
                      background:
                        row.readiness === "not_ready"
                          ? "rgba(127,29,29,0.18)"
                          : row.readiness === "partial_ready"
                            ? "rgba(120,53,15,0.12)"
                            : "transparent",
                    }}
                  >
                    <td style={{ padding: "9px 12px", fontSize: 13, color: "#f8fafc", fontWeight: 600 }}>
                      {row.companyName}
                    </td>
                    <td style={{ padding: "9px 12px", fontFamily: "monospace", color: "#93c5fd", fontSize: 12 }}>{row.ticker}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "#cbd5e1" }}>{row.sector}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "#cbd5e1" }}>{row.region}</td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: row.earningsPublished ? "#86efac" : "#fca5a5" }}>
                      {formatDateTime(row.earningsEventDatetime)}
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "#cbd5e1" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: statusDot(row.financialReportStatus),
                          }}
                        />
                        {REPORT_LABEL[row.financialReportStatus]}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "#cbd5e1" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{ width: 8, height: 8, borderRadius: 999, background: statusDot(row.segmentReportStatus) }}
                        />
                        {REPORT_LABEL[row.segmentReportStatus]}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 12 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: `${READINESS_COLOR[row.readiness]}22`,
                          color: READINESS_COLOR[row.readiness],
                        }}
                      >
                        {READINESS_LABEL[row.readiness]}
                      </span>
                    </td>
                    <td style={{ padding: "9px 12px", fontSize: 12, color: "#fca5a5", minWidth: 260 }}>
                      {row.issueTags.length === 0 ? (
                        <span style={{ color: "#86efac" }}>No issue</span>
                      ) : (
                        row.issueTags.join(" · ")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
