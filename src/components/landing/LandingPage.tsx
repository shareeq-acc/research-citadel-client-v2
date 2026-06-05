"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, Check, ArrowRight, Lock, Eye, Users, Database, 
  Library, Sparkles, Activity, Play, AlertCircle, RefreshCw,
  Clock, GitMerge, Settings, HelpCircle, ArrowUpRight, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

interface LandingPageProps {
  currentUser: any;
  onNavigate: (path: string) => void;
}

export default function LandingPage({ currentUser, onNavigate }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [sandboxInput, setSandboxInput] = useState(
    `# Transformer Attention Mechanics
A quantitative study on self-attention matrix dimensions under multi-node distributed training runs:

- **Dot-Product Scaling Bounds:** Established as O(N² · d) memory complexity.
- **Lattice Constraint Check:** Achieved via sparse attention layers to constrain window sizes.

> Peer Note: Empirical benchmarks confirm cross-node context remains fully synchronized during co-authoring blocks.`
  );

  const sandboxPresets = [
    {
      title: "Attention Mechanics",
      text: `# Transformer Attention Mechanics
A quantitative study on self-attention matrix dimensions under multi-node distributed training runs:

- **Dot-Product Scaling Bounds:** Established as O(N² · d) memory complexity.
- **Lattice Constraint Check:** Achieved via sparse attention layers to constrain window sizes.

> Peer Note: Empirical benchmarks confirm cross-node context remains fully synchronized during co-authoring blocks.`
    },
    {
      title: "Schwarzschild Spacetime",
      text: `# Gravitational Boundary Conditions
Mathematical exploration of space-time metrics nearing high-density astronomical boundaries:

- **Apparent Horizon Threshold:** Defined strictly when r reaches 2GM.
- **Radial Invariant Verification:** Verified via Schwarzschild spacetime solutions.

> Peer Note: Dynamic modeling indicates high stability under custom peer integration schemas.`
    },
    {
      title: "Genomic Sequencing",
      text: `# Chromosome Topology Analysis
Deciphering transcription factor localization within primary nucleotide sequence assemblies:

- **Consensus Sequence Splitting:** Splicing coordinates validated across 5'-GT...AG-3' enclaves.
- **Binding Affinity Ranges:** Enhanced stabilization located in nucleotide zones -10 to -35.

> Peer Note: Real-time annotation logs show pristine alignment across target DNA strands.`
    }
  ];

  // Auto-rotate tabs to showcase live capability if user hasn't clicked
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-black flex flex-col font-sans select-none relative bg-[linear-gradient(to_right,#e0e0e0_1px,transparent_1px),linear-gradient(to_bottom,#e0e0e0_1px,transparent_1px)] bg-[size:32px_32px]">
      
      {/* HEADER NAVIGATION */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50 px-4 md:px-8 py-4 shrink-0 shadow-[0_4px_0px_#000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate("/")}>
            <div className="w-11 h-11 bg-yellow-300 border-4 border-black font-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <Library className="w-6 h-6 text-black stroke-[3]" />
            </div>
            <div>
              <h1 className="font-mono font-black text-sm md:text-base tracking-tight leading-none uppercase">
                Research Citadel
              </h1>
              <span className="inline-block px-1.5 py-0.5 mt-1 bg-black text-yellow-300 text-[8px] font-mono font-bold uppercase">
                Academic Co-Writing Engine
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => {
                const el = document.getElementById("walk");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-mono font-black uppercase tracking-wider text-black hover:bg-yellow-300 border-2 border-transparent hover:border-black px-3 py-1.5 transition-all duration-150 cursor-pointer"
            >
              Scholar Walk
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("playground");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-mono font-black uppercase tracking-wider text-black hover:bg-yellow-300 border-2 border-transparent hover:border-black px-3 py-1.5 transition-all duration-150 cursor-pointer"
            >
              Notation Playground
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("specs");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-mono font-black uppercase tracking-wider text-black hover:bg-yellow-300 border-2 border-transparent hover:border-black px-3 py-1.5 transition-all duration-150 cursor-pointer"
            >
              Specs & Features
            </button>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">ACTIVE SCHOLAR</span>
                  <span className="text-xs font-mono font-black text-black">{currentUser.name}</span>
                </div>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-none border-3 border-black shadow-[2px_2px_0px_#000]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 bg-yellow-300 border-3 border-black flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_#000]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="px-4 py-2 bg-yellow-300 text-black border-3 border-black font-mono font-black text-xs cursor-pointer shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0px_#000] transition-all duration-150 flex items-center gap-1.5"
                >
                  Enter Workspace
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="text-xs font-mono font-black uppercase tracking-wider text-black hover:bg-stone-200 border-2 border-transparent hover:border-black px-3 py-1.5 transition-all duration-150 cursor-pointer"
                >
                  Register
                </button>
                <button
                  onClick={() => onNavigate("/dashboard")}
                  className="px-4 py-2 bg-white text-black border-3 border-black font-mono font-black text-xs cursor-pointer shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0px_#000] transition-all duration-150 flex items-center gap-1.5"
                >
                  Sign In
                  <Lock className="w-3.5 h-3.5 text-black stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-4 py-16 md:py-24 bg-white border-b-4 border-black relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF] border-3 border-black font-mono font-extrabold text-xs text-black shadow-[3px_3px_0px_#000]">
              <Sparkles className="w-4 h-4 text-black" />
              THE PEER-TO-PEER CO-AUTHORING PROTOCOL
            </span>

            <h1 className="font-mono font-black text-4xl sm:text-6xl text-black leading-tight uppercase tracking-tight">
              Isolate your literature reviews. <br />
              <span className="bg-yellow-300 text-black px-3 py-1 border-4 border-black inline-block my-2 shadow-[5px_5px_0px_#000]">
                Query your sources.
              </span> <br />
              Write without merge conflicts.
            </h1>

            <p className="text-sm sm:text-base text-stone-800 leading-relaxed max-w-xl font-mono font-semibold">
              We got tired of slow, stuffy academic tools and nightmare file overwrites when writing our papers. Research Citadel lets your university lab partners drag raw papers into private vaults, annotate code and math side-by-side, and resolve concurrent saves instantly at the paragraph level.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => onNavigate("/dashboard")}
                className="px-8 py-4 bg-yellow-300 text-black border-4 border-black font-mono font-black text-sm uppercase cursor-pointer shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all duration-150 flex items-center justify-center gap-2"
              >
                Launch Scholar Citadel →
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById("walk");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-white text-black border-4 border-black font-mono font-black text-sm uppercase cursor-pointer shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all duration-150 flex items-center justify-center gap-2"
              >
                Review Scholar Walk
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t-4 border-black max-w-lg">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 border-3 border-black bg-red-400 font-bold text-xs flex items-center justify-center font-mono">
                  DR
                </div>
                <div className="w-9 h-9 border-3 border-black bg-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                  AJ
                </div>
                <div className="w-9 h-9 border-3 border-black bg-purple-400 font-bold text-xs flex items-center justify-center font-mono">
                  KS
                </div>
              </div>
              <span className="text-[11px] font-mono leading-tight text-stone-700 font-black">
                Built by students and researchers for tech-savvy lab peers who value clean data formats and absolute sanity.
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Mock Panel */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Visual Backing Accent Card */}
            <div className="absolute inset-x-0 -bottom-6 h-full bg-black border-4 border-black z-0 transform rotate-1" />
            
            {/* Main Interactive Container */}
            <div className="relative z-10 bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] space-y-6">
              
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b-4 border-black pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-none bg-red-500 inline-block border-2 border-black" />
                  <span className="w-3.5 h-3.5 rounded-none bg-yellow-400 inline-block border-2 border-black" />
                  <span className="w-3.5 h-3.5 rounded-none bg-green-500 inline-block border-2 border-black" />
                </div>
                <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-0.5 border-2 border-black">
                  <Activity className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span className="text-[9px] font-mono font-black text-black">WORKSPACE.LIVE_STREAM</span>
                </div>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 border-4 border-black p-1 bg-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveTab(0)}
                  className={`py-2 px-1 text-center font-mono font-black text-[10px] uppercase transition-all duration-150 cursor-pointer ${
                    activeTab === 0
                      ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                      : "text-stone-500 hover:text-black"
                  }`}
                >
                  [01. INGEST]
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className={`py-2 px-1 text-center font-mono font-black text-[10px] uppercase transition-all duration-150 cursor-pointer ${
                    activeTab === 1
                      ? "bg-[#6ee7b7] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                      : "text-stone-500 hover:text-black"
                  }`}
                >
                  [02. SYNC]
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className={`py-2 px-1 text-center font-mono font-black text-[10px] uppercase transition-all duration-150 cursor-pointer ${
                    activeTab === 2
                      ? "bg-rose-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                      : "text-stone-500 hover:text-black"
                  }`}
                >
                  [03. RESOLVE]
                </button>
              </div>

              {/* Dynamic View Area */}
              <div className="min-h-[220px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* Tab 1: INGEST */}
                    {activeTab === 0 && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-mono font-black text-sm text-black underline">
                            Automated Literature Ingestion
                          </h4>
                          <p className="text-xs text-stone-700 font-mono mt-1">
                            Drop PDFs, markdown, or text directly into isolated research environments. The system instantly parses texts and extracts citations into local, queryable indexes.
                          </p>
                        </div>

                        {/* Interactive dropzone and status items */}
                        <div className="border-4 border-dashed border-black bg-stone-50 p-4 text-center">
                          <FileText className="w-8 h-8 mx-auto mb-1 text-black" />
                          <span className="text-[10px] font-mono font-black text-black block uppercase">
                            DRAG RAW RESEARCH DOCUMENT HERE
                          </span>
                          <span className="text-[8px] text-stone-500 font-mono font-bold block mt-0.5">
                            PDF, MD, or Web Datasets parsed instantly
                          </span>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between border-2 border-black p-1.5 bg-emerald-50">
                            <span className="text-[10px] font-mono font-bold text-black flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                              Attention Is All You Need (PDF)
                            </span>
                            <span className="bg-[#a7f3d0] text-emerald-900 border border-black font-mono text-[8px] px-1.5 font-bold uppercase">
                              [INDEXED]
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-2 border-black p-1.5 bg-yellow-50">
                            <span className="text-[10px] font-mono font-bold text-black flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />
                              Gemini Multimodal Models (Web Article)
                            </span>
                            <span className="bg-[#fef08a] text-amber-900 border border-black font-mono text-[8px] px-1.5 font-bold uppercase">
                              [TEXT ONLY]
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: SYNC */}
                    {activeTab === 1 && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-mono font-black text-sm text-black underline">
                            Real-Time Group Annotation
                          </h4>
                          <p className="text-xs text-stone-700 font-mono mt-1">
                            A unified workspace where peer collaborators highlight literature, tag key findings, and map out paper outlines simultaneously without desyncing.
                          </p>
                        </div>

                        {/* Simulated editor highlighting active cursors */}
                        <div className="border-4 border-black p-3.5 bg-white space-y-3 font-mono text-[10px] leading-relaxed">
                          <div className="border-b-2 border-black pb-1.5 flex justify-between items-center text-[8px] text-stone-500 font-black">
                            <span>superconductivity-v3.md</span>
                            <span className="text-emerald-700 font-bold uppercase animate-pulse">● 2 Researchers Online</span>
                          </div>
                          
                          <p className="text-stone-800 leading-normal">
                            Using self-attention matrix equations, we characterize the transition temperature boundaries of high-temperature copper compounds.{" "}
                            <span className="bg-yellow-200 border border-black px-1 font-bold relative group cursor-pointer inline">
                              "The transition temp peaks under 140K."
                              <span className="absolute -top-4 right-0 bg-yellow-300 text-black border border-black text-[7px] px-1 py-0 font-bold">
                                [Seer Ijj: Key Methodology]
                              </span>
                            </span>{" "}
                            This matches the expected baseline formula calculations.
                          </p>
                          
                          <div className="p-2 border-2 border-black bg-stone-50 text-[9px] text-stone-600 font-bold">
                            <strong className="text-black">Adrian Carter added LaTeX:</strong> {"$T_c \\approx 140\\text{K} \\implies$ verified."}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-stone-600 font-bold">
                          <div>
                            <span className="text-black block">ACTIVE EDITOR</span>
                            Prof. Vance (Typing...)
                          </div>
                          <div>
                            <span className="text-black block">WORKSPACE PATHWAY</span>
                            lab-4-critical-path
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: RESOLVE */}
                    {activeTab === 2 && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-mono font-black text-sm text-black underline">
                            Paragraph-Level Conflict Safeguards
                          </h4>
                          <p className="text-xs text-stone-700 font-mono mt-1">
                            The definitive solution to collaborative overwriting. When multiple researchers edit the same sentence at 3:00 AM, changes are gracefully merged at the paragraph level rather than creating chaotic file conflicts.
                          </p>
                        </div>

                        {/* 3-Panel Diff Block layout */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {/* User Edits */}
                            <div className="border-2 border-black bg-blue-50 p-2 font-mono text-[8px] leading-tight flex flex-col justify-between">
                              <span className="text-blue-900 font-black underline block mb-1">
                                [YOUR EDIT - 3:02 AM]
                              </span>
                              <p className="text-stone-700">
                                "We establish rigid boundary conditions under severe gravitational forces, specifically when r reaches 2GM."
                              </p>
                            </div>

                            {/* Collaborator Edits */}
                            <div className="border-2 border-black bg-rose-50 p-2 font-mono text-[8px] leading-tight flex flex-col justify-between">
                              <span className="text-rose-900 font-black underline block mb-1">
                                [ALICE EDIT - 3:02 AM]
                              </span>
                              <p className="text-stone-700">
                                "We compute rigid boundary constraints for dense astronomical masses, restricting boundaries strictly when r hits 2GM."
                              </p>
                            </div>
                          </div>

                          {/* Reconciled Output */}
                          <div className="border-4 border-black bg-emerald-50 p-2 font-mono text-[9px] leading-tight">
                            <span className="text-emerald-900 font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-black pb-1 mb-1">
                              <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
                              RECONCILED UNIFIED RESOLUTION (AUTO-MERGED)
                            </span>
                            <p className="text-black italic font-semibold">
                              "We establish rigid boundary conditions and constraints under high-density gravitational fields, restricting boundaries strictly when r reaches 2GM."
                            </p>
                            <span className="text-[7px] text-emerald-800 font-extrabold mt-1 block font-mono">
                              ✓ Both contributions maintained. Zero git collisions. Absolute sanity preserved.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Direct Action inside the card */}
                <div className="pt-4 mt-2">
                  <button 
                    onClick={() => onNavigate("/dashboard")}
                    className="w-full py-3 bg-black text-white border-3 border-black font-mono font-black text-xs uppercase hover:bg-yellow-300 hover:text-black hover:shadow-[4px_4px_0px_#000] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    Join Citadel Workspace
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SCHOLAR WALK - PIPELINE OVERVIEW */}
      <section id="walk" className="scroll-mt-24 px-4 py-16 bg-stone-50 border-b-4 border-black relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-left space-y-2.5 max-w-2xl border-l-8 border-black pl-4">
            <span className="bg-black text-white font-mono text-[9px] font-bold uppercase px-2 py-0.5 border border-black">
              THE WORKSPACE BLUEPRINT
            </span>
            <h2 className="font-mono font-black text-3xl md:text-5xl uppercase tracking-tight text-black">
              A Scholar's Workspace Walk
            </h2>
            <p className="text-xs sm:text-sm text-stone-800 font-mono font-bold">
              Follow our practical pipeline to safely gather, annotate, and write peer research papers together.
            </p>
          </div>

          {/* Steps in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 border-3 border-black bg-yellow-300 flex items-center justify-center font-mono font-black text-sm">
                  1
                </div>
                <h3 className="font-mono font-black text-base uppercase text-black underline">
                  Assemble Private Vaults
                </h3>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  Establish private scholarly directories restricted to specific team peers. Invite colleagues directly via simple credential access keys. No global advertising, pure isolation.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[9px] font-mono font-black bg-stone-100 border border-black px-1.5 py-0.5 text-stone-700">
                  PROTOCOL: CLOSED BOX
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 border-3 border-black bg-[#9df1d4] flex items-center justify-center font-mono font-black text-sm">
                  2
                </div>
                <h3 className="font-mono font-black text-base uppercase text-black underline">
                  Annotate and Typeset
                </h3>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  Collaborators highlight papers in real-time, write equations with native LaTeX support, and index citation sequences automatically. Keep prose and findings organized together.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[9px] font-mono font-black bg-stone-100 border border-black px-1.5 py-0.5 text-stone-700">
                  TYPESETTING: LATEX
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 border-3 border-black bg-rose-300 flex items-center justify-center font-mono font-black text-sm">
                  3
                </div>
                <h3 className="font-mono font-black text-base uppercase text-black underline">
                  Concordant Paragraph Merges
                </h3>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  The integrated conflict-checking compiler monitors inputs. If concurrent saves match, the system compiles variations block-by-block, safeguarding data integrity without overwriting notes.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[9px] font-mono font-black bg-stone-100 border border-black px-1.5 py-0.5 text-stone-700">
                  MERGE ENGINE: CONCORDANT
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* NOTATION PLAYGROUND */}
      <section id="playground" className="scroll-mt-24 px-4 py-16 bg-white border-b-4 border-black relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Playground Editor */}
          <div className="lg:col-span-6 bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="bg-yellow-300 text-black font-mono text-[9px] font-bold uppercase px-2 py-0.5 border-2 border-black inline-block">
                INTERACTIVE PREVIEW LAB
              </span>
              <h2 className="font-mono font-black text-2xl md:text-3xl uppercase text-black">
                Scholarly Notation Sandbox
              </h2>
              <p className="text-xs text-stone-700 font-mono">
                Synthesize observations, structure peer arguments, and embed blockquotes. Witness how our parser structures formulas and clean markdown notation instantly.
              </p>

              {/* Subject presets selection */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-black text-stone-500 uppercase block">
                  Select Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sandboxPresets.map((pr, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setSandboxInput(pr.text)}
                      className="px-2.5 py-1 bg-white hover:bg-yellow-300 text-black border-2 border-black text-[9px] font-mono font-black transition-all cursor-pointer"
                    >
                      {pr.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area input */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-stone-500 uppercase block">
                  Edit LaTeX and Markdown prose:
                </label>
                <textarea
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="w-full h-[220px] p-3 border-4 border-black font-mono text-xs bg-stone-50 text-black rounded-none focus:ring-0 focus:outline-none focus:bg-white"
                  placeholder="Enter custom research notes..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate("/dashboard")}
                className="w-full py-3.5 bg-black text-white border-3 border-black font-mono font-black text-xs uppercase hover:bg-yellow-300 hover:text-black hover:shadow-[4px_4px_0px_#000] transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                Inscribe note into persistent Vault
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Compiled Output Sheet */}
          <div className="lg:col-span-6 bg-[#fafafa] border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between h-[520px] lg:h-auto overflow-hidden">
            <div className="space-y-4 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center border-b-4 border-black pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
                  <span className="text-xs font-mono font-black text-black">
                    CITADEL.RENDER_PREVIEW.SHEET
                  </span>
                </div>
                <span className="bg-[#a7f3d0] border border-black text-emerald-900 font-mono text-[9px] font-black px-2 py-0.5">
                  ACTIVE
                </span>
              </div>

              {/* Render viewport */}
              <div className="flex-1 overflow-y-auto px-1 select-text py-2">
                {sandboxInput.trim() ? (
                  <MarkdownRenderer content={sandboxInput} />
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-stone-400 italic text-xs py-10">
                    <span>No annotation or text found inside the sandbox field.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-black pt-3 shrink-0 text-center font-mono text-[9px] text-stone-500 font-bold">
              ✓ Fully parses citations, numbered lists, blockquotes, and LaTeX formatting.
            </div>
          </div>

        </div>
      </section>

      {/* SYSTEM SPECIFICATIONS & FEATURES BENTO */}
      <section id="specs" className="scroll-mt-24 px-4 py-16 bg-stone-50 border-b-4 border-black relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-black bg-stone-200 border-2 border-black px-2 py-0.5 text-black uppercase inline-block">
              SYSTEM CONSTRAINTS &amp; CAPABILITIES
            </span>
            <h2 className="font-mono font-black text-3xl md:text-4xl uppercase text-black">
              Engineered For Scholarly Precision
            </h2>
            <p className="text-xs sm:text-sm text-stone-800 font-mono max-w-xl mx-auto font-semibold">
              Research Citadel relies on absolute file isolation and high-density text synchronization, giving teams a straightforward workspace with zero locked layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Spec 1 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all duration-150">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-black bg-yellow-300 flex items-center justify-center">
                  <Database className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase underline text-black">
                  Isolated Private Vaults
                </h4>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  Decide who gains access to active document directories. Annotations and outlines sit strictly inside invited lab-partner structures, authenticated by verifiable email logins.
                </p>
              </div>
              <div className="pt-4 border-t border-dashed border-stone-200 text-left">
                <span className="text-[8px] font-mono font-black text-stone-400">
                  SYSTEM FLAG: COHORT_RESTRICTED
                </span>
              </div>
            </div>

            {/* Spec 2 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all duration-150">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-black bg-[#9df1d4] flex items-center justify-center">
                  <Users className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase underline text-black">
                  Simultaneous Highlights
                </h4>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  Peer collaborators highlight draft text segments, formulate outlines in real-time, and cross-reference citations concurrently. Follow collaborators' highlights via clear, labeled cursors.
                </p>
              </div>
              <div className="pt-4 border-t border-dashed border-stone-200 text-left">
                <span className="text-[8px] font-mono font-black text-stone-400">
                  SYSTEM FLAG: PEER_STREAM
                </span>
              </div>
            </div>

            {/* Spec 3 */}
            <div className="bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all duration-150">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-black bg-rose-300 flex items-center justify-center">
                  <Check className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase underline text-black">
                  Inline LaTeX Formatting
                </h4>
                <p className="text-xs text-stone-800 font-mono leading-relaxed">
                  Avoid formatting papers in clunky outer terminals. Insert standard mathematical formulas, matrix outlines, and custom citations using clean LaTeX syntax directly in the annotation panels.
                </p>
              </div>
              <div className="pt-4 border-t border-dashed border-stone-200 text-left">
                <span className="text-[8px] font-mono font-black text-stone-400">
                  SYSTEM FLAG: NATIVE_MATH
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* LOWER CALL TO ACTION */}
      <section className="px-4 py-20 bg-white border-b-4 border-black text-center relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-4xl">🎓</div>
          <h2 className="font-mono font-black text-3xl md:text-5xl uppercase tracking-tight text-black">
            Stop Fighting Messy PDF Folders. Let's Write Together.
          </h2>
          <p className="text-xs sm:text-sm text-stone-800 font-mono max-w-lg mx-auto leading-relaxed font-bold">
            Workspaces are persistent, structured, and co-authored in real-time. Share literature comments and mathematical equations with your research colleagues instantly.
          </p>
          <div className="pt-4">
            <button
              onClick={() => onNavigate("/dashboard")}
              className="px-8 py-4.5 bg-yellow-300 text-black border-4 border-black font-mono font-black text-base uppercase cursor-pointer shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[5px_5px_0px_#000] transition-all duration-150 flex items-center justify-center gap-2 mx-auto"
            >
              Launch Custom Vault Now
              <Play className="w-4 h-4 fill-current stroke-[2.5] ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 px-4 md:px-8 border-t-2 border-black select-none mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-black stroke-[2.5]" />
            <span className="font-mono font-black text-xs uppercase tracking-tight text-black">
              Research Citadel &copy; 2026. Custom layout built for lab peers.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-stone-600 font-bold">
            <button onClick={() => onNavigate("/dashboard")} className="hover:underline">LAUNCH ENGINE</button>
            <span>&bull;</span>
            <span className="uppercase text-stone-400">STRUCTURED CITATION ENVIRONMENT v2.1.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
