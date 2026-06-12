// app/api-crawler/page.tsx
"use client";

import { useState, useCallback } from "react";
import type { RequestConfig, ApiResponse, SchemaField, DagConfig } from "@/lib/types";
import { ActivityBar } from "@/components/api-crawler/ActivityBar";
import { CollectionsTree } from "@/components/api-crawler/CollectionsTree";
import { RequestBreadcrumb } from "@/components/api-crawler/RequestBreadcrumb";
import { EndpointBar } from "@/components/api-crawler/EndpointBar";
import { RequestTabs } from "@/components/api-crawler/RequestTabs";
import { ResponsePanel } from "@/components/api-crawler/ResponsePanel";
import { RightIconBar } from "@/components/api-crawler/RightIconBar";
import { SchemaPanel } from "@/components/api-crawler/SchemaPanel";
import { DagPanel } from "@/components/api-crawler/DagPanel";
import { executeRequest } from "@/lib/apiClient";
import { inferSchema } from "@/lib/schemaInfer";
import { mockRequests, mockCollections } from "@/data/mockCollections";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_REQUEST: RequestConfig = {
  id: "new",
  name: "Untitled Request",
  method: "GET",
  url: "",
  queryParams: [],
  pathParams: [],
  headers: [],
  bodyType: "none",
  bodyJson: "",
  auth: { type: "none" },
};

const DEFAULT_DAG: DagConfig = {
  crawlerName: "",
  schedule: "0 6 * * *",
  outputFormat: "json",
  outputPath: "s3://tmic-data/",
  tags: [],
  retries: 2,
  timeoutSeconds: 120,
};

type ActivitySection = "collections" | "environments" | "history";
type RightPanel = "schema" | "dag";

/** Walk the collections tree to find breadcrumb info for a requestId */
function findBreadcrumb(requestId: string): { collection: string; folder: string } {
  for (const col of mockCollections) {
    if (col.kind !== "collection") continue;
    for (const child of col.children) {
      if (child.kind === "folder") {
        for (const leaf of child.children) {
          if (leaf.kind === "request" && leaf.requestId === requestId) {
            return { collection: col.name, folder: child.name };
          }
        }
      }
    }
  }
  return { collection: "Collections", folder: "—" };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApiCrawlerPage() {
  const [request, setRequest] = useState<RequestConfig>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [dagConfig, setDagConfig] = useState<DagConfig>(DEFAULT_DAG);

  const [activeSection, setActiveSection] = useState<ActivitySection | null>("collections");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState({ collection: "tMIC", folder: "New" });
  const [rightPanel, setRightPanel] = useState<RightPanel | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSelectRequest = useCallback((requestId: string) => {
    const mock = mockRequests[requestId];
    if (!mock) return;
    setRequest(mock.config);
    setSchema(mock.schema);
    setDagConfig(mock.dagConfig);
    setResponse(mock.mockResponse);
    setActiveRequestId(requestId);
    setBreadcrumb(findBreadcrumb(requestId));
  }, []);

  const setReq = (patch: Partial<RequestConfig>) => setRequest((r) => ({ ...r, ...patch }));

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      if (activeRequestId && (request.url.includes("tmic-internal") || request.url.includes("marketdata.app"))) {
        const mock = mockRequests[activeRequestId];
        if (mock) {
          await new Promise((r) => setTimeout(r, mock.mockResponse.durationMs));
          setResponse(mock.mockResponse);
          return;
        }
      }
      const res = await executeRequest(request);
      setResponse(res);
    } finally {
      setLoading(false);
    }
  }

  function handleInferSchema() {
    if (!response?.body) return;
    setSchema(inferSchema(response.body));
  }

  function handleSave() {
    const name = dagConfig.crawlerName || request.name;
    setSaveMsg(`"${name}" saved!`);
    setTimeout(() => setSaveMsg(null), 2500);
  }

  function handleActivityToggle(section: ActivitySection) {
    setActiveSection((cur) => (cur === section ? null : section));
  }

  function handleRightPanelToggle(panel: RightPanel) {
    setRightPanel((cur) => (cur === panel ? null : panel));
  }

  const collectionsOpen = activeSection === "collections";

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>

      {/* Activity Bar */}
      <ActivityBar activeSection={activeSection} onSectionToggle={handleActivityToggle} />

      {/* Collections Tree (collapsible) */}
      {collectionsOpen && (
        <CollectionsTree
          activeRequestId={activeRequestId}
          onSelectRequest={handleSelectRequest}
        />
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <RequestBreadcrumb
          collectionName={breadcrumb.collection}
          folderName={breadcrumb.folder}
          requestName={request.name}
          onRequestNameChange={(name) => setReq({ name })}
          onSave={handleSave}
          saveMessage={saveMsg}
        />
        <EndpointBar
          method={request.method}
          url={request.url}
          loading={loading}
          onMethodChange={(m) => setReq({ method: m })}
          onUrlChange={(url) => setReq({ url })}
          onSend={handleSend}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: "0 0 220px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <RequestTabs request={request} onChange={setReq} />
          </div>
          <div style={{ flex: 1, display: "flex", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
            <ResponsePanel response={response} loading={loading} />
          </div>
        </div>
      </div>

      {/* Right Slide-in Panels */}
      {rightPanel === "schema" && (
        <SchemaPanel
          fields={schema}
          onFieldsChange={setSchema}
          onInferFromResponse={handleInferSchema}
          hasResponse={!!response?.body}
        />
      )}
      {rightPanel === "dag" && (
        <DagPanel config={dagConfig} onChange={setDagConfig} onSave={handleSave} />
      )}

      {/* Right Icon Bar */}
      <RightIconBar activePanel={rightPanel} onPanelToggle={handleRightPanelToggle} />
    </div>
  );
}
