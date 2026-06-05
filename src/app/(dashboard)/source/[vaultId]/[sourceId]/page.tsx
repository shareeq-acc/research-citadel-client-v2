"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { Source, Vault, Annotation } from "@/types";
import { SourceDetailPage } from "@/components/source/SourceDetailPage";
import { SkeletonSourceDetailPage } from "@/components/shared/Skeleton";

function generateOnTheFlyCitationValue(
  source: Source,
  format: "APA" | "MLA" | "CHICAGO" | "BIBTEX" | "IEEE"
): string {
  const authors = source.authors.length > 0 ? source.authors.join(", ") : "Unknown Author";
  const year = source.year || "n.d.";
  const title = source.title || "Untitled";
  const pub = source.publication || "";
  switch (format) {
    case "APA":     return `${authors} (${year}). ${title}. ${pub}.`;
    case "MLA":     return `${authors}. "${title}." ${pub}, ${year}.`;
    case "CHICAGO": return `${authors}. "${title}." ${pub} (${year}).`;
    case "BIBTEX":  return `@article{${source.id},\n  author = {${authors}},\n  title = {${title}},\n  year = {${year}},\n  journal = {${pub}}\n}`;
    case "IEEE":    return `${authors}, "${title}," ${pub}, ${year}.`;
    default:        return `${authors} (${year}). ${title}.`;
  }
}

export default function SourceDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const { setActiveVault, setSources, setAnnotations, setActiveAnnotation, annotations } = useApp();

  const vaultId = params.vaultId as string;
  const sourceId = params.sourceId as string;

  const [vault, setVault] = useState<Vault | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [citationDrawerOpen, setCitationDrawerOpen] = useState(false);
  const [citationFormat, setCitationFormat] = useState<"APA" | "MLA" | "CHICAGO" | "BIBTEX" | "IEEE">("APA");
  const [editedCitation, setEditedCitation] = useState("");
  const [copiedStates, setCopiedStates] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [vaultRes, srcRes] = await Promise.all([
          apiFetch(`/api/vault/${vaultId}`),
          apiFetch(`/api/vault/${vaultId}/source`),
        ]);
        const vaultData = await vaultRes.json();
        const srcData = await srcRes.json();

        if (vaultData.success) {
          setVault(vaultData.data);
          setActiveVault(vaultData.data);
        }
        if (srcData.success) {
          setSources(srcData.data.sources);
          const found = srcData.data.sources.find((s: Source) => s.id === sourceId);
          if (found) {
            setSource(found);
            setEditedCitation(generateOnTheFlyCitationValue(found, "APA"));
          }
        }
        const annRes = await apiFetch(`/api/vault/${vaultId}/source/${sourceId}/annotation`);
        const annData = await annRes.json();
        if (annData.success) setAnnotations(annData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vaultId, sourceId]);

  useEffect(() => {
    if (source && citationDrawerOpen) {
      setEditedCitation(generateOnTheFlyCitationValue(source, citationFormat));
    }
  }, [citationFormat, citationDrawerOpen]);

  const handleTriggerQAProcess = async (sid: string) => {
    if (!vault) return;
    try {
      const res = await apiFetch(`/api/vault/${vault.id}/source/${sid}/process-for-qa`, { method: "POST" });
      const data = await res.json();
      if (data.success && source) {
        const updated = { ...source, chunksProcessed: true };
        setSource(updated);
        setSources((prev) => prev.map((s) => s.id === sid ? { ...s, chunksProcessed: true } : s));
      }
    } catch (err) { console.error(err); }
  };

  const handleCopyCitationText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(true);
    setTimeout(() => setCopiedStates(false), 2000);
  };

  if (loading) return <div className="max-w-7xl mx-auto"><SkeletonSourceDetailPage /></div>;

  if (!source || !vault) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="font-mono text-stone-500">Source not found.</p>
        <button onClick={() => router.push("/dashboard")} className="neo-btn px-4 py-2 text-xs">← Back to Dashboard</button>
      </div>
    );
  }

  return (
    <SourceDetailPage
      activeSource={source}
      activeVault={vault}
      annotations={annotations}
      citationDrawerOpen={citationDrawerOpen}
      setCitationDrawerOpen={setCitationDrawerOpen}
      citationFormat={citationFormat}
      setCitationFormat={setCitationFormat}
      editedCitation={editedCitation}
      setEditedCitation={setEditedCitation}
      copiedStates={copiedStates}
      setCopiedStates={setCopiedStates}
      handleTriggerQAProcess={handleTriggerQAProcess}
      handleNavigateScreen={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
      }}
      loadVaultDetail={() => router.push("/dashboard")}
      setSources={setSources}
      setActiveSource={setSource}
      setAnnotations={setAnnotations}
      setActiveAnnotation={setActiveAnnotation}
      setCurrentScreen={() => { /* handled by onNavigateToAnnotationDetail */ }}
      onNavigateToAnnotationDetail={(ann) => {
        router.push(`/annotation/${vaultId}/${sourceId}/${ann.id}`);
      }}
      handleOpenAddAnnotationWorkspace={() => {
        router.push(`/annotation-workspace/${vaultId}/${sourceId}`);
      }}
      handleOpenEditAnnotationWorkspace={(ann) => {
        router.push(`/annotation-workspace/${vaultId}/${sourceId}?annotationId=${ann.id}`);
      }}
      generateOnTheFlyCitationValue={generateOnTheFlyCitationValue}
      handleCopyCitationText={handleCopyCitationText}
    />
  );
}
