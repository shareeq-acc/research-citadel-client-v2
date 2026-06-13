"use client";

import React, { useState } from "react";
import { Library, Menu, X, ArrowUpRight, Play, Check, Minus } from "lucide-react";
import { TICKER_ITEMS } from "./landing-data";

interface LandingNavProps {
  currentUser: { name: string; avatar?: string | null } | null;
  onNavigate: (path: string) => void;
}

const NAV_LINKS = [
  { href: "#process", label: "How It Works" },
  { href: "#collab", label: "Collaboration" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNav({ currentUser, onNavigate }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const ctaPath = currentUser ? "/dashboard" : "/auth";
  const ctaLabel = currentUser ? "Open Dashboard →" : "Get Started →";

  return (
    <>
      <header className="border-b-4 border-black bg-white sticky top-0 z-[200] px-4 md:px-8 py-3.5 shrink-0 shadow-[0_4px_0px_#000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full gap-4">
          {/* Branding Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-11 h-11 bg-yellow-300 border-4 border-black font-black flex items-center justify-center shadow-[3px_3px_0px_#000] shrink-0">
              <Library className="w-6 h-6 text-black stroke-[3]" />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-mono font-black text-xs md:text-sm tracking-tight leading-none uppercase text-black">
                Research Citadel
              </h1>
              <span className="inline-block px-1.5 py-0.5 mt-1 bg-black text-yellow-300 text-[8px] font-mono font-bold uppercase leading-none">
                Academic Co-Writing Engine
              </span>
            </div>
          </div>

          {/* Centered Nav Links */}
          <nav className="flex-1 hidden lg:flex justify-center items-center px-4">
            <div className="flex items-center gap-1 bg-stone-50 border-2 border-black rounded-sm shadow-[2px_2px_0px_#000] px-1 py-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 hover:text-black hover:bg-yellow-200 px-3 py-1.5 cursor-pointer transition-all border-0 bg-transparent rounded-sm"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(ctaPath)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-300 border-2 border-black text-black font-display font-black text-[11px] uppercase shadow-[2.5px_2.5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              {ctaLabel}
            </button>

            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-10 h-10 border-2 border-black bg-white shadow-[2px_2px_0px_#000] cursor-pointer"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed top-[72px] left-0 right-0 bg-white border-b-4 border-black z-[199] flex flex-col px-6 py-3 shadow-[0_6px_0px_rgba(0,0,0,0.1)]">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="text-stone-700 hover:text-black hover:bg-yellow-100 font-mono font-bold text-[11px] uppercase tracking-wider py-3 px-2 border-b-2 border-stone-100 last:border-0 bg-transparent border-x-0 border-t-0 text-left cursor-pointer transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onNavigate(ctaPath)}
            className="mt-2 w-full py-2.5 bg-yellow-300 border-2 border-black text-black font-display font-black text-[11px] uppercase shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            {ctaLabel}
          </button>
        </div>
      )}
    </>
  );
}

export function LandingTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="bg-[#ffd000] lp-border border-x-0 overflow-hidden h-[38px] flex items-center">
      <div className="flex lp-ticker-track whitespace-nowrap">
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="font-mono text-[11px] font-bold tracking-widest px-7 h-[38px] flex items-center gap-2 lp-border border-y-0 border-l-0 shrink-0"
          >
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingCtaButtons({
  onNavigate,
  currentUser,
  variant = "hero",
}: {
  onNavigate: (path: string) => void;
  currentUser: LandingNavProps["currentUser"];
  variant?: "hero" | "footer";
}) {
  const primaryPath = currentUser ? "/dashboard" : "/auth";
  const primaryLabel = currentUser ? "Open Dashboard" : "Start for Free";

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={() => onNavigate(primaryPath)}
        className="bg-black text-[#ffd000] lp-border px-8 py-4 font-mono text-[13px] font-bold tracking-wide cursor-pointer lp-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
      >
        <ArrowUpRight className="w-4 h-4" />
        {primaryLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3.5">
      <button
        type="button"
        onClick={() => onNavigate(primaryPath)}
        className="bg-[#ffd000] text-black lp-border px-6 py-3.5 font-mono text-[13px] font-bold tracking-wide cursor-pointer lp-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:lp-shadow-lg transition-all inline-flex items-center gap-2"
      >
        <ArrowUpRight className="w-4 h-4" />
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={() => document.getElementById("process")?.scrollIntoView({ behavior: "smooth" })}
        className="bg-white text-black lp-border px-6 py-3.5 font-mono text-[13px] font-bold tracking-wide cursor-pointer lp-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
      >
        <Play className="w-4 h-4 fill-current" />
        See How It Works
      </button>
    </div>
  );
}

export function PlanFeature({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="font-mono text-[11px] text-[#aaa] flex items-center gap-2">
      {included ? (
        <Check className="w-3.5 h-3.5 text-[#00c48c] shrink-0 stroke-[2.5]" />
      ) : (
        <Minus className="w-3.5 h-3.5 text-[#333] shrink-0 stroke-[2.5]" />
      )}
      {text}
    </li>
  );
}
