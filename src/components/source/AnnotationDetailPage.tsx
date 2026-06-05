"use client";

import React from "react";
import { Source, Vault, Annotation } from "@/types";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import {
  Telescope, Users, Edit3, Eye, CircleDot, Sparkles, Check, BookOpen, FileText,
  ArrowUpRight, ChevronDown, ChevronRight, Award, Compass, Cpu, StickyNote
} from "lucide-react";

interface AnnotationDetailPageProps {
  activeAnnotation: Annotation;
  activeSource: Source | null;
  activeVault: Vault | null;
  annotations: Annotation[];
  detailRoomPresence: any[];
  detailLiveUpdate: {
    newVersion: number;
    byUser: string;
    time: string;
  } | null;
  setDetailLiveUpdate: (v: any) => void;
  setActiveAnnotation: React.Dispatch<React.SetStateAction<Annotation | null>>;
  handleNavigateScreen: (screen: string) => void;
  loadVaultDetail: (id: string) => void;
  loadSourceDetail: (id: string) => void;
  workspaceRefPaneTab: "summary" | "insights" | "annotations" | "document";
  setWorkspaceRefPaneTab: (tab: "summary" | "insights" | "annotations" | "document") => void;
  expandedRefAnnotations: Record<string, boolean>;
  setExpandedRefAnnotations: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const AnnotationDetailPage: React.FC<AnnotationDetailPageProps> = ({
  activeAnnotation,
  activeSource,
  activeVault,
  annotations,
  detailRoomPresence,
  detailLiveUpdate,
  setDetailLiveUpdate,
  setActiveAnnotation,
  handleNavigateScreen,
  loadVaultDetail,
  loadSourceDetail,
  workspaceRefPaneTab,
  setWorkspaceRefPaneTab,
  expandedRefAnnotations,
  setExpandedRefAnnotations,
}) => {
  const truncateText = (str: string, maxLen: number = 22) => {
    if (!str) return "";
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "...";
  };

  return (
    <div className="space-y-6">
      {/* header breadcrumb row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-neo-dark pb-3">
        <div>
          <div className="text-xs font-mono font-bold text-stone-500 uppercase flex flex-wrap items-center gap-1.5 leading-relaxed">
            <button
              onClick={() => handleNavigateScreen("dashboard")}
              className="hover:underline hover:text-neo-dark whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => {
                if (activeVault) loadVaultDetail(activeVault.id);
              }}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors"
              title={activeVault?.name}
            >
              <span className="sm:hidden">{truncateText(activeVault?.name || "Vault", 12)}</span>
              <span className="hidden sm:inline">{activeVault?.name || "Vault"}</span>
            </button>
            <span>/</span>
            <button
              onClick={() => {
                if (activeSource) loadSourceDetail(activeSource.id);
              }}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors"
              title={activeSource?.title}
            >
              <span className="sm:hidden">{truncateText(activeSource?.title || "Source", 12)}</span>
              <span className="hidden sm:inline">{activeSource?.title || "Source"}</span>
            </button>
            <span>/</span>
            <span className="text-neo-dark font-black">Focus study room</span>
          </div>

          <h2 className="font-display font-black text-xl md:text-2xl mt-1 tracking-tight flex items-center gap-2">
            <Telescope className="w-6 h-6 text-neo-dark stroke-[2.5]" />
            Focus annotation studies
          </h2>
        </div>

        <button
          onClick={() => {
            if (activeSource) loadSourceDetail(activeSource.id);
          }}
          className="px-4 py-2 border-2 border-neo-dark font-bold font-display text-xs cursor-pointer hover:bg-stone-50 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_#0A0A0A]"
        >
          ← Back to document Analysis
        </button>
      </div>

      <div className="space-y-6">
        {/* Row 1: Annotation (Primary Study Note) and Collaboration Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Study note workspace panel */}
          <div className="lg:col-span-2 bg-white rounded neo-border p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b-2 border-stone-200 pb-2">
                <div className="font-display font-medium text-xs text-stone-500 flex items-center gap-2">
                  <span>Page reference:</span>
                  <span className="font-semibold text-neo-dark bg-amber-50 px-2 py-0.5 rounded border border-neo-dark font-mono font-bold uppercase select-none">
                    Page {activeAnnotation.pageReference || "unspecified"}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 font-mono font-bold">
                  Document ID: {activeAnnotation.sourceId}
                </div>
              </div>

              {/* Annotation HTML output */}
              <div className="bg-neo-bg p-5 rounded neo-border-sm font-sans prose max-w-none text-[13px] leading-relaxed">
                <MarkdownRenderer content={activeAnnotation.contentMarkdown} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 items-center text-[10px] text-stone-500 font-mono pt-4 border-t border-stone-100">
              <span>Inscribed by:</span>
              <span className="font-bold text-neo-dark">{activeAnnotation.author?.name}</span>
              <span>•</span>
              <span>Security track:</span>
              <span className="text-emerald-700 bg-emerald-100 rounded px-1 text-[9px] border border-emerald-300 select-none font-bold">
                SSL Encrypted
              </span>
              <span>•</span>
              <span>Revision tracker:</span>
              <span className="font-bold text-neo-dark">v{activeAnnotation.version}</span>
            </div>
          </div>

          {/* Simulated Live collaborative drawer side-log */}
          <div className="lg:col-span-1 bg-white p-5 rounded neo-border shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-5 h-auto lg:min-h-[450px]">
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-black text-sm text-neo-dark uppercase flex items-center gap-1.5 mb-1.5">
                  <Users className="w-4 h-4 text-rose-500 shrink-0" />
                  Collaborative updates
                </h3>
                <div className="h-1 bg-neo-dark w-full mb-3" />
              </div>

              {/* WHO IS VIEWING AND EDITING */}
              <div className="space-y-2.5">
                <span className="block text-[9px] font-black font-mono text-neo-dark tracking-widest bg-neo-muted border-2 border-neo-dark px-2 py-1 rounded inline-block shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                  ACTIVE PARTICIPANTS
                </span>
                <div className="space-y-2">
                  {detailRoomPresence.map((peer) => (
                    <div 
                      key={peer.id} 
                      className="flex items-center justify-between p-2 rounded-md border-2 border-neo-dark bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <RenderUserAvatar 
                          avatar={peer.avatar} 
                          name={peer.name} 
                          size={28} 
                        />
                        <span className="text-[11px] font-display font-black text-neo-dark truncate">
                          {peer.name}
                        </span>
                      </div>
                      <div>
                        {peer.status === "editing" ? (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase font-mono tracking-wider bg-neo-orange text-white border-2 border-neo-dark px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse">
                            <Edit3 className="w-2.5 h-2.5 stroke-[3] shrink-0" /> Editing
                          </span>
                        ) : peer.status === "viewing" ? (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase font-mono tracking-wider bg-neo-accent text-neo-dark border-2 border-neo-dark px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            <Eye className="w-3 h-3 stroke-[2.5] shrink-0" /> Viewing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase font-mono tracking-wider bg-neo-muted text-stone-600 border-2 border-neo-dark px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            <CircleDot className="w-2.5 h-2.5 stroke-[3] shrink-0" /> Idle
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONCURRENT REVISION STATUS */}
              <div className="space-y-2">
                <span className="block text-[9px] font-black font-mono text-neo-dark tracking-widest bg-neo-muted border-2 border-neo-dark px-2 py-1 rounded inline-block shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                  REVISION STATUS
                </span>
                {detailLiveUpdate ? (
                  <div className="bg-neo-yellow border-2 border-neo-dark p-3 rounded shadow-[3px_3px_0px_rgba(0,0,0,1)] text-[11px] font-mono animate-[pulse_2.5s_infinite]">
                    <div className="font-bold text-neo-dark flex items-center gap-1 mb-1 font-display uppercase tracking-tight text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-neo-orange shrink-0 animate-bounce" />
                      v{detailLiveUpdate.newVersion} LIVE UPDATE DETECTED
                    </div>
                    <p className="text-neo-dark text-[10px] leading-relaxed mb-2">
                      <strong>{detailLiveUpdate.byUser}</strong> saved a new revision at {detailLiveUpdate.time}.
                    </p>
                    <button
                      onClick={() => {
                        setActiveAnnotation((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            version: detailLiveUpdate.newVersion,
                            contentMarkdown: prev.contentMarkdown + `\n\n*Amendment (v${detailLiveUpdate.newVersion} - ${detailLiveUpdate.byUser} at ${detailLiveUpdate.time}):* Concurrently synchronized revision history highlights critical alignment with Transformer dot-product scaling and cross-workspace consensus.`
                          };
                        });
                        setDetailLiveUpdate(null);
                      }}
                      className="w-full text-center py-1.5 bg-neo-dark text-white font-bold font-display uppercase text-[9px] tracking-widest rounded border-2 border-neo-dark shrink-0 transition active:translate-y-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-stone-800 cursor-pointer"
                    >
                      Pull Revision v{detailLiveUpdate.newVersion}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-neo-dark p-3 rounded shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] text-[10px] font-mono text-stone-700 leading-normal">
                    <div className="flex items-center gap-1.5 font-black text-neo-dark mb-1 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-neo-accent stroke-[3] shrink-0" />
                      NO CONFLICTS
                    </div>
                    <span>You are viewing the latest active index (v{activeAnnotation.version}). No external edits detected since load.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t-2 border-neo-dark text-center">
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-emerald-700 tracking-wider">
                SECURE LIVE RECOGNIZER ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Reference Workspace Tabs */}
        {activeSource ? (
          <div className="bg-white border-4 border-neo-dark rounded-xs shadow-[5px_5px_0px_rgba(0,0,0,1)] p-5 flex flex-col min-h-[480px] overflow-hidden">
            <div className="border-b-2 border-stone-200 pb-3 mb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="bg-neo-accent text-neo-dark border-2 border-neo-dark px-2.5 py-1 text-[10px] uppercase font-mono font-black select-none rounded-sm shadow-[1.5px_1.5px_0px_#000] inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                  Context Reference Companion
                </span>
                <h3 className="font-display font-black text-sm text-neo-dark mt-2.5 select-text flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-neo-dark stroke-[2.5]" />
                  <span>{activeSource.title}</span>
                </h3>
                <p className="text-[10px] font-mono text-stone-500 mt-1 select-text">
                  By {activeSource.authors.join(", ") || "Unknown Scholastics"} • {activeSource.year || "n.d."}
                </p>
              </div>
              
              {activeSource.file?.fileUrl && (
                <div className="mt-1 shrink-0">
                  <a
                    href={activeSource.file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-stone-100 hover:bg-stone-200 border-2 border-neo-dark p-2 rounded transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View/Download Attached Source Document
                    <ArrowUpRight className="w-3 h-3 text-stone-600" />
                  </a>
                </div>
              )}
            </div>

            {/* Navigation Tab links */}
            <div className="flex flex-wrap border-b-2 border-neo-dark pb-0 mb-4 bg-stone-100 p-1 rounded-sm gap-1 select-none shrink-0">
              <button
                onClick={() => setWorkspaceRefPaneTab("summary")}
                className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceRefPaneTab === "summary"
                    ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                    : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
                }`}
              >
                <span>Summary / Context</span>
              </button>
              <button
                onClick={() => setWorkspaceRefPaneTab("insights")}
                className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceRefPaneTab === "insights"
                    ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                    : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
                }`}
              >
                <span>Structured Intel</span>
              </button>
              <button
                onClick={() => setWorkspaceRefPaneTab("annotations")}
                className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceRefPaneTab === "annotations"
                    ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                    : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
                }`}
              >
                <span>Prior Annotations ({annotations.length})</span>
              </button>
              <button
                onClick={() => setWorkspaceRefPaneTab("document")}
                className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                  workspaceRefPaneTab === "document"
                    ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                    : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
                }`}
              >
                <span>View Document</span>
              </button>
            </div>

            {/* Dynamic reference pane body */}
            <div className="flex-1 overflow-y-auto select-text pr-1.5 space-y-4 font-sans text-xs text-stone-700 leading-relaxed min-h-[380px]">
              {workspaceRefPaneTab === "summary" && (
                <div className="space-y-3.5">
                  <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-600 stroke-[2.5]" />
                    Source Material Context &amp; Synopses
                  </p>
                  <div className="bg-[#FAF7F2] border-2 border-neo-dark p-4 rounded-sm text-stone-900 leading-relaxed max-h-[380px] overflow-y-auto text-xs whitespace-pre-wrap select-text font-mono shadow-[1.5px_1.5px_0px_#000]">
                    {activeSource.aiSummary || activeSource.extractedText || "No context crawled yet. Please run AI summaries or process the source."}
                  </div>
                </div>
              )}

              {workspaceRefPaneTab === "insights" && (
                <div className="space-y-4">
                  {activeSource.aiInsights ? (
                    <div className="space-y-4">
                      <div className="bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm shadow-[2px_2px_0px_#000]">
                        <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2">
                          <Compass className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                          Research Problem &amp; Scope
                        </h4>
                        <p className="text-stone-800 italic leading-relaxed text-xs">
                          {activeSource.aiInsights.researchProblem}
                        </p>
                      </div>

                      <div className="bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm shadow-[2px_2px_0px_#000]">
                        <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2">
                          <Cpu className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                          Methodological Framework
                        </h4>
                        <p className="text-stone-800 leading-relaxed text-xs">
                          {activeSource.aiInsights.methodology}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-stone-200 pb-1.5 mb-2.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] fill-[#FEF3C7] stroke-[2.5]" />
                          Key Core Findings ({activeSource.aiInsights.keyFindings?.length || 0})
                        </h4>
                        <div className="space-y-2.5">
                          {activeSource.aiInsights.keyFindings?.map((kf, i) => (
                            <div key={i} className="bg-white border-2 border-neo-dark p-3 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-start gap-2.5">
                              <span className={`text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded-xs shrink-0 border-2 border-neo-dark shadow-[1px_1px_0px_#000] ${
                                kf.significance === "High" ? "bg-rose-100 text-rose-955 border-rose-300" :
                                kf.significance === "Medium" ? "bg-amber-100 text-amber-955 border-amber-300" :
                                "bg-stone-100 text-stone-800 border-stone-300"
                              }`}>
                                {kf.significance}
                              </span>
                              <span className="text-[11px] leading-snug select-text text-stone-900 font-display font-medium">
                                {kf.finding}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {activeSource.aiInsights.contributions && activeSource.aiInsights.contributions.length > 0 && (
                        <div className="bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm shadow-[2px_2px_0px_#000]">
                          <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2">
                            <Award className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            Scientific Contributions
                          </h4>
                          <ul className="space-y-1.5 text-xs text-stone-800">
                            {activeSource.aiInsights.contributions.map((c, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 border border-emerald-700 mt-1.5 shrink-0" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded text-stone-400 italic font-mono bg-stone-50/50 text-xs">
                      No AI Insights generated yet. Check &apos;Process for QA Index&apos; details.
                    </div>
                  )}
                </div>
              )}

              {workspaceRefPaneTab === "annotations" && (
                <div className="space-y-3.5">
                  <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-2 mb-3">
                    <StickyNote className="w-3.5 h-3.5 text-neo-dark stroke-[2.5]" />
                    Peer Annotations in Active Document ({annotations.length})
                  </p>
                  {annotations.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-stone-300 bg-[#FAF7F2]/50 text-stone-500 font-mono italic rounded-sm text-xs">
                      No prior notes cached inside current source.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {annotations.map((ann) => {
                        const isExpanded = !!expandedRefAnnotations[ann.id];
                        return (
                          <div key={ann.id} className="bg-white border-2 border-neo-dark rounded-sm p-3.5 shadow-[1.5px_1.5px_0px_#000] space-y-2 text-stone-800">
                            <div 
                              onClick={() => {
                                setExpandedRefAnnotations(prev => ({
                                  ...prev,
                                  [ann.id]: !prev[ann.id]
                                }));
                              }}
                              className="flex justify-between items-center text-[10px] font-mono border-b border-stone-200 pb-2 cursor-pointer select-none group"
                            >
                              <div className="flex items-center gap-1.5">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-stone-600 stroke-[2.5] group-hover:text-neo-dark" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-stone-600 stroke-[2.5] group-hover:text-neo-dark" />
                                )}
                                <span className="font-extrabold text-neo-dark text-xs font-display group-hover:underline">
                                  {ann.author?.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold shrink-0">
                                {ann.pageReference && (
                                  <span className="bg-[#FAF7F2] text-neo-dark border-2 border-neo-dark px-1.5 py-0.5 rounded-xs text-[8px] font-black uppercase tracking-wider shadow-[0.5px_0.5px_0px_#000]">
                                    Page {ann.pageReference}
                                  </span>
                                )}
                                {ann.sectionReference && (
                                  <span className="bg-amber-50 text-amber-955 border border-amber-200 px-1.5 py-0.5 rounded-xs text-[8px] font-extrabold max-w-[90px] truncate" title={ann.sectionReference}>
                                    {ann.sectionReference}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isExpanded ? (
                              <div className="leading-relaxed select-text font-sans text-xs text-stone-850 pt-1">
                                <MarkdownRenderer content={ann.contentMarkdown} />
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setExpandedRefAnnotations(prev => ({
                                    ...prev,
                                    [ann.id]: true
                                  }));
                                }}
                                className="leading-snug select-none text-[11px] text-stone-500 italic truncate cursor-pointer hover:text-stone-800 pt-1"
                              >
                                {ann.contentMarkdown.replace(/[#*`_\[\]]/g, '').slice(0, 150) || "Click to expand note content..."}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {workspaceRefPaneTab === "document" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm select-none shadow-[2px_2px_0px_#000]">
                    <div>
                      <span className="text-[10px] font-mono font-black text-stone-600 uppercase">Attached File Asset</span>
                      <h4 className="font-display font-black text-xs text-neo-dark mt-0.5">{activeSource.file?.fileName || "academic-document.pdf"}</h4>
                    </div>
                    {activeSource.file?.fileUrl && (
                      <div className="flex gap-2.5">
                        <a
                          href={activeSource.file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-neo-yellow text-neo-dark border-2 border-neo-dark px-3 py-1.5 font-black font-mono text-[10px] hover:bg-yellow-400 cursor-pointer shadow-[1.5px_1.5px_0px_#000] inline-flex items-center gap-1.5 active:translate-y-0.5 transition-transform"
                        >
                          <FileText className="w-3.5 h-3.5 stroke-[2]" />
                          Open PDF in Separate Tab
                          <ArrowUpRight className="w-3.5 h-3.5 text-neo-dark stroke-[2.5]" />
                        </a>
                      </div>
                    )}
                  </div>

                  {activeSource.file?.fileUrl ? (
                    <div className="border-4 border-neo-dark rounded-sm overflow-hidden bg-stone-100 flex flex-col h-[520px] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <iframe
                        src={`${activeSource.file.fileUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full flex-grow border-0"
                        title="Source Document File Viewer"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                        <FileText className="w-3.5 h-3.5 text-stone-600 stroke-[2.5]" />
                        Extracted Plain Text Layout
                      </p>
                      <div className="bg-white border-2 border-neo-dark p-4 rounded-sm text-stone-900 leading-relaxed h-[380px] overflow-y-auto text-xs whitespace-pre-wrap select-text font-mono shadow-[1.5px_1.5px_0px_#000]">
                        {activeSource.extractedText || "No text could be extracted or is available for this metadata source entry."}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-stone-50 border-2 border-stone-200 rounded p-6 flex items-center justify-center text-stone-400 font-mono text-xs">
            Loading context source...
          </div>
        )}
      </div>
    </div>
  );
};
