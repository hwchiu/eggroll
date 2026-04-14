"use client";
import { useState, useEffect } from "react";

type CellData = { date: string; count: number; amount: number };

function generateContribData(): CellData[] {
  const cells: CellData[] = [];
  const now = new Date("2026-04-14");
  const start = new Date(now);
  start.setFullYear(now.getFullYear() - 1);
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const events = [
    { date: "2025-06-12", amount: 54200 },
    { date: "2025-08-05", amount: 33500 },
    { date: "2025-09-22", amount: 41000 },
    { date: "2025-11-14", amount: 62800 },
    { date: "2025-12-03", amount: 15000 },
    { date: "2026-01-08", amount: 41000 },
    { date: "2026-01-18", amount: 33500 },
    { date: "2026-02-01", amount: 15000 },
    { date: "2026-02-20", amount: 41000 },
    { date: "2026-03-15", amount: 62800 },
    { date: "2026-03-22", amount: 54200 },
    { date: "2026-03-28", amount: 54200 },
    { date: "2026-04-02", amount: 15000 },
    { date: "2026-04-07", amount: 87500 },
    { date: "2026-04-14", amount: 87500 },
  ];

  const eventMap = new Map(events.map((e) => [e.date, e]));

  let cursor = new Date(start);
  while (cursor <= now) {
    const iso = cursor.toISOString().split("T")[0];
    const ev = eventMap.get(iso);
    cells.push({
      date: iso,
      count: ev ? 1 : 0,
      amount: ev ? ev.amount : 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

function getColor(count: number, amount: number): string {
  if (count === 0) return "#161b22";
  if (amount >= 80000) return "#3b82f6"; // bright blue
  if (amount >= 50000) return "#2563eb";
  if (amount >= 30000) return "#1d4ed8";
  return "#1e40af";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function ContributionGraph() {
  const [cells, setCells] = useState<CellData[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    setCells(generateContribData());
  }, []);

  if (cells.length === 0) return null;

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
                    {week.map((cell, di) => (
                      <div
                        key={cell.date}
                        className="contribution-cell cursor-pointer"
                        style={{
                          width: 12,
                          height: 12,
                          background: getColor(cell.count, cell.amount),
                          borderRadius: 2,
                        }}
                        onClick={() => setShowComingSoon(true)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowComingSoon(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowComingSoon(false)}
        >
          <div
            className="rounded-2xl border px-10 py-8 text-center shadow-2xl"
            style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="coming-soon-title" className="text-2xl font-bold text-white mb-2">🚀 Coming Soon</div>
            <div className="text-sm text-gray-400 mb-5">This feature is under development.</div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
