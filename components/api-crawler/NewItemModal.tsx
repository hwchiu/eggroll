// components/api-crawler/NewItemModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Folder, ChevronRight, ChevronDown } from "lucide-react";
import type { CollectionNode } from "@/lib/types";

interface NewItemModalProps {
  collections: CollectionNode[];
  onClose: () => void;
  onCreate: (
    type: "collection" | "folder",
    parentId: string | null,
    containerName: string,
    requestName: string
  ) => void;
}

export function NewItemModal({ collections, onClose, onCreate }: NewItemModalProps) {
  const [type, setType] = useState<"collection" | "folder">("collection");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [containerName, setContainerName] = useState("");
  const [requestName, setRequestName] = useState("New Request");
  const containerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => containerInputRef.current?.focus(), 50);
  }, []);

  const topLevelCollections = collections.filter((n) => n.kind === "collection");

  const canCreate =
    containerName.trim().length > 0 &&
    (type === "collection" || selectedParentId !== null);

  function handleCreate() {
    if (!canCreate) return;
    onCreate(type, selectedParentId, containerName.trim(), requestName.trim() || "New Request");
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {type === "collection" ? "New Collection" : "New Folder"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Type selector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Type
            </label>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {(["collection", "folder"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setSelectedParentId(null); }}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    background: type === t ? "var(--accent)" : "transparent",
                    border: "none",
                    color: type === t ? "#fff" : "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: type === t ? 600 : 400,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "background 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Parent picker (folder only) */}
          {type === "folder" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                Parent Collection <span style={{ color: "#e06060" }}>*</span>
              </label>
              <div style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                maxHeight: 160,
                overflowY: "auto",
                background: "var(--bg-surface)",
              }}>
                {topLevelCollections.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)" }}>
                    No collections yet — create a Collection first.
                  </div>
                ) : topLevelCollections.map((col) => (
                  <ParentPickerRow
                    key={col.id}
                    node={col}
                    selectedId={selectedParentId}
                    onSelect={setSelectedParentId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Container name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              {type === "collection" ? "Collection Name" : "Folder Name"} <span style={{ color: "#e06060" }}>*</span>
            </label>
            <input
              ref={containerInputRef}
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder={type === "collection" ? "e.g. Financial Data API" : "e.g. Equity Endpoints"}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Request name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Initial Request Name
            </label>
            <input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="New Request"
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            style={{
              padding: "7px 16px",
              background: canCreate ? "var(--accent)" : "var(--bg-surface)",
              border: "none",
              borderRadius: 6,
              color: canCreate ? "#fff" : "var(--text-dim)",
              fontSize: 13,
              fontWeight: 600,
              cursor: canCreate ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Parent Picker Row ────────────────────────────────────────────────────────

function ParentPickerRow({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: CollectionNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  if (node.kind === "request") return null;

  const isSelected = selectedId === node.id;
  const indent = depth * 14 + 10;
  const subFolders = node.children.filter((c) => c.kind !== "request");

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: `6px 10px 6px ${indent}px`,
          background: isSelected ? "rgba(91,133,232,0.15)" : "transparent",
          border: isSelected ? "1px solid var(--accent)" : "1px solid transparent",
          cursor: "pointer",
          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 12,
          textAlign: "left",
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-dim)", display: "flex" }}
        >
          {subFolders.length > 0
            ? (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />)
            : <span style={{ display: "inline-block", width: 11 }} />}
        </button>
        <Folder size={12} color={isSelected ? "var(--accent)" : "var(--text-muted)"} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </span>
      </button>
      {open && subFolders.map((child) => (
        <ParentPickerRow
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
