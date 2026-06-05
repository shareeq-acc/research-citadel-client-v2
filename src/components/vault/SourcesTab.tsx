"use client";

import React, { useState } from "react";
import { Source } from "@/types";
import { Plus, Search, FileText, Globe, Calendar, User, BookOpen, AlertCircle, Upload, Link, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SourcesTabProps {
  vaultId: string;
  myRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  sources: Source[];
  onSourceAdded: (src: Source) => void;
}

export default function SourcesTab({ vaultId, myRole, sources, onSourceAdded }: SourcesTabProps) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"PDF" | "WEB_ARTICLE">("PDF");

  // Form Fields
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [publication, setPublication] = useState("");
  const [year, setYear] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canEdit = myRole === "OWNER" || myRole === "CONTRIBUTOR";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFileName(file.name);
      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const cleanTitle = baseName
          .split(/[-_ ]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        setTitle(cleanTitle);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setPdfFileName(file.name);
      if (!title.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const cleanTitle = baseName
          .split(/[-_ ]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        setTitle(cleanTitle);
      }
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate structured payload
    const payload: any = {
      title,
      authors: authors ? authors.split(",").map((a) => a.trim()) : ["Unknown"],
      publication: publication || null,
      year: year ? parseInt(year) : null,
      sourceType: addType,
      externalUrl: addType === "WEB_ARTICLE" ? externalUrl : null,
    };

    if (addType === "PDF") {
      payload.file = {
        fileName: pdfFileName || "draft_manuscript.pdf",
        fileUrl: "https://arxiv.org/pdf/1706.03762.pdf",
        fileSize: 1024 * 1024 * 3, // 3MB mock
      };
    }

    try {
      const response = await apiFetch(`/api/vault/${vaultId}/source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      if (res.success) {
        onSourceAdded(res.data);
        setShowAddModal(false);
        // Reset state
        setTitle("");
        setAuthors("");
        setPublication("");
        setYear("");
        setExternalUrl("");
        setPdfFileName("");
      } else {
        setError(res.message || "Failed to add source parameters.");
      }
    } catch (err) {
      setError("Network bottleneck occurred while index updates.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.publication && s.publication.toLowerCase().includes(search.toLowerCase())) ||
      s.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="relative flex-1 w-full md:max-w-xl lg:max-w-3xl group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
            <Search className="text-stone-500 w-5 h-5 group-focus-within:text-neo-dark transition-colors" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter vault references by title, author names..."
            className="w-full neo-input pr-4 py-3 text-sm bg-white rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all font-sans"
            style={{ paddingLeft: "3rem" }}
          />
        </div>

        {canEdit ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="neo-btn px-5 py-3 w-full md:w-auto text-sm animate-pulse-slow"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
            Add Reference Source
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono font-bold px-3 py-2 bg-stone-100 border border-stone-300 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] select-none">
            <Lock className="w-3.5 h-3.5 text-stone-500 stroke-[2.5]" />
            <span>View-only account access</span>
          </div>
        )}
      </div>

      {/* Sources Grid Card lists */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded neo-border p-8 text-center max-w-xl mx-auto neo-shadow-sm mt-8">
          <AlertCircle className="w-12 h-12 text-neo-orange mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-neo-dark">No reference sources found</h3>
          <p className="text-stone-500 text-sm mt-1 max-w-md mx-auto leading-relaxed">
            There are no documents uploaded matching your queries. Let&apos;s expand your Research Vault database by creating a new reference asset.
          </p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="neo-btn px-4 py-2 mt-4 text-xs font-bold"
            >
              Add Reference Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <a
              key={s.id}
              href={`#source-${s.id}`}
              className="bg-white p-5 rounded neo-border neo-shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 border text-neo-dark rounded-sm shadow-[1px_1px_0px_#0a0a0a] ${
                      s.sourceType === "PDF" ? "bg-neo-yellow" : "bg-neo-accent"
                    }`}
                  >
                    {s.sourceType}
                  </span>
                  {s.chunksProcessed ? (
                    <span className="text-[9px] font-mono font-black uppercase bg-emerald-50/90 text-emerald-950 border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-700" />
                      <span>Q&amp;A Ready</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-black uppercase bg-amber-50/90 text-amber-950 border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 border border-amber-700" />
                      <span>Text Only</span>
                    </span>
                  )}
                </div>

                <h4 className="font-display font-extrabold text-base text-neo-dark tracking-tight line-clamp-2 scale-x-[0.99] group-hover:text-neo-orange transition-colors">
                  {s.title}
                </h4>

                <div className="space-y-1.5 mt-3 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 py-0.5 text-stone-400 shrink-0" />
                    <span className="truncate">{s.authors.join(", ")}</span>
                  </div>
                  {s.publication && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{s.publication}</span>
                    </div>
                  )}
                  {s.year && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{s.year}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-dashed border-stone-200 flex justify-between items-center text-xs font-bold font-display text-neo-dark">
                <span>View document analysis</span>
                <span className="text-neo-orange text-sm font-semibold">→</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Structured Add Modal Dialog box */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-dark/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white neo-border p-6 rounded-sm neo-shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b-4 border-neo-dark pb-3">
              <h3 className="font-display font-extrabold text-xl flex items-center gap-2">
                📂 Assemble Reference Sources
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-500 hover:text-stone-950 font-bold font-mono text-xl"
              >
                ✕
              </button>
            </div>

            {/* Type selector tab headers */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAddType("PDF")}
                className={`py-2 px-3 text-xs font-bold font-display border-2 border-neo-dark flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
                  addType === "PDF" ? "bg-neo-yellow shadow-[2px_2px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF File
              </button>
              <button
                type="button"
                onClick={() => setAddType("WEB_ARTICLE")}
                className={`py-2 px-3 text-xs font-bold font-display border-2 border-neo-dark flex items-center justify-center gap-2 rounded-sm cursor-pointer ${
                  addType === "WEB_ARTICLE" ? "bg-neo-yellow shadow-[2px_2px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Add External URL Link
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-500 text-xs font-mono text-red-700 font-bold mb-4 rounded">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Attention Is All You Need"
                  className="w-full neo-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                  Authors (Comma separated)
                </label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="e.g. Vaswani A., Shazeer N."
                  className="w-full neo-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                    Publisher / Journal
                  </label>
                  <input
                    type="text"
                    value={publication}
                    onChange={(e) => setPublication(e.target.value)}
                    placeholder="e.g. NeurIPS Conference"
                    className="w-full neo-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2017"
                    className="w-full neo-input text-xs"
                  />
                </div>
              </div>

              {addType === "PDF" ? (
                <div>
                  <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                    Upload PDF File *
                  </label>
                  <div
                    onClick={() => document.getElementById("pdf-file-picker")?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-4 border-dashed border-neo-dark rounded bg-neo-bg p-5 text-center cursor-pointer hover:bg-stone-50 transition-all select-none"
                  >
                    <FileText className="w-8 h-8 text-stone-500 mx-auto mb-2 animate-bounce-slow" />
                    <span className="text-xs font-bold text-neo-dark block mb-1">
                      Drag &amp; drop PDF here or click to select from your computer
                    </span>
                    <span className="text-[10px] text-stone-500 block mb-3 font-sans">
                      Any standard PDF document
                    </span>

                    <input
                      type="file"
                      id="pdf-file-picker"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="relative mt-2" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-left text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                        Active Reference File Name:
                      </label>
                      <input
                        type="text"
                        value={pdfFileName}
                        onChange={(e) => setPdfFileName(e.target.value)}
                        placeholder="e.g. attention_is_all_you_need.pdf"
                        required
                        className="w-full text-center text-xs p-2 border-2 border-neo-dark bg-white rounded font-mono text-neo-dark shadow-[1px_1px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold font-mono text-stone-700 uppercase mb-1">
                    External Source Web URL *
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                      <Globe className="text-stone-500 w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://arXiv.org/abs/1706.03762"
                      className="w-full neo-input text-xs"
                      style={{ paddingLeft: "2.5rem" }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t-2 border-neo-dark">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border-2 border-neo-dark font-bold font-display text-xs cursor-pointer hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn px-5 py-2 text-xs"
                >
                  {loading ? "Index processing..." : "Save Reference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
