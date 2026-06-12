// app/api-crawler/page.tsx
"use client";

import { useState } from "react";
import type { RequestConfig, ApiResponse, SchemaField, DagConfig } from "@/lib/types";
import { EndpointBar } from "@/components/api-crawler/EndpointBar";
import { ParamsEditor } from "@/components/api-crawler/ParamsEditor";
import { AuthEditor } from "@/components/api-crawler/AuthEditor";
import { ResponseViewer } from "@/components/api-crawler/ResponseViewer";
import { SchemaEditor } from "@/components/api-crawler/SchemaEditor";
import { DagConfigPanel } from "@/components/api-crawler/DagConfigPanel";
import { Header } from "@/components/layout/Header";
import { executeRequest } from "@/lib/apiClient";
import { inferSchema } from "@/lib/schemaInfer";

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

type LeftTab = "params" | "auth";

export default function ApiCrawlerPage() {
  const [request, setRequest] = useState<RequestConfig>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [dagConfig, setDagConfig] = useState<DagConfig>(DEFAULT_DAG);
  const [leftTab, setLeftTab] = useState<LeftTab>("params");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const setReq = (patch: Partial<RequestConfig>) => setRequest((r) => ({ ...r, ...patch }));

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
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

  function handleSaveCrawler() {
    const name = dagConfig.crawlerName || request.name;
    setSaveMsg(`Crawler "${name}" saved! (mock)`);
    setTimeout(() => setSaveMsg(null), 3000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="API Crawler Designer" />

      <EndpointBar
        method={request.method}
        url={request.url}
        loading={loading}
        onMethodChange={(m) => setReq({ method: m })}
        onUrlChange={(url) => setReq({ url })}
        onSend={handleSend}
      />

      {saveMsg && (
        <div style={{ background: "var(--success)", color: "#000", padding: "6px 16px", fontSize: 13, fontWeight: 600 }}>
          ✓ {saveMsg}
        </div>
      )}

      {/* Main split: left params/auth + right response */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        {/* Left pane */}
        <div style={{ width: "50%", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 8 }}>
            {(["params", "auth"] as LeftTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                style={{
                  padding: "9px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: leftTab === t ? "2px solid var(--accent)" : "2px solid transparent",
                  color: leftTab === t ? "var(--accent-hover)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: leftTab === t ? 600 : 400,
                }}
              >
                {t === "params" ? "Params" : "Auth"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {leftTab === "params" ? (
              <ParamsEditor
                queryParams={request.queryParams}
                pathParams={request.pathParams}
                headers={request.headers}
                bodyType={request.bodyType}
                bodyJson={request.bodyJson}
                onQueryParamsChange={(p) => setReq({ queryParams: p })}
                onPathParamsChange={(p) => setReq({ pathParams: p })}
                onHeadersChange={(h) => setReq({ headers: h })}
                onBodyTypeChange={(t) => setReq({ bodyType: t })}
                onBodyJsonChange={(s) => setReq({ bodyJson: s })}
              />
            ) : (
              <AuthEditor auth={request.auth} onChange={(a) => setReq({ auth: a })} />
            )}
          </div>
        </div>

        {/* Right pane — Response */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>

      {/* Bottom split: schema + dag config */}
      <div style={{ height: 280, display: "flex", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", overflow: "auto" }}>
          <SchemaEditor
            fields={schema}
            onFieldsChange={setSchema}
            onInferFromResponse={handleInferSchema}
            hasResponse={!!response?.body}
          />
        </div>
        <div style={{ width: 380, overflow: "auto" }}>
          <DagConfigPanel config={dagConfig} onChange={setDagConfig} onSave={handleSaveCrawler} />
        </div>
      </div>
    </div>
  );
}
