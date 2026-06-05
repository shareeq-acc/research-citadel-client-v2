"use client";

import { useState } from "react";
import { MessageSquare, Send, Sparkles, Trash2, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Filter, Loader2, SlidersHorizontal } from "lucide-react";
import { Source } from "@/types";
import { apiFetch } from "@/lib/api";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

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
  sources: Source[];
}

export default function QAPanel({ vaultId, sources }: QAPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Welcome to the Research Citadel Ask Engine! I can synthesize answers grounded strictly in the academic sources listed inside this Vault. Ask me anything to begin.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [openCitationId, setOpenCitationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const suggestionChips = [
    "What is the primary methodology used?",
    "What are the central research findings?",
    "What are the main limits or caveats identified?",
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiFetch(`/api/vault/${vaultId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: textToSend,
          sourceIds: selectedSources,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: resData.data.answer,
          sources: resData.data.sources,
          chunksUsed: resData.data.chunksUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errMsg: Message = {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ Error: ${resData.message || "Failed to fetch response."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } catch (err) {
      const errMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "⚠️ A network error occurred while reaching the AI Citadel service.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const toggleSourceSelection = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const processedSources = sources.filter((s) => s.chunksProcessed);
  const unprocessedSourcesCount = sources.length - processedSources.length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[740px] items-stretch">
      {/* Search context settings sidebar */}
      {sidebarOpen ? (
        <div className="w-full lg:w-80 shrink-0 bg-white neo-border p-4 h-auto lg:h-full flex flex-col justify-between overflow-y-auto neo-shadow-sm min-h-[350px] transition-all duration-300">
          <div>
            <div className="flex items-start justify-between mb-4 border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-neo-orange shrink-0" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark">
                  Source Scope
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-stone-50 border-2 border-neo-dark rounded-xs cursor-pointer transition-colors"
                title="Collapse Grounding Sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-neo-dark" />
              </button>
            </div>
            
            <p className="text-xs text-stone-600 mb-5 font-sans leading-relaxed">
              Filter search synthesis to specific documents or query the whole vault repository.
            </p>

            <div className="space-y-3">
              <div className="font-semibold text-[10px] uppercase tracking-wider text-stone-500 font-mono">
                Select active sources:
              </div>
              {sources.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No sources in this vault.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-[260px] lg:max-h-[380px] overflow-y-auto pt-1.5 pb-2 px-1">
                  {sources.map((s) => {
                    const isSelected = selectedSources.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xs cursor-pointer text-xs transition-all border-2 select-none ${
                          isSelected
                            ? "bg-amber-50 border-neo-dark font-black shadow-[3px_3px_0px_#0A0A0A] -translate-y-0.5"
                            : "bg-white border-stone-200 hover:border-neo-dark hover:bg-stone-50 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0A0A0A] text-stone-600 hover:text-neo-dark"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSourceSelection(s.id)}
                          className="sr-only"
                        />
                        <div className={`mt-0.5 w-5 h-5 rounded-xs border-2 border-neo-dark flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-neo-dark text-neo-yellow" : "bg-white"}`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-sans font-bold leading-snug line-clamp-2 ${isSelected ? "text-neo-dark font-black" : "text-stone-800"}`}>
                            {s.title}
                          </div>
                          <div className="text-[10px] font-mono mt-2 space-y-1.5">
                            <div className="uppercase tracking-wider text-stone-500 font-bold text-[9px]">
                              {s.sourceType === "PDF" ? "PDF Document" : s.sourceType === "WEB_ARTICLE" ? "Web Article" : s.sourceType}
                            </div>
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white border-2 border-neo-dark rounded-xs w-max text-[8.5px] font-black text-neo-dark shadow-[1px_1px_0px_#000]">
                              {s.chunksProcessed ? (
                                <>
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-700" />
                                  <span className="uppercase tracking-wider">Indexed</span>
                                </>
                              ) : (
                                <>
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 border border-amber-700" />
                                  <span className="uppercase tracking-wider">Text Only</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {unprocessedSourcesCount > 0 && (
              <div className="mt-4 p-3.5 bg-amber-50/80 border-2 border-neo-dark text-[11.5px] text-neo-dark font-sans rounded-xs shadow-[2px_2px_0px_#0A0A0A] leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[10px] block text-neo-orange mb-1">
                  ⚠️ Extraction Pending
                </span>
                {unprocessedSourcesCount} source(s) are not indexed for Q&amp;A. Click <strong className="font-extrabold">&quot;Process for Q&amp;A&quot;</strong> in document view.
              </div>
            )}
          </div>

          <button
            onClick={clearChat}
            className="flex items-center justify-center gap-2 w-full p-2.5 mt-4 text-xs font-bold font-display cursor-pointer bg-stone-100 hover:bg-rose-100 border-2 border-neo-dark neo-shadow-sm active:translate-y-0.5 transition-all text-stone-700 hover:text-rose-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear Workspace Chat
          </button>
        </div>
      ) : (
        /* Collapsed Sidebar View */
        <>
          {/* Mobile view of collapsed bar (takes minimal space) */}
          <div className="lg:hidden w-full bg-white neo-border p-3 flex items-center justify-between shadow-[2px_2px_0px_#000] transition-all duration-300">
            <div className="flex items-center gap-2 font-display text-xs font-black uppercase text-neo-dark min-w-0">
              <SlidersHorizontal className="w-4 h-4 text-neo-orange shrink-0" />
              <span className="truncate">Scope ({selectedSources.length} Active)</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-neo-yellow hover:bg-amber-300 border-2 border-neo-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer flex items-center justify-center rounded-sm shrink-0"
              title="Configure Filter"
            >
              <Filter className="w-4 h-4 text-neo-dark" />
            </button>
          </div>

          {/* Desktop view of collapsed bar (compact vertical strip) */}
          <div className="hidden lg:flex flex-col justify-between items-center w-16 bg-white neo-border p-3 h-full neo-shadow-sm shrink-0 transition-all duration-300">
            <div className="flex flex-col items-center gap-5 w-full">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 bg-neo-yellow hover:bg-amber-300 border-2 border-neo-dark rounded cursor-pointer transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center w-10 h-10"
                title="Expand Grounding Sidebar"
              >
                <ChevronRight className="w-5 h-5 text-neo-dark" />
              </button>

              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  className="p-2 cursor-pointer bg-white border-2 border-neo-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-xs hover:translate-y-0.5"
                  onClick={() => setSidebarOpen(true)}
                  title="Configure active documents filters"
                >
                  <Filter className="w-4 h-4 text-neo-dark" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[7.5px] font-mono font-black text-stone-400 uppercase tracking-widest leading-none mb-1 text-center">
                    ACTIVE
                  </span>
                  <span className="w-7 h-7 rounded-sm bg-neo-dark text-white border-2 border-neo-dark flex items-center justify-center font-mono text-[11px] font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)] leading-none">
                    {selectedSources.length}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="w-10 h-10 flex items-center justify-center bg-stone-50 hover:bg-rose-50 border-2 border-neo-dark text-stone-600 hover:text-rose-600 rounded cursor-pointer transition-colors"
              title="Clear Workspace Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white neo-border flex flex-col h-[550px] lg:h-full overflow-hidden neo-shadow-sm transition-all duration-300">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 neo-border-sm text-sm font-sans ${
                  m.sender === "user"
                    ? "bg-neo-yellow text-neo-dark rounded-l-lg rounded-tr-lg"
                    : "bg-neo-bg text-neo-dark rounded-r-lg rounded-tl-lg"
                }`}
              >
                {/* Text body */}
                <div className="leading-relaxed select-text">
                  <MarkdownRenderer content={m.text} />
                </div>

                {/* Sources accordion if AI message */}
                {m.sender === "ai" && m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed border-stone-300">
                    <button
                      onClick={() => setOpenCitationId(openCitationId === m.id ? null : m.id)}
                      className="text-xs font-bold font-display flex items-center gap-1 text-neo-orange hover:underline focus:outline-none"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {m.sources.length} document citation(s) grounded
                      <span className="text-[10px] bg-stone-100 px-1 border border-stone-300 rounded font-mono">
                        {m.chunksUsed ? `${m.chunksUsed} chunks` : ""}
                      </span>
                    </button>

                    {openCitationId === m.id && (
                      <div className="mt-2 space-y-1.5 transition-all">
                        {m.sources.map((cit) => (
                          <div
                            key={cit.sourceId}
                            className="bg-white p-2 border border-neo-dark rounded text-xs flex justify-between items-center gap-2"
                          >
                            <span className="font-semibold line-clamp-1 text-stone-800">
                              {cit.title}
                            </span>
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
              <span className="text-[10px] text-stone-500 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 p-3 neo-border-sm bg-stone-50 text-stone-600 text-xs w-52 rounded-lg font-mono">
              <Loader2 className="w-4 h-4 text-neo-orange animate-spin shrink-0" />
              <span>AI synthesizing grounds...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap gap-2">
            <span className="text-xs text-stone-500 font-semibold flex items-center gap-1 font-mono">
              Suggestions:
            </span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(chip);
                  handleSend(chip);
                }}
                disabled={loading}
                className="text-xs bg-white border border-neo-dark px-2.5 py-1 rounded-sm shadow-[1px_1px_0px_#0A0A0A] hover:bg-stone-50 active:translate-y-0.5 transition-all cursor-pointer font-sans"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3 border-t-4 border-neo-dark bg-stone-50 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Input research question to query vault files context..."
            disabled={loading}
            className="flex-1 neo-input text-sm p-2.5 bg-white font-sans text-neo-dark placeholder-stone-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="neo-btn p-3 aspect-square text-neo-dark cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
