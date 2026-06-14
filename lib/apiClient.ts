// lib/apiClient.ts
import type { RequestConfig, ApiResponse } from "./types";

function buildHeaders(config: RequestConfig): Record<string, string> {
  const h: Record<string, string> = {};

  for (const row of config.headers) {
    if (row.enabled && row.key) h[row.key] = row.value;
  }

  if (config.auth.type === "bearer" && config.auth.bearerToken) {
    h["Authorization"] = `Bearer ${config.auth.bearerToken}`;
  } else if (config.auth.type === "basic" && config.auth.basicUsername) {
    const creds = btoa(`${config.auth.basicUsername}:${config.auth.basicPassword ?? ""}`);
    h["Authorization"] = `Basic ${creds}`;
  } else if (config.auth.type === "api_key" && config.auth.apiKeyValue) {
    const headerName = config.auth.apiKeyHeader ?? "X-API-Key";
    h[headerName] = config.auth.apiKeyValue;
  }

  if (config.bodyType === "json") {
    h["Content-Type"] = "application/json";
  } else if (config.bodyType === "form") {
    h["Content-Type"] = "application/x-www-form-urlencoded";
  }

  return h;
}

function buildUrl(config: RequestConfig): string {
  let url = config.url;

  for (const row of config.pathParams) {
    if (row.enabled && row.key) {
      url = url.replace(`{${row.key}}`, encodeURIComponent(row.value));
      url = url.replace(`:${row.key}`, encodeURIComponent(row.value));
    }
  }

  const enabledQuery = config.queryParams.filter((p) => p.enabled && p.key);
  if (enabledQuery.length > 0) {
    const qs = enabledQuery
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
    url += (url.includes("?") ? "&" : "?") + qs;
  }

  return url;
}

function buildBody(config: RequestConfig): string | undefined {
  if (config.bodyType === "json") return config.bodyJson || undefined;
  if (config.bodyType === "form") {
    const rows = config.queryParams.filter((p) => p.enabled && p.key);
    return rows.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
  }
  return undefined;
}

export async function executeRequest(config: RequestConfig): Promise<ApiResponse> {
  const start = Date.now();
  try {
    const res = await fetch("/api/eggroll/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    const durationMs = Date.now() - start;
    const data: ApiResponse = await res.json();
    return { ...data, durationMs };
  } catch (err: unknown) {
    return {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: null,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
