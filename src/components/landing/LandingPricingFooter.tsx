"use client";

import React from "react";
import { Home } from "lucide-react";
import { PRICING_PLANS } from "./landing-data";
import { LandingCtaButtons, PlanFeature } from "./LandingNav";

interface LandingPricingFooterProps {
  currentUser: { name: string } | null;
  onNavigate: (path: string) => void;
}

export function LandingPricing({ currentUser, onNavigate }: LandingPricingFooterProps) {
  return (
    <section id="pricing" className="scroll-mt-20 bg-black text-white px-4 md:px-12 py-20 lp-border border-x-0 border-t-0">
      <div className="max-w-4xl mx-auto">
        <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#666] uppercase mb-3 text-center">Pricing</div>
        <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight tracking-tight mb-12 text-center">
          Simple. Honest. No tricks.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.name} className="border border-[#222] p-8 relative">
              {plan.popular && (
                <div className="absolute -top-3 left-6 bg-[#ffd000] text-black font-mono text-[9px] font-bold px-2 py-0.5 tracking-widest">
                  MOST POPULAR
                </div>
              )}
              <div className="font-mono text-[11px] font-bold tracking-widest text-[#666] uppercase mb-2">{plan.name}</div>
              <div className="font-display font-extrabold text-5xl leading-none">
                {plan.price}
                <span className="font-mono text-sm text-[#555] font-normal align-middle">{plan.period}</span>
              </div>
              <p className="text-[13px] text-[#555] mt-4 mb-6 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-2.5 mb-8 list-none m-0 p-0">
                {plan.features.map((f) => (
                  <PlanFeature key={f.text} included={f.included} text={f.text} />
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onNavigate(currentUser ? "/subscription" : "/auth")}
                className={`w-full py-3 font-mono text-xs font-bold tracking-wide cursor-pointer transition-all border-2 ${
                  plan.ctaStyle === "pro"
                    ? "bg-[#ffd000] text-black border-[#ffd000] hover:bg-[#e6bb00]"
                    : "bg-transparent text-white border-[#333] hover:bg-white hover:text-black hover:border-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCtaStrip({ currentUser, onNavigate }: LandingPricingFooterProps) {
  return (
    <section className="bg-[#ffd000] lp-border border-x-0 border-t-0 px-4 md:px-12 py-16 md:py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
        <h2 className="font-display font-extrabold text-[clamp(1.75rem,4vw,3.5rem)] leading-tight tracking-tight">
          Ready to build your
          <br />
          <span className="underline decoration-4 underline-offset-[6px]">research citadel?</span>
        </h2>
        <div className="flex flex-col items-start lg:items-end gap-3">
          <LandingCtaButtons onNavigate={onNavigate} currentUser={currentUser} variant="footer" />
          <p className="font-mono text-[11px] text-[#555]">No credit card required. Free plan forever.</p>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <footer className="bg-black text-white lp-border border-x-0 border-b-0">
      <div className="max-w-6xl mx-auto px-4 md:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display font-extrabold text-sm mb-3">
            <Home className="w-[18px] h-[18px] text-[#ffd000] stroke-[2.5]" />
            RESEARCH CITADEL
          </div>
          <p className="text-[13px] text-[#666] leading-relaxed">
            A collaborative workspace for teams who do real research — vaults, citations, AI Q&A, and live annotations in one place.
          </p>
        </div>
        {[
          { title: "Platform", links: ["Dashboard", "Vaults", "Citations", "AI Q&A", "Annotations"] },
          { title: "Company", links: ["About", "Changelog", "Pricing", "Blog"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="font-mono text-[10px] font-bold tracking-widest text-[#555] uppercase mb-4">{col.title}</div>
            <ul className="space-y-2 list-none m-0 p-0">
              {col.links.map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    onClick={() => {
                      if (link === "Pricing") document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                      else if (link === "Dashboard") onNavigate("/dashboard");
                      else onNavigate("/auth");
                    }}
                    className="text-[#888] hover:text-[#ffd000] font-mono text-[12px] bg-transparent border-0 cursor-pointer p-0 transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#222] px-4 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="font-mono text-[10px] text-[#555] tracking-wider">© 2026 RESEARCH CITADEL — ALL RIGHTS RESERVED</div>
        <div className="flex gap-2">
          {["FREE TIER", "PRO TIER"].map((b) => (
            <span key={b} className="font-mono text-[9px] font-bold px-2 py-0.5 border border-[#333] text-[#666]">
              {b}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
