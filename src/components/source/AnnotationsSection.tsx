"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Annotation } from "@/types";
import { 
  Plus, BookOpen, Clock, Edit3, Trash2, Eye, StickyNote, 
  Search, SlidersHorizontal, X, ArrowUpDown, UserCheck, ChevronLeft, ChevronRight
} from "lucide-react";
import { annotationService } from "@/services";

interface AnnotationsSectionProps {
  vaultId: string;
  sourceId: string;
  myRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  annotations: Annotation[];
  onAnnotationDeleted: (id: string) => void;
  onNavigateToDetail: (annotationId: string) => void;
  onTriggerAddAnnotation: () => void;
  onTriggerEditAnnotation: (ann: Annotation) => void;
}

export default function AnnotationsSection({
  vaultId,
  sourceId,
  myRole,
  annotations,
  onAnnotationDeleted,
  onNavigateToDetail,
  onTriggerAddAnnotation,
  onTriggerEditAnnotation,
}: AnnotationsSectionProps) {
  const canEdit = myRole === "OWNER" || myRole === "CONTRIBUTOR";

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "page-asc" | "version-desc">("date-desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 2; // Keep x small so that pagination and scrollbars are easy to test & interact with

  // Reset pagination to 1 when filters are changed
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPage, selectedAuthor, sortBy, annotations.length]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this annotation?")) return;
    try {
      const res = await annotationService.deleteAnnotation(vaultId, sourceId, id);
      if (res.success) onAnnotationDeleted(id);
    } catch (err) {
      console.error(err);
    }
  };

  // Basic client-side helper to slice markdown blocks to line strings
  const getCleanLine = (md: string) => {
    const plain = md.replace(/[#*`>$]/g, "").replace(/\[.*?\]\(.*?\)/g, "").trim();
    if (plain.length > 55) return plain.slice(0, 55) + "...";
    return plain || "View full mathematical annotation detail";
  };

  // Format date and time of annotations beautifully
  const formatAnnotationDate = (dateStr: string) => {
    try {
      if (!dateStr) return "Just now";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      
      const formattedTime = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      return `${formattedDate} at ${formattedTime}`;
    } catch {
      return "Recently";
    }
  };

  // Derive filter lists from annotations
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    annotations.forEach((ann) => {
      if (ann.author?.name) {
        set.add(ann.author.name);
      }
    });
    return Array.from(set).sort();
  }, [annotations]);

  const uniquePages = useMemo(() => {
    const set = new Set<number>();
    annotations.forEach((ann) => {
      if (ann.pageReference !== null && ann.pageReference !== undefined) {
        set.add(ann.pageReference);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [annotations]);

  // Compute filtered & sorted annotation nodes
  const filteredAnnotations = useMemo(() => {
    let list = [...annotations];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ann) =>
          ann.contentMarkdown.toLowerCase().includes(q) ||
          (ann.author?.name && ann.author.name.toLowerCase().includes(q)) ||
          (ann.sectionReference && ann.sectionReference.toLowerCase().includes(q))
      );
    }

    // Page filter
    if (selectedPage !== "all") {
      const pageNum = parseInt(selectedPage, 10);
      list = list.filter((ann) => ann.pageReference === pageNum);
    }

    // Author filter
    if (selectedAuthor !== "all") {
      list = list.filter((ann) => ann.author?.name === selectedAuthor);
    }

    // Sort order
    list.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "page-asc") {
        const pA = a.pageReference ?? 999999;
        const pB = b.pageReference ?? 999999;
        return pA - pB;
      }
      if (sortBy === "version-desc") {
        return b.version - a.version;
      }
      return 0;
    });

    return list;
  }, [annotations, searchQuery, selectedPage, selectedAuthor, sortBy]);

  // Paginated selection compute
  const totalPages = Math.max(1, Math.ceil(filteredAnnotations.length / ITEMS_PER_PAGE));
  const paginatedAnnotations = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnnotations.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredAnnotations, currentPage]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPage("all");
    setSelectedAuthor("all");
    setSortBy("date-desc");
  };

  const isFiltered = searchQuery || selectedPage !== "all" || selectedAuthor !== "all";

  return (
    <div className="space-y-4">
      {/* Header Widget */}
      <div className="bg-[#FAFAF9] p-4 border-2 border-neo-dark rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-xs font-black text-neo-dark font-display flex items-center gap-2 uppercase tracking-wide">
            <div className="p-1.5 bg-neo-yellow border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <StickyNote className="w-3.5 h-3.5 text-neo-dark stroke-[2.5]" />
            </div>
            <span>
              {isFiltered ? `${filteredAnnotations.length} of ${annotations.length}` : annotations.length} {annotations.length === 1 ? "annotation" : "annotations"}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center cursor-pointer transition-all select-none hover:scale-102 active:translate-y-[1px] ${
                showFilters || isFiltered
                  ? "bg-neo-orange text-white"
                  : "bg-stone-100 hover:bg-stone-200 text-neo-dark"
              }`}
              title="Toggle filter view options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            {canEdit && (
              <button
                onClick={onTriggerAddAnnotation}
                className="neo-btn px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-neo-yellow hover:bg-yellow-400 text-neo-dark border-2 border-neo-dark transition-all select-none hover:scale-102 cursor-pointer active:translate-y-[1px]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Add Note</span>
                <span className="inline sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Expandable Filters Dashboard with Neo design styling */}
        {(showFilters || isFiltered) && (
          <div className="pt-3 border-t-2 border-dashed border-stone-200 space-y-3">
            {/* Quick text search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                <Search className="w-3.5 h-3.5 text-stone-500 stroke-[2.5]" />
              </span>
              <input
                type="text"
                placeholder="Search note tags, content or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-7 py-2 border-2 border-neo-dark rounded font-sans focus:outline-hidden focus:bg-[#FFFDEB] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Structured dropdown pickers grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-bold font-mono text-stone-500 uppercase mb-1">
                  Filter by Author
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="w-full text-[10px] font-bold py-1.5 pl-2 pr-6 bg-white border-2 border-neo-dark rounded text-stone-800 focus:outline-hidden"
                >
                  <option value="all">All Collaborators</option>
                  {uniqueAuthors.map((auth) => (
                    <option key={auth} value={auth}>
                      {auth}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold font-mono text-stone-500 uppercase mb-1">
                  Filter by Page Number
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full text-[10px] font-bold py-1.5 pl-2 pr-7 bg-white border-2 border-neo-dark rounded text-stone-800 focus:outline-hidden"
                >
                  <option value="all">Any Document Page</option>
                  {uniquePages.map((page) => (
                    <option key={page} value={page.toString()}>
                      Page {page}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 items-center">
              <div>
                <label className="block text-[8px] font-bold font-mono text-stone-500 uppercase mb-1">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-[10px] font-bold py-1.5 pl-2 pr-7 bg-white border-2 border-neo-dark rounded text-stone-800 focus:outline-hidden"
                >
                  <option value="date-desc">Newest Recorded First</option>
                  <option value="date-asc">Oldest Recorded First</option>
                  <option value="page-asc">Document Page Sequence</option>
                  <option value="version-desc">Highest Annotations Version</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 text-rose-700 font-bold font-mono border-2 border-neo-dark rounded py-1 px-3 shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Annotations List Container with active vertical scroll if list on current page exceeds custom height limits */}
      {paginatedAnnotations.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-stone-200 rounded text-center text-xs text-stone-400 font-sans italic bg-stone-50/50 space-y-2">
          <p>No annotation matches current search presets.</p>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-neo-orange underline font-mono cursor-pointer"
            >
              Reset all active filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scroll wrapper configured based on element density & theme scrollbars */}
          <div 
            className="space-y-5 max-h-[580px] overflow-y-auto pr-2 neo-scroll-y"
          >
            {paginatedAnnotations.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded neo-border neo-shadow p-5 hover:border-neo-orange transition-all duration-150"
              >
                {/* Header section with vertical breathing space and high contrast */}
                <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-3.5 mb-3.5">
                  <div className="flex items-center gap-3 min-w-0 shrink-0">
                    <img
                      src={ann.author?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                      alt={ann.author?.name}
                      className="w-9 h-9 rounded-full border-2 border-neo-dark shadow-[1px_1px_0px_rgba(0,0,0,1)] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-black text-neo-dark block leading-none tracking-tight truncate max-w-[180px] sm:max-w-[200px]" title={ann.author?.name}>
                        {ann.author?.name}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono flex items-center gap-1.5 mt-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-stone-400 stroke-[2.5]" />
                        <span className="bg-[#FFEAA7]/20 px-1.5 py-0.5 border border-stone-300 text-neo-dark rounded-sm text-[9px] font-black">
                          v{ann.version}
                        </span>
                      </span>
                      {/* Sepatated separate line for the date to solve layout breaks */}
                      <span className="block mt-1.5 text-[9px] font-mono text-stone-500 uppercase font-black tracking-tight leading-normal">
                        {formatAnnotationDate(ann.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end flex-wrap shrink-0 ml-auto">
                    {canEdit && (
                      <div className="flex items-center gap-1 border-r border-stone-200 pr-1.5">
                        <button
                          onClick={() => onTriggerEditAnnotation(ann)}
                          title="Edit note"
                          className="p-1.5 bg-stone-100 hover:bg-[#FACC15] text-neo-dark border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          title="Delete note"
                          className="p-1.5 bg-rose-50 hover:bg-rose-500 text-stone-700 hover:text-white border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onNavigateToDetail(ann.id)}
                      title="View detailed annotation"
                      className="p-1.5 bg-[#00D4AA] hover:bg-[#00B38F] text-neo-dark border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-neo-dark stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Quick tags metrics row */}
                {(ann.pageReference || ann.sectionReference) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ann.pageReference && (
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-950 border-2 border-neo-dark px-2.5 py-1 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                        Page {ann.pageReference}
                      </span>
                    )}
                    {ann.sectionReference && (
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-950 border-2 border-neo-dark px-2.5 py-1 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] truncate max-w-[240px]" title={ann.sectionReference}>
                        Section: {ann.sectionReference}
                      </span>
                    )}
                  </div>
                )}

                {/* Description preview text */}
                <div className="bg-stone-50 border-2 border-neo-dark p-3.5 rounded text-xs text-stone-800 leading-relaxed font-mono shadow-[1px_1px_0px_rgba(0,0,0,0.1)]">
                  {getCleanLine(ann.contentMarkdown)}
                </div>
              </div>
            ))}
          </div>

          {/* Neo-brutalist pagination controls element */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 pb-1 border-t-2 border-dashed border-stone-200 select-none">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-black bg-white disabled:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-neo-dark rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:scale-102 active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1 text-neo-dark hover:bg-stone-50"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span>Prev</span>
              </button>
              
              <div className="px-3 py-1.5 bg-[#FFEAA7] border-2 border-neo-dark rounded-md shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[10px] font-black text-neo-dark font-mono uppercase tracking-wider">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-black bg-white disabled:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-neo-dark rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:scale-102 active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1 text-neo-dark hover:bg-stone-50"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
