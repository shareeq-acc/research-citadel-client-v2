/**
 * Core HTTP client built on axios.
 *
 * - Attaches credentials (cookies) on every request so the server's
 *   HTTP-only JWT cookie is forwarded automatically.
 * - Normalises error responses into a predictable shape.
 * - Exposes the raw axios instance for advanced usage.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode: number;
  /** Original axios error, available for advanced handling */
  cause?: AxiosError;
}

// ── Instance ──────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive HTTP-only cookies (JWT)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// ── Request interceptor ───────────────────────────────────────────────────────

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // The JWT arrives as an HTTP-only cookie so the browser handles it
    // automatically via withCredentials. No manual header injection needed.
    return config;
  },
  (error: AxiosError<{ message?: string }>) =>
    Promise.reject(normaliseError(error)),
);

// ── Response interceptor ──────────────────────────────────────────────────────

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    return Promise.reject(normaliseError(error));
  },
);

// ── Error normalisation ────────────────────────────────────────────────────────

function normaliseError(error: AxiosError<{ message?: string }>): ApiError {
  const statusCode = error.response?.status ?? 0;
  const serverMessage =
    error.response?.data?.message ?? error.message ?? "An unexpected error occurred";

  return {
    message: serverMessage,
    statusCode,
    cause: error,
  };
}

// ── Typed convenience methods ─────────────────────────────────────────────────

/** GET and return the unwrapped `data` payload. */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await httpClient.get<ApiResponse<T>>(url, config);
  return res.data;
}

/** POST and return the unwrapped `data` payload. */
export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await httpClient.post<ApiResponse<T>>(url, body, config);
  return res.data;
}

/** PUT and return the unwrapped `data` payload. */
export async function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await httpClient.put<ApiResponse<T>>(url, body, config);
  return res.data;
}

/** PATCH and return the unwrapped `data` payload. */
export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await httpClient.patch<ApiResponse<T>>(url, body, config);
  return res.data;
}

/** DELETE and return the unwrapped `data` payload. */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await httpClient.delete<ApiResponse<T>>(url, config);
  return res.data;
}

export default httpClient;
