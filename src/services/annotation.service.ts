/**
 * Annotation service — wraps all annotation endpoints.
 */

import { del, get, post, put } from "@/lib/http-client";
import type { Annotation } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateAnnotationPayload {
  contentMarkdown: string;
  contentHtml: string;
  pageReference?: number;
  sectionReference?: string;
}

export interface UpdateAnnotationPayload {
  contentMarkdown?: string;
  contentHtml?: string;
  pageReference?: number;
  sectionReference?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface AnnotationsResult {
  annotations: Annotation[];
  total: number;
  page: number;
  limit: number;
}

const annotationService = {
  /** List all annotations for a source. */
  listAnnotations(vaultId: string, sourceId: string) {
    return get<AnnotationsResult>(`/vault/${vaultId}/source/${sourceId}/annotation`);
  },

  /** Create an annotation. */
  createAnnotation(
    vaultId: string,
    sourceId: string,
    payload: CreateAnnotationPayload,
  ) {
    return post<Annotation>(
      `/vault/${vaultId}/source/${sourceId}/annotation`,
      payload,
    );
  },

  /** Update an annotation. */
  updateAnnotation(
    vaultId: string,
    sourceId: string,
    annotationId: string,
    payload: UpdateAnnotationPayload,
  ) {
    return put<Annotation>(
      `/vault/${vaultId}/source/${sourceId}/annotation/${annotationId}`,
      payload,
    );
  },

  /** Delete an annotation. */
  deleteAnnotation(
    vaultId: string,
    sourceId: string,
    annotationId: string,
  ) {
    return del<{ deleted: boolean }>(
      `/vault/${vaultId}/source/${sourceId}/annotation/${annotationId}`,
    );
  },

  /**
   * Request AI enhancement of a draft annotation.
   * Returns the enhanced markdown string.
   */
  enhanceAnnotation(
    vaultId: string,
    sourceId: string,
    draft: string,
  ) {
    return post<{ enhancedMarkdown: string }>(
      `/vault/${vaultId}/source/${sourceId}/annotation/enhance`,
      { contentMarkdown: draft },  // server expects contentMarkdown
    );
  },
} as const;

export default annotationService;
