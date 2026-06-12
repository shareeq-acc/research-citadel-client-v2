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

export interface VaultMember {
  id: string;
  role: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  joinedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface AuditLogsQuery {
  limit?: number;
  offset?: number;
  /** Exact AuditAction value (e.g. "SOURCE_ADDED"). Takes priority over category. */
  action?: string;
  /** Category prefix filter: VAULT | MEMBER | FILE | SOURCE | ANNOTATION | CITATION */
  category?: string;
  /** ISO date string — include logs on or after this date */
  startDate?: string;
  /** ISO date string — include logs on or before this date */
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

  /** Get all members of a vault with their role. */
  getMembers(vaultId: string) {
    return get<VaultMember[]>(`/vault/${vaultId}/members`);
  },

  /** Remove a member from the vault (owner only). */
  removeMember(vaultId: string, userId: string) {
    return del<{ removed: boolean }>(`/vault/${vaultId}/members/${userId}`);
  },

  /** Fetch vault activity / audit logs. */
  getAuditLogs(vaultId: string, query: AuditLogsQuery = {}) {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.offset !== undefined) params.set("offset", String(query.offset));
    // Exact action takes priority; otherwise send category for prefix-based filtering
    if (query.action && query.action !== "ALL") {
      params.set("action", query.action);
    } else if (query.category && query.category !== "ALL") {
      params.set("category", query.category);
    }
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate)   params.set("endDate",   query.endDate);

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
