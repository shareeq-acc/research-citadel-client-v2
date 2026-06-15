"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { vaultService, sourceService, annotationService } from "@/services";
import { io, Socket } from "socket.io-client";
import { Source, Vault, Annotation } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";
const WS_NS  = "/collaboration";
import { AnnotationWorkspacePage } from "@/components/source/AnnotationWorkspacePage";

function AnnotationWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setActiveVault, setSources, setAnnotations, annotations, refreshCurrentUser } = useApp();

  const vaultId = params.vaultId as string;
  const sourceId = params.sourceId as string;
  const annotationId = searchParams.get("annotationId");

  const [vault, setVault] = useState<Vault | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [loading, setLoading] = useState(true);

  // Workspace form state
  const [workspaceDraft, setWorkspaceDraft] = useState("");
  const [workspacePageRef, setWorkspacePageRef] = useState("");
  const [workspaceSectionRef, setWorkspaceSectionRef] = useState("");
  const [workspacePreviousDraft, setWorkspacePreviousDraft] = useState("");
  const [workspaceEnhancing, setWorkspaceEnhancing] = useState(false);
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");

  // Collaboration state
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [workspacePresenceList, setWorkspacePresenceList] = useState<any[]>([]);

  // Reference pane state
  const [workspaceRefPaneTab, setWorkspaceRefPaneTab] = useState<
    "summary" | "insights" | "annotations" | "document"
  >("summary");
  const [expandedRefAnnotations, setExpandedRefAnnotations] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    async function loadData() {
      try {
        const [vaultRes, srcRes, annRes] = await Promise.all([
          vaultService.getVault(vaultId),
          sourceService.listSources(vaultId),
          annotationService.listAnnotations(vaultId, sourceId),
        ]);

        if (vaultRes.success) { setVault(vaultRes.data); setActiveVault(vaultRes.data); }

        if (srcRes.success) {
          setSources(srcRes.data.sources);
          const found = srcRes.data.sources.find((s: Source) => s.id === sourceId);
          if (found) setSource(found);
        }

        if (annRes.success) {
          const list = annRes.data.annotations;
          setAnnotations(list);
          if (annotationId) {
            const found = list.find((a) => a.id === annotationId);
            if (found) {
              setEditingAnnotation(found);
              setWorkspaceDraft(found.contentMarkdown);
              setWorkspacePageRef(found.pageReference?.toString() || "");
              setWorkspaceSectionRef(found.sectionReference || "");
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vaultId, sourceId, annotationId]);

  // ── Real-time presence via Socket.IO ─────────────────────────────────────
  useEffect(() => {
    if (!source || !vault || !currentUser) return;

    const socket: Socket = io(`${WS_URL}${WS_NS}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      // Join the vault room so we receive presence broadcasts
      socket.emit("joinVault", { vaultId: vault.id });

      // Tell others we are editing this annotation
      if (editingAnnotation) {
        socket.emit("startEditing", { vaultId: vault.id, annotationId: editingAnnotation.id });
      }
    });

    // Server broadcasts unified presence (editors + viewers)
    socket.on("annotation:editing", (payload: {
      annotationId: string;
      presence?: Array<{ userId: string; name: string; status: string }>;
      editors?: Array<{ userId: string; name: string }>;
    }) => {
      if (payload.annotationId !== editingAnnotation?.id) return;

      // Prefer the unified `presence` array; fall back to `editors` for older server versions
      const list: Array<{ userId: string; name: string; status: string }> =
        payload.presence ??
        (payload.editors ?? []).map((e) => ({ ...e, status: 'editing' }));

      setWorkspacePresenceList(
        list.map((p) => ({
          userId: p.userId,
          name: p.userId === currentUser.id ? `${p.name} (You)` : p.name,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(p.name)}`,
          status: p.status,
        }))
      );
    });

    return () => {
      if (editingAnnotation) {
        socket.emit("stopEditing", { vaultId: vault.id, annotationId: editingAnnotation.id });
      }
      socket.emit("leaveVault", { vaultId: vault.id });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.id, vault?.id, editingAnnotation?.id]);

  const handleSaveWorkspace = async () => {
    if (!vault || !source) return;
    if (!workspaceDraft.trim()) {
      setWorkspaceError("Annotation content cannot be empty.");
      return;
    }
    setWorkspaceSaving(true);
    setWorkspaceError("");
    try {
      const payload = {
        contentMarkdown: workspaceDraft,
        contentHtml: workspaceDraft,
        pageReference: workspacePageRef ? parseInt(workspacePageRef) : undefined,
        sectionReference: workspaceSectionRef || undefined,
      };

      const res = editingAnnotation
        ? await annotationService.updateAnnotation(vault.id, source.id, editingAnnotation.id, payload)
        : await annotationService.createAnnotation(vault.id, source.id, payload);

      if (res.success) {
        router.push(`/source/${vault.id}/${source.id}`);
      } else {
        setWorkspaceError(res.message || "Failed to save annotation.");
      }
    } catch (err: any) {
      setWorkspaceError(err?.message || "Failed to save annotation.");
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const handleAIEnhanceWorkspace = async () => {
    if (!vault || !source || !workspaceDraft.trim()) return;
    setWorkspaceEnhancing(true);
    setWorkspacePreviousDraft(workspaceDraft);
    try {
      const res = await annotationService.enhanceAnnotation(vault.id, source.id, workspaceDraft);
      if (res.success) {
        setWorkspaceDraft(res.data.enhancedMarkdown);
        await refreshCurrentUser();
      }
    } catch { /* ignore */ } finally {
      setWorkspaceEnhancing(false);
    }
  };

  const handleRevertAIWorkspace = () => {
    setWorkspaceDraft(workspacePreviousDraft);
    setWorkspacePreviousDraft("");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-stone-200 border-2 border-neo-dark w-1/3 rounded" />
        <div className="h-[600px] bg-white border-4 border-neo-dark rounded" />
      </div>
    );
  }

  if (!source || !vault) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="font-mono text-stone-500">Source not found.</p>
        <button onClick={() => router.push("/dashboard")} className="neo-btn px-4 py-2 text-xs">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <AnnotationWorkspacePage
      activeSource={source}
      activeVault={vault}
      annotations={annotations}
      editingAnnotation={editingAnnotation}
      workspaceSaving={workspaceSaving}
      workspaceError={workspaceError}
      conflictResult={conflictResult}
      setConflictResult={setConflictResult}
      workspacePresenceList={workspacePresenceList}
      workspacePageRef={workspacePageRef}
      setWorkspacePageRef={setWorkspacePageRef}
      workspaceSectionRef={workspaceSectionRef}
      setWorkspaceSectionRef={setWorkspaceSectionRef}
      workspaceDraft={workspaceDraft}
      setWorkspaceDraft={setWorkspaceDraft}
      workspaceEnhancing={workspaceEnhancing}
      workspacePreviousDraft={workspacePreviousDraft}
      handleNavigateScreen={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
      }}
      loadVaultDetail={() => router.push("/dashboard")}
      loadSourceDetail={(id) => router.push(`/source/${vaultId}/${id}`)}
      handleSaveWorkspace={handleSaveWorkspace}
      handleAIEnhanceWorkspace={handleAIEnhanceWorkspace}
      handleRevertAIWorkspace={handleRevertAIWorkspace}
      workspaceRefPaneTab={workspaceRefPaneTab}
      setWorkspaceRefPaneTab={setWorkspaceRefPaneTab}
      expandedRefAnnotations={expandedRefAnnotations}
      setExpandedRefAnnotations={setExpandedRefAnnotations}
    />
  );
}

export default function AnnotationWorkspaceRoute() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-stone-200 border-2 border-neo-dark w-1/3 rounded" />
        <div className="h-[600px] bg-white border-4 border-neo-dark rounded" />
      </div>
    }>
      <AnnotationWorkspaceContent />
    </Suspense>
  );
}
