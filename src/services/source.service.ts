/**
 * Source service — wraps all /vault/:vaultId/source endpoints.
 */

import { del, get, post } from "@/lib/http-client";
import httpClient from "@/lib/http-client";
import type { Source } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateSourcePayload {
  title: string;
  authors?: string[];
  publication?: string;
  year?: number;
  externalUrl?: string;
  sourceType: "PDF" | "WEB_ARTICLE" | "DATASET" | "VIDEO" | "BOOK" | "OTHER";
}

export interface SourcesResult {
  sources: Source[];
}

export interface SummarizePayload {
  length: "short" | "medium" | "long";
}

// ── Service ───────────────────────────────────────────────────────────────────

const sourceService = {
  /** List all sources in a vault. */
  listSources(vaultId: string) {
    return get<SourcesResult>(`/vault/${vaultId}/source`);
  },

  /**
   * Create a source with an optional file upload.
   * When `file` is provided, sends a multipart/form-data request.
   */
  createSource(
    vaultId: string,
    payload: CreateSourcePayload,
    file?: File,
  ) {
    if (file) {
      const form = new FormData();
      form.append("file", file);
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
        }
      });
      return httpClient
        .post<{ success: boolean; data: Source }>(
          `/vault/${vaultId}/source`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } },
        )
        .then((r) => r.data);
    }
    return post<Source>(`/vault/${vaultId}/source`, payload);
  },

  /** Get a single source. */
  getSource(vaultId: string, sourceId: string) {
    return get<Source>(`/vault/${vaultId}/source/${sourceId}`);
  },

  /** Delete a source. */
  deleteSource(vaultId: string, sourceId: string) {
    return del<{ deleted: boolean }>(`/vault/${vaultId}/source/${sourceId}`);
  },

  /** Trigger AI summarisation for a source. */
  summarize(
    vaultId: string,
    sourceId: string,
    payload: SummarizePayload,
  ) {
    return post<Source>(`/vault/${vaultId}/source/${sourceId}/summarize`, payload);
  },

  /** Extract structured AI insights from a source. */
  extractInsights(vaultId: string, sourceId: string) {
    return post<Source>(`/vault/${vaultId}/source/${sourceId}/extract-insights`);
  },

  /** Process a source for Q&A (chunk + embed). */
  processForQa(vaultId: string, sourceId: string) {
    return post<{ processed: boolean }>(
      `/vault/${vaultId}/source/${sourceId}/process-for-qa`,
    );
  },

  /**
   * One-shot: extract text from the attached file (if missing) then
   * chunk and index the source for Q&A.
   * Use when processForQa fails with "No extracted text available".
   */
  extractAndIndex(vaultId: string, sourceId: string) {
    return post<{ sourceId: string; chunksCreated: number; wordsExtracted: number }>(
      `/vault/${vaultId}/source/${sourceId}/extract-and-index`,
    );
  },
} as const;

export default sourceService;
