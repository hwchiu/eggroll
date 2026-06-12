// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Briefcase, Settings, Layers } from "lucide-react";

const NAV_ITEMS = [
  { href: "/api-crawler", icon: Code2,    label: "API Crawler" },
  { href: "/jobs",        icon: Briefcase, label: "My Jobs"     },
  { href: "/settings",    icon: Settings,  label: "Settings"    },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Layers size={22} color="var(--accent)" />
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          tMIC Workspace
        </span>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                color: active ? "var(--accent-hover)" : "var(--text-muted)",
                background: active ? "var(--bg-elevated)" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Phase 1 — MVP</span>
      </div>
    </aside>
  );
}
