"use client";

import React from "react";
import { Source, Vault, Annotation } from "@/types";
import InsightsSection from "@/components/source/InsightsSection";
import AnnotationsSection from "@/components/source/AnnotationsSection";
import { 
  FileText, BookOpen, ArrowLeft, ArrowUpRight, Copy, Check, StickyNote 
} from "lucide-react";

interface SourceDetailPageProps {
  activeSource: Source;
  activeVault: Vault | null;
  annotations: Annotation[];
  citationDrawerOpen: boolean;
  setCitationDrawerOpen: (open: boolean) => void;
  citationFormat: "APA" | "MLA" | "CHICAGO" | "BIBTEX" | "IEEE";
  setCitationFormat: (fmt: "APA" | "MLA" | "CHICAGO" | "BIBTEX" | "IEEE") => void;
  editedCitation: string;
  setEditedCitation: (v: string) => void;
  copiedStates: boolean;
  setCopiedStates: (v: boolean) => void;
  handleTriggerQAProcess: (srcId: string) => void;
  handleNavigateScreen: (screen: string) => void;
  loadVaultDetail: (vaultId: string) => void;
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  setActiveSource: (src: Source) => void;
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  setActiveAnnotation: (ann: Annotation) => void;
  setCurrentScreen: (screen: string) => void;
  handleOpenAddAnnotationWorkspace: () => void;
  handleOpenEditAnnotationWorkspace: (ann: Annotation) => void;
  generateOnTheFlyCitationValue: (source: Source, fmt: "APA" | "MLA" | "CHICAGO" | "BIBTEX" | "IEEE") => string;
  handleCopyCitationText: (text: string) => void;
  // Next.js navigation override — when provided, used instead of setCurrentScreen
  onNavigateToAnnotationDetail?: (ann: Annotation) => void;
}

export const SourceDetailPage: React.FC<SourceDetailPageProps> = ({
  activeSource,
  activeVault,
  annotations,
  citationDrawerOpen,
  setCitationDrawerOpen,
  citationFormat,
  setCitationFormat,
  editedCitation,
  setEditedCitation,
  copiedStates,
  setCopiedStates,
  handleTriggerQAProcess,
  handleNavigateScreen,
  loadVaultDetail,
  setSources,
  setActiveSource,
  setAnnotations,
  setActiveAnnotation,
  setCurrentScreen,
  handleOpenAddAnnotationWorkspace,
  handleOpenEditAnnotationWorkspace,
  generateOnTheFlyCitationValue,
  handleCopyCitationText,
  onNavigateToAnnotationDetail,
}) => {
  const truncateText = (str: string, maxLen: number = 22) => {
    if (!str) return "";
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs header row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-neo-dark pb-3">
        <div>
          <div className="text-xs font-mono font-bold text-stone-500 uppercase flex flex-wrap items-center gap-1.5 leading-relaxed">
            <button
              onClick={() => handleNavigateScreen("dashboard")}
              className="hover:underline hover:text-neo-dark whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dashboard
            </button>
            <span className="text-stone-400">/</span>
            <button
              onClick={() => {
                if (activeVault) loadVaultDetail(activeVault.id);
              }}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors"
              title={activeVault?.name}
            >
              <span className="sm:hidden">{truncateText(activeVault?.name || "Vault", 12)}</span>
              <span className="hidden sm:inline">{activeVault?.name}</span>
            </button>
            <span className="text-stone-400">/</span>
            <span className="text-neo-dark font-black" title={activeSource.title}>
              <span className="sm:hidden">{truncateText(activeSource.title || "Source", 12)}</span>
              <span className="hidden sm:inline">{activeSource.title}</span>
            </span>
          </div>

          <h2 className="font-display font-black text-xl md:text-2xl mt-4 sm:mt-1.5 tracking-tight scale-x-[0.99] leading-tight flex items-center gap-2.5 text-neo-dark">
            <span className="p-1 bg-neo-orange text-white border-2 border-neo-dark rounded-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 stroke-[2.5]" />
            </span>
            <span>{activeSource.title}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCitationDrawerOpen(true)}
            className="bg-neo-yellow text-neo-dark px-4.5 py-2.5 border-2 border-neo-dark shadow-[1.5px_1.5px_0px_#0A0A0A] font-bold font-display text-xs cursor-pointer flex items-center gap-1.5 active:translate-y-0.5"
          >
            <BookOpen className="w-4 h-4 text-neo-dark stroke-[2.5]" />
            Generate Citation Drawer
          </button>
          <button
            onClick={() => {
              if (activeVault) loadVaultDetail(activeVault.id);
            }}
            className="px-4 py-2.5 border-2 border-neo-dark font-bold font-display text-xs cursor-pointer hover:bg-stone-50 active:translate-y-0.5"
          >
            ✕ Close Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Primary Analysis Blocks row column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: ATTACHED FILE VIEW */}
          <div className="bg-white p-5 rounded neo-border neo-shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-neo-accent p-3 rounded-sm border-2 border-neo-dark shadow-[1.5px_1.5px_0px_#0a0a0a] text-neo-dark">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-neo-dark leading-tight">
                  Attached Reference Asset: {activeSource.file?.fileName || "Crawl metadata link"}
                </h3>
                <p className="font-mono text-[10px] text-stone-500 mt-0.5">
                  Type: {activeSource.sourceType} • Size: {(activeSource.file?.fileSize || 0) > 0 ? `${((activeSource.file?.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB` : "Metadata only"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 select-none justify-center sm:justify-end w-full sm:w-auto">
              {/* Processing triggers indicator bounds check */}
              {!activeSource.chunksProcessed ? (
                <button
                  onClick={() => handleTriggerQAProcess(activeSource.id)}
                  className="bg-neo-orange border-2 border-neo-dark text-white shadow-[1.5px_1.5px_0px_#0A0A0A] font-bold font-display px-3 py-1.5 text-xs cursor-pointer hover:-translate-y-0.5 transition-transform shrink-0"
                >
                  🚀 Process for QA Index
                </button>
              ) : (
                <span className="text-[10px] font-mono font-black uppercase bg-emerald-50/90 text-emerald-950 border-2 border-neo-dark px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 select-none shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-700 shrink-0" />
                  <span>
                    <span className="hidden sm:inline">Grounded &amp; Semantic </span>Indexed
                  </span>
                </span>
              )}

              {activeSource.file?.fileUrl && (
                <a
                  href={activeSource.file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold font-display border-2 border-neo-dark px-2.5 py-1.5 hover:bg-stone-50 flex items-center gap-1 active:translate-y-0.5 shrink-0"
                >
                  Retrieve PDF File
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                </a>
              )}
            </div>
          </div>

          {/* SECTION 2 & 3: SUMMARY & KEY FINDINGS DTO */}
          <InsightsSection
            vaultId={activeVault?.id || ""}
            source={activeSource}
            myRole={activeVault?.myRole || "VIEWER"}
            onSourceUpdated={(updated) => {
              setActiveSource(updated);
              setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            }}
          />

        </div>

        {/* Sidebar Annotations section inline list */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded neo-border neo-shadow-sm sticky top-24">
            <h3 className="font-display font-black text-sm mb-3.5 border-b-2 border-stone-300 pb-2.5 flex items-center gap-2.5 text-neo-dark uppercase tracking-tight">
              <div className="p-1.5 bg-neo-yellow border-2 border-neo-dark rounded-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <StickyNote className="w-4 h-4 text-neo-dark stroke-[2.5]" />
              </div>
              <span>Reference annotations notes</span>
            </h3>

            <AnnotationsSection
              vaultId={activeVault?.id || ""}
              sourceId={activeSource.id}
              myRole={activeVault?.myRole || "VIEWER"}
              annotations={annotations}
              onAnnotationDeleted={(annId) =>
                setAnnotations((prev) => prev.filter((a) => a.id !== annId))
              }
              onNavigateToDetail={(annId) => {
                const matched = annotations.find((a) => a.id === annId);
                if (matched) {
                  setActiveAnnotation(matched);
                  if (onNavigateToAnnotationDetail) {
                    onNavigateToAnnotationDetail(matched);
                  } else {
                    setCurrentScreen("annotation-detail");
                  }
                }
              }}
              onTriggerAddAnnotation={handleOpenAddAnnotationWorkspace}
              onTriggerEditAnnotation={handleOpenEditAnnotationWorkspace}
            />
          </div>
        </div>

      </div>

      {/* CITATIONS SLIDEOUT DIAG PANEL SCREEN DRAWER */}
      {citationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-neo-dark/30 backdrop-blur-xs">
          
          <div className="w-full max-w-md h-full bg-white border-l-4 border-neo-dark p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b-4 border-neo-dark pb-3">
                <h3 className="font-display font-black text-lg flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-neo-yellow" />
                  academic reference citations
                </h3>
                <button
                  onClick={() => setCitationDrawerOpen(false)}
                  className="text-stone-500 hover:text-stone-900 font-bold font-mono text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Format Tab selectors switcher bar */}
              <div className="grid grid-cols-3 gap-1.5 border-2 border-neo-dark p-1 rounded-sm bg-stone-50 select-none">
                {(["APA", "MLA", "CHICAGO", "BIBTEX", "IEEE"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      setCitationFormat(fmt);
                      setCopiedStates(false);
                    }}
                    className={`text-[10px] py-1 font-bold font-mono border border-transparent rounded cursor-pointer ${
                      citationFormat === fmt ? "bg-neo-yellow border-neo-dark font-black" : "hover:bg-stone-200"
                    }`}
                  >
                    {fmt} format
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                    Formulated reference output (editable):
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSource) {
                        setEditedCitation(generateOnTheFlyCitationValue(activeSource, citationFormat));
                      }
                    }}
                    className="text-[10px] text-neo-orange font-bold font-mono hover:underline cursor-pointer"
                    title="Revert back to auto-generated format"
                  >
                    [Revert Changes]
                  </button>
                </div>
                {/* Real structured citation computed values text panel */}
                <div className="relative">
                  <textarea
                    value={editedCitation}
                    onChange={(e) => setEditedCitation(e.target.value)}
                    rows={6}
                    className="w-full text-xs p-3.5 border-3 border-neo-dark bg-stone-50 rounded text-neo-dark font-sans leading-relaxed focus:bg-amber-50/20 focus:outline-hidden focus:ring-2 focus:ring-neo-orange resize-y shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                    placeholder="Click here or type to edit citation citation..."
                  />
                </div>

                <button
                  onClick={() => handleCopyCitationText(editedCitation)}
                  className="w-full neo-btn py-3 text-xs flex items-center justify-center gap-2"
                >
                  {copiedStates ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 animate-pulse" />
                      Citation vector copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy parsed reference citation
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-stone-400 font-mono italic text-center pt-4 border-t border-dashed border-stone-200">
              Formatted dynamically locally using core workspace citation algorithms.
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
