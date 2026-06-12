"use client";

import { useState } from "react";
import { Source } from "@/types";
import { Sparkles, Target, FlaskConical, Lightbulb, Star, AlertTriangle, Rocket, Database, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { sourceService } from "@/services";
import { useApp } from "@/context/AppContext";

interface InsightsSectionProps {
  vaultId: string;
  source: Source;
  myRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  onSourceUpdated: (src: Source) => void;
}

export default function InsightsSection({ vaultId, source, myRole, onSourceUpdated }: InsightsSectionProps) {
  const { refreshCurrentUser } = useApp();
  // Collapsible toggle states
  const [collapsedSummary, setCollapsedSummary] = useState(false);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    problem: true,
    methodology: true,
    findings: true,
    contributions: false,
    limitations: false,
    future: false,
    datasets: false,
  });

  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "long">("medium");
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState("");

  const canEdit = myRole === "OWNER" || myRole === "CONTRIBUTOR";

  const toggleBlock = (name: string) => {
    setOpenBlocks((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleGenerateSummary = async () => {
    setSummarizeLoading(true);
    setError("");
    try {
      const res = await sourceService.summarize(vaultId, source.id, { length: summaryLength });
      if (res.success) {
        onSourceUpdated(res.data);
        await refreshCurrentUser();
      } else setError(res.message || "Failed to generate AI summary.");
    } catch (err: any) {
      setError(err?.message || "AI generation network error.");
    } finally {
      setSummarizeLoading(false);
    }
  };

  const handleExtractInsights = async () => {
    setInsightsLoading(true);
    setError("");
    try {
      const res = await sourceService.extractInsights(vaultId, source.id);
      if (res.success) {
        onSourceUpdated(res.data);
        await refreshCurrentUser();
        setOpenBlocks({ problem: true, methodology: true, findings: true, contributions: true, limitations: true, future: true, datasets: true });
      } else {
        setError(res.message || "Failed to query specialized AI insights.");
      }
    } catch (err: any) {
      setError(err?.message || "AI Extraction network error.");
    } finally {
      setInsightsLoading(false);
    }
  };

  const i = source.aiInsights;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-500 font-mono text-red-700 text-xs font-bold rounded">
          ⚠️ {error}
        </div>
      )}

      {/* SECTION 2: AI SUMMARY CONTAINER */}
      <div className="bg-white rounded neo-border neo-shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display font-extrabold text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neo-yellow fill-neo-yellow" />
            AI Intel Fact Summary
          </h3>
          {source.aiSummary && (
            <button
              onClick={() => setCollapsedSummary(!collapsedSummary)}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 font-mono focus:outline-none"
            >
              {collapsedSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              {collapsedSummary ? "Expand Summary" : "Collapse"}
            </button>
          )}
        </div>

        {!source.aiSummary ? (
          <div className="p-4 bg-stone-50 border-2 border-dashed border-stone-300 rounded text-center">
            <p className="text-xs text-stone-600 mb-3 font-sans">
              There is no precomputed AI structural summary for this citation document yet.
            </p>
            {canEdit ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex bg-white border border-neo-dark rounded overflow-hidden shadow-[1px_1px_0px_#0A0A0A]">
                  {(["short", "medium", "long"] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSummaryLength(len)}
                      className={`px-3 py-1 text-xs font-bold font-mono border-r last:border-0 border-neo-dark cursor-pointer select-none ${
                        summaryLength === len ? "bg-neo-yellow text-neo-dark" : "bg-white hover:bg-stone-50"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={summarizeLoading}
                  className="neo-btn px-4 py-1.5 text-xs flex items-center gap-1.5"
                >
                  {summarizeLoading && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  Generate AI Overview
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Owner or Contributor role required to generate AI Summary.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!collapsedSummary && (
              <div className="text-xs font-sans text-neo-dark leading-relaxed whitespace-pre-wrap p-3.5 bg-neo-bg border-2 border-neo-dark rounded">
                {source.aiSummary}
              </div>
            )}

            {canEdit && (
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-end pt-2 border-t border-dashed border-stone-200">
                <span className="text-[10px] font-mono text-stone-500">Regenerate format:</span>
                <div className="flex bg-white border border-neo-dark rounded overflow-hidden shadow-[1px_1px_0px_#0A0A0A]">
                  {(["short", "medium", "long"] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSummaryLength(len)}
                      className={`px-2.5 py-0.5 text-[10px] font-bold font-mono border-r last:border-0 border-neo-dark cursor-pointer ${
                        summaryLength === len ? "bg-neo-yellow text-neo-dark" : "bg-white hover:bg-stone-50"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={summarizeLoading}
                  className="neo-border border-2 px-3 py-1 hover:bg-stone-50 text-[10px] font-bold font-display flex items-center gap-1 cursor-pointer active:translate-y-0.5"
                >
                  {summarizeLoading && <Loader className="w-3.5 h-3.5 animate-spin" />}
                  Regenerate Summary
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: KEY RESEARCH INSIGHTS DTO ACCORDIONS */}
      <div className="bg-white rounded neo-border neo-shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-display font-extrabold text-base flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-neo-accent" />
              Scientific Key Insights Audit
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 font-sans">
              Critical analytical dimensions extracted directly from the literature logic.
            </p>
          </div>

          {!i && canEdit && (
            <button
              onClick={handleExtractInsights}
              disabled={insightsLoading}
              className="neo-btn px-4 py-2 text-xs flex items-center gap-1.5"
            >
              {insightsLoading ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Extracting (10-30s)...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Extract Insights
                </>
              )}
            </button>
          )}
        </div>

        {!i ? (
          <div className="p-8 border-2 border-dashed border-stone-200 rounded text-center">
            <p className="text-xs text-stone-400 italic">No Key Insights structured yet. Extract insights to map out research methodology, problems, contributions and limits automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* PROBLEM BLOCK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("problem")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  1. Research Problem &amp; Bottleneck
                </span>
                {openBlocks.problem ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.problem && (
                <div className="p-4 bg-white text-xs text-stone-700 leading-relaxed font-sans">
                  {i.researchProblem}
                </div>
              )}
            </div>

            {/* METHODOLOGY BLOCK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("methodology")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-indigo-500" />
                  2. Core Technical Methodology
                </span>
                {openBlocks.methodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.methodology && (
                <div className="p-4 bg-white text-xs text-stone-700 leading-relaxed font-sans">
                  {i.methodology}
                </div>
              )}
            </div>

            {/* KEY FINDINGS BLOCK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("findings")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-100" />
                  3. Key Discoveries &amp; Findings
                </span>
                {openBlocks.findings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.findings && (
                <div className="p-4 bg-white space-y-3 font-sans">
                  {i.keyFindings.map((f, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border text-neo-dark select-none mt-0.5 shrink-0 ${
                          f.significance === "High"
                            ? "bg-red-200 border-red-500 text-red-800"
                            : f.significance === "Medium"
                            ? "bg-yellow-200 border-yellow-500 text-yellow-800"
                            : "bg-emerald-200 border-emerald-500 text-emerald-800"
                        }`}
                      >
                        {f.significance} Ref
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed">{f.finding}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONTRIBUTIONS BLOCK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("contributions")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-neo-purple fill-purple-100" />
                  4. Domain Contributions
                </span>
                {openBlocks.contributions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.contributions && (
                <div className="p-4 bg-white font-sans">
                  {i.contributions.length === 0 ? (
                    <p className="text-xs italic text-stone-400">None declared.</p>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside text-xs text-stone-700">
                      {i.contributions.map((c, idx) => (
                        <li key={idx} className="leading-relaxed">{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* LIMITATIONS BLOCK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("limitations")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-neo-orange" />
                  5. Architectural Limitations &amp; Caveats
                </span>
                {openBlocks.limitations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.limitations && (
                <div className="p-4 bg-white font-sans">
                  {i.limitations.length === 0 ? (
                    <p className="text-xs italic text-stone-400">None declared.</p>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside text-xs text-stone-700">
                      {i.limitations.map((l, idx) => (
                        <li key={idx} className="leading-relaxed">{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* FUTURE WORK */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("future")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-500" />
                  6. Recommended Expansion &amp; Future Work
                </span>
                {openBlocks.future ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.future && (
                <div className="p-4 bg-white font-sans">
                  {i.futureWork.length === 0 ? (
                    <p className="text-xs italic text-stone-400">None declared.</p>
                  ) : (
                    <ul className="space-y-2 list-disc list-inside text-xs text-stone-700">
                      {i.futureWork.map((fw, idx) => (
                        <li key={idx} className="leading-relaxed">{fw}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* DATASETS BADGES */}
            <div className="border-2 border-neo-dark rounded overflow-hidden">
              <button
                onClick={() => toggleBlock("datasets")}
                className="w-full text-left p-3.5 font-bold font-display text-sm bg-stone-50 hover:bg-stone-100 flex items-center justify-between border-b-2 border-neo-dark"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  7. Benchmark Evaluation Datasets
                </span>
                {openBlocks.datasets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openBlocks.datasets && (
                <div className="p-4 bg-white flex flex-wrap gap-2">
                  {i.datasets.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">None referenced.</span>
                  ) : (
                    i.datasets.map((d, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-cyan-50 border-2 border-neo-dark px-3 py-1 font-mono hover:bg-cyan-100 text-neo-dark font-semibold rounded-sm tracking-wide"
                      >
                        {d}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
