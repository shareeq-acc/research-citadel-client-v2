"use client";

import React, { useState } from "react";
import { Home, Menu, X, ArrowUpRight, Play, Check, Minus } from "lucide-react";
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
      <nav className="sticky top-0 z-[200] bg-[#0a0a0a] lp-border border-t-0 border-x-0 flex items-center justify-between px-4 md:px-12 h-[62px]">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
        >
          <div className="w-9 h-9 bg-[#ffd000] border-2 border-white flex items-center justify-center shrink-0">
            <Home className="w-[18px] h-[18px] text-black stroke-[2.5]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-white font-mono text-[13px] font-bold tracking-wide leading-tight">RESEARCH CITADEL</div>
            <div className="text-[#ffd000] font-mono text-[10px] tracking-widest">Research Workspace</div>
          </div>
        </button>

        <ul className="hidden lg:flex items-center gap-7 list-none m-0 p-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => scrollTo(link.href)}
                className="text-[#999] hover:text-[#ffd000] font-mono text-xs tracking-wide bg-transparent border-0 cursor-pointer transition-colors"
              >
                {link.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onNavigate(ctaPath)}
              className="bg-[#ffd000] text-black border-2 border-white px-4 py-1.5 font-mono text-xs font-bold cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#fff] transition-all"
            >
              {ctaLabel}
            </button>
          </li>
        </ul>

        <button
          type="button"
          className="lg:hidden flex flex-col gap-1.5 p-1 bg-transparent border-0 cursor-pointer"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden absolute top-[62px] left-0 right-0 bg-[#0a0a0a] lp-border border-x-0 z-[199] flex flex-col px-6 py-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => scrollTo(link.href)}
              className="text-[#aaa] hover:text-[#ffd000] font-mono text-[13px] py-3 border-b border-[#1a1a1a] bg-transparent border-x-0 border-t-0 text-left cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onNavigate(ctaPath)}
            className="text-[#ffd000] font-mono text-[13px] font-bold py-3 bg-transparent border-0 text-left cursor-pointer"
          >
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
