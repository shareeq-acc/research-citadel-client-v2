"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, FileText } from "lucide-react";
import { PREVIEW_TABS } from "./landing-data";

export function LandingPreview() {
  const [activeTab, setActiveTab] = useState("dash");
  const tab = PREVIEW_TABS.find((t) => t.id === activeTab) ?? PREVIEW_TABS[0];

  return (
    <section className="px-4 md:px-12 py-20 lp-border border-x-0 border-t-0 bg-[#f5f2eb]">
      <div className="max-w-6xl mx-auto">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-3">Platform Preview</div>
        <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight mb-8">
          Built for how researchers actually work.
        </h2>

        <div className="flex flex-wrap gap-0 lp-border border-b-0 bg-white">
          {PREVIEW_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-mono text-[11px] font-bold cursor-pointer border-0 border-r lp-border border-t-0 border-l-0 transition-colors ${
                  activeTab === t.id ? "lp-preview-tab-active" : "bg-stone-50 text-[#666] hover:bg-stone-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="lp-border lp-shadow-lg bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b lp-border border-x-0 border-t-0">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#ffd000] border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#00c48c] border border-black" />
            <div className="flex-1 mx-3 bg-white border lp-border border-[1.5px] px-3 py-1 font-mono text-[10px] text-[#666] truncate">
              https://{tab.url}
            </div>
          </div>

          <div className="p-4 md:p-6 min-h-[320px] bg-[#fafafa]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "dash" && <PreviewDashboard />}
                {activeTab === "cites" && <PreviewCitations />}
                {activeTab === "ai" && <PreviewAi />}
                {activeTab === "team" && <PreviewTeam />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewDashboard() {
  return (
    <div className="grid grid-cols-12 gap-3 min-h-[280px]">
      <div className="col-span-4 bg-white lp-border p-3 hidden sm:block">
        <div className="font-mono text-[9px] font-bold text-[#888] mb-2 tracking-widest">VAULT NODES</div>
        <div className="lp-border bg-[#ffd000]/10 p-2 mb-2">
          <div className="font-mono text-[8px] font-bold">PRIVATE · OWNER</div>
          <div className="font-display font-bold text-[11px] mt-1">AI FOUNDATIONS</div>
        </div>
        <div className="lp-border p-2 opacity-60">
          <div className="font-mono text-[8px]">PUBLIC · CONTRIBUTOR</div>
          <div className="font-display font-bold text-[11px] mt-1">CLIMATE DATASETS</div>
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 bg-white lp-border p-4">
        <div className="font-display font-bold text-sm mb-3">AI FOUNDATIONS — Overview</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: "12", l: "Sources" },
            { n: "47", l: "Annotations" },
            { n: "3", l: "Members" },
          ].map((s) => (
            <div key={s.l} className="lp-border p-2 text-center">
              <div className="font-mono text-lg font-bold">{s.n}</div>
              <div className="font-mono text-[8px] text-[#888]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewCitations() {
  return (
    <div className="space-y-2">
      {[
        { title: "Attention Is All You Need", authors: "Vaswani et al.", year: "2017" },
        { title: "BERT: Pre-training of Deep Bidirectional Transformers", authors: "Devlin et al.", year: "2019" },
      ].map((s) => (
        <div key={s.title} className="bg-white lp-border p-3 flex items-start gap-3">
          <FileText className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-display font-bold text-[13px]">{s.title}</div>
            <div className="font-mono text-[10px] text-[#888] mt-0.5">{s.authors} · {s.year}</div>
          </div>
          <span className="ml-auto font-mono text-[8px] font-bold bg-[#00c48c]/20 text-[#00c48c] px-1.5 py-0.5 shrink-0">INDEXED</span>
        </div>
      ))}
    </div>
  );
}

function PreviewAi() {
  return (
    <div className="bg-white lp-border p-4 max-w-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#ffd000]" />
        <span className="font-mono text-[10px] font-bold">Grounded Q&A</span>
      </div>
      <div className="bg-stone-50 lp-border p-2 mb-2 font-mono text-[11px]">
        What scaling factor does the Transformer use in attention?
      </div>
      <div className="bg-black text-[#ccc] p-3 font-mono text-[11px] leading-relaxed">
        The scaling factor is <span className="text-[#ffd000]">1/√d_k</span>, applied before the softmax to counteract large dot products in high dimensions (Vaswani et al., §3.2.1).
      </div>
    </div>
  );
}

function PreviewTeam() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { name: "Dr. Seer Ijj", role: "OWNER", color: "bg-[#ffd000]" },
        { name: "Prof. Carter", role: "CONTRIBUTOR", color: "bg-[#00b8d9]" },
        { name: "Dr. Rostova", role: "VIEWER", color: "bg-stone-300" },
      ].map((m) => (
        <div key={m.name} className="bg-white lp-border p-4 text-center">
          <div className={`w-10 h-10 ${m.color} lp-border mx-auto mb-2 flex items-center justify-center font-display font-bold text-sm`}>
            {m.name.charAt(0)}
          </div>
          <div className="font-display font-bold text-[13px]">{m.name}</div>
          <div className="font-mono text-[9px] font-bold text-[#888] mt-1">{m.role}</div>
        </div>
      ))}
    </div>
  );
}
