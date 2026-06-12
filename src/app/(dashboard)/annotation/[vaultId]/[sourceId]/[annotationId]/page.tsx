"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { vaultService, sourceService, annotationService } from "@/services";
import { io, Socket } from "socket.io-client";
import { Source, Vault, Annotation } from "@/types";
import { AnnotationDetailPage } from "@/components/source/AnnotationDetailPage";
import { SkeletonAnnotationDetailPage } from "@/components/shared/Skeleton";

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";
const WS_NS  = "/collaboration";

export default function AnnotationDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, setActiveVault, setSources, setAnnotations } = useApp();

  const vaultId      = params.vaultId      as string;
  const sourceId     = params.sourceId     as string;
  const annotationId = params.annotationId as string;

  const [vault,            setVault]            = useState<Vault | null>(null);
  const [source,           setSource]           = useState<Source | null>(null);
  const [annotation,       setAnnotation]       = useState<Annotation | null>(null);
  const [annotations,      setLocalAnnotations] = useState<Annotation[]>([]);
  const [loading,          setLoading]          = useState(true);

  const [workspaceRefPaneTab,    setWorkspaceRefPaneTab]    = useState<"summary" | "insights" | "annotations" | "document">("summary");
  const [expandedRefAnnotations, setExpandedRefAnnotations] = useState<Record<string, boolean>>({});
  const [detailRoomPresence,     setDetailRoomPresence]     = useState<any[]>([]);
  const [detailLiveUpdate,       setDetailLiveUpdate]       = useState<any>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
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
          setLocalAnnotations(list);
          setAnnotations(list);
          const found = list.find((a) => a.id === annotationId);
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

  // ── Real-time presence via Socket.IO ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !vaultId || !annotationId) return;

    const socket: Socket = io(`${WS_URL}${WS_NS}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    // Seed the presence list with ourselves as a viewer immediately
    setDetailRoomPresence([{
      id: currentUser.id,
      userId: currentUser.id,
      name: `${currentUser.name} (You)`,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(currentUser.name)}`,
      status: "viewing" as const,
    }]);

    socket.on("connect", () => {
      socket.emit("joinVault", { vaultId });
      // Register as a viewer — does NOT affect the editor presence list
      socket.emit("startViewing", { vaultId, annotationId });
    });

    // Unified presence: editors + viewers from the gateway
    socket.on("annotation:editing", ({ annotationId: annId, presence }: {
      annotationId: string;
      presence?: Array<{ userId: string; name: string; status: string }>;
      editors?: Array<{ userId: string; name: string }>;
    }) => {
      if (annId !== annotationId) return;

      const list = presence ?? [];
      setDetailRoomPresence(
        list.map((p) => ({
          id: p.userId,
          userId: p.userId,
          name: p.userId === currentUser.id ? `${p.name} (You)` : p.name,
          avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(p.name)}`,
          status: p.status,
        }))
      );
    });

    // Live annotation update from the workspace editor
    socket.on("annotation:updated", ({ sourceId: sid, annotation: updatedAnn }: any) => {
      if (sid !== sourceId) return;
      if (updatedAnn?.id !== annotationId) return;
      setDetailLiveUpdate({
        updated: true,
        byUser: updatedAnn.author?.name ?? "A collaborator",
        newVersion: updatedAnn.version ?? ((annotation?.version ?? 1) + 1),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        newContent: updatedAnn.contentMarkdown,
      });
    });

    return () => {
      socket.emit("stopViewing", { vaultId, annotationId });
      socket.emit("leaveVault", { vaultId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId, annotationId, currentUser?.id]);

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
