/**
 * Vault service — wraps all /vault endpoints.
 */

import { del, get, post, put } from "@/lib/http-client";
import type { AuditLog, Vault } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateVaultPayload {
  name: string;
  description?: string;
  privacy?: "PRIVATE" | "PUBLIC";
}

export interface UpdateVaultPayload {
  name?: string;
  description?: string;
  privacy?: "PRIVATE" | "PUBLIC";
}

export interface AddMemberPayload {
  userId: string;
  role: "CONTRIBUTOR" | "VIEWER";
}

export interface AuditLogsQuery {
  limit?: number;
  offset?: number;
  /** Maps to the `action` query param on the server (e.g. "SOURCE_ADDED"). Pass "ALL" or omit to skip. */
  action?: string;
  startDate?: string;
  endDate?: string;
}

/** The server returns a flat array of log entries in `data`. */
export type AuditLogsResult = AuditLog[];

// ── Service ───────────────────────────────────────────────────────────────────

const vaultService = {
  /** List all vaults the authenticated user is a member of. */
  listVaults() {
    return get<Vault[]>("/vault");
  },

  /** Create a new vault. */
  createVault(payload: CreateVaultPayload) {
    return post<Vault>("/vault", payload);
  },

  /** Fetch a single vault by ID. */
  getVault(vaultId: string) {
    return get<Vault>(`/vault/${vaultId}`);
  },

  /** Update vault metadata. */
  updateVault(vaultId: string, payload: UpdateVaultPayload) {
    return put<Vault>(`/vault/${vaultId}`, payload);
  },

  /** Permanently delete a vault. */
  deleteVault(vaultId: string) {
    return del<{ deleted: boolean }>(`/vault/${vaultId}`);
  },

  /** Add a member to the vault. */
  addMember(vaultId: string, payload: AddMemberPayload) {
    return post<void>(`/vault/${vaultId}/members`, payload);
  },

  /** Fetch vault activity / audit logs. */
  getAuditLogs(vaultId: string, query: AuditLogsQuery = {}) {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.offset !== undefined) params.set("offset", String(query.offset));
    // Server uses "action" param, skip if "ALL" or empty
    if (query.action && query.action !== "ALL") params.set("action", query.action);

    const qs = params.toString();
    return get<AuditLogsResult>(`/vault/${vaultId}/audit${qs ? `?${qs}` : ""}`);
  },

  /** Fetch aggregate stats for a vault. */
  getStats(vaultId: string) {
    return get<unknown>(`/vault/${vaultId}/stats`);
  },

  /** Ask a question across all (or selected) sources in a vault. */
  ask(
    vaultId: string,
    payload: { question: string; sourceIds?: string[] },
  ) {
    return post<{
      answer: string;
      sources: Array<{ sourceId: string; title: string; similarity: number }>;
      chunksUsed: number;
    }>(`/vault/${vaultId}/ask`, payload);
  },
} as const;

export default vaultService;
