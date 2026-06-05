"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { Source, Vault, Annotation } from "@/types";
import { AnnotationDetailPage } from "@/components/source/AnnotationDetailPage";
import { SkeletonAnnotationDetailPage } from "@/components/shared/Skeleton";

export default function AnnotationDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, setActiveVault, setSources, setAnnotations } = useApp();

  const vaultId = params.vaultId as string;
  const sourceId = params.sourceId as string;
  const annotationId = params.annotationId as string;

  const [vault, setVault] = useState<Vault | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [annotations, setLocalAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  const [workspaceRefPaneTab, setWorkspaceRefPaneTab] = useState<
    "summary" | "insights" | "annotations" | "document"
  >("summary");
  const [expandedRefAnnotations, setExpandedRefAnnotations] = useState<
    Record<string, boolean>
  >({});
  const [detailRoomPresence, setDetailRoomPresence] = useState<any[]>([]);
  const [detailLiveUpdate, setDetailLiveUpdate] = useState<any>(null);

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
          setLocalAnnotations(annData.data);
          setAnnotations(annData.data);
          const found = annData.data.find((a: Annotation) => a.id === annotationId);
          if (found) setAnnotation(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vaultId, sourceId, annotationId]);

  // Simulate live presence
  useEffect(() => {
    if (!annotation) return;
    const presence = [
      {
        id: "u-1",
        name: currentUser ? `${currentUser.name} (You)` : "You",
        avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj",
        status: "viewing",
      },
      {
        id: "u-2",
        name: "Prof. Adrian Carter",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Adrian",
        status: "viewing",
      },
      {
        id: "u-3",
        name: "Elena Rostova",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena",
        status: "viewing",
      },
    ];
    setDetailRoomPresence(presence);

    const t1 = setTimeout(
      () =>
        setDetailRoomPresence((prev) =>
          prev.map((p) => (p.id === "u-2" ? { ...p, status: "editing" } : p))
        ),
      4000
    );
    const t2 = setTimeout(() => {
      setDetailLiveUpdate({
        updated: true,
        byUser: "Prof. Adrian Carter",
        newVersion: annotation.version + 1,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setDetailRoomPresence((prev) =>
        prev.map((p) => (p.id === "u-2" ? { ...p, status: "viewing" } : p))
      );
    }, 10000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [annotation?.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <SkeletonAnnotationDetailPage />
      </div>
    );
  }

  if (!annotation || !vault) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="font-mono text-stone-500">Annotation not found.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="neo-btn px-4 py-2 text-xs"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <AnnotationDetailPage
      activeAnnotation={annotation}
      activeSource={source}
      activeVault={vault}
      annotations={annotations}
      detailRoomPresence={detailRoomPresence}
      detailLiveUpdate={detailLiveUpdate}
      setDetailLiveUpdate={setDetailLiveUpdate}
      setActiveAnnotation={(ann) => setAnnotation(ann)}
      handleNavigateScreen={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
      }}
      loadVaultDetail={() => router.push("/dashboard")}
      loadSourceDetail={(id) => router.push(`/source/${vaultId}/${id}`)}
      workspaceRefPaneTab={workspaceRefPaneTab}
      setWorkspaceRefPaneTab={setWorkspaceRefPaneTab}
      expandedRefAnnotations={expandedRefAnnotations}
      setExpandedRefAnnotations={setExpandedRefAnnotations}
    />
  );
}
