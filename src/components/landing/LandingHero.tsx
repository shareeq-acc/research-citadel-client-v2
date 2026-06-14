"use client";

import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { AI_TYPEWRITER_TEXT } from "./landing-data";
import { LandingCtaButtons } from "./LandingNav";

interface LandingHeroProps {
  currentUser: { name: string } | null;
  onNavigate: (path: string) => void;
}

export function LandingHero({ currentUser, onNavigate }: LandingHeroProps) {
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setTyping(false);
      let i = 0;
      const type = () => {
        if (i < AI_TYPEWRITER_TEXT.length) {
          setTyped(AI_TYPEWRITER_TEXT.slice(0, ++i));
          setTimeout(type, 18 + Math.random() * 10);
        }
      };
      type();
    }, 1400);
    return () => clearTimeout(delay);
  }, []);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-100px)] lp-border border-x-0 border-t-0">
      <div className="lp-hero-grid border-b lg:border-b-0 lg:border-r lp-border border-x-0 border-t-0 px-6 md:px-14 py-16 lg:py-[72px] flex flex-col justify-center relative">


        <h1 className="font-display font-extrabold text-[clamp(2.5rem,6vw,5.25rem)] leading-[0.95] tracking-tight">
          Where Teams
          <br />
          Do Real
          <br />
          Research.

          {/* <span className="inline-block bg-[#ffd000] px-2.5 py-0.5 lp-border -rotate-1 lp-shadow mt-1">
            Research.
          </span> */}
        </h1>

        <p className="mt-6 text-base leading-relaxed text-[#444] max-w-md">
          Create shared vaults, upload your papers, annotate in real-time with your team, and get AI answers grounded strictly in your own documents.
        </p>

        <div className="mt-9">
          <LandingCtaButtons onNavigate={onNavigate} currentUser={currentUser} />
        </div>

      </div>

      <div className="bg-black px-6 md:px-9 py-11 flex flex-col justify-center gap-3 relative overflow-hidden">
        <div className="absolute bottom-2 -right-2 font-display text-[96px] font-extrabold text-white/[0.03] pointer-events-none whitespace-nowrap">
          CITADEL
        </div>

        <div className="bg-[#f5f2eb] border-[2.5px] border-white p-4 lp-shadow relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex gap-1.5">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-black text-white">PRIVATE</span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#ffd000] text-black">OWNER</span>
            </div>
            <span className="font-mono text-[9px] text-[#666] tracking-widest">AUTHORIZED</span>
          </div>
          <div className="font-display font-extrabold text-sm tracking-wide">ARTIFICIAL INTELLIGENCE FOUNDATIONS</div>
          <div className="text-xs text-[#555] mt-1">Core papers on deep learning, transformer architectures…</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-[#666]">
            <FileText className="w-2.5 h-2.5" /> 2 Sources
          </div>
        </div>

        <div className="bg-[#f5f2eb] border-[2.5px] border-white p-4 lp-shadow relative z-10">
          <div className="flex gap-1.5 mb-2">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#00b8d9] text-black">PUBLIC</span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-white text-black border border-black">CONTRIBUTOR</span>
          </div>
          <div className="font-display font-extrabold text-sm tracking-wide">CLIMATE IMPACT & RENEWABLE DATASETS</div>
          <div className="text-xs text-[#555] mt-1">Atmospheric simulation logs, grid integration…</div>
        </div>

        <div className="bg-[#1a1a1a] border-2 border-[#333] p-4 shadow-[4px_4px_0_#ffd000] relative z-10 min-h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-[#00c48c] rounded-full lp-live-dot" />
            <span className="font-mono text-[9px] text-[#888] tracking-widest">AI Q&A — GROUNDED RESPONSE</span>
          </div>
          <div className="text-[11px] text-[#ccc] leading-relaxed font-mono mt-2 min-h-[48px]">
            {typed}
            {!typing && typed.length < AI_TYPEWRITER_TEXT.length && (
              <span className="border-r-2 border-[#ffd000] lp-cursor-blink ml-0.5">&nbsp;</span>
            )}
          </div>
          {typing && (
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 bg-[#ffd000] rounded-full lp-typing-dot" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
