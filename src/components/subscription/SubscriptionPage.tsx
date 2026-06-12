"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { userService } from "@/services";
import { getAiUsagePercents } from "@/lib/aiUsage";
import { 
  Zap, 
  Check, 
  X, 
  Sparkles, 
  ArrowLeft, 
  Database, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Calendar
} from "lucide-react";

interface SubscriptionPageProps {
  user: User;
  onNavigate: (screen: string) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export default function SubscriptionPage({ user, onNavigate, onUpdateUser }: SubscriptionPageProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { dailyUsed, dailyLimit, weeklyUsed, weeklyLimit, dailyPercent: dailyPct, weeklyPercent: weeklyPct } =
    getAiUsagePercents(user.aiUsage);

  const handlePlanChange = async (targetPlan: "FREE" | "PRO") => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await userService.upgradePlan(targetPlan);
      if (res.success) {
        setSuccessMsg(`Account tier updated to ${targetPlan} successfully!`);
        if (res.data) {
          onUpdateUser(res.data);
        }
      } else {
        setErrorMsg(res.message || "Could not change subscription tier.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to communicate with the Scholar Authority server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* HEADER SECTION WITH NAVIGATION ROUTE BACK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-4 border-neo-dark bg-white p-6 rounded-xs shadow-[4px_4px_0px_#0A0A0A]">
        <div>
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-xs font-mono font-black text-stone-500 hover:text-neo-dark uppercase mb-2 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Research Repositories
          </button>
          <h1 className="text-3xl font-black font-display text-neo-dark tracking-tight">
            SCHOLAR POWER & LIMITS
          </h1>
          <p className="text-stone-600 text-sm font-mono mt-1">
            Analyze your computational resource bounds and upgrade your research authority tier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] font-mono text-stone-500 leading-none">CURRENT STATUS</span>
            <span className="text-xs font-mono font-bold text-stone-600 uppercase">TIER LEVEL:</span>
          </div>
          <span className={`px-4 py-2 text-lg font-black font-mono border-3 border-neo-dark uppercase shadow-[3px_3px_0px_#0A0A0A] ${user.plan === "PRO" ? "bg-neo-yellow text-neo-dark" : "bg-stone-100 text-stone-500"}`}>
            {user.plan || "FREE"}
          </span>
        </div>
      </div>

      {/* ERROR FEEDBACK BAR */}
      {errorMsg && (
        <div className="border-4 border-red-600 bg-red-50 text-red-900 px-4 py-3 rounded-xs font-mono text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUCCESS FEEDBACK BAR */}
      {successMsg && (
        <div className="border-4 border-emerald-600 bg-emerald-50 text-emerald-900 px-4 py-3 rounded-xs font-mono text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* THE THREE COLUMN COMPREHENSIVE AI POWER UTILIZATION METRICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Capacity Tracker */}
        <div className="border-4 border-neo-dark bg-[#FFFDF2] p-6 rounded-xs shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-neo-dark pb-3 mb-4">
              <span className="text-xs font-mono font-black text-stone-600 uppercase tracking-wider">DAILY COMPUTE BOUNDS</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-neo-dark text-white rounded">24 HOURS RATE</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 block">COMPREHENSIVE USAGE</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-display text-neo-dark">
                  {Math.round(dailyPct)}%
                </span>
                <span className="text-xs text-stone-500 ml-1.5 font-mono">capacity utilized</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="w-full bg-stone-200 h-4 border-2 border-neo-dark rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-neo-orange h-full rounded-full transition-all duration-500" 
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="font-bold text-stone-500">CONSUMPTION INDEX:</span>
              <span className="font-black text-neo-dark">{Math.round(dailyPct)}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono bg-white border-2 border-neo-dark p-2 rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] h-9">
              <span className="font-bold text-stone-500 flex items-center gap-1.5 leading-none">
                <Clock className="w-3.5 h-3.5 text-neo-orange animate-[pulse_2s_infinite] shrink-0" />
                RESETS AT:
              </span>
              <span className="font-black text-neo-dark leading-none">12:00 AM UTC DAILY</span>
            </div>
            {dailyPct >= 100 && (
              <div className="p-2 border border-dashed border-red-500 bg-red-50 rounded text-[10px] font-mono text-red-700">
                ⚠️ Daily capacity reached. Expand compute limits by upgrading to PRO.
              </div>
            )}
          </div>
        </div>

        {/* Weekly Capacity Tracker */}
        <div className="border-4 border-neo-dark bg-[#FFFDF2] p-6 rounded-xs shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-neo-dark pb-3 mb-4">
              <span className="text-xs font-mono font-black text-stone-600 uppercase tracking-wider">WEEKLY COMPUTE BOUNDS</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-stone-700 text-white rounded">7 DAYS RATE</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 block">COMPREHENSIVE USAGE</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-display text-teal-600">
                  {Math.round(weeklyPct)}%
                </span>
                <span className="text-xs text-stone-500 ml-1.5 font-mono">capacity utilized</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="w-full bg-stone-200 h-4 border-2 border-neo-dark rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${weeklyPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="font-bold text-stone-500">CONSUMPTION INDEX:</span>
              <span className="font-black text-neo-dark">{Math.round(weeklyPct)}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono bg-white border-2 border-neo-dark p-2 rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] h-9">
              <span className="font-bold text-stone-500 flex items-center gap-1.5 leading-none">
                <Clock className="w-3.5 h-3.5 text-teal-600 animate-[pulse_2.5s_infinite] shrink-0" />
                RESETS ON:
              </span>
              <span className="font-black text-neo-dark leading-none">MON 12:00 AM UTC</span>
            </div>
            {weeklyPct >= 100 && (
              <div className="p-2 border border-dashed border-red-500 bg-red-50 rounded text-[10px] font-mono text-red-700">
                ⚠️ Weekly capacity reached. Expand weekly capability slots in PRO.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Tier Sandbox Upgrade Console */}
        <div className="border-4 border-neo-dark bg-white p-6 rounded-xs shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
            <TrendingUp className="w-32 h-32 text-stone-900" />
          </div>

          <div className="relative z-10">
            <h3 className="text-md font-black font-display text-neo-dark leading-none">
              SCHOLAR CONTROLLER
            </h3>
            <span className="text-[10px] font-mono text-stone-500 uppercase block mt-1">
              Instant Plan Simulator Settings
            </span>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Toggle academic auth level level. Instantly increase dynamic sandbox daily/weekly compute capabilities for tests.
            </p>
          </div>

          <div className="mt-6 space-y-2.5 relative z-10">
            <div className="flex gap-2">
              <button
                disabled={loading || user.plan === "FREE"}
                onClick={() => handlePlanChange("FREE")}
                className={`flex-1 font-mono font-black text-xs py-2 px-3 border-2 border-neo-dark transition-all rounded shadow-[2.5px_2.5px_0px_#0A0A0A] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 ${
                  user.plan === "FREE" 
                    ? "bg-stone-300 text-stone-700 opacity-60 pointer-events-none cursor-not-allowed shadow-none active:translate-y-0" 
                    : "bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Set FREE Grade</>
                )}
              </button>

              <button
                disabled={loading || user.plan === "PRO"}
                onClick={() => handlePlanChange("PRO")}
                className={`flex-1 font-mono font-black text-xs py-2 px-3 border-2 border-neo-dark transition-all rounded shadow-[2.5px_2.5px_0px_#0A0A0A] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5 ${
                  user.plan === "PRO" 
                    ? "bg-neo-yellow text-neo-dark animate-pulse font-black" 
                    : "bg-neo-orange hover:bg-neo-orange-dark text-white"
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Upgrade to PRO ⚡</>
                )}
              </button>
            </div>
            <div className="text-[9px] font-mono text-stone-500 leading-tight text-center">
              *Toggling sends live updates to the server. No real payment is required.
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED COMPARISON MATRIX - THEME CONGRUENT */}
      <div className="border-4 border-neo-dark bg-white rounded-xs shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Header Block inside comparative box */}
        <div className="bg-neo-dark text-white p-5 border-b-4 border-neo-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black font-display tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neo-yellow" />
              TRIAL & PRO COMPETENCY MATRIX
            </h2>
            <p className="text-[11px] font-mono text-stone-400 mt-0.5">
              Review resource allocations, security bounds, and advanced analytical layers of each plan tier.
            </p>
          </div>
          <span className="px-2 py-1 text-[10px] font-mono bg-stone-800 text-neo-yellow font-black border border-stone-600 rounded">
            LATEST REVISION v1.9
          </span>
        </div>

        {/* Side by side comparison container */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y-4 md:divide-y-0 md:divide-x-4 divide-neo-dark">
          
          {/* FREE PLAN METRICS PANEL */}
          <div className="p-6 space-y-6 bg-stone-50/50">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div>
                <span className="text-xs font-mono font-black text-stone-500 block">STANDARD LEVEL</span>
                <h3 className="text-xl font-black font-display text-stone-700">FREE NOVICE</h3>
              </div>
              <span className="px-3 py-1 bg-stone-200 border-2 border-neo-dark font-mono font-bold text-xs text-stone-700">
                $0 / LIFETIME
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Designed for individual entry-level students testing out file uploads and brief text parsing capabilities.
            </p>

            {/* List of points */}
            <ul className="space-y-3 font-mono text-xs">
              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-red-100 text-red-700 border border-neo-dark rounded-xs">
                  <X className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black">0 Custom Vaults allowed</strong>
                  <span className="text-[10px] text-stone-500">Only access shared team vaults. Cannot produce new vaults.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-neo-yellow/30 text-stone-700 border border-neo-dark rounded-xs">
                  <Database className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black">3 Collaborating Scholars max</strong>
                  <span className="text-[10px] text-stone-500">Fixed hard limit on the number of scholars you can add to vaults.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-neo-yellow/30 text-stone-700 border border-neo-dark rounded-xs">
                  <Zap className="w-3.5 h-3.5 text-neo-orange" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black">100% Daily Smart AI compute load</strong>
                  <span className="text-[10px] text-stone-500">Shared limit for summary requests, insights & enhance annotation depending on prompt complexity.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-stone-200 text-stone-500 border border-stone-300 rounded-xs">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <div>
                  <strong className="block text-stone-500 font-display font-bold">100% Weekly Smart AI compute load</strong>
                  <span className="text-[10px] text-stone-400">Accumulated total weekly compute processing capacity threshold.</span>
                </div>
              </li>
            </ul>

            <div className="pt-4">
              <div className="bg-stone-100 border-2 border-stone-300 p-3 text-[11px] text-stone-500 text-center font-mono">
                {user.plan === "FREE" ? "✓ YOUR ACTIVE TIER STATUS" : "SANDBOX TRIAL OPTION AVAILABLE"}
              </div>
            </div>
          </div>

          {/* PRO PLAN METRICS PANEL */}
          <div className="p-6 space-y-6 bg-yellow-50/20">
            <div className="flex items-center justify-between border-b-2 border-neo-dark pb-3">
              <div>
                <span className="text-xs font-mono font-black text-neo-orange block">PREMIUM AUTHORITY</span>
                <h3 className="text-xl font-black font-display text-neo-dark flex items-center gap-1.5">
                  PRO CITADEL SCHOLAR
                  <Sparkles className="w-5 h-5 text-neo-orange" />
                </h3>
              </div>
              <span className="px-3 py-1 bg-neo-yellow border-2 border-neo-dark font-mono font-black text-xs text-neo-dark shadow-[2px_2px_0px_#0A0A0A]">
                $29 / MON
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Unshackle computational blocks. Empower deep research teams seeking extreme data ingest capacities and high Q&A bandwidth.
            </p>

            {/* List of points */}
            <ul className="space-y-3 font-mono text-xs">
              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-emerald-100 text-emerald-800 border border-neo-dark rounded-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black font-semibold">Unlimited Custom Vaults</strong>
                  <span className="text-[10px] text-stone-500 font-sans">Organize dozens of projects, domains, and individual research corpora.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-emerald-100 text-emerald-800 border border-neo-dark rounded-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black font-semibold">Unlimited Collaborating Scholars</strong>
                  <span className="text-[10px] text-stone-500 font-sans">Coordinate works and concurrent editing on sources without restriction.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-emerald-100 text-emerald-800 border border-neo-dark rounded-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black font-semibold">5,000% Daily Smart AI compute load</strong>
                  <span className="text-[10px] text-stone-500 font-sans">Massive capacity ceiling. Run deep summaries, document audits, and complex reasoning queries effortlessly.</span>
                </div>
              </li>

              <li className="flex items-start gap-2 text-stone-700">
                <span className="p-0.5 bg-emerald-100 text-emerald-800 border border-neo-dark rounded-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </span>
                <div>
                  <strong className="block text-neo-dark font-display font-black font-semibold">10,000% Weekly Smart AI compute load</strong>
                  <span className="text-[10px] text-stone-500 font-sans">Maximum academic throughput for high-frequency or automated batch document processing.</span>
                </div>
              </li>
            </ul>

            <div className="pt-4">
              {user.plan === "PRO" ? (
                <div className="bg-neo-yellow border-2 border-neo-dark p-3 text-[11px] text-neo-dark text-center font-mono font-black shadow-[3px_3px_0px_#0A0A0A] animate-pulse">
                  ⚡ YOUR ACCOUNT IS ACTIVE AND LICENSED IN PRO LEVEL
                </div>
              ) : (
                <button
                  disabled={loading}
                  onClick={() => handlePlanChange("PRO")}
                  className="w-full text-center bg-neo-orange hover:bg-neo-orange-dark border-3 border-neo-dark py-2.5 text-white font-mono font-black text-xs uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-y-1 transition-all"
                >
                  {loading ? "Activating Licence..." : "Upgrade Authority Stream ($29/month) ⚡"}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
