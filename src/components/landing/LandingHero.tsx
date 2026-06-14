"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, Upload, Sparkles, MessageSquare,
  Lock, Globe, Users, Search, PenLine, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LandingCtaButtons } from "./LandingNav";

interface LandingHeroProps {
  currentUser: { name: string } | null;
  onNavigate: (path: string) => void;
}

/* ─── Hero demo tab data ─── */
const HERO_TABS = [
  { id: "vault", label: "Vaults", icon: Lock },
  { id: "sources", label: "Sources", icon: BookOpen },
  { id: "ai", label: "AI Q&A", icon: Sparkles },
  { id: "collab", label: "Team", icon: Users },
] as const;

type HeroTabId = (typeof HERO_TABS)[number]["id"];

/* ─── Floating cursor data ─── */
const FLOATING_CURSORS = [
  { name: "SC", color: "#f59e0b", x: "72%", y: "32%", delay: 0 },
  { name: "RK", color: "#06b6d4", x: "25%", y: "68%", delay: 0.4 },
  { name: "AL", color: "#a855f7", x: "85%", y: "78%", delay: 0.8 },
];

/* ─── AI typewriter lines ─── */
const AI_LINES = [
  { role: "user", text: "What is the main finding in the climate report?" },
  { role: "ai", text: "Global temperatures rose by 1.2°C since 1850, and Arctic summer ice is declining at a rate of 13% per decade." },
  { role: "source", text: "📄 IPCC_Climate_Report_2024.pdf, Page 14" },
];

export function LandingHero({ currentUser, onNavigate }: LandingHeroProps) {
  const [activeTab, setActiveTab] = useState<HeroTabId>("vault");
  const [aiStep, setAiStep] = useState(0);
  const [aiTyped, setAiTyped] = useState("");

  // Auto-cycle tabs every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = HERO_TABS.findIndex((t) => t.id === prev);
        return HERO_TABS[(idx + 1) % HERO_TABS.length].id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // AI typewriter effect when AI tab is active
  useEffect(() => {
    if (activeTab !== "ai") {
      setAiStep(0);
      setAiTyped("");
      return;
    }
    // Show user question immediately
    setAiStep(1);
    const answerDelay = setTimeout(() => {
      setAiStep(2);
      const fullText = AI_LINES[1].text;
      let i = 0;
      const type = () => {
        if (i < fullText.length) {
          setAiTyped(fullText.slice(0, ++i));
          setTimeout(type, 14 + Math.random() * 8);
        } else {
          // Show source citation after typing
          setTimeout(() => setAiStep(3), 400);
        }
      };
      type();
    }, 800);
    return () => clearTimeout(answerDelay);
  }, [activeTab]);



  const tabUrl = {
    vault: "app.researchcitadel.com/dashboard",
    sources: "app.researchcitadel.com/vault/ai-foundations/sources",
    ai: "app.researchcitadel.com/vault/ai-foundations/qa",
    collab: "app.researchcitadel.com/vault/ai-foundations/members",
  }[activeTab];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-100px)] lp-border border-x-0 border-t-0">
      {/* ─── LEFT: Headline ─── */}
      <div className="lp-hero-grid border-b lg:border-b-0 lg:border-r lp-border border-x-0 border-t-0 px-6 md:px-14 py-16 lg:py-[72px] flex flex-col justify-center relative">
        <h1 className="font-display font-extrabold text-[clamp(2.5rem,6vw,5.25rem)] leading-[0.95] tracking-tight">
          Where Teams
          <br />
          Do Real
          <br />
          Research.
        </h1>

        <p className="mt-6 text-base leading-relaxed text-[#444] max-w-md">
          Create shared vaults, upload your papers, annotate in real-time with your team, and get AI answers grounded strictly in your own documents.
        </p>

        <div className="mt-9">
          <LandingCtaButtons onNavigate={onNavigate} currentUser={currentUser} />
        </div>
      </div>

      {/* ─── RIGHT: Interactive Demo Panel ─── */}
      <div className="bg-[#0a0a0a] px-4 md:px-7 py-8 flex flex-col justify-center relative overflow-hidden">
        {/* Giant watermark */}
        <div className="absolute bottom-1 -right-2 font-display text-[80px] font-extrabold text-white/[0.02] pointer-events-none whitespace-nowrap select-none">
          CITADEL
        </div>

        {/* Browser window frame */}
        <div className="bg-white border-4 border-black rounded-sm shadow-[6px_6px_0px_#ffd000] overflow-hidden relative z-10 flex flex-col max-h-[520px]">
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b-4 border-black shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#ffd000] border border-black" />
            <span className="w-3 h-3 rounded-full bg-[#00c48c] border border-black" />
            <div className="flex-1 mx-3 bg-white border-2 border-black px-3 py-1 font-mono text-[10px] text-[#666] truncate text-left">
              https://{tabUrl}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b-3 border-black bg-stone-50 shrink-0">
            {HERO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[9px] font-black uppercase tracking-wider border-r-2 border-black last:border-r-0 cursor-pointer transition-all ${
                    isActive
                      ? "bg-yellow-300 text-black shadow-[0_-2px_0px_#000_inset]"
                      : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-black"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Live indicator bar */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0a0a0a] border-b-2 border-black shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 lp-live-dot" />
            <span className="font-mono text-[8px] text-stone-400 tracking-widest uppercase">Live Demo</span>
            <div className="flex-1" />
            <div className="flex -space-x-1.5">
              {FLOATING_CURSORS.map((c) => (
                <div
                  key={c.name}
                  className="w-4 h-4 rounded-full border-[1.5px] border-black flex items-center justify-center text-[5px] font-black text-white"
                  style={{ background: c.color }}
                >
                  {c.name}
                </div>
              ))}
            </div>
            <span className="font-mono text-[7px] text-stone-500">3 online</span>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="p-5 text-left h-full"
              >
                {activeTab === "vault" && <HeroDemoVault />}
                {activeTab === "sources" && <HeroDemoSources />}
                {activeTab === "ai" && <HeroDemoAI aiStep={aiStep} aiTyped={aiTyped} />}
                {activeTab === "collab" && <HeroDemoCollab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle progress bar below window */}
        <div className="mt-3 flex gap-1.5 justify-center relative z-10">
          {HERO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="h-1 rounded-full border border-stone-600 cursor-pointer transition-all"
              style={{
                width: activeTab === tab.id ? 32 : 12,
                background: activeTab === tab.id ? "#ffd000" : "#333",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   HERO DEMO PANELS
   ════════════════════════════════════════ */

function HeroDemoVault() {
  const vaults = [
    { name: "AI Foundations", privacy: "PRIVATE", role: "OWNER", sources: 4, desc: "Core papers on deep learning, transformers…", color: "bg-rose-50 border-rose-200" },
    { name: "Climate & Renewables", privacy: "PUBLIC", role: "CONTRIBUTOR", sources: 7, desc: "Atmospheric simulation logs, grid data…", color: "bg-emerald-50 border-emerald-200" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-rose-500 rounded-sm" />
            <div className="w-1 h-3 bg-rose-500 rounded-sm" />
            <div className="w-1 h-3 bg-rose-500 rounded-sm" />
          </div>
          <span className="font-mono text-[9px] font-black tracking-wider uppercase text-black">Vault Nodes (2)</span>
        </div>
        <span className="text-[8px] font-mono font-black bg-white border-2 border-black text-black px-2 py-0.5 shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider">Authorized</span>
      </div>

      {vaults.map((v, i) => (
        <motion.div
          key={v.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.25 }}
          className="border-2 border-black p-3 bg-white rounded-sm shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {v.privacy === "PRIVATE" ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-black border border-black bg-rose-50 text-rose-700 rounded-sm shadow-[1px_1px_0px_#000] uppercase">
                  <Lock className="w-2.5 h-2.5" />PRIVATE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-black border border-black bg-emerald-50 text-emerald-700 rounded-sm shadow-[1px_1px_0px_#000] uppercase">
                  <Globe className="w-2.5 h-2.5" />PUBLIC
                </span>
              )}
            </div>
            <span className="text-[7px] font-mono font-black bg-stone-50 border border-black px-1.5 py-0.5 rounded-sm shadow-[1px_1px_0px_#000] uppercase tracking-wider">
              ROLE: {v.role}
            </span>
          </div>
          <h4 className="font-display font-black text-[11px] uppercase tracking-tight text-black">{v.name}</h4>
          <p className="text-[10px] text-stone-500 mt-0.5 font-medium leading-relaxed">{v.desc}</p>
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dashed border-stone-200">
            <span className="inline-flex items-center gap-1 text-[8px] font-mono font-black border border-black bg-white px-1.5 py-0.5 shadow-[1px_1px_0px_#000] rounded-sm">
              <FileText className="w-2.5 h-2.5" /> {v.sources} Sources
            </span>
            <span className="text-rose-500 font-display font-black text-[8px] uppercase tracking-widest">INSPECT →</span>
          </div>
        </motion.div>
      ))}

      {/* Inscribe button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="border-2 border-dashed border-stone-300 p-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-black hover:bg-stone-50 transition-all"
      >
        <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider">+ Inscribe New Vault</span>
      </motion.div>
    </div>
  );
}

function HeroDemoSources() {
  const sources = [
    { type: "PDF", title: "Attention Is All You Need", authors: "Vaswani et al.", year: "2017", pages: 15 },
    { type: "PDF", title: "BERT: Pre-training of Deep Bidirectional Transformers", authors: "Devlin et al.", year: "2019", pages: 16 },
    { type: "WEB", title: "The Illustrated Transformer", authors: "Jay Alammar", year: "2018", pages: null },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[9px] font-black tracking-wider uppercase text-black">Citation Index (3)</span>
        <div className="flex gap-1.5">
          <span className="text-[7px] font-mono font-black bg-yellow-300 border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_#000] uppercase tracking-wider cursor-pointer">
            <Upload className="w-2.5 h-2.5 inline mr-0.5" />Upload
          </span>
        </div>
      </div>

      {sources.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.2 }}
          className="border-2 border-black p-2.5 bg-white rounded-sm shadow-[2px_2px_0px_#000] flex items-start gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000] transition-all"
        >
          <div className={`shrink-0 w-8 h-8 border-2 border-black flex items-center justify-center font-mono text-[7px] font-black shadow-[1px_1px_0px_#000] ${
            s.type === "PDF" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
          }`}>
            {s.type}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-black text-[10px] uppercase tracking-tight text-black truncate">{s.title}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-mono text-stone-500">{s.authors}</span>
              <span className="text-[8px] font-mono text-stone-400">·</span>
              <span className="text-[8px] font-mono text-stone-500">{s.year}</span>
              {s.pages && (
                <>
                  <span className="text-[8px] font-mono text-stone-400">·</span>
                  <span className="text-[8px] font-mono text-stone-400">{s.pages}p</span>
                </>
              )}
            </div>
          </div>
          <span className="text-[7px] font-mono font-black bg-emerald-100 border border-emerald-400 text-emerald-700 px-1.5 py-0.5 rounded-sm uppercase shrink-0">Indexed</span>
        </motion.div>
      ))}
    </div>
  );
}

function HeroDemoAI({ aiStep, aiTyped }: { aiStep: number; aiTyped: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
          <span className="font-mono text-[9px] font-black tracking-wider uppercase text-black">Grounded AI Q&A</span>
        </div>
        <span className="text-[7px] font-mono font-black bg-black text-white px-2 py-0.5 uppercase tracking-wider">Source-Scoped</span>
      </div>

      {/* User question */}
      <AnimatePresence>
        {aiStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 items-start"
          >
            <div className="w-5 h-5 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center text-[6px] font-black shrink-0 shadow-[1px_1px_0px_#000]">
              YOU
            </div>
            <div className="bg-yellow-50 border-2 border-black p-2.5 rounded-sm shadow-[2px_2px_0px_#000] text-[10px] font-mono font-bold text-black max-w-[85%]">
              {AI_LINES[0].text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI response */}
      <AnimatePresence>
        {aiStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 items-start justify-end"
          >
            <div className="bg-stone-900 border-2 border-black p-2.5 rounded-sm shadow-[2px_2px_0px_#ffd000] text-[10px] font-mono text-stone-200 max-w-[88%] leading-relaxed">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                <span className="text-[7px] font-black text-yellow-400 uppercase tracking-wider">AI Response</span>
              </div>
              {aiTyped}
              {aiTyped.length < AI_LINES[1].text.length && (
                <span className="border-r-2 border-yellow-400 lp-cursor-blink ml-0.5">&nbsp;</span>
              )}
            </div>
            <div className="w-5 h-5 rounded-full bg-stone-800 border-2 border-black flex items-center justify-center text-[6px] font-black text-yellow-400 shrink-0 shadow-[1px_1px_0px_#000]">
              AI
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source citation */}
      <AnimatePresence>
        {aiStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border-2 border-emerald-400 p-2 rounded-sm shadow-[1.5px_1.5px_0px_#000] text-[9px] font-mono text-emerald-800 font-bold"
          >
            {AI_LINES[2].text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking dots */}
      {aiStep === 1 && (
        <div className="flex items-center gap-2 pl-8">
          <span className="text-[8px] font-mono text-stone-400 tracking-wider uppercase">Reasoning</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full lp-typing-dot" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeroDemoCollab() {
  const members = [
    { name: "Prof. Carter", initials: "PC", role: "OWNER", color: "bg-yellow-100 border-yellow-400 text-yellow-800", avatarBg: "bg-amber-300" },
    { name: "Dr. Rostova", initials: "RO", role: "CONTRIBUTOR", color: "bg-emerald-100 border-emerald-400 text-emerald-800", avatarBg: "bg-[#00c48c]" },
    { name: "Sam C.", initials: "SC", role: "VIEWER", color: "bg-stone-100 border-stone-400 text-stone-700", avatarBg: "bg-purple-300" },
  ];

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-black" />
          <span className="font-mono text-[9px] font-black tracking-wider uppercase text-black">Active Researchers (3)</span>
        </div>
        <span className="text-[7px] font-mono font-black bg-emerald-300 border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_#000] uppercase tracking-wider cursor-pointer">
          + Invite
        </span>
      </div>

      {/* Member cards */}
      {members.map((m, i) => (
        <motion.div
          key={m.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.2 }}
          className="border-2 border-black p-2.5 bg-white rounded-sm shadow-[2px_2px_0px_#000] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full border-2 border-black ${m.avatarBg} flex items-center justify-center font-mono font-black text-[10px] text-black shadow-[1.5px_1.5px_0px_#000] shrink-0`}>
              {m.initials}
            </div>
            <div>
              <span className="font-display font-black text-[10px] text-black block">{m.name}</span>
              <span className="text-[7px] font-mono text-stone-500">Active now</span>
            </div>
          </div>
          <span className={`px-1.5 py-0.5 text-[7px] font-mono font-black uppercase border rounded-sm ${m.color}`}>
            {m.role}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
