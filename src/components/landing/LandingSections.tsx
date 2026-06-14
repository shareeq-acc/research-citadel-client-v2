"use client";

import React, { useState } from "react";
import { Check, X, Radio, Crown, Send } from "lucide-react";
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
                {/* Browser URL Header Bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b-4 border-black shrink-0">
                  <span className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#ffd000] border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#00c48c] border border-black" />
                  <div className="flex-1 mx-3 bg-white border-2 border-black px-3 py-1 font-mono text-[10px] text-[#666] truncate text-left">
                    https://{step.url}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 flex-1 flex flex-col text-left">
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span className="font-mono text-[9px] font-black bg-yellow-300 border-2 border-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider text-black">
                      STEP {step.num}
                    </span>
                    <span className="font-mono text-[9px] font-black tracking-widest text-stone-500 uppercase">{step.tag}</span>
                  </div>
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
}function CollabPreview({ type }: { type: string }) {
  if (type === "presence") {
    return (
      <div className="mt-4 shrink-0 select-none">
        {/* Workspace Peer Presence (3) Row */}
        <div className="bg-[#FAF7F2] border-2 border-black p-2.5 rounded-sm shadow-[2px_2px_0px_#000] space-y-2 text-left">
          <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-stone-300">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-700" />
              <span className="font-mono text-[8.5px] font-black tracking-wider uppercase text-black">
                Workspace Peer Presence (3):
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7.5px] font-mono font-black text-black flex items-center gap-1">
                <span className="inline-block border border-black w-2.5 h-2.5 bg-black text-white text-[7px] text-center leading-none">✓</span>
                MOCK CO-SCHOLARS
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Samuel Charlie", badge: "EDITING", color: "bg-amber-100 border-amber-400 text-amber-900" },
              { name: "Mufa Bhai (You)", badge: "EDITING", color: "bg-amber-100 border-amber-400 text-amber-900" },
              { name: "Shahzad", badge: "VIEWING", color: "bg-sky-50 border-sky-300 text-sky-955" }
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-black rounded-sm text-[8px] font-mono font-bold text-black shadow-[1px_1px_0px_#000]"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-black bg-stone-100 flex items-center justify-center font-black text-[6.5px] uppercase">
                  {p.name.substring(0, 2)}
                </div>
                <span>{p.name}</span>
                <span className={`px-1 text-[6.5px] font-black uppercase rounded-xs border ${p.color}`}>
                  {p.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 flex justify-end">
            <span className="text-[7.5px] font-mono font-black text-red-700 border-2 border-red-500 bg-white px-2 py-0.5 shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider">
              Simulate Conflict Edit
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "chat") {
    return (
      <div className="mt-4 space-y-4 shrink-0 font-mono text-[9px] text-left select-none bg-stone-50 border-2 border-black p-3.5 rounded-sm shadow-[2px_2px_0px_#000]">
        {/* Msg 1 (Left aligned) */}
        <div className="space-y-1.5">
          <div className="text-[8px] text-stone-550 font-bold">
            Mufa Bhai · 07:59 PM
          </div>
          <div className="bg-white border-2 border-black p-2.5 rounded-sm shadow-[2.5px_2.5px_0px_#000] text-stone-900 inline-block max-w-[90%] font-medium">
            Have you looked into the annotation?
          </div>
          <div className="text-[7.5px] text-stone-400 hover:text-stone-600 pl-0.5 cursor-pointer font-bold">
            ← Reply
          </div>
        </div>

        {/* Msg 2 (Right aligned / Reply) */}
        <div className="space-y-1.5 flex flex-col items-end">
          <div className="text-[8px] text-stone-550 font-bold self-end pr-1">
            Samuel Charlie · 08:00 PM
          </div>
          <div className="border-l-[3px] border-orange-500 bg-stone-100 p-2 text-stone-600 text-[8px] rounded-r-sm max-w-[85%] flex flex-col gap-0.5 leading-snug border border-stone-200">
            <span className="font-bold text-stone-700 leading-none">↳ @Mufa Bhai</span>
            <span>"Have you looked into the annotation?"</span>
          </div>
          <div className="bg-yellow-300 border-2 border-black p-2.5 rounded-sm shadow-[2.5px_2.5px_0px_#000] text-black inline-block max-w-[90%] font-bold">
            I am just taking a look into it
          </div>
        </div>

        {/* Msg 3 (Left aligned) */}
        <div className="space-y-1.5">
          <div className="text-[8px] text-stone-550 font-bold">
            Shahzad · 08:02 PM
          </div>
          <div className="bg-white border-2 border-black p-2.5 rounded-sm shadow-[2.5px_2.5px_0px_#000] text-stone-900 inline-block max-w-[90%] font-medium">
            I have some great insights that AI shared with me!
          </div>
        </div>
      </div>
    );
  }

  // Access / Roles card
  return (
    <div className="mt-4 border-4 border-black rounded-sm shadow-[3px_3px_0px_#000] bg-white overflow-hidden flex flex-col shrink-0 select-none">
      {/* Header bar */}
      <div className="bg-emerald-300 border-b-2 border-black px-3.5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-black" />
          <span className="font-mono text-[9px] font-black tracking-wider uppercase text-black">Active Researchers</span>
        </div>
        <span className="text-[7px] font-mono font-black bg-white border border-black px-1.5 py-0.5 shadow-[1px_1px_0px_#000] uppercase tracking-wider">
          Invite
        </span>
      </div>

      {/* Access body */}
      <div className="p-3 bg-stone-50 space-y-3 font-mono text-[9px] text-left">
        <div className="space-y-2">
          <div className="bg-white border-2 border-black p-2 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4.5 h-4.5 rounded-full border border-black bg-emerald-100 flex items-center justify-center font-black text-[7px] uppercase">
                PC
              </div>
              <span className="font-bold text-stone-900 block truncate">Prof. Carter</span>
            </div>
            <span className="bg-emerald-100 text-emerald-955 border border-emerald-300 text-[6.5px] font-black uppercase px-1 rounded-sm">
              CONTRIBUTOR
            </span>
          </div>

          <div className="bg-white border-2 border-black p-2 rounded-sm shadow-[1.5px_1.5px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4.5 h-4.5 rounded-full border border-black bg-stone-200 flex items-center justify-center font-black text-[7px] uppercase">
                RO
              </div>
              <span className="font-bold text-stone-900 block truncate">Dr. Rostova</span>
            </div>
            <span className="bg-stone-100 text-stone-700 border border-stone-300 text-[6.5px] font-black uppercase px-1 rounded-sm">
              VIEWER
            </span>
          </div>
        </div>

        {/* Invite search bar mockup */}
        <div className="bg-white border-2 border-black p-2 rounded-sm shadow-[1.5px_1.5px_0px_#000] space-y-1.5 text-left">
          <div className="text-[6.5px] font-black text-stone-500 uppercase">➕ Invite Member</div>
          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value="Dr. Adrian"
              className="flex-1 px-2 py-1 text-[8px] border border-black bg-stone-50"
            />
            <button
              type="button"
              className="px-2 py-1 bg-yellow-300 border border-black font-black text-[7.5px] uppercase tracking-wider shadow-[1px_1px_0px_#000] cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingCollab() {
  return (
    <section id="collab" className="scroll-mt-20 bg-white text-black px-4 md:px-12 py-20 border-b-4 border-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#888] uppercase mb-3">Collaboration</div>
            <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight">
              Built for teams who
              <br />
              think together.
            </h2>
          </div>
          <p className="text-[15px] text-[#555] leading-relaxed self-end">
            Research Citadel is built for seamless scholarly teamwork — co-write annotations, discuss papers in dedicated contextual channels, and manage collaborator access easily.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLLAB_ITEMS.map((item, idx) => {
            const colors = [
              { bg: "bg-yellow-300" },
              { bg: "bg-sky-300" },
              { bg: "bg-emerald-300" },
            ];
            const color = colors[idx % colors.length];

            return (
              <div
                key={item.title}
                className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-10 h-10 border-2 border-black ${color.bg} flex items-center justify-center text-black shadow-[2px_2px_0px_#000]`}>
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <span className="font-mono text-[9px] font-black tracking-widest bg-black text-white px-2 py-0.5 uppercase">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg mb-2.5 uppercase tracking-tight text-black">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-stone-600 leading-relaxed mb-4 font-sans font-medium">
                    {item.desc}
                  </p>
                </div>
                <CollabPreview type={item.preview} />
              </div>
            );
          })}
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
