// components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, Briefcase, Settings, Layers, Sun, Moon } from "lucide-react";

const BASE = "/eggroll";

const NAV_ITEMS = [
  { path: "/api-crawler", icon: Code2,     label: "API Crawler" },
  { path: "/jobs",        icon: Briefcase, label: "My Jobs"     },
  { path: "/settings",    icon: Settings,  label: "Settings"    },
];

export function Sidebar() {
  const pathname = usePathname(); // returns path WITHOUT basePath, e.g. "/api-crawler"
  const [dark, setDark] = useState(true);

  // Initialise theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("tmic-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("tmic-theme", next ? "dark" : "light");
  };

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
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = pathname.startsWith(path);
          // Use plain <a> with absolute path to avoid Next.js basePath double-prepend
          return (
            <a
              key={path}
              href={`${BASE}${path}/`}
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
            </a>
          );
        })}
      </nav>

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Phase 1 — MVP</span>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 6px",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </aside>
  );
}
