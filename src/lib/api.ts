/**
 * Legacy `apiFetch` adapter — keeps all existing call-sites working while
 * the codebase migrates to the typed service modules in `@/services/`.
 *
 * Behaviour:
 *  - When NEXT_PUBLIC_MOCK_MODE=true  → delegates to the in-memory mock handler.
 *  - Otherwise                       → proxies through the axios http-client so
 *    credentials (cookies) are forwarded correctly.
 *
 * New code should import directly from `@/services` instead of using apiFetch.
 */

import { handleMockRequest } from "./mockApi";
import httpClient from "./http-client";

const MOCK_MODE =
  process.env.NEXT_PUBLIC_MOCK_MODE === "true";

/** Map a local `/api/...` path to the real backend URL. */
function toBackendUrl(path: string): string {
  // Strip the leading /api prefix — the axios baseURL already includes /api/v1
  // e.g.  /api/auth/login  →  /auth/login
  //        /api/vault        →  /vault
  //        /api/user/me      →  /user/me
  return path.replace(/^\/api\/v1/, "").replace(/^\/api/, "");
}

function mockResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Drop-in replacement for `fetch` that works for `/api/...` routes.
 * All other URLs are passed straight to the browser's native `fetch`.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = input.toString();

  // Pass through non-API routes unchanged
  if (!url.startsWith("/api/")) {
    return fetch(input, init);
  }

  // ── Mock mode ─────────────────────────────────────────────────────────
  if (MOCK_MODE) {
    const result = handleMockRequest(url, init);
    return mockResponse(result);
  }

  // ── Real backend via axios ─────────────────────────────────────────────
  const method = (init?.method ?? "GET").toUpperCase();
  const backendPath = toBackendUrl(url);

  let requestBody: unknown;
  if (init?.body) {
    try {
      requestBody = JSON.parse(init.body as string);
    } catch {
      requestBody = init.body;
    }
  }

  // Build headers (strip Content-Type so axios can set it correctly for
  // FormData, JSON, etc.)
  const customHeaders: Record<string, string> = {};
  if (init?.headers) {
    const h = new Headers(init.headers);
    h.forEach((value, key) => {
      // Let axios manage content-type
      if (key.toLowerCase() !== "content-type") {
        customHeaders[key] = value;
      }
    });
  }

  const axiosResponse = await httpClient.request({
    url: backendPath,
    method,
    data: requestBody,
    headers: customHeaders,
  });

  // Wrap the axios response in a Web API Response so callers can still do
  // `await response.json()` without changing call-sites.
  return new Response(JSON.stringify(axiosResponse.data), {
    status: axiosResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
