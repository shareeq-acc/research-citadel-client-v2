"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send, Sparkles, Trash2, BookOpen, ChevronLeft, ChevronRight,
  Filter, Loader2, SlidersHorizontal, Cpu, RefreshCw, CheckCircle2,
  AlertCircle, Zap,
} from "lucide-react";
import { Source } from "@/types";
import { vaultService, sourceService } from "@/services";
import { useApp } from "@/context/AppContext";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  sources?: Array<{ sourceId: string; title: string; similarity: number }>;
  chunksUsed?: number;
  timestamp: string;
}

interface QAPanelProps {
  vaultId: string;
  /** Initial sources passed from parent — panel will also fetch live. */
  sources: Source[];
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  "What is the primary methodology used?",
  "What are the central research findings?",
  "What are the main limitations identified?",
  "Summarise the key contributions.",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function QAPanel({ vaultId, sources: initialSources }: QAPanelProps) {
  const { refreshCurrentUser } = useApp();
  // ── Source state (fetched live) ──────────────────────────────────────────
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [loadingSources, setLoadingSources] = useState(false);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  /** Per-source error message shown inside the unindexed card. */
  const [indexErrors, setIndexErrors] = useState<Record<string, string>>({});

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Welcome to the Research Citadel Ask Engine. I synthesise answers grounded strictly in the academic sources in this vault. Select sources in the sidebar, then ask anything.",
      timestamp: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);

  // ── Sidebar state ─────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const feedRef = useRef<HTMLDivElement>(null);

  // ── Fetch sources live ────────────────────────────────────────────────────

  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const res = await sourceService.listSources(vaultId);
      if (res.success) setSources(res.data.sources);
    } catch { /* keep existing */ } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId]);

  // Auto-scroll on new message
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // ── Index a source for Q&A ────────────────────────────────────────────────

  const handleIndexSource = async (sourceId: string) => {
    setIndexingId(sourceId);
    // Clear any previous error for this source
    setIndexErrors((prev) => { const next = { ...prev }; delete next[sourceId]; return next; });

    try {
      // First try the fast path: text is already extracted, just chunk it
      const res = await sourceService.processForQa(vaultId, sourceId);
      if (res.success) {
        setSources((prev) =>
          prev.map((s) => s.id === sourceId ? { ...s, chunksProcessed: true } : s)
        );
        setSelectedIds((prev) => new Set([...prev, sourceId]));
        return;
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const isNoText = msg.toLowerCase().includes("no extracted text") ||
                       msg.toLowerCase().includes("extracted text available");

      if (!isNoText) {
        // Not a recoverable error — show it and stop
        setIndexErrors((prev) => ({ ...prev, [sourceId]: friendlyError(msg) }));
        setIndexingId(null);
        return;
      }

      // No text yet → try the full extract-and-index pipeline
      try {
        const res2 = await sourceService.extractAndIndex(vaultId, sourceId);
        if (res2.success) {
          setSources((prev) =>
            prev.map((s) => s.id === sourceId ? { ...s, chunksProcessed: true } : s)
          );
          setSelectedIds((prev) => new Set([...prev, sourceId]));
          return;
        }
      } catch (err2: any) {
        setIndexErrors((prev) => ({
          ...prev,
          [sourceId]: friendlyError(err2?.message ?? "Indexing failed."),
        }));
        setIndexingId(null);
        return;
      }
    }

    setIndexingId(null);
  };

  // ── Send question ─────────────────────────────────────────────────────────

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await vaultService.ask(vaultId, {
        question: trimmed,
        sourceIds: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
      });

      const aiMsg: Message = res.success
        ? {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: res.data.answer,
            sources: res.data.sources,
            chunksUsed: res.data.chunksUsed,
            timestamp: now(),
          }
        : {
            id: `ai-err-${Date.now()}`,
            sender: "ai",
            text: `⚠️ ${res.message || "Request failed."}`,
            timestamp: now(),
          };

      setMessages((prev) => [...prev, aiMsg]);
      if (res.success) await refreshCurrentUser();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ ${err?.message || "A network error occurred."}`,
          timestamp: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Conversation cleared. Grounded research synthesizer online. What would you like to investigate?",
        timestamp: now(),
      },
    ]);
  };

  const toggleSource = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const indexedSources = sources.filter((s) => s.chunksProcessed);
  const unindexedSources = sources.filter((s) => !s.chunksProcessed);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-auto lg:h-[780px] items-stretch border-4 border-neo-dark rounded-sm shadow-[4px_4px_0px_#000] overflow-hidden">

      {/* ── Sidebar ── */}
      {sidebarOpen ? (
        <div className="w-full lg:w-72 shrink-0 bg-white border-r-4 border-neo-dark flex flex-col h-auto lg:h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-2 border-neo-dark bg-stone-50">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neo-orange shrink-0" />
              <span className="font-display font-black text-xs uppercase tracking-wider text-neo-dark">
                Source Scope
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-stone-100 border-2 border-neo-dark rounded cursor-pointer transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-neo-dark" />
            </button>
          </div>

          {/* Source list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Refresh row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-black text-stone-400 uppercase tracking-widest">
                {sources.length} source{sources.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={fetchSources}
                disabled={loadingSources}
                className="flex items-center gap-1 text-[9px] font-mono font-bold text-stone-500 hover:text-neo-dark border border-stone-300 hover:border-neo-dark px-1.5 py-0.5 rounded cursor-pointer transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loadingSources ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {sources.length === 0 && !loadingSources && (
              <p className="text-xs text-stone-400 italic font-mono text-center py-6">
                No sources in this vault.
              </p>
            )}

            {/* Indexed sources */}
            {indexedSources.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Indexed for Q&A ({indexedSources.length})
                </p>
                {indexedSources.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSource(s.id)}
                      className={`w-full text-left p-2.5 rounded-sm border-2 transition-all cursor-pointer text-xs select-none ${
                        isSelected
                          ? "bg-amber-50 border-neo-dark shadow-[2px_2px_0px_#000] -translate-y-0.5"
                          : "bg-white border-stone-200 hover:border-neo-dark hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Checkbox */}
                        <div className={`mt-0.5 w-4 h-4 rounded-xs border-2 border-neo-dark flex items-center justify-center shrink-0 ${isSelected ? "bg-neo-dark" : "bg-white"}`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 stroke-[3.5] text-neo-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-sans font-bold leading-tight line-clamp-2 ${isSelected ? "text-neo-dark" : "text-stone-800"}`}>
                            {s.title}
                          </p>
                          <span className="text-[9px] font-mono text-stone-400 uppercase mt-0.5 block">
                            {s.sourceType}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Unindexed sources */}
            {unindexedSources.length > 0 && (
              <div className="space-y-1.5 mt-3">
                <p className="text-[9px] font-mono font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5" /> Not Indexed ({unindexedSources.length})
                </p>
                {unindexedSources.map((s) => {
                  const err = indexErrors[s.id];
                  return (
                    <div
                      key={s.id}
                      className={`w-full p-2.5 rounded-sm border-2 text-xs ${
                        err
                          ? "border-rose-400 bg-rose-50"
                          : "border-dashed border-stone-300 bg-stone-50"
                      }`}
                    >
                      <p className="font-sans font-bold text-stone-600 line-clamp-2 leading-tight mb-2">
                        {s.title}
                      </p>
                      {err ? (
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-mono text-rose-700 font-bold leading-relaxed">
                            ⚠️ {err}
                          </p>
                          <p className="text-[9px] font-mono text-stone-400 leading-relaxed">
                            This source cannot be used in Q&amp;A.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono text-stone-400 uppercase">{s.sourceType}</span>
                          <button
                            type="button"
                            onClick={() => handleIndexSource(s.id)}
                            disabled={indexingId === s.id}
                            className="flex items-center gap-1 text-[9px] font-mono font-black text-neo-dark bg-neo-yellow border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1px_1px_0px_#000] hover:bg-yellow-300 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            {indexingId === s.id ? (
                              <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                Indexing…
                              </>
                            ) : (
                              <>
                                <Zap className="w-2.5 h-2.5" />
                                Index
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <p className="text-[9px] font-mono text-stone-400 leading-relaxed px-0.5">
                  Index sources to include them in Q&A context.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t-2 border-neo-dark bg-stone-50 space-y-2">
            {selectedIds.size > 0 && (
              <div className="text-[9px] font-mono font-black text-neo-dark bg-neo-yellow border-2 border-neo-dark px-2 py-1 rounded-sm text-center shadow-[1px_1px_0px_#000]">
                {selectedIds.size} source{selectedIds.size !== 1 ? "s" : ""} scoped
              </div>
            )}
            <button
              onClick={clearChat}
              className="flex items-center justify-center gap-1.5 w-full p-2 text-xs font-bold font-display cursor-pointer bg-stone-100 hover:bg-rose-100 border-2 border-neo-dark active:translate-y-0.5 transition-all text-stone-700 hover:text-rose-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Chat
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed sidebar strip */
        <div className="hidden lg:flex flex-col justify-between items-center w-14 bg-white border-r-4 border-neo-dark p-2 h-full shrink-0">
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 bg-neo-yellow hover:bg-amber-300 border-2 border-neo-dark rounded cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center w-9 h-9"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 text-neo-dark" />
            </button>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[7px] font-mono font-black text-stone-400 uppercase tracking-widest">SCOPE</span>
              <span className="w-7 h-7 rounded-sm bg-neo-dark text-white border-2 border-neo-dark flex items-center justify-center font-mono text-[11px] font-black">
                {selectedIds.size}
              </span>
            </div>
            {unindexedSources.length > 0 && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[7px] font-mono font-black text-amber-600 uppercase tracking-widest">QUEUE</span>
                <span className="w-7 h-7 rounded-sm bg-amber-400 text-neo-dark border-2 border-neo-dark flex items-center justify-center font-mono text-[11px] font-black">
                  {unindexedSources.length}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={clearChat}
            className="w-9 h-9 flex items-center justify-center bg-stone-50 hover:bg-rose-50 border-2 border-neo-dark text-stone-600 hover:text-rose-600 rounded cursor-pointer transition-colors mb-2"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Chat panel ── */}
      <div className="flex-1 bg-white flex flex-col min-h-[500px] lg:h-full overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-neo-dark bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neo-orange" />
            <span className="font-display font-black text-xs uppercase tracking-wider text-neo-dark">
              Ask Engine
            </span>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 text-[10px] font-mono font-bold text-neo-dark border-2 border-neo-dark px-2 py-1 rounded-sm bg-white hover:bg-stone-50 cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            Sources ({selectedIds.size})
          </button>
          {selectedIds.size > 0 && (
            <span className="hidden lg:block text-[9px] font-mono font-black bg-neo-yellow border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1px_1px_0px_#000]">
              Scoped to {selectedIds.size} source{selectedIds.size !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Messages feed */}
        <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 text-sm font-sans border-2 border-neo-dark shadow-[2px_2px_0px_#000] ${
                  m.sender === "user"
                    ? "bg-neo-yellow text-neo-dark rounded-l-sm rounded-tr-sm"
                    : "bg-[#F9FAFB] text-neo-dark rounded-r-sm rounded-tl-sm"
                }`}
              >
                <div className="leading-relaxed select-text">
                  <MarkdownRenderer content={m.text} />
                </div>

                {/* Cited sources accordion */}
                {m.sender === "ai" && m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-stone-300">
                    <button
                      onClick={() => setOpenCitationId(openCitationId === m.id ? null : m.id)}
                      className="text-xs font-bold font-display flex items-center gap-1.5 text-neo-orange hover:underline focus:outline-none"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {m.sources.length} source{m.sources.length !== 1 ? "s" : ""} cited
                      {m.chunksUsed !== undefined && (
                        <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 border border-stone-300 rounded font-mono ml-1">
                          {m.chunksUsed} chunks
                        </span>
                      )}
                    </button>

                    {openCitationId === m.id && (
                      <div className="mt-2 space-y-1.5">
                        {m.sources.map((cit) => (
                          <div
                            key={cit.sourceId}
                            className="bg-white p-2 border border-neo-dark rounded text-xs flex justify-between items-center gap-2"
                          >
                            <span className="font-semibold line-clamp-1 text-stone-800">{cit.title}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold rounded-full shrink-0">
                              {(cit.similarity * 100).toFixed(0)}% match
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 border-2 border-neo-dark bg-stone-50 text-stone-600 text-xs w-52 shadow-[2px_2px_0px_#000] font-mono">
              <Loader2 className="w-4 h-4 text-neo-orange animate-spin shrink-0" />
              <span>Synthesising answer…</span>
            </div>
          )}
        </div>

        {/* Suggestion chips — show only on first message */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t border-stone-200 bg-stone-50 flex flex-wrap gap-1.5">
            <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest self-center">Try:</span>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="text-xs bg-white border border-neo-dark px-2.5 py-1 rounded-sm shadow-[1px_1px_0px_#0A0A0A] hover:bg-amber-50 hover:border-neo-dark active:translate-y-0.5 transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="p-3 border-t-4 border-neo-dark bg-stone-50 flex gap-2 items-center shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              indexedSources.length === 0
                ? "Index at least one source to start asking questions…"
                : "Ask a question about the sources in this vault…"
            }
            disabled={loading}
            className="flex-1 text-sm p-2.5 bg-white border-2 border-neo-dark rounded-sm font-sans text-neo-dark placeholder-stone-400 focus:outline-none focus:shadow-[2px_2px_0px_#000]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || indexedSources.length === 0}
            className="p-3 bg-neo-yellow border-2 border-neo-dark rounded-sm shadow-[2px_2px_0px_#000] hover:bg-yellow-300 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neo-dark" />
            ) : (
              <Send className="w-4 h-4 text-neo-dark" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Convert a raw server error message into a short, human-readable sentence
 * shown directly on the source card.
 */
function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("no file") || m.includes("no attached"))
    return "No file attached. Upload a PDF or document to enable indexing.";
  if (m.includes("unsupported file type") || m.includes("not supported"))
    return "Unsupported file type. Only PDF and DOCX files can be indexed.";
  if (m.includes("scanned") || m.includes("image-only") || m.includes("no content"))
    return "Document appears to be scanned or image-only — no text could be extracted.";
  if (m.includes("no extracted text") || m.includes("extracted text available"))
    return "No text found. Upload a readable PDF or DOCX file.";
  if (m.includes("forbidden") || m.includes("only contributor"))
    return "You need Contributor or Owner role to index sources.";
  if (m.includes("network") || m.includes("connection"))
    return "Network error. Check your connection and try again.";
  // Trim to keep it short
  return msg.length > 120 ? msg.slice(0, 117) + "…" : msg;
}
