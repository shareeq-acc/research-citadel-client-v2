"use client";

import React from "react";
import { Source, Vault, Annotation } from "@/types";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import {
  FileText, Edit3, PlusCircle, Info, Check, BookOpen, Eye,
  Folder, Terminal, Cpu, Sparkles, ChevronDown, ChevronRight, Compass,
  Award, StickyNote, ArrowUpRight, ArrowRightLeft
} from "lucide-react";

interface AnnotationWorkspacePageProps {
  activeSource: Source;
  activeVault: Vault | null;
  annotations: Annotation[];
  editingAnnotation: Annotation | null;
  workspaceSaving: boolean;
  workspaceError: string | null;
  conflictResult: any | null;
  setConflictResult: (v: any) => void;
  workspacePresenceList: any[];
  workspacePageRef: string;
  setWorkspacePageRef: (v: string) => void;
  workspaceSectionRef: string;
  setWorkspaceSectionRef: (v: string) => void;
  workspaceDraft: string;
  setWorkspaceDraft: React.Dispatch<React.SetStateAction<string>>;
  workspaceEnhancing: boolean;
  workspacePreviousDraft: string;
  handleNavigateScreen: (screen: string) => void;
  loadVaultDetail: (id: string) => void;
  loadSourceDetail: (id: string) => void;
  handleSaveWorkspace: () => void;
  handleAIEnhanceWorkspace: () => void;
  handleRevertAIWorkspace: () => void;
  workspaceRefPaneTab: "summary" | "insights" | "annotations" | "document";
  setWorkspaceRefPaneTab: (tab: "summary" | "insights" | "annotations" | "document") => void;
  expandedRefAnnotations: Record<string, boolean>;
  setExpandedRefAnnotations: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const AnnotationWorkspacePage: React.FC<AnnotationWorkspacePageProps> = ({
  activeSource,
  activeVault,
  annotations,
  editingAnnotation,
  workspaceSaving,
  workspaceError,
  conflictResult,
  setConflictResult,
  workspacePresenceList,
  workspacePageRef,
  setWorkspacePageRef,
  workspaceSectionRef,
  setWorkspaceSectionRef,
  workspaceDraft,
  setWorkspaceDraft,
  workspaceEnhancing,
  workspacePreviousDraft,
  handleNavigateScreen,
  loadVaultDetail,
  loadSourceDetail,
  handleSaveWorkspace,
  handleAIEnhanceWorkspace,
  handleRevertAIWorkspace,
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
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Main workspace breadcrumbs / header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-neo-dark pb-3">
        <div>
          <div className="text-xs font-mono font-bold text-stone-500 uppercase flex flex-wrap items-center gap-1.5 leading-relaxed">
            <button
              onClick={() => handleNavigateScreen("dashboard")}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors"
            >
              Dashboard
            </button>
            <span className="text-stone-300">/</span>
            <button
              onClick={() => activeVault && loadVaultDetail(activeVault.id)}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors"
              title={activeVault?.name}
            >
              {truncateText(activeVault?.name || "Vault", 20)}
            </button>
            <span className="text-stone-300">/</span>
            <button
              onClick={() => activeSource && loadSourceDetail(activeSource.id)}
              className="hover:underline hover:text-neo-dark cursor-pointer transition-colors inline-flex items-center gap-1"
              title={activeSource.title}
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>{truncateText(activeSource.title, 25)}</span>
            </button>
            <span className="text-stone-300">/</span>
            <span className="text-neo-dark font-black">Workspace Composer</span>
          </div>

          <h2 className="font-display font-black text-xl md:text-2xl mt-3 md:mt-1.5 tracking-tight flex items-center gap-2.5 text-neo-dark">
            {editingAnnotation ? (
              <>
                <span className="p-1 bg-[#FFE4E6] text-black border-2 border-neo-dark rounded-xs shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span>Edit Academic Research Note</span>
              </>
            ) : (
              <>
                <span className="p-1 bg-[#FEF3C7] text-black border-2 border-neo-dark rounded-xs shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span>Create Reference Annotation Note</span>
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (activeSource) loadSourceDetail(activeSource.id);
            }}
            className="px-4 py-2 border-2 border-neo-dark bg-white font-bold font-mono text-xs hover:bg-stone-50 cursor-pointer shadow-[1.5px_1.5px_0px_#0A0A0A] active:translate-y-0.5 transition-all"
          >
            ← Cancel &amp; Close Workspace
          </button>
          <button
            onClick={() => handleSaveWorkspace()}
            disabled={workspaceSaving}
            className="px-5 py-2.5 bg-neo-yellow text-neo-dark border-2 border-neo-dark font-black font-display text-xs hover:bg-yellow-400 cursor-pointer shadow-[1.5px_1.5px_0px_#0A0A0A] active:translate-y-0.5 disabled:opacity-50 transition-all"
          >
            {workspaceSaving ? "Inscribing Analysis..." : "Save Annotation Note"}
          </button>
        </div>
      </div>

      {/* Validation Err banner */}
      {workspaceError && (
        <div className="p-3 bg-red-50 border-2 border-red-500 font-bold text-xs text-red-800 font-mono animate-bounce rounded-sm flex items-center gap-2 shadow-[2px_2px_0px_rgba(239,68,68,0.25)]">
          <Info className="w-4 h-4 text-red-600 shrink-0" />
          <span>{workspaceError}</span>
        </div>
      )}

      {/* SCIENTIFIC MERGE CONFLICT RESOLUTION OVERLAY PANEL */}
      {conflictResult && (
        <div className="p-5 bg-white border-4 border-amber-500 rounded-sm shadow-[4px_4px_0px_#F59E0B] animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4">
            <h3 className="font-display font-black text-amber-700 text-sm md:text-base flex items-center gap-2">
              ⚠️ CO-AUTHORED CONCURRENT EDIT CONFLICT SOLVED
            </h3>
            <span className="bg-amber-100 text-amber-800 border border-amber-300 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-xs">
              Synthesis Merged
            </span>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed mb-4">
            {conflictResult.details} Inside this Workspace Composer, the concurrent analytical overlaps between your local edits and peer revisions have been automatically consolidated. Let's inspect the diff resolution below:
          </p>

          {/* Side-by-side drafts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-stone-50 border border-stone-300 rounded p-3">
              <h4 className="text-[10px] font-black font-mono text-stone-500 uppercase mb-2">
                Your Proposed Edits:
              </h4>
              <pre className="text-[10px] font-mono leading-normal text-stone-700 bg-white p-2.5 rounded border border-stone-200 overflow-x-auto max-h-[160px] whitespace-pre-wrap select-text">
                {conflictResult.userProposedDraft}
              </pre>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded p-3">
              <h4 className="text-[10px] font-black font-mono text-amber-700 uppercase mb-2">
                Prof. Adrian Carter's Synced Revisions:
              </h4>
              <pre className="text-[10px] font-mono leading-normal text-stone-700 bg-white p-2.5 rounded border border-stone-200 overflow-x-auto max-h-[160px] whitespace-pre-wrap select-text">
                {conflictResult.colleagueDraft}
              </pre>
            </div>
          </div>

          {/* Consolidated block results */}
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded p-4 mb-5">
            <h4 className="text-[11px] font-black font-mono text-emerald-800 uppercase mb-2 flex items-center gap-1.5">
              ✨ Unified Consolidated Synthesis (Constructed directly in Editor):
            </h4>
            <div className="bg-white p-3 rounded border border-emerald-200 max-h-[200px] overflow-y-auto font-mono text-xs text-stone-800 leading-relaxed select-text shadow-sm whitespace-pre-wrap">
              {conflictResult.mergedContent}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setConflictResult(null);
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white border-2 border-neo-dark font-black font-display text-xs hover:bg-emerald-700 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />
              Keep Unified Draft &amp; Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Main workspace layout */}
      <div className="space-y-6 flex flex-col items-stretch">
        
        {/* ROW 1: ACADEMIC COMPOSER */}
        <div className="bg-white border-4 border-neo-dark rounded-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] p-5 flex flex-col h-auto md:h-[680px] md:overflow-hidden">
          
          {/* REAL-TIME PRESENCE & TEAM COLLABORATION CONTROLS */}
          <div className="mb-4 bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 shadow-[2px_2px_0px_#000]">
            {/* Left: Active Co-scholars visual list */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-semibold text-stone-750">
              <div className="text-[10px] font-black font-mono text-stone-800 uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block border border-emerald-700" />
                Workspace Peer presence ({workspacePresenceList.length}):
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {workspacePresenceList.map((peer, pIdx) => (
                  <div key={peer.userId || pIdx} className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border-2 border-neo-dark rounded-sm shadow-[1.5px_1.5px_0px_#000] transition-transform hover:-translate-y-0.5 select-none shrink-0">
                    <RenderUserAvatar 
                      avatar={peer.avatar} 
                      name={peer.name} 
                      size={18} 
                    />
                    <span className="text-[10px] font-black font-display text-neo-dark truncate max-w-[120px]">{peer.name}</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black font-mono uppercase rounded-xs border-2 border-neo-dark ${
                      peer.status === "editing" 
                        ? "bg-amber-100 text-amber-900 border-amber-300" 
                        : "bg-emerald-50 text-emerald-900 border-emerald-300"
                    }`}>
                      {peer.status === "editing" ? (
                        <>
                          <Edit3 className="w-2.5 h-2.5 text-amber-700 stroke-[3]" />
                          <span>Editing</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                          <span>Viewing</span>
                        </>
                      )}
                    </span>
                  </div>
                ))}
                {workspacePresenceList.length === 0 && (
                  <span className="text-[10px] italic text-stone-500 font-mono">Syncing workspace sessions...</span>
                )}
              </div>
            </div>

            {/* Right: placeholder for future controls */}
            <div className="shrink-0" />
          </div>

          {/* Reference locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3.5 border-b-2 border-stone-200 shrink-0 mb-3 bg-[#FAF7F2] p-3 rounded-xs border-2 border-neo-dark shadow-[2px_2px_0px_#000]">
            <div>
              <label className="block text-[10px] font-black font-mono text-neo-dark uppercase mb-1.5 flex items-center gap-1.5 select-none">
                <BookOpen className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                Reference Location (Page Number)
              </label>
              <input
                type="number"
                value={workspacePageRef}
                onChange={(e) => setWorkspacePageRef(e.target.value)}
                placeholder="e.g. 4"
                className="w-full neo-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-neo-dark uppercase mb-1.5 flex items-center gap-1.5 select-none">
                <Folder className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                Section Name / Subsection Title
              </label>
              <input
                type="text"
                value={workspaceSectionRef}
                onChange={(e) => setWorkspaceSectionRef(e.target.value)}
                placeholder="e.g. Section 3.2: Multi-Head Attention"
                className="w-full neo-input text-xs font-mono"
              />
            </div>
          </div>

          {/* TWO PANEL ACADEMIC COMPOSER & LIVE PREVIEW SPLIT */}
          <div className="flex-1 md:overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 md:min-h-0">
            
            {/* SOURCE CODE TEXT COMPILER */}
            <div className="flex flex-col md:h-full md:overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 shrink-0 select-none">
                <span className="text-[10px] font-black font-mono text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  Markdown Editor
                </span>
                
                {/* Assistant enhancers */}
                <div className="flex items-center gap-1.5">
                  {workspaceDraft.trim() && (
                    <button
                      type="button"
                      onClick={handleAIEnhanceWorkspace}
                      disabled={workspaceEnhancing}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-400 rounded px-2.5 py-1 text-[9px] font-bold font-mono flex items-center gap-1 cursor-pointer active:translate-y-0.5"
                    >
                      <Cpu className="w-3 h-3 text-purple-800 shrink-0" />
                      {workspaceEnhancing ? "AI Rendering..." : "AI Enhance"}
                    </button>
                  )}
                  {workspacePreviousDraft && (
                    <button
                      type="button"
                      onClick={handleRevertAIWorkspace}
                      className="bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded px-2.5 py-1 text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-stone-600 shrink-0" />
                      Revert
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-[160px] flex flex-col relative">
                <textarea
                  value={workspaceDraft}
                  onChange={(e) => setWorkspaceDraft(e.target.value)}
                  required
                  placeholder="Inscribe reference annotations. You can format with Markdown like headers (#, ##), bold (**, __), italic, bullet lists, custom blockquotes, or detailed code snippets."
                  className="w-full h-44 md:h-full p-3 font-mono text-xs border-2 border-neo-dark bg-stone-50/50 rounded-sm focus:outline-none focus:bg-white leading-relaxed select-text resize-none overflow-y-auto"
                />
              </div>

              {/* Formatting quick toolbar helper */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1 bg-stone-100 border border-stone-200 p-1.5 rounded-sm shrink-0 select-none">
                <span className="text-[8px] font-bold font-mono text-stone-500 uppercase mr-1">
                  Insert:
                </span>
                {[
                  { label: "H1", value: "# " },
                  { label: "H2", value: "## " },
                  { label: "H3", value: "### " },
                  { label: "Bold", value: "**text**" },
                  { label: "Italic", value: "*text*" },
                  { label: "Bullet", value: "- " },
                  { label: "Blockquote", value: "> " },
                  { label: "Code", value: "```python\n# code block\n```" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => {
                      setWorkspaceDraft((prev) => {
                        const addNL = prev.length > 0 && !prev.endsWith("\n");
                        return prev + (addNL ? "\n" : "") + btn.value;
                      });
                    }}
                    className="bg-white hover:bg-stone-50 border border-stone-300 text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-[0.5px_0.5px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="flex flex-col md:h-full md:overflow-hidden border-t-2 md:border-t-0 md:border-l-2 border-stone-200 pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center justify-between mb-1.5 shrink-0 select-none">
                <span className="text-[10px] font-black font-mono text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  Parsed Preview
                </span>
                <span className="text-[9px] font-mono bg-stone-100 text-stone-500 border px-1.5 py-0.5 rounded">
                  {workspaceDraft.length} chars
                </span>
              </div>

              <div className="flex-1 bg-white border-2 border-dashed border-stone-300 rounded p-3 overflow-y-auto select-text min-h-[160px] h-44 md:h-full">
                {workspaceDraft.trim() ? (
                  <div className="prose max-w-none text-xs leading-relaxed text-stone-850 space-y-2">
                    <MarkdownRenderer content={workspaceDraft} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 p-8 select-none">
                    <Sparkles className="w-7 h-7 text-stone-300 animate-pulse mb-1.5" />
                    <p className="text-[11px] italic font-sans max-w-xs">
                      Your formatted mathematics, annotations and structured bullets will transform here...
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ROW 2: REFERENCE COMPANION */}
        <div className="bg-white border-4 border-neo-dark rounded-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] p-5 flex flex-col min-h-[480px] overflow-hidden">
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
              <p className="text-[10px] font-mono text-stone-500 mt-1 select-text font-semibold">
                By {activeSource.authors.join(", ") || "Unknown Scholastics"} • {activeSource.year || "n.d."}
              </p>
            </div>
            
            {activeSource.file?.fileUrl && (
              <div className="mt-1 shrink-0 select-none">
                <a
                  href={activeSource.file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono bg-stone-100 hover:bg-stone-200 border-2 border-neo-dark p-2 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 stroke-[2]" />
                  View/Download Attached Source Document
                  <ArrowUpRight className="w-3 h-3 text-stone-600 stroke-[2.5]" />
                </a>
              </div>
            )}
          </div>

          {/* Navigation Tab links */}
          <div className="flex flex-wrap border-b-2 border-neo-dark pb-0 mb-4 bg-stone-100 p-1 rounded-sm gap-1 select-none shrink-0">
            <button
              onClick={() => setWorkspaceRefPaneTab("summary")}
              className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer ${
                workspaceRefPaneTab === "summary"
                  ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                  : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
              }`}
            >
              Summary / Context
            </button>
            <button
              onClick={() => setWorkspaceRefPaneTab("insights")}
              className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer ${
                workspaceRefPaneTab === "insights"
                  ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                  : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
              }`}
            >
              Structured Intel
            </button>
            <button
              onClick={() => setWorkspaceRefPaneTab("annotations")}
              className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer ${
                workspaceRefPaneTab === "annotations"
                  ? "bg-neo-dark text-white border-neo-dark rounded-xs shadow-[1px_1px_0px_#0A0A0A]"
                  : "bg-transparent text-stone-600 hover:bg-stone-50 border-transparent shadow-none"
              }`}
            >
              Prior Annotations ({annotations.length})
            </button>
            <button
              onClick={() => setWorkspaceRefPaneTab("document")}
              className={`py-1.5 px-3 font-display font-black text-[11px] uppercase border transition-all cursor-pointer ${
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
                <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-1.5 select-none">
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
                      <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2 select-none">
                        <Compass className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                        Research Problem &amp; Scope
                      </h4>
                      <p className="text-stone-800 italic leading-relaxed text-xs">
                        {activeSource.aiInsights.researchProblem}
                      </p>
                    </div>

                    <div className="bg-[#FAF7F2] border-2 border-neo-dark p-3.5 rounded-sm shadow-[2px_2px_0px_#000]">
                      <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2 select-none">
                        <Cpu className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                        Methodological Framework
                      </h4>
                      <p className="text-stone-800 leading-relaxed text-xs">
                        {activeSource.aiInsights.methodology}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-stone-200 pb-1.5 mb-2.5 select-none">
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
                        <h4 className="font-mono text-[10px] font-black text-neo-dark uppercase tracking-wide flex items-center gap-1.5 border-b border-neo-dark pb-1.5 mb-2 select-none">
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
                  <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded text-stone-400 italic font-mono bg-stone-50/50 text-xs select-none">
                    No AI Insights generated yet. Check &apos;Process for QA Index&apos; details.
                  </div>
                )}
              </div>
            )}

            {workspaceRefPaneTab === "annotations" && (
              <div className="space-y-3.5 font-semibold text-stone-750">
                <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-2 mb-3 select-none">
                  <StickyNote className="w-3.5 h-3.5 text-neo-dark stroke-[2.5]" />
                  Peer Annotations in Active Document ({annotations.length})
                </p>
                {annotations.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-stone-300 bg-[#FAF7F2]/50 text-stone-500 font-mono italic rounded-sm text-xs select-none">
                    No prior notes cached inside current source.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {annotations.map((ann) => {
                      const isExpanded = !!expandedRefAnnotations[ann.id];
                      return (
                        <div key={ann.id} className="bg-white border-2 border-neo-dark rounded-sm p-3.5 shadow-[1.5px_1.5px_0px_#000] space-y-2 text-stone-800">
                          {/* Toggle header */}
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
                          
                          {/* Collapsible body content */}
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
                  <div className="border-4 border-neo-dark rounded-sm overflow-hidden bg-stone-100 flex flex-col h-[520px] shadow-[4px_4px_0px_rgba(0,0,0,1)] select-none">
                    <iframe
                      src={`${activeSource.file.fileUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full flex-grow border-0"
                      title="Source Document File Viewer"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="font-mono text-[10px] font-black uppercase text-stone-700 flex items-center gap-1.5 border-b border-stone-200 pb-1.5 select-none font-semibold">
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

      </div>
    </div>
  );
};
