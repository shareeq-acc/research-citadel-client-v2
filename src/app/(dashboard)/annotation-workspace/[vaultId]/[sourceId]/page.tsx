"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { Source, Vault, Annotation } from "@/types";
import { AnnotationWorkspacePage } from "@/components/source/AnnotationWorkspacePage";

function AnnotationWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setActiveVault, setSources, setAnnotations, annotations } = useApp();

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
  const [simulateCollaborators, setSimulateCollaborators] = useState(true);
  const [collaboratorEditSimulating, setCollaboratorEditSimulating] = useState(false);
  const [collaboratorEditSimulatedMessage, setCollaboratorEditSimulatedMessage] = useState("");

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
          apiFetch(`/api/vault/${vaultId}`),
          apiFetch(`/api/vault/${vaultId}/source`),
          apiFetch(`/api/vault/${vaultId}/source/${sourceId}/annotation`),
        ]);

        const vaultData = await vaultRes.json();
        if (vaultData.success) {
          setVault(vaultData.data);
          setActiveVault(vaultData.data);
        }

        const srcData = await srcRes.json();
        if (srcData.success) {
          setSources(srcData.data.sources);
          const found = srcData.data.sources.find((s: Source) => s.id === sourceId);
          if (found) setSource(found);
        }

        const annData = await annRes.json();
        if (annData.success) {
          setAnnotations(annData.data);
          if (annotationId) {
            const found = annData.data.find((a: Annotation) => a.id === annotationId);
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

  // Presence polling
  useEffect(() => {
    if (!source || !vault) return;
    const syncPresence = async () => {
      try {
        const res = await apiFetch(
          `/api/vault/${vault.id}/source/${source.id}/presence`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: editingAnnotation ? "editing" : "viewing",
              editingAnnId: editingAnnotation?.id || null,
              simulate: simulateCollaborators,
            }),
          }
        );
        const data = await res.json();
        if (data.success && data.data) setWorkspacePresenceList(data.data);
      } catch { /* ignore */ }
    };
    syncPresence();
    const id = setInterval(syncPresence, 2500);
    return () => clearInterval(id);
  }, [source?.id, vault?.id, editingAnnotation?.id, simulateCollaborators]);

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
        pageReference: workspacePageRef ? parseInt(workspacePageRef) : null,
        sectionReference: workspaceSectionRef || null,
      };
      const response = editingAnnotation
        ? await apiFetch(
            `/api/vault/${vault.id}/source/${source.id}/annotation/${editingAnnotation.id}`,
            { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
          )
        : await apiFetch(
            `/api/vault/${vault.id}/source/${source.id}/annotation`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
          );

      const res = await response.json();
      if (res.success) {
        router.push(`/source/${vault.id}/${source.id}`);
      } else {
        setWorkspaceError(res.message || "Failed to save annotation.");
      }
    } catch {
      setWorkspaceError("Network error while saving annotation.");
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const handleAIEnhanceWorkspace = async () => {
    if (!vault || !source || !workspaceDraft.trim()) return;
    setWorkspaceEnhancing(true);
    setWorkspacePreviousDraft(workspaceDraft);
    try {
      const res = await apiFetch(
        `/api/vault/${vault.id}/source/${source.id}/annotation/enhance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft: workspaceDraft }),
        }
      );
      const data = await res.json();
      if (data.success) setWorkspaceDraft(data.data.enhanced);
    } catch { /* ignore */ } finally {
      setWorkspaceEnhancing(false);
    }
  };

  const handleRevertAIWorkspace = () => {
    setWorkspaceDraft(workspacePreviousDraft);
    setWorkspacePreviousDraft("");
  };

  const handleSimulateCollaboratorConflict = async () => {
    if (!vault || !source || !editingAnnotation) return;
    setCollaboratorEditSimulating(true);
    try {
      const res = await apiFetch(
        `/api/vault/${vault.id}/source/${source.id}/annotation/${editingAnnotation.id}/simulate-conflict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentDraft: workspaceDraft }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setCollaboratorEditSimulatedMessage(
          "⚡ Prof. Adrian Carter has saved an edit. Conflict detected between drafts."
        );
        setConflictResult(data.data);
        if (data.data?.mergedContent) setWorkspaceDraft(data.data.mergedContent);
      }
    } catch { /* ignore */ } finally {
      setCollaboratorEditSimulating(false);
    }
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
      simulateCollaborators={simulateCollaborators}
      setSimulateCollaborators={setSimulateCollaborators}
      collaboratorEditSimulating={collaboratorEditSimulating}
      collaboratorEditSimulatedMessage={collaboratorEditSimulatedMessage}
      setCollaboratorEditSimulatedMessage={setCollaboratorEditSimulatedMessage}
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
      handleSimulateCollaboratorConflict={handleSimulateCollaboratorConflict}
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
