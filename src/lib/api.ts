import { handleMockRequest } from "./mockApi";

// Set to true to use mock data (no backend required)
const MOCK_MODE = true;

function mockResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = input.toString();

  if (!url.startsWith("/api/")) {
    return fetch(input, init);
  }

  // Use mock mode when enabled
  if (MOCK_MODE) {
    const result = handleMockRequest(url, init);
    return mockResponse(result);
  }

  // Real API call
  const headers = new Headers(init?.headers);
  const storedUid =
    typeof window !== "undefined"
      ? localStorage.getItem("cid_uid_storage")
      : null;
  if (storedUid) {
    headers.set("Authorization", `Bearer ${storedUid}`);
  }
  return fetch(input, { ...init, headers });
}
