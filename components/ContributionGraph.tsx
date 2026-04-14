"use client";
import { useState, useMemo } from "react";
import type { HistoryEntry } from "@/lib/types";

type CellData = { date: string; count: number; amount: number };

function buildCells(history: HistoryEntry[]): CellData[] {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 1);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  // Build a map: date → {count, amount}
  const eventMap = new Map<string, { count: number; amount: number }>();
  for (const entry of history) {
    const existing = eventMap.get(entry.date);
    if (existing) {
      existing.count += 1;
      existing.amount += entry.amount;
    } else {
      eventMap.set(entry.date, { count: 1, amount: entry.amount });
    }
  }

  const cells: CellData[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const iso = cursor.toISOString().split("T")[0];
    const ev = eventMap.get(iso);
    cells.push({ date: iso, count: ev?.count ?? 0, amount: ev?.amount ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

function getColor(count: number, amount: number): string {
  if (count === 0) return "#161b22";
  if (amount >= 80000) return "#3b82f6";
  if (amount >= 50000) return "#2563eb";
  if (amount >= 30000) return "#1d4ed8";
  return "#1e40af";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  history: HistoryEntry[];
}

export default function ContributionGraph({ history }: Props) {
  // Lazy initializer: true only on the client, avoiding useEffect setState
  const [isClient] = useState(() => typeof window !== "undefined");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; cell: CellData } | null>(null);

  const cells = useMemo(() => (isClient ? buildCells(history) : []), [isClient, history]);

  if (!isClient || cells.length === 0) return null;

  // Group by week columns
  const weeks: CellData[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ week: wi, label: MONTHS[month] });
      lastMonth = month;
    }
  });

  const totalPayments = cells.filter((c) => c.count > 0).length;
  const totalAmount = cells.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold text-white">Payment in the last year</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {totalPayments} payments • ${totalAmount.toLocaleString()} total
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            {["#161b22", "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm contribution-cell" style={{ background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin pb-1">
          <div className="relative" style={{ minWidth: `${weeks.length * 14}px` }}>
            {/* Month labels */}
            <div className="flex mb-1 ml-7">
              {weeks.map((_, wi) => {
                const ml = monthLabels.find((m) => m.week === wi);
                return (
                  <div key={wi} style={{ width: 13, marginRight: 1 }}>
                    {ml && (
                      <span className="text-[9px] text-gray-500 whitespace-nowrap">{ml.label}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day labels + grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col mr-1 gap-px">
                {DAYS.map((d, di) => (
                  <div
                    key={d}
                    className="text-[9px] text-gray-600 flex items-center"
                    style={{ height: 12, visibility: di % 2 === 0 ? "visible" : "hidden" }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-px">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-px">
                    {week.map((cell) => (
                      <div
                        key={cell.date}
                        className="contribution-cell cursor-pointer"
                        style={{
                          width: 12,
                          height: 12,
                          background: getColor(cell.count, cell.amount),
                          borderRadius: 2,
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ x: rect.left, y: rect.top, cell });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.cell.count > 0 && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg border text-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y - 56,
            background: "#1f2937",
            borderColor: "#374151",
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-white font-medium">{tooltip.cell.date}</div>
          <div className="text-blue-400">${tooltip.cell.amount.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
