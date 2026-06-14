"use client";

import React from "react";
import "./landing.css";
import { LandingNav, LandingTicker } from "./LandingNav";
import { LandingHero } from "./LandingHero";
import { LandingProcess, LandingCollab, LandingFeatures, LandingRoles } from "./LandingSections";
import { LandingPricing, LandingCtaStrip, LandingFooter } from "./LandingPricingFooter";

interface LandingPageProps {
  currentUser: { name: string; avatar?: string | null } | null;
  onNavigate: (path: string) => void;
}

export default function LandingPage({ currentUser, onNavigate }: LandingPageProps) {
  return (
    <div className="landing-page min-h-screen flex flex-col">
      <LandingNav currentUser={currentUser} onNavigate={onNavigate} />
      {/* <LandingTicker /> */}
      <main className="flex-1">
        <LandingHero currentUser={currentUser} onNavigate={onNavigate} />
        <LandingProcess />
        <LandingCollab />
        <LandingFeatures />
        <LandingRoles />
        <LandingPricing currentUser={currentUser} onNavigate={onNavigate} />
        <LandingCtaStrip currentUser={currentUser} onNavigate={onNavigate} />
      </main>
      <LandingFooter onNavigate={onNavigate} />
    </div>
  );
}
