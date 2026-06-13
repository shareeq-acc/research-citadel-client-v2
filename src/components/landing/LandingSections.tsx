"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PROCESS_STEPS, COLLAB_ITEMS, FEATURES, ROLES } from "./landing-data";

export function LandingProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const step = PROCESS_STEPS[activeStep];

  return (
    <section id="process" className="scroll-mt-20 px-4 md:px-12 py-20 lp-border border-x-0 border-t-0 bg-[#f5f2eb]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-3">Process</div>
            <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight">
              From paper to
              <br />
              insight, step by step.
            </h2>
          </div>
          <p className="text-[15px] text-[#555] leading-relaxed self-end">
            Research Citadel is built around how teams actually work — create vaults, upload papers, analyse with AI, annotate together, and communicate without ever leaving the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {PROCESS_STEPS.map((s, i) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`text-left border-4 border-black p-4 cursor-pointer transition-all rounded-sm ${
                  activeStep === i
                    ? "bg-yellow-300 shadow-[4px_4px_0px_#000] -translate-y-0.5"
                    : "bg-white shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-xs font-black ${activeStep === i ? "text-black" : "text-stone-400"}`}>{s.num}</span>
                  <span className={`font-mono text-[9px] font-black tracking-widest uppercase ${activeStep === i ? "text-black/70" : "text-stone-400"}`}>{s.tag}</span>
                </div>
                <div className="font-display font-black text-sm mt-1.5 uppercase tracking-tight">{s.title}</div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-4 border-black rounded-sm shadow-[6px_6px_0px_#000] overflow-hidden h-full min-h-[280px] flex flex-col"
              >
                {/* Header bar */}
                <div className="bg-yellow-300 border-b-4 border-black px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-black rounded-none border-2 border-black" />
                    <span className="font-mono text-[9px] font-black tracking-[0.2em] uppercase text-black">{step.tag}</span>
                  </div>
                  <span className="text-[8px] font-mono font-black bg-white border-2 border-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider">
                    Step {step.num}
                  </span>
                </div>

                {/* Content body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-black">{step.title}</h3>
                  <p className="text-[13px] text-stone-600 leading-relaxed mt-3 mb-5 font-sans font-medium">{step.desc}</p>

                  {/* Neobrutalist chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className="font-mono text-[9px] font-black px-2.5 py-1 bg-stone-50 border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Footer navigation */}
                  <div className="mt-auto pt-4 border-t-2 border-dashed border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {PROCESS_STEPS.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveStep(i)}
                          className={`w-3 h-3 border-2 border-black cursor-pointer transition-all ${
                            i === activeStep ? "bg-yellow-300 shadow-[1px_1px_0px_#000]" : "bg-stone-100 hover:bg-stone-200"
                          }`}
                        />
                      ))}
                      <span className="font-mono text-[9px] text-stone-500 font-bold ml-2">
                        {activeStep + 1}/{PROCESS_STEPS.length}
                      </span>
                    </div>
                    {activeStep < PROCESS_STEPS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveStep((s) => s + 1)}
                        className="font-display font-black text-[10px] text-black bg-yellow-300 px-3.5 py-1.5 border-2 border-black shadow-[2.5px_2.5px_0px_#000] cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all uppercase tracking-wider"
                      >
                        Next step →
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollabPreview({ type }: { type: string }) {
  if (type === "presence") {
    return (
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {["SEER · EDITING", "CARTER · EDITING", "ROSTOVA · VIEWING"].map((p, i) => (
            <span
              key={p}
              className={`font-mono text-[8px] font-bold px-2 py-0.5 border ${
                i < 2 ? "bg-[#ffd000]/20 border-[#ffd000] text-[#ffd000]" : "bg-white/10 border-[#555] text-[#888]"
              }`}
            >
              {p}
            </span>
          ))}
        </div>
        <div className="border border-[#222] p-2.5 text-[11px] text-[#555] font-mono leading-relaxed">
          Section 3.2.2 Multi-Head Attention
          <span className="border-r-2 border-[#ffd000] lp-cursor-blink ml-0.5">&nbsp;</span>
        </div>
      </div>
    );
  }
  if (type === "chat") {
    return (
      <div className="mt-4 space-y-2 font-mono text-[10px]">
        <div className="bg-[#111] border border-[#333] p-2 rounded-sm">
          <span className="text-[#ffd000] font-bold">@seer</span>
          <span className="text-[#888]"> Can you verify the attention scaling in §3?</span>
        </div>
        <div className="bg-[#111] border border-[#333] p-2 rounded-sm ml-4">
          <span className="text-[#00b8d9] font-bold">seer</span>
          <span className="text-[#aaa]"> Confirmed — see Vaswani et al. p.4</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[8px]">
      <div className="bg-blue-950/40 border border-blue-800 p-2 text-blue-200">Your edit: boundary at 2GM</div>
      <div className="bg-rose-950/40 border border-rose-800 p-2 text-rose-200">Peer edit: constraints at 2GM</div>
      <div className="col-span-2 bg-emerald-950/40 border border-emerald-700 p-2 text-emerald-200">
        ✓ Merged: unified boundary conditions at r = 2GM
      </div>
    </div>
  );
}

export function LandingCollab() {
  return (
    <section id="collab" className="scroll-mt-20 bg-black text-white px-4 md:px-12 py-20 lp-border border-x-0 border-t-0">
      <div className="max-w-6xl mx-auto">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#666] uppercase mb-3">Collaboration</div>
        <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight mb-12">
          Built for teams who think together.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLLAB_ITEMS.map((item) => (
            <div key={item.title} className="border border-[#222] p-6 hover:border-[#ffd000] transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 border border-[#333] flex items-center justify-center text-[#aaa] group-hover:border-[#ffd000] group-hover:text-[#ffd000] transition-colors">
                  <Check className="w-5 h-5" />
                </div>
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#ffd000]">{item.badge}</span>
              </div>
              <div className="font-display font-bold text-lg mb-2">{item.title}</div>
              <div className="text-[13px] text-[#888] leading-relaxed mb-2">{item.desc}</div>
              <CollabPreview type={item.preview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 px-4 md:px-12 py-20 lp-border border-x-0 border-t-0 bg-[#f5f2eb]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-3">Features</div>
            <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight">
              Everything your research team needs.
            </h2>
          </div>
          <p className="text-[15px] text-[#555] leading-relaxed self-end">
            From solo researchers to multi-institution collaborations — vaults, citations, AI Q&A, and live annotations in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white lp-border p-6 lp-shadow hover:-translate-y-1 hover:lp-shadow-lg transition-all duration-150">
              <div className="w-11 h-11 lp-border flex items-center justify-center mb-4 bg-[#ffd000]/10">
                <Icon className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="font-display font-bold text-base mb-2">{title}</div>
              <div className="text-[13px] text-[#555] leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingRoles() {
  return (
    <section className="px-4 md:px-12 py-20 lp-border border-x-0 border-t-0 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-3">Access Control</div>
        <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight mb-12">
          The right access
          <br />
          for every collaborator.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((role) => (
            <div key={role.name} className="bg-[#0a0a0a] text-white lp-border p-6 lp-shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display font-extrabold text-lg">{role.name}</div>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 ${role.badgeClass}`}>{role.badge}</span>
              </div>
              <ul className="space-y-2.5 list-none m-0 p-0">
                {role.perms.map((p) => (
                  <li key={p.text} className="flex items-center gap-2 font-mono text-[11px] text-[#aaa]">
                    {p.ok ? (
                      <Check className="w-3.5 h-3.5 text-[#00c48c] shrink-0 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#555] shrink-0 stroke-[2.5]" />
                    )}
                    {p.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
