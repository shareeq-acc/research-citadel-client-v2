"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Globe, Lock, FolderPlus, Sparkles,
  LineChart, BookOpenCheck, LockKeyhole, BellOff, ChevronRight,
  History, Bell, ShieldCheck, Fingerprint, Eye, Cpu, VolumeX,
  Trash2, Check, Crown, Edit3, Menu, Settings,
  UserPlus, Send, Loader2, X
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { vaultService, userService, annotationService, invitationService } from "@/services";
import { Source, Annotation, Vault } from "@/types";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";
import StatsTab from "@/components/vault/StatsTab";
import SourcesTab from "@/components/vault/SourcesTab";
import QAPanel from "@/components/vault/QAPanel";
import { ColloquiumChatTab } from "@/components/chat/ColloquiumChatTab";
import {
  SkeletonSourcesTab, SkeletonAnnotationsTab, SkeletonStatsTab,
  SkeletonMembersTab, SkeletonChatTab, SkeletonQALayout,
  SkeletonAuditTrail, SkeletonVaultSettings
} from "@/components/shared/Skeleton";

export default function DashboardClient() {
  const router = useRouter();
  const {
    currentUser, vaults, setVaults, activeVault, setActiveVault,
    sources, setSources, annotations, setAnnotations,
    auditLogs, auditLogsData, auditPage, setAuditPage,
    auditTypeFilter, setAuditTypeFilter, auditStartDate, setAuditStartDate,
    auditEndDate, setAuditEndDate, loadAuditLogs, loadVaultList, loadVaultDetail,
    vaultSearchQuery, setVaultSearchQuery, mutedVaults, handleMuteVaultToggle,
  } = useApp();

  const [loadingView, setLoadingView] = useState(false);
  const [activeVaultTab, setActiveVaultTab] = useState("stats");

  const [showVaultForm, setShowVaultForm] = useState(false);
  const [newVaultName, setNewVaultName] = useState("");
  const [newVaultDesc, setNewVaultDesc] = useState("");
  const [newVaultPrivacy, setNewVaultPrivacy] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [creatingVault, setCreatingVault] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");

  // Vault settings state
  const [editVaultName, setEditVaultName] = useState("");
  const [editVaultDesc, setEditVaultDesc] = useState("");
  const [editVaultPrivacy, setEditVaultPrivacy] = useState<"PRIVATE" | "PUBLIC">("PRIVATE");
  const [updatingVaultSettings, setUpdatingVaultSettings] = useState(false);
  const [confirmExitVault, setConfirmExitVault] = useState(false);
  const [confirmDeleteVault, setConfirmDeleteVault] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
  const [settingsErrorMsg, setSettingsErrorMsg] = useState("");
  const [activeSettingsSubTab, setActiveSettingsSubTab] = useState<"general" | "guidelines" | "idcard" | "admin">("general");
  const [settingsSidebarCollapsed, setSettingsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [simulateCollaborators, setSimulateCollaborators] = useState(true);

  const [inviteSearch, setInviteSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviteRole, setInviteRole] = useState<"CONTRIBUTOR" | "VIEWER">("CONTRIBUTOR");
  const [collaborativeLogs, setCollaborativeLogs] = useState<string[]>([]);
  const [expandAnnotationsByDefault, setExpandAnnotationsByDefault] = useState(false);
  const [notifyOnNewAnnotations, setNotifyOnNewAnnotations] = useState(true);

  const truncateText = (str: string, maxLen: number = 22) => {
    if (!str) return "";
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "...";
  };

  const triggerLoadingTransition = (duration = 2500) => {
    setLoadingView(true);
    setTimeout(() => setLoadingView(false), duration);
  };

  useEffect(() => {
    if (activeVault) {
      setEditVaultName(activeVault.name);
      setEditVaultDesc(activeVault.description || "");
      setEditVaultPrivacy(activeVault.privacy);
      setConfirmExitVault(false);
      setConfirmDeleteVault(false);
      setSettingsSuccessMsg("");
      setSettingsErrorMsg("");
    }
  }, [activeVault?.id]);

  useEffect(() => {
    setSettingsSuccessMsg("");
    setSettingsErrorMsg("");
  }, [activeVaultTab]);

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName) return;
    setCreatingVault(true);
    setErrMessage("");
    setOkMessage("");
    try {
      const res = await vaultService.createVault({
        name: newVaultName,
        description: newVaultDesc || undefined,
        privacy: newVaultPrivacy,
      });
      if (res.success) {
        setNewVaultName("");
        setNewVaultDesc("");
        setNewVaultPrivacy("PRIVATE");
        setShowVaultForm(false);
        setOkMessage("🟢 Secure Vault node allocated successfully!");
        setActiveVault(res.data);
        loadVaultList(res.data.id);
        setTimeout(() => setOkMessage(""), 4000);
      } else {
        setErrMessage(res.message || "Failed to create vault.");
      }
    } catch (err: any) {
      setErrMessage(err?.message || "Connection error while registering vault node.");
    } finally {
      setCreatingVault(false);
    }
  };

  const handleUserSearchQuery = async (query: string) => {
    setInviteSearch(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    try {
      const res = await userService.searchUsers(query);
      if (res.success) setSearchResults(res.data.users ?? []);
    } catch { /* ignore */ }
  };

  const handleAddMemberSubmit = async (targetUserId: string) => {
    if (!activeVault) return;
    try {
      const res = await vaultService.addMember(activeVault.id, {
        userId: targetUserId,
        role: inviteRole,
      });
      if (res.success) {
        setInviteSearch("");
        setSearchResults([]);
        loadVaultDetail(activeVault.id);
      }
    } catch { /* ignore */ }
  };

  const handleUpdateVaultSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVault) return;
    setUpdatingVaultSettings(true);
    try {
      const res = await vaultService.updateVault(activeVault.id, {
        name: editVaultName,
        description: editVaultDesc,
        privacy: editVaultPrivacy,
      });
      if (res.success) {
        setActiveVault(res.data);
        setVaults((prev) => prev.map((v) => v.id === activeVault.id ? res.data : v));
        setSettingsSuccessMsg("Vault settings updated successfully.");
      } else {
        setSettingsErrorMsg(res.message || "Failed to update vault settings.");
      }
    } catch (err: any) {
      setSettingsErrorMsg(err?.message || "Connection error while updating vault.");
    } finally {
      setUpdatingVaultSettings(false);
    }
  };

  const handleExitVault = async () => {
    if (!activeVault) return;
    try {
      // No dedicated exit endpoint — remove from local state (owner can't exit, only delete)
      setVaults((prev) => prev.filter((v) => v.id !== activeVault.id));
      setActiveVault(vaults.find((v) => v.id !== activeVault.id) || null);
    } catch { /* ignore */ }
  };

  const handleDeleteVault = async () => {
    if (!activeVault) return;
    try {
      const res = await vaultService.deleteVault(activeVault.id);
      if (res.success) {
        setVaults((prev) => prev.filter((v) => v.id !== activeVault.id));
        setActiveVault(vaults.find((v) => v.id !== activeVault.id) || null);
      }
    } catch { /* ignore */ }
  };

  const filteredVaults = vaults.filter((v) =>
    v.name.toLowerCase().includes(vaultSearchQuery.toLowerCase())
  );

  const dailyComputePercent = 85;
  const weeklyComputePercent = 53;

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-rose-500 animate-pulse";
    if (percent >= 50) return "bg-amber-400";
    return "bg-teal-500";
  };

  const handleNavigateToSourceDetail = (sourceId: string) => {
    if (activeVault) {
      router.push(`/source/${activeVault.id}/${sourceId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Scholar Banner */}
      <div className="bg-neo-yellow border-4 border-neo-dark p-6 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="font-display font-black text-lg md:text-xl text-neo-dark uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neo-dark fill-current" />
            Welcome, Scholar {currentUser?.name || "Seer Ijj"}!
          </h1>
          <p className="text-xs font-medium text-neo-dark mt-1 max-w-2xl font-mono">
            Inscribe secure encrypted Research Vaults, parse reference citation indices, review collaborative logs, and launch grounded peer search sessions.
          </p>
        </div>
        <div className="bg-white border-2 border-neo-dark px-3 py-1.5 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2 self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-neo-dark" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neo-dark">Standard Nodes Sandbox Live</span>
        </div>
      </div>

      {/* Compute Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-4 border-neo-dark p-4 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-28">
          <div>
            <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block">DAILY SCHOLAR COMPUTE</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display font-black text-2xl text-neo-dark">{dailyComputePercent}%</span>
              <span className="text-[10px] font-mono text-stone-500">capacity utilized</span>
            </div>
          </div>
          <div className="w-full bg-stone-100 border-2 border-neo-dark rounded-full h-3.5 overflow-hidden mt-3 relative">
            <div className={`${getProgressColor(dailyComputePercent)} h-full border-r-2 border-neo-dark`} style={{ width: `${dailyComputePercent}%` }} />
          </div>
        </div>
        <div className="bg-white border-4 border-neo-dark p-4 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-28">
          <div>
            <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block">WEEKLY SCHOLAR COMPUTE</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-display font-black text-2xl text-neo-dark">{weeklyComputePercent}%</span>
              <span className="text-[10px] font-mono text-stone-500">capacity utilized</span>
            </div>
          </div>
          <div className="w-full bg-stone-100 border-2 border-neo-dark rounded-full h-3.5 overflow-hidden mt-3 relative">
            <div className={`${getProgressColor(weeklyComputePercent)} h-full border-r-2 border-neo-dark`} style={{ width: `${weeklyComputePercent}%` }} />
          </div>
        </div>
        <div className="bg-neo-bg border-4 border-neo-dark p-4 pb-4.5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left flex flex-col justify-between h-28">
          <div>
            <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block">CURRENT TIER CAPACITY</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="font-display font-black text-sm text-neo-dark tracking-tight leading-none">FREE</span>
              <span className="text-[8px] font-mono font-bold border border-neo-dark bg-neo-yellow px-1.5 py-0.5 rounded-[6px] uppercase tracking-wide leading-none">LIMITED</span>
            </div>
          </div>
          <button onClick={() => router.push("/subscription")} className="w-full py-1 text-[9px] font-mono font-semibold uppercase text-neo-dark bg-white border-2 border-neo-dark rounded-[4px] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-stone-50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-1 cursor-pointer">
            LAUNCH LIMITS HUB <span className="text-rose-500 font-bold font-sans">⚡</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Vault Navigation sidebar */}
        <div className="lg:col-span-4 bg-white rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-neo-dark pb-3.5">
            <div className="flex items-center">
              <div className="flex gap-0.5 mr-2">
                <div className="w-1 h-3.5 bg-rose-500 rounded-sm" />
                <div className="w-1 h-3.5 bg-rose-500 rounded-sm" />
                <div className="w-1 h-3.5 bg-rose-500 rounded-sm" />
              </div>
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-neo-dark">Vault Nodes Index ({filteredVaults.length})</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white border-2 border-neo-dark text-neo-dark px-2 py-0.5 rounded-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase">Authorized</span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-stone-400 w-4 h-4" />
            <input type="text" placeholder="Search secure vaults..." value={vaultSearchQuery} onChange={(e) => setVaultSearchQuery(e.target.value)} className="w-full text-xs p-2 pl-9 bg-stone-50 border-2 border-neo-dark rounded-sm focus:outline-none focus:bg-stone-100 font-mono" />
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredVaults.length === 0 ? (
              <p className="text-xs text-stone-400 font-mono italic p-4 text-center">Refine parameters, no ledger matches found.</p>
            ) : (
              filteredVaults.map((vault) => {
                const isActive = activeVault && activeVault.id === vault.id;
                return (
                  <div key={vault.id} onClick={() => { triggerLoadingTransition(2500); loadVaultDetail(vault.id); }}
                    className={`p-4 border-2 border-neo-dark rounded-sm cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col gap-2.5 text-left relative ${isActive ? "bg-neo-bg shadow-[4px_4px_0px_#FACC15]" : "bg-white text-stone-700 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vault.privacy === "PUBLIC" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-black border-2 border-neo-dark bg-emerald-100 text-emerald-800 rounded-[4px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"><Globe className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />PUBLIC</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-black border-2 border-neo-dark bg-[#FFE4E6] text-rose-700 rounded-[4px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"><Lock className="w-2.5 h-2.5 text-rose-600 stroke-[3]" />PRIVATE</span>
                        )}
                        {mutedVaults[vault.id] && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-black border-2 border-neo-dark bg-amber-100 text-amber-700 rounded-[4px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"><BellOff className="w-2.5 h-2.5 text-amber-600 stroke-[3]" />MUTED</span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider bg-[#F9FAFB] border-2 border-neo-dark text-neo-dark px-2 py-0.5 rounded-[4px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">ROLE: {vault.myRole || "OWNER"}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-xs md:text-sm text-neo-dark uppercase truncate flex-1 tracking-tight leading-snug">{vault.name}</h4>
                      <p className="text-[11px] text-[#6B7280] font-sans font-medium line-clamp-2 leading-relaxed">{vault.description || "Supplemental isolated research ledger indices, with dynamic annotation models and live peer channels."}</p>
                    </div>
                    <div className="flex items-center justify-between w-full pt-1.5 border-t border-dashed border-stone-200">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-black border-2 border-neo-dark bg-white text-neo-dark rounded-[4px] shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">📄 {vault._count?.sources ?? 0} Sources</span>
                      {!isActive && (
                        <span className="text-[#F43F5E] font-display font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-rose-600 transition-colors">INSPECT <span className="ml-[1px] text-xs font-sans">→</span></span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Create Vault */}
          {!showVaultForm ? (
            <button type="button" onClick={() => setShowVaultForm(true)} className="w-full bg-white hover:bg-stone-50 border-4 border-neo-dark p-5 rounded-sm text-center font-display font-black text-xs text-neo-dark uppercase tracking-wider cursor-pointer shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#000] transition-all flex flex-col items-center justify-center gap-2 block">
              <FolderPlus className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
              <span>+ Inscribe New Vault</span>
              <span className="text-[9px] font-mono text-stone-500 font-bold normal-case tracking-tight">Initiate isolated research ledger node</span>
            </button>
          ) : (
            <div className="bg-white rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_#000] space-y-3.5 text-left">
              <div className="flex items-center justify-between border-b-2 border-neo-dark pb-1.5">
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-neo-dark flex items-center gap-1.5"><FolderPlus className="w-4 h-4 text-emerald-600" />Inscribe Vault Node</h3>
                <button type="button" onClick={() => setShowVaultForm(false)} className="text-[10px] font-mono font-bold text-stone-500 hover:text-stone-800 uppercase px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded cursor-pointer hover:bg-stone-200">Cancel</button>
              </div>
              {errMessage && <p className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-400 p-2 rounded-sm leading-relaxed">⚠️ {errMessage}</p>}
              {okMessage && <p className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-400 p-2 rounded-sm leading-relaxed">🟢 {okMessage}</p>}
              <form onSubmit={handleCreateVault} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Vault Name / Parameter designation</label>
                  <input type="text" required placeholder="e.g. Bio-Informatics Genome Index" value={newVaultName} onChange={(e) => setNewVaultName(e.target.value)} className="w-full text-xs font-sans font-medium p-2 border-2 border-neo-dark rounded-sm focus:outline-none focus:bg-stone-50" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Supplemental notes summary</label>
                  <textarea placeholder="e.g. Molecular sequence analysis..." value={newVaultDesc} onChange={(e) => setNewVaultDesc(e.target.value)} className="w-full text-xs font-sans p-2 border-2 border-neo-dark rounded-sm focus:outline-none focus:bg-stone-50 h-16 resize-none leading-relaxed" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Privacy Access vector</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                    <button type="button" onClick={() => setNewVaultPrivacy("PRIVATE")} className={`py-1.5 px-3 border border-neo-dark font-display font-bold text-[10px] rounded-sm cursor-pointer transition-all ${newVaultPrivacy === "PRIVATE" ? "bg-neo-yellow text-neo-dark font-black shadow-[1px_1px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"}`}>Private</button>
                    <button type="button" onClick={() => setNewVaultPrivacy("PUBLIC")} className={`py-1.5 px-3 border border-neo-dark font-display font-bold text-[10px] rounded-sm cursor-pointer transition-all ${newVaultPrivacy === "PUBLIC" ? "bg-neo-yellow text-neo-dark font-black shadow-[1px_1px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"}`}>Public</button>
                  </div>
                </div>
                <button type="submit" disabled={creatingVault} className="w-full py-2.5 mt-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-400 hover:bg-emerald-500 text-neo-dark border-2 font-black border-neo-dark rounded-sm">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  {creatingVault ? "Allocating context..." : "Inscribe Vault Node"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Vault Workspace */}
        <div className="lg:col-span-8">
          {activeVault ? (
            <div className="space-y-4">
              {/* Vault Card Header */}
              <div className="bg-white rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <div className="text-[10px] font-mono text-neo-orange font-bold uppercase flex items-center gap-1.5">
                    <span>WORKSPACE ANALYSIS NODE</span>
                    <span>•</span>
                    <span className="bg-neo-orange/10 text-neo-orange border border-neo-orange/20 px-1 py-0.5 rounded-sm">{activeVault.privacy} Clearance</span>
                  </div>
                  <h2 className="font-display font-black text-lg tracking-tight text-neo-dark mt-1 flex items-center gap-2 uppercase">
                    {activeVault.privacy === "PRIVATE" ? <LockKeyhole className="w-5 h-5 text-rose-500" /> : <Globe className="w-5 h-5 text-emerald-500" />}
                    {activeVault.name}
                  </h2>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-3 py-1.5 bg-stone-50 border-2 border-neo-dark rounded-sm shadow-[1px_1px_0px_#000]">Role: {activeVault.myRole || "OWNER"}</span>
                </div>
              </div>

              {/* Tab Controllers */}
              <div className="flex border-4 border-neo-dark bg-white rounded-sm shadow-[3px_3px_0px_#0A0A0A] overflow-x-auto select-none">
                {[
                  { id: "stats", label: "Stats" }, { id: "sources", label: "Sources" },
                  { id: "annotations", label: "Annotations" }, { id: "members", label: "Researchers" },
                  { id: "chat", label: "Chat" }, { id: "qa", label: "Q/A" },
                  { id: "audit", label: "Audits" }, { id: "settings", label: "Settings" },
                ].map((tab) => (
                  <button key={tab.id}
                    onClick={() => { triggerLoadingTransition(2500); setActiveVaultTab(tab.id); if (tab.id === "audit") loadAuditLogs(activeVault.id); }}
                    className={`py-3 px-4 font-display font-extrabold text-xs border-r last:border-0 border-neo-dark hover:bg-stone-50 shrink-0 cursor-pointer transition-all ${activeVaultTab === tab.id ? "bg-neo-yellow text-neo-dark font-black" : "text-stone-600 hover:text-neo-dark"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {loadingView ? (
                  activeVaultTab === "sources" ? <div className="p-2"><SkeletonSourcesTab /></div> :
                  activeVaultTab === "annotations" ? <div className="p-2"><SkeletonAnnotationsTab /></div> :
                  activeVaultTab === "stats" ? <div className="p-2"><SkeletonStatsTab /></div> :
                  activeVaultTab === "members" ? <div className="p-2"><SkeletonMembersTab myRole={activeVault?.myRole} /></div> :
                  activeVaultTab === "chat" ? <div className="p-2"><SkeletonChatTab /></div> :
                  activeVaultTab === "qa" ? <div className="p-2"><SkeletonQALayout /></div> :
                  activeVaultTab === "audit" ? <div className="p-2"><SkeletonAuditTrail /></div> :
                  activeVaultTab === "settings" ? <div className="p-2"><SkeletonVaultSettings /></div> :
                  <div className="p-2"><SkeletonStatsTab /></div>
                ) : (
                  <>
                    {activeVaultTab === "stats" && (
                      <StatsTab vaultId={activeVault.id} members={activeVault.members || []} auditData={auditLogsData} />
                    )}
                    {activeVaultTab === "sources" && (
                      <SourcesTab
                        vaultId={activeVault.id}
                        myRole={activeVault.myRole || "VIEWER"}
                        sources={sources}
                        onSourceAdded={(newSrc) => setSources((prev) => [newSrc, ...prev])}
                        onSourceClick={(sourceId) => router.push(`/source/${activeVault.id}/${sourceId}`)}
                      />
                    )}
                    {activeVaultTab === "annotations" && (
                      <AnnotationsTab
                        vaultId={activeVault.id}
                        sources={sources}
                        onNavigateToSource={(sourceId) => router.push(`/source/${activeVault.id}/${sourceId}`)}
                        onNavigateToWorkspace={(sourceId) => router.push(`/annotation-workspace/${activeVault.id}/${sourceId}`)}
                      />
                    )}
                    {activeVaultTab === "members" && currentUser && (
                      <MembersTab
                        activeVault={activeVault}
                        currentUser={currentUser}
                        onMemberRemoved={() => loadVaultDetail(activeVault.id)}
                      />
                    )}
                    {activeVaultTab === "chat" && currentUser && (
                      <ColloquiumChatTab
                        vaultId={activeVault.id}
                        currentUser={currentUser}
                        vaultOwnerId={activeVault.ownerId || ""}
                        vaultMembers={activeVault.members || []}
                        sources={sources}
                      />
                    )}
                    {activeVaultTab === "qa" && (
                      <QAPanel vaultId={activeVault.id} sources={sources} />
                    )}
                    {activeVaultTab === "audit" && (
                      <AuditTab
                        auditLogs={auditLogs}
                        auditLogsData={auditLogsData}
                        auditPage={auditPage}
                        setAuditPage={setAuditPage}
                        auditTypeFilter={auditTypeFilter}
                        setAuditTypeFilter={setAuditTypeFilter}
                        auditStartDate={auditStartDate}
                        setAuditStartDate={setAuditStartDate}
                        auditEndDate={auditEndDate}
                        setAuditEndDate={setAuditEndDate}
                        activeVaultId={activeVault.id}
                        loadAuditLogs={(page: number, type: string, start: string, end: string) => loadAuditLogs(activeVault.id, page, type, start, end)}
                      />
                    )}
                    {activeVaultTab === "settings" && (
                      <VaultSettingsTab
                        activeVault={activeVault}
                        currentUser={currentUser}
                        editVaultName={editVaultName}
                        setEditVaultName={setEditVaultName}
                        editVaultDesc={editVaultDesc}
                        setEditVaultDesc={setEditVaultDesc}
                        editVaultPrivacy={editVaultPrivacy}
                        setEditVaultPrivacy={setEditVaultPrivacy}
                        updatingVaultSettings={updatingVaultSettings}
                        handleUpdateVaultSettings={handleUpdateVaultSettings}
                        confirmExitVault={confirmExitVault}
                        setConfirmExitVault={setConfirmExitVault}
                        handleExitVault={handleExitVault}
                        confirmDeleteVault={confirmDeleteVault}
                        setConfirmDeleteVault={setConfirmDeleteVault}
                        handleDeleteVault={handleDeleteVault}
                        settingsSuccessMsg={settingsSuccessMsg}
                        settingsErrorMsg={settingsErrorMsg}
                        handleMuteVaultToggle={handleMuteVaultToggle}
                        mutedVaults={mutedVaults}
                        activeSettingsSubTab={activeSettingsSubTab}
                        setActiveSettingsSubTab={setActiveSettingsSubTab}
                        simulateCollaborators={simulateCollaborators}
                        setSimulateCollaborators={setSimulateCollaborators}
                        expandAnnotationsByDefault={expandAnnotationsByDefault}
                        setExpandAnnotationsByDefault={setExpandAnnotationsByDefault}
                        notifyOnNewAnnotations={notifyOnNewAnnotations}
                        setNotifyOnNewAnnotations={setNotifyOnNewAnnotations}
                        settingsSidebarCollapsed={settingsSidebarCollapsed}
                        setSettingsSidebarCollapsed={setSettingsSidebarCollapsed}
                        mobileSidebarOpen={mobileSidebarOpen}
                        setMobileSidebarOpen={setMobileSidebarOpen}
                        onNavigateToPassport={() => router.push(`/passport/${activeVault.id}`)}
                        idCardNickname={""}
                        idCardSpecialization={""}
                        idCardMotto={""}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-neo-dark p-12 text-center shadow-[6px_6px_0px_#000] py-16 space-y-4 rounded-sm">
              <div className="w-16 h-16 bg-stone-100 border-3 border-neo-dark rounded-full flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0A0A0A]">
                <LineChart className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="font-display font-black text-lg text-neo-dark uppercase">No Vault Selected</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Select a vault from the left panel to open its workspace, or create a new vault to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MembersTab({ activeVault, currentUser, inviteRole, setInviteRole, onMemberRemoved }: any) {
  const [members,       setMembers]       = React.useState<any[]>([]);
  const [loadingMembers,setLoadingMembers] = React.useState(true);
  const [membersError,  setMembersError]  = React.useState("");
  const [removingId,    setRemovingId]    = React.useState<string | null>(null);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [inviteQuery,     setInviteQuery]     = React.useState("");
  const [inviteResults,   setInviteResults]   = React.useState<any[]>([]);
  const [inviteSearching, setInviteSearching] = React.useState(false);
  const [inviteRole2,     setInviteRole2]     = React.useState<"CONTRIBUTOR" | "VIEWER">("CONTRIBUTOR");
  const [inviting,        setInviting]        = React.useState<string | null>(null);
  const [inviteSuccess,   setInviteSuccess]   = React.useState("");
  const [inviteError,     setInviteError]     = React.useState("");
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = activeVault.myRole === "OWNER" || currentUser.id === activeVault.ownerId;

  const fetchMembers = React.useCallback(async () => {
    setLoadingMembers(true); setMembersError("");
    try {
      const res = await vaultService.getMembers(activeVault.id);
      if (res.success) setMembers(res.data as any[]);
      else setMembersError(res.message || "Failed to load members.");
    } catch (err: any) {
      setMembersError(err?.message || "Could not load members.");
    } finally { setLoadingMembers(false); }
  }, [activeVault.id]);

  React.useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this researcher from the vault?")) return;
    setRemovingId(userId);
    try {
      const res = await vaultService.removeMember(activeVault.id, userId);
      if (res.success) { setMembers((p) => p.filter((m) => m.user.id !== userId)); onMemberRemoved?.(); }
    } catch { /* ignore */ } finally { setRemovingId(null); }
  };

  // Username search with debounce
  const handleInviteSearch = (q: string) => {
    setInviteQuery(q); setInviteError(""); setInviteSuccess("");
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setInviteResults([]); return; }
    setInviteSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await invitationService.searchByUsername(q.trim());
        if (res.success) {
          const memberIds = new Set(members.map((m: any) => m.user.id));
          setInviteResults((res.data ?? []).filter((u: any) => !memberIds.has(u.id)));
        }
      } catch { setInviteResults([]); } finally { setInviteSearching(false); }
    }, 350);
  };

  const handleSendInvite = async (userId: string) => {
    setInviting(userId); setInviteError(""); setInviteSuccess("");
    try {
      const res = await invitationService.sendInvitation(activeVault.id, userId, inviteRole2);
      if (res.success) {
        setInviteSuccess("Invitation sent! The user will receive an email.");
        setInviteQuery(""); setInviteResults([]);
        setTimeout(() => { setInviteSuccess(""); setShowInviteModal(false); }, 3000);
      } else { setInviteError(res.message || "Failed to send invitation."); }
    } catch (err: any) { setInviteError(err?.message || "Failed to send invitation."); }
    finally { setInviting(null); }
  };

  const roleBadge = (role: string) => {
    if (role === "OWNER")       return "bg-neo-yellow text-neo-dark";
    if (role === "CONTRIBUTOR") return "bg-emerald-100 text-emerald-900";
    return "bg-stone-100 text-stone-700";
  };

  return (
    <div className="space-y-4 text-left">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-neo-orange" />
          Active Researchers
          {!loadingMembers && (
            <span className="text-[9px] font-mono font-black bg-neo-yellow border-2 border-neo-dark px-1.5 py-0.5 rounded-sm shadow-[1px_1px_0px_#000]">
              {members.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMembers}
            disabled={loadingMembers}
            className="text-[9px] font-mono font-bold text-stone-500 hover:text-neo-dark border border-stone-300 hover:border-neo-dark px-2 py-1 rounded cursor-pointer transition-all disabled:opacity-40"
          >
            {loadingMembers ? "Loading…" : "↻ Refresh"}
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => { setShowInviteModal(true); setInviteQuery(""); setInviteResults([]); setInviteError(""); setInviteSuccess(""); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neo-yellow border-2 border-neo-dark text-neo-dark font-display font-black text-[10px] uppercase rounded-sm shadow-[2px_2px_0px_#000] hover:bg-yellow-300 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Invite Researcher
            </button>
          )}
        </div>
      </div>

      {membersError && (
        <div className="p-2 bg-rose-50 border-2 border-rose-400 text-xs font-mono text-rose-700 font-bold rounded">
          ⚠️ {membersError}
        </div>
      )}

      {/* ── Members list ── */}
      <div className="bg-white border-4 border-neo-dark rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        {loadingMembers ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-stone-200 border-2 border-neo-dark shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/2" />
                </div>
                <div className="h-5 w-20 bg-stone-200 border-2 border-neo-dark rounded-sm" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-stone-400 font-mono italic text-center py-10">
            No members yet. Invite researchers using the button above.
          </p>
        ) : (
          <div className="divide-y-2 divide-stone-100">
            {members.map((m: any) => (
              <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={m.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(m.user.name)}`}
                    alt={m.user.name}
                    className="w-9 h-9 rounded-full border-2 border-neo-dark bg-stone-100 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neo-dark block truncate">{m.user.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono truncate block">{m.user.email}</span>
                    {m.joinedAt && (
                      <span className="text-[9px] text-stone-400 font-mono block">
                        Joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-mono font-black border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] ${roleBadge(m.role)}`}>
                    {m.role}
                  </span>
                  {isOwner && m.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(m.user.id)}
                      disabled={removingId === m.user.id}
                      className="p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border-2 border-neo-dark rounded shadow-[1px_1px_0px_#000] transition-all disabled:opacity-40 cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-dark/50">
          <div className="w-full max-w-md bg-white border-4 border-neo-dark rounded-sm shadow-[6px_6px_0px_#000] overflow-hidden">

            {/* Modal header */}
            <div className="bg-neo-yellow border-b-4 border-neo-dark px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Invite Researcher
                </h3>
                <p className="text-[10px] font-mono text-stone-600 mt-0.5">Search by username and send an email invitation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 hover:bg-amber-300 border-2 border-neo-dark rounded cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-neo-dark" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Success / error */}
              {inviteSuccess && (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-xs font-mono font-bold text-emerald-700 rounded-sm flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> {inviteSuccess}
                </div>
              )}
              {inviteError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-400 text-xs font-mono font-bold text-rose-700 rounded-sm">
                  ⚠️ {inviteError}
                </div>
              )}

              {/* Username search */}
              <div>
                <label className="block text-[9px] font-black font-mono text-stone-600 uppercase mb-1.5">
                  Search by Username
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="@username"
                    value={inviteQuery}
                    onChange={(e) => handleInviteSearch(e.target.value)}
                    className="w-full text-xs p-2 pl-9 border-2 border-neo-dark rounded-sm focus:outline-none font-mono bg-stone-50"
                    autoFocus
                  />
                  {inviteSearching && (
                    <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-stone-400" />
                  )}
                </div>
                <p className="text-[9px] font-mono text-stone-400 mt-1">Min 2 characters to search.</p>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-[9px] font-black font-mono text-stone-600 uppercase mb-1.5">
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["CONTRIBUTOR", "VIEWER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole2(r)}
                      className={`py-1.5 text-[10px] font-display font-black border-2 border-neo-dark rounded-sm cursor-pointer transition-all ${
                        inviteRole2 === r ? "bg-neo-yellow shadow-[1px_1px_0px_#000]" : "bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search results */}
              {inviteResults.length > 0 && (
                <div className="border-2 border-neo-dark rounded-sm overflow-hidden">
                  <div className="bg-stone-50 px-3 py-1.5 border-b-2 border-neo-dark">
                    <span className="text-[9px] font-mono font-black text-stone-500 uppercase tracking-widest">
                      {inviteResults.length} result{inviteResults.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="divide-y-2 divide-stone-100 max-h-52 overflow-y-auto">
                    {inviteResults.map((u: any) => (
                      <div key={u.id} className="px-3 py-2.5 flex items-center justify-between gap-3 bg-white hover:bg-amber-50 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full border-2 border-neo-dark shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-black text-xs text-neo-dark block truncate">{u.name}</span>
                            <span className="font-mono text-[9px] text-stone-400 block">@{u.username}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendInvite(u.id)}
                          disabled={inviting === u.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-neo-dark text-neo-yellow font-display font-black text-[10px] uppercase border-2 border-neo-dark rounded-sm shadow-[1.5px_1.5px_0px_#FACC15] hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {inviting === u.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Send className="w-3 h-3" />
                          }
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inviteQuery.trim().length >= 2 && !inviteSearching && inviteResults.length === 0 && !inviteSuccess && (
                <p className="text-xs font-mono text-stone-400 italic text-center py-2">
                  No users found for "@{inviteQuery}".
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnotationsTab({ vaultId, sources, onNavigateToSource, onNavigateToWorkspace }: {
  vaultId: string;
  sources: Source[];
  onNavigateToSource: (sourceId: string) => void;
  onNavigateToWorkspace: (sourceId: string) => void;
}) {
  const [annotationsBySource, setAnnotationsBySource] = React.useState<Record<string, Annotation[]>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sources.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(
      sources.map((src) =>
        annotationService.listAnnotations(vaultId, src.id)
          .then((res) => ({ sourceId: src.id, data: res.success ? (res.data as Annotation[]) : [] }))
          .catch(() => ({ sourceId: src.id, data: [] }))
      )
    ).then((results) => {
      const map: Record<string, Annotation[]> = {};
      results.forEach(({ sourceId, data }) => { map[sourceId] = data; });
      setAnnotationsBySource(map);
    }).finally(() => setLoading(false));
  }, [vaultId, sources.map(s => s.id).join(",")]);

  const totalAnnotations = Object.values(annotationsBySource).reduce((s, a) => s + a.length, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-stone-100 border-2 border-neo-dark rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm border-4 border-neo-dark shadow-[4px_4px_0px_#000] text-left overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-neo-dark bg-stone-50">
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
          <BookOpenCheck className="w-5 h-5 text-neo-orange" />
          Unified Annotations Index
        </h3>
        <span className="text-[10px] font-mono font-black bg-neo-yellow border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_#000]">
          {totalAnnotations} total
        </span>
      </div>

      {sources.length === 0 ? (
        <div className="text-center p-10 text-xs text-stone-400 italic font-mono bg-stone-50 border-t-0">
          Add sources in the Sources tab first — annotations live inside sources.
        </div>
      ) : (
        <div className="divide-y-2 divide-neo-dark">
          {sources.map((src) => {
            const anns = annotationsBySource[src.id] ?? [];
            const meta = [
              `Type: ${src.sourceType}`,
              src.year ? `Year: ${src.year}` : null,
              anns.length > 0 ? `${anns.length} annotation${anns.length !== 1 ? "s" : ""}` : null,
            ].filter(Boolean).join(" • ");

            return (
              <div
                key={src.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors group"
              >
                {/* Left: title + meta */}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-black text-sm text-neo-dark uppercase tracking-tight truncate">
                    {src.title}
                  </p>
                  <p className="text-[11px] font-mono text-stone-400 mt-0.5">{meta}</p>
                </div>

                {/* Right: CTA */}
                <button
                  type="button"
                  onClick={() => onNavigateToWorkspace(src.id)}
                  className="shrink-0 ml-6 text-xs font-mono font-bold text-neo-orange hover:text-orange-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Open Workspace Annotator →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Audit helpers ─────────────────────────────────────────────────────────────

/**
 * Convert an audit log entry into a human-readable description.
 * `details` may be null, a primitive, or an object — never render it raw.
 */
function formatAuditDetails(action: string, details: unknown): string {
  if (details === null || details === undefined) {
    return ACTION_LABELS[action] ?? action.toLowerCase().replace(/_/g, " ");
  }
  if (typeof details !== "object") return String(details);

  const d = details as Record<string, unknown>;

  // Provide readable descriptions for known actions
  switch (action) {
    case "SOURCE_ADDED":
      return `Added source${d.textExtracted ? ` · ${d.wordCount ?? 0} words extracted` : " (no text extracted)"}`;
    case "SOURCE_UPDATED":
      if (d.action === "qa_processing_complete") return `Indexed for Q&A · ${d.chunksCreated ?? 0} chunks`;
      if (d.action === "ai_summary_generated") return `AI summary generated (${d.summaryLength ?? "medium"})`;
      if (d.action === "ai_insights_extracted") return `AI insights extracted · ${d.findingsCount ?? 0} findings`;
      if (d.action === "extract_and_index_complete") return `Extracted & indexed · ${d.chunksCreated ?? 0} chunks`;
      if (d.updated) return `Updated: ${Object.keys(d.updated as object).join(", ")}`;
      return "Source updated";
    case "FILE_UPLOADED":
      return "File uploaded";
    case "MEMBER_ADDED":
      return `Member added with role ${d.role ?? ""}`;
    case "MEMBER_REMOVED":
      return "Member removed";
    case "ANNOTATION_ADDED":
      return "Annotation created";
    case "ANNOTATION_UPDATED":
      return "Annotation updated";
    case "ANNOTATION_DELETED":
      return "Annotation deleted";
    case "VAULT_CREATED":
      return "Vault created";
    case "VAULT_UPDATED":
      return d.updated ? `Updated: ${Object.keys(d.updated as object).join(", ")}` : "Vault updated";
    case "VAULT_DELETED":
      return "Vault deleted";
    default:
      return action.toLowerCase().replace(/_/g, " ");
  }
}

const ACTION_LABELS: Record<string, string> = {
  VAULT_CREATED: "Vault created",
  VAULT_UPDATED: "Vault updated",
  VAULT_DELETED: "Vault deleted",
  MEMBER_ADDED: "Member added",
  MEMBER_REMOVED: "Member removed",
  MEMBER_ROLE_CHANGED: "Member role changed",
  FILE_UPLOADED: "File uploaded",
  FILE_DELETED: "File deleted",
  SOURCE_ADDED: "Source added",
  SOURCE_UPDATED: "Source updated",
  SOURCE_DELETED: "Source deleted",
  ANNOTATION_ADDED: "Annotation created",
  ANNOTATION_UPDATED: "Annotation updated",
  ANNOTATION_DELETED: "Annotation deleted",
};

function AuditTab({ auditLogs, auditLogsData, auditPage, setAuditPage, auditTypeFilter, setAuditTypeFilter, auditStartDate, setAuditStartDate, auditEndDate, setAuditEndDate, loadAuditLogs, activeVaultId }: any) {
  return (
    <div className="bg-white rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_#000] space-y-4 text-left">

      {/* Header: title + pager */}
      <div className="flex justify-between items-center border-b-2 border-stone-200 pb-2 bg-stone-50 px-2 py-1.5 rounded border border-neo-dark flex-wrap gap-2">
        <h3 className="font-display font-black text-xs uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
          <History className="w-4 h-4 text-rose-500 animate-[spin_4s_linear_infinite]" />
          Vault audit chronology
        </h3>

        {/* Pager */}
        <div className="flex bg-white rounded-sm border-2 border-neo-dark overflow-hidden shadow-[1px_1px_0px_#000] text-[9px] select-none font-bold">
          <button
            disabled={auditPage === 0}
            onClick={() => {
              const prevPage = Math.max(0, auditPage - 1);
              setAuditPage(prevPage);
              loadAuditLogs(prevPage, auditTypeFilter, auditStartDate, auditEndDate);
            }}
            className="px-2 py-0.5 border-r-2 border-neo-dark cursor-pointer hover:bg-amber-50 disabled:opacity-40"
          >
            ◀ <span className="hidden sm:inline">PREV</span>
          </button>
          <span className="px-2 py-0.5 bg-stone-50 font-mono border-r-2 border-neo-dark text-center min-w-[50px]">
            PAGE {auditPage + 1}
          </span>
          <button
            onClick={() => {
              const nextPage = auditPage + 1;
              setAuditPage(nextPage);
              loadAuditLogs(nextPage, auditTypeFilter, auditStartDate, auditEndDate);
            }}
            className="px-2 py-0.5 cursor-pointer hover:bg-amber-50"
          >
            <span className="hidden sm:inline">NEXT</span> ▶
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 bg-stone-50 border-2 border-neo-dark rounded-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="text-left">
          <label className="block text-[9px] uppercase font-black font-mono text-stone-600 mb-1">Action Type</label>
          <select
            value={auditTypeFilter}
            onChange={(e) => {
              const val = e.target.value;
              setAuditTypeFilter(val);
              setAuditPage(0);
              loadAuditLogs(0, val, auditStartDate, auditEndDate);
            }}
            className="w-full text-xs p-1.5 border-2 border-neo-dark rounded bg-white font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL PROCESSES</option>
            <option value="VAULT">VAULT SECURE BOUNDS</option>
            <option value="MEMBER">PERSONNEL & MEMBERS</option>
            <option value="FILE">FILE UPLOADS</option>
            <option value="SOURCE">SOURCE RESEARCH NODES</option>
            <option value="ANNOTATION">ANNOTATION & COMMENTS</option>
            <option value="CITATION">CITATION FORMATS</option>
          </select>
        </div>

        <div className="text-left">
          <label className="block text-[9px] uppercase font-black font-mono text-stone-600 mb-1">From Date</label>
          <input
            type="date"
            value={auditStartDate}
            onChange={(e) => {
              const val = e.target.value;
              setAuditStartDate(val);
              setAuditPage(0);
              loadAuditLogs(0, auditTypeFilter, val, auditEndDate);
            }}
            className="w-full text-xs p-1 border-2 border-neo-dark rounded bg-white font-mono focus:outline-none"
          />
        </div>

        <div className="text-left">
          <label className="block text-[9px] uppercase font-black font-mono text-stone-600 mb-1">To Date</label>
          <input
            type="date"
            value={auditEndDate}
            onChange={(e) => {
              const val = e.target.value;
              setAuditEndDate(val);
              setAuditPage(0);
              loadAuditLogs(0, auditTypeFilter, auditStartDate, val);
            }}
            className="w-full text-xs p-1 border-2 border-neo-dark rounded bg-white font-mono focus:outline-none"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setAuditTypeFilter("ALL");
              setAuditStartDate("");
              setAuditEndDate("");
              setAuditPage(0);
              loadAuditLogs(0, "ALL", "", "");
            }}
            className="w-full text-[10px] font-bold font-mono py-2 px-3 bg-stone-200 border-2 border-neo-dark text-neo-dark hover:bg-stone-300 rounded shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 transition-all text-center cursor-pointer uppercase"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 select-none text-[11px] font-mono">
        {auditLogs.length === 0 ? (
          <p className="text-xs text-stone-400 font-mono italic p-4 text-center">No visual audit logs indexed.</p>
        ) : (
          auditLogs.map((log: any) => {
            let borderCol = "border-l-indigo-500 bg-indigo-50/10";
            if (log.action.includes("CREATED") || log.action.includes("ADDED"))
              borderCol = "border-l-emerald-500 bg-emerald-50/10";
            if (log.action.includes("DELETED") || log.action.includes("REMOVED"))
              borderCol = "border-l-rose-500 bg-rose-50/10";

            return (
              <div
                key={log.id}
                className={`p-2.5 border-2 border-neo-dark border-l-8 rounded-sm hover:bg-stone-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${borderCol}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-left">
                  <span className="bg-stone-100 border border-stone-300 font-bold px-1.5 py-0.5 rounded text-[8px] text-stone-600 tracking-tight">
                    {log.action}
                  </span>
                  <span className="text-neo-dark font-black font-sans bg-amber-50/40 px-1 py-0.5">
                    {log.user?.name || "Member"}:
                  </span>
                  <span className="text-stone-700 font-sans tracking-tight leading-none text-left">
                    {formatAuditDetails(log.action, log.details)}
                  </span>
                </div>
                <span className="text-[9px] text-stone-600 font-bold shrink-0 font-mono bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,0.15)]">
                  {new Date(log.createdAt).toLocaleDateString()} &bull; {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function VaultSettingsTab({
  activeVault, currentUser,
  editVaultName, setEditVaultName,
  editVaultDesc, setEditVaultDesc,
  editVaultPrivacy, setEditVaultPrivacy,
  updatingVaultSettings, handleUpdateVaultSettings,
  confirmExitVault, setConfirmExitVault, handleExitVault,
  confirmDeleteVault, setConfirmDeleteVault, handleDeleteVault,
  settingsSuccessMsg, settingsErrorMsg,
  handleMuteVaultToggle, mutedVaults,
  activeSettingsSubTab, setActiveSettingsSubTab,
  simulateCollaborators, setSimulateCollaborators,
  expandAnnotationsByDefault, setExpandAnnotationsByDefault,
  notifyOnNewAnnotations, setNotifyOnNewAnnotations,
  onNavigateToPassport,
  idCardNickname, idCardSpecialization, idCardMotto,
  settingsSidebarCollapsed, setSettingsSidebarCollapsed,
  mobileSidebarOpen, setMobileSidebarOpen,
}: any) {

  return (
    <div className="space-y-6">
      {/* Success / Error alerts */}
      {settingsSuccessMsg && (
        <div className="p-3 bg-emerald-50 border-2 border-neo-dark text-emerald-950 text-xs font-mono font-bold rounded shadow-[2.5px_2.5px_0px_#10B981] flex items-center gap-2 animate-fadeIn">
          <span className="text-emerald-700">🟢</span>
          <span>{settingsSuccessMsg}</span>
        </div>
      )}
      {settingsErrorMsg && (
        <div className="p-3 bg-rose-50 border-2 border-neo-dark text-rose-950 text-xs font-mono font-bold rounded shadow-[2.5px_2.5px_0px_#EF4444] flex items-center gap-2 animate-fadeIn">
          <span className="text-rose-700">⚠️</span>
          <span>{settingsErrorMsg}</span>
        </div>
      )}

      {/* ── MOBILE: top toggle bar ── */}
      <div className="block md:hidden bg-white border-4 border-neo-dark rounded-sm p-3 shadow-[2.5px_2.5px_0px_#000] space-y-2 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-neo-yellow border-2 border-neo-dark rounded">
              <Settings className="w-4 h-4 text-neo-dark" />
            </span>
            <div className="text-left">
              <span className="text-[9px] font-mono uppercase font-bold text-stone-500 block leading-none">Settings Tab</span>
              <span className="font-display font-black text-xs uppercase tracking-tight text-neo-dark">
                {activeSettingsSubTab === "general" && "General Settings"}
                {activeSettingsSubTab === "guidelines" && "Researcher Guidelines"}
                {activeSettingsSubTab === "idcard" && "Vault Researcher ID Card"}
                {activeSettingsSubTab === "admin" && "Admin Ledger"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="px-2.5 py-1.5 bg-neo-yellow hover:bg-yellow-400 text-neo-dark border-2 border-neo-dark font-display font-black text-[10px] uppercase rounded-xs shadow-[1.5px_1.5px_0px_#000] cursor-pointer active:translate-y-0.5 flex items-center gap-1"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Tabs</span>
          </button>
        </div>

        {mobileSidebarOpen && (
          <div className="pt-2 border-t-2 border-dashed border-stone-200 grid grid-cols-1 gap-1.5">
            {[
              { id: "general", icon: <Bell className="w-4 h-4 shrink-0" />, label: "General Settings" },
              { id: "guidelines", icon: <ShieldCheck className="w-4 h-4 shrink-0" />, label: "Clearance / Guidelines" },
              { id: "idcard", icon: <Fingerprint className="w-4 h-4 shrink-0" />, label: "Researcher ID Card" },
              ...(activeVault.myRole === "OWNER" ? [{ id: "admin", icon: <LockKeyhole className="w-4 h-4 shrink-0" />, label: "Admin Ledger Node" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveSettingsSubTab(tab.id); setMobileSidebarOpen(false); }}
                className={`w-full text-left p-2.5 border-2 border-neo-dark rounded font-display font-bold text-xs flex items-center gap-2 transition-all ${
                  activeSettingsSubTab === tab.id ? "bg-neo-yellow text-neo-dark font-black" : "bg-stone-50 hover:bg-stone-100 text-stone-600"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP: sidebar + content ── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* Collapsible Sidebar (desktop only) */}
        <div className={`hidden md:flex flex-col shrink-0 bg-white border-4 border-neo-dark rounded-sm p-4 shadow-[4px_4px_0px_#000] transition-all duration-300 relative ${settingsSidebarCollapsed ? "w-20" : "w-64"}`}>
          <div className="border-b-2 border-stone-200 pb-3 mb-4 flex items-center justify-between">
            {!settingsSidebarCollapsed ? (
              <div className="text-left">
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-neo-dark">Vault Settings</h3>
                <p className="text-[9px] font-mono text-stone-400 font-bold leading-none mt-1 uppercase">{activeVault.myRole || "OWNER"} clearance</p>
              </div>
            ) : (
              <span className="mx-auto p-1 bg-stone-50 border-2 border-neo-dark rounded text-stone-600">
                <Settings className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1 relative z-10">
            {[
              { id: "general", icon: <Bell className="w-4 h-4 shrink-0" />, label: "General Settings" },
              { id: "guidelines", icon: <ShieldCheck className="w-4 h-4 shrink-0" />, label: "Clearance & Rules" },
              { id: "idcard", icon: <Fingerprint className="w-4 h-4 shrink-0" />, label: "Vault ID Passport" },
              ...(activeVault.myRole === "OWNER" ? [{ id: "admin", icon: <LockKeyhole className="w-4 h-4 shrink-0" />, label: "Admin Configuration" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSettingsSubTab(tab.id)}
                title={tab.label}
                className={`w-full p-2.5 border-2 border-neo-dark rounded font-display font-bold text-xs flex items-center gap-2.5 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer ${
                  activeSettingsSubTab === tab.id ? "bg-neo-yellow text-neo-dark font-black" : "bg-stone-50 hover:bg-stone-100 text-stone-600"
                } ${settingsSidebarCollapsed ? "justify-center px-1" : "text-left"}`}
              >
                {tab.icon}
                {!settingsSidebarCollapsed && <span className="truncate">{tab.label}</span>}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-dashed border-stone-200 mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setSettingsSidebarCollapsed(!settingsSidebarCollapsed)}
              className="p-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 border-2 border-neo-dark font-mono font-bold text-[10px] rounded hover:text-neo-dark transition-all flex items-center justify-center gap-1 cursor-pointer w-full uppercase shadow-[1.5px_1.5px_0px_#000]"
            >
              {!settingsSidebarCollapsed ? (
                <><ChevronRight className="w-3.5 h-3.5 rotate-180" /><span>Collapse</span></>
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 w-full space-y-6">

          {/* ── GENERAL ── */}
          {activeSettingsSubTab === "general" && (
            <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-5 text-left">
              <div className="border-b-2 border-stone-200 pb-2 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
                  <Bell className="w-5 h-5 text-amber-500" />
                  General Preferences
                </h3>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 border-2 border-neo-dark rounded bg-neo-yellow text-neo-dark uppercase shadow-[1px_1px_0px_#000]">
                  {activeVault.myRole || "OWNER"} clearance
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs text-left">
                {/* Mute Vault */}
                <div className="flex items-center justify-between p-3.5 bg-stone-50 border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] gap-4">
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="font-black text-neo-dark uppercase flex items-center gap-1.5 font-mono">
                      {mutedVaults[activeVault.id] ? <VolumeX className="w-4 h-4 text-amber-600 stroke-[2.5]" /> : <Bell className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                      <span>Mute Vault Notifications</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-sans font-medium">Silence collaborator audio pings, dynamic indicators, and mock real-time events.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMuteVaultToggle(activeVault.id)}
                    className={`py-1.5 px-4 border-2 border-neo-dark font-display font-black text-[10px] uppercase rounded-xs cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 shrink-0 ${
                      mutedVaults[activeVault.id] ? "bg-stone-200 text-stone-600 hover:bg-stone-300" : "bg-emerald-400 text-neo-dark"
                    }`}
                  >
                    {mutedVaults[activeVault.id] ? "Inactive" : "Active"}
                  </button>
                </div>

                {/* Expand Annotations */}
                <div className="flex items-center justify-between p-3.5 bg-stone-50 border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] gap-4">
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="font-black text-neo-dark uppercase flex items-center gap-1.5 font-mono">
                      <Eye className="w-4 h-4 text-stone-700 stroke-[2.5]" />
                      <span>Expand Annotations List</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-sans font-medium">Auto-expand all custom detailed citation logs on your layout entries by default.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandAnnotationsByDefault(!expandAnnotationsByDefault)}
                    className={`py-1.5 px-4 border-2 border-neo-dark font-display font-black text-[10px] uppercase rounded-xs cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 shrink-0 ${
                      expandAnnotationsByDefault ? "bg-emerald-400 text-neo-dark" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }`}
                  >
                    {expandAnnotationsByDefault ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Activity Pings */}
                <div className="flex items-center justify-between p-3.5 bg-stone-50 border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] gap-4">
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="font-black text-neo-dark uppercase flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                      <span>Activity Highlight Pings</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-sans font-medium">Toggle subtle visual alert indicators in the page workspace when peer updates occur.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyOnNewAnnotations(!notifyOnNewAnnotations)}
                    className={`py-1.5 px-4 border-2 border-neo-dark font-display font-black text-[10px] uppercase rounded-xs cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 shrink-0 ${
                      notifyOnNewAnnotations ? "bg-emerald-400 text-neo-dark" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }`}
                  >
                    {notifyOnNewAnnotations ? "Active" : "Inactive"}
                  </button>
                </div>

                {/* Simulate Peer Conflict */}
                {(activeVault.myRole === "OWNER" || activeVault.myRole === "CONTRIBUTOR") && (
                  <div className="flex items-center justify-between p-3.5 bg-stone-50 border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] gap-4">
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="font-black text-neo-dark uppercase flex items-center gap-1.5 font-mono">
                        <Cpu className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                        <span>Simulation Peer Conflict</span>
                      </div>
                      <p className="text-[10px] text-stone-500 font-sans font-medium">Generate dynamic automated editing overlays and simulate collaboration conflicts.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulateCollaborators(!simulateCollaborators)}
                      className={`py-1.5 px-4 border-2 border-neo-dark font-display font-black text-[10px] uppercase rounded-xs cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 shrink-0 ${
                        simulateCollaborators ? "bg-emerald-400 text-neo-dark" : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                      }`}
                    >
                      {simulateCollaborators ? "Active" : "Inactive"}
                    </button>
                  </div>
                )}
              </div>

              {/* Exit / Owner restriction */}
              <div className="pt-4 border-t-2 border-stone-200">
                {activeVault.myRole !== "OWNER" ? (
                  <div className="space-y-3">
                    {!confirmExitVault ? (
                      <button
                        type="button"
                        onClick={() => setConfirmExitVault(true)}
                        className="w-full py-2.5 bg-rose-100 hover:bg-rose-200 border-2 border-neo-dark text-rose-950 font-display font-black text-xs uppercase tracking-wider rounded-xs shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-700 stroke-[2.5]" />
                        Exit Research Vault Node
                      </button>
                    ) : (
                      <div className="p-3 bg-rose-50 border-2 border-rose-500 rounded space-y-2.5">
                        <p className="text-[10px] text-stone-700 font-medium leading-relaxed font-mono">⚠️ WARNING: You are leaving this vault bounds. You will lose access to all its citations, comments, and collaborative room logs.</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={handleExitVault} className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white border-2 border-neo-dark text-[10px] font-mono font-black uppercase rounded shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 cursor-pointer">Confirm Exit</button>
                          <button type="button" onClick={() => setConfirmExitVault(false)} className="flex-1 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border-2 border-neo-dark text-[10px] font-mono font-bold uppercase rounded shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border-2 border-neo-dark rounded-sm flex items-start gap-3 shadow-[2.5px_2.5px_0px_#000]">
                    <LockKeyhole className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-xs text-amber-950 uppercase tracking-wide">Vault Owner-Admin Restriction</h4>
                      <p className="text-[11px] text-stone-600 font-sans font-semibold leading-relaxed">You cannot exit your own ledger workspace. Use the "Dismantle Vault" option under the "Admin Configuration" tab to permanently deactivate this research node.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── GUIDELINES ── */}
          {activeSettingsSubTab === "guidelines" && (
            <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-4 font-sans text-xs text-stone-600 text-left">
              <div className="border-b-2 border-stone-200 pb-2">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Researcher Guidelines
                </h3>
              </div>
              <div className="space-y-4 leading-relaxed">
                <p className="font-bold text-neo-dark text-xs">
                  You are authorized in this vault under clearance:{" "}
                  <span className="bg-neo-yellow border-2 border-neo-dark px-1.5 py-0.5 rounded text-[10px] font-black">{activeVault.myRole || "OWNER"}</span>.
                </p>
                <div className="p-3.5 bg-stone-50 border-2 border-neo-dark rounded space-y-2 shadow-[2px_2px_0px_#000]">
                  <div className="font-bold text-stone-800 uppercase text-[9px] font-mono flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    {activeVault.myRole === "OWNER" ? "Admin Owner Permissions List" : activeVault.myRole === "CONTRIBUTOR" ? "Editor Permissions List" : "Viewer Permissions List"}
                  </div>
                  <p className="text-stone-500 font-semibold font-sans text-[11px] leading-relaxed select-text">
                    {activeVault.myRole === "OWNER"
                      ? "As the Owner (Creator), you possess supreme cryptographic bounds, holding unilateral authorization to index original sources, edit metadata bounds, dismantle nodes, and manage investigator clearances."
                      : activeVault.myRole === "CONTRIBUTOR"
                      ? "As a Contributor (Editor), you have full authorization to compile citations sources indices, register comments annotations, invoke peer collaboration overlays, and consult grounding inquiry models."
                      : "As a Viewer, your node clearance allows read-only examination. You can view all processed annotations entries, consult grounded Q/A summaries, read chat colloquia, and review secure audit chronological registries."}
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <h4 className="font-display font-black text-[10px] uppercase tracking-wider text-stone-500">Security Clearance Bounds</h4>
                  <div className="space-y-2 border-2 border-neo-dark p-3 bg-stone-50 rounded shadow-[2px_2px_0px_#000]">
                    {[
                      { label: "Citations adding/editing", allowed: activeVault.myRole === "OWNER" || activeVault.myRole === "CONTRIBUTOR" },
                      { label: "Annotating reference sheets", allowed: activeVault.myRole === "OWNER" || activeVault.myRole === "CONTRIBUTOR" },
                      { label: "Inviting new personnel", allowed: activeVault.myRole === "OWNER", restricted: "Admin Only" },
                      { label: "Archiving / Dismantling", allowed: activeVault.myRole === "OWNER", restricted: "Admin Only" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-1 border-b border-stone-200 last:border-0 flex-wrap gap-1">
                        <span className="font-sans font-bold text-stone-700 text-[11px]">{row.label}</span>
                        {row.allowed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-neo-dark bg-emerald-100 text-emerald-950 font-display font-black text-[9px] uppercase shadow-[1px_1px_0px_#000]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Authorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-neo-dark bg-rose-100 text-rose-950 font-display font-black text-[9px] uppercase shadow-[1px_1px_0px_#000]">
                            <Lock className="w-2.5 h-2.5" /> {row.restricted || "Unauthorized"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ID CARD ── */}
          {activeSettingsSubTab === "idcard" && (
            <div className="space-y-6 text-left">
              <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-1.5">
                    <Fingerprint className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    Identity & Clearance Passport
                  </h3>
                  <p className="text-[11px] text-stone-500 font-sans font-medium">Your digital vault ledger credentials and unique Neobrutalist sector passport card.</p>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-1 bg-emerald-100 border-2 border-neo-dark rounded text-emerald-950 uppercase shadow-[1.5px_1.5px_0px_#000]">Active Cryptosector ID Card</span>
              </div>

              <div className="bg-white rounded-sm border-4 border-neo-dark p-6 md:p-8 shadow-[6px_6px_0px_#000] flex flex-col items-center space-y-6">
                {/* Passport preview */}
                <div className="w-full max-w-2xl border-0 sm:border-4 border-dashed border-stone-300 p-0 sm:p-4 rounded-md flex flex-col items-center relative">
                  <div className="w-full bg-stone-50 border-2 sm:border-4 border-neo-dark rounded-xs sm:rounded-sm p-3.5 sm:p-4 md:p-6 shadow-[4px_4px_0px_#000] sm:shadow-[8px_8px_0px_#000] relative overflow-hidden">
                    <div className="border-b-4 border-neo-dark pb-3.5 mb-4 flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h5 className="font-display font-black text-xs md:text-sm text-neo-dark tracking-wide block uppercase leading-none">SECURE RESEARCH BOUNDS PASSPORT</h5>
                        <span className="text-[8px] md:text-[9px] font-mono font-bold text-stone-500 uppercase block tracking-wider mt-1">COGNITIVE VAULT INTEL DIRECTORY APPARATUS</span>
                      </div>
                      <span className="text-[8px] font-mono font-black border border-neo-dark px-1.5 py-0.5 rounded bg-neo-yellow text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000]">V.SECURE</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      <div className="col-span-1 md:col-span-4 flex flex-col items-center space-y-2">
                        <RenderUserAvatar avatar={currentUser ? currentUser.avatar : null} name={idCardNickname || (currentUser ? currentUser.name : "Scholar")} size={100} squareBorder={true} />
                        <div className="text-center w-full">
                          <span className="text-[8px] font-mono font-black uppercase text-stone-500 block leading-none mb-1">Pass Hologram</span>
                          <div className="flex gap-1 justify-center">
                            <div className="w-4 h-4 rounded-full bg-stone-200 border border-neo-dark flex items-center justify-center text-[7px] font-black tracking-tight select-none">ID</div>
                            <div className="w-10 h-4 border border-neo-dark bg-stone-100 flex items-center justify-around px-0.5">
                              {[3, 4, 2, 3, 2, 2, 4].map((h, i) => <div key={i} className={`w-0.5 bg-neo-dark`} style={{ height: `${h * 3}px` }} />)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-8 space-y-2.5 font-sans font-semibold text-stone-700 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <div className="border-b-2 border-stone-100 pb-1"><span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-none mb-0.5">AGENT ALIAS</span><span className="text-xs font-display font-black text-neo-dark block uppercase truncate">{idCardNickname || (currentUser ? currentUser.name : "Anonymous Agent")}</span></div>
                          <div className="border-b-2 border-stone-100 pb-1"><span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-none mb-0.5">BOUND STATUS</span><span className="text-xs font-display font-black text-emerald-600 block uppercase">{activeVault?.myRole || "OWNER"} LEVEL</span></div>
                        </div>
                        <div className="border-b-2 border-stone-100 pb-1"><span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-none mb-0.5">AUTHORIZED VAULT INDEX</span><span className="text-[11px] font-display font-black text-indigo-700 block uppercase truncate">{activeVault?.name || "GLOBAL SYSTEM CORE VAULT"}</span></div>
                        <div className="border-b-2 border-stone-100 pb-1"><span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-none mb-0.5">SPECIALIZATION BRANCH</span><span className="text-[11px] font-sans font-black text-neo-dark block uppercase truncate">{idCardSpecialization || "Advanced System Architect"}</span></div>
                        <div className="border-b-2 border-stone-100 pb-1"><span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block leading-none mb-0.5">PERSONAL DIRECTIVE MOTTO</span><p className="text-[10px] font-sans font-bold leading-tight text-stone-500 italic">"{idCardMotto || "Data verification is the supreme virtue."}"</p></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1.5 border-t border-stone-100">
                          <div className="grid grid-cols-2 gap-4 text-[9px] font-mono font-bold text-stone-400 uppercase flex-1">
                            <div><span className="block text-[7px] text-stone-400">PASSPORT NODE INDEX</span><span className="text-neo-dark tracking-tighter">NODE-VT-{activeVault ? activeVault.id.slice(0, 8).toUpperCase() : "SECURE"}</span></div>
                            <div><span className="block text-[7px] text-stone-400">SECTOR CALENDER MATRIX</span><span className="text-neo-dark">02.06.2026</span></div>
                          </div>
                          <div className="border-4 border-dashed border-rose-500/85 rounded-xs py-1 px-2.5 text-rose-500/85 text-[10px] font-display font-black tracking-widest uppercase select-none pointer-events-none shadow-[1.5px_1.5px_0px_rgba(239,68,68,0.2)] shrink-0">APPROVED SECTOR</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3.5 border-t-2 border-dashed border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[10px]">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-neo-dark stroke-[2]" />
                        <div className="text-left leading-none"><span className="text-[7.5px] font-mono font-bold text-stone-400 block uppercase">SECURE ENCRYPTION SEQUENCE</span><span className="font-mono text-[9px] text-neo-dark whitespace-nowrap">SHA-256V://COGNIT_SEC_VERIFY</span></div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-6 w-32 bg-stone-50 border border-stone-300 rounded-sm opacity-85" style={{ background: "repeating-linear-gradient(90deg,transparent,transparent 2px,#000 2px,#000 5px,transparent 5px,transparent 6px,#000 6px,#000 7px,transparent 7px,transparent 9px,#000 9px,#000 12px)" }} />
                        <span className="text-[7px] font-mono font-bold text-stone-400 tracking-wider mt-0.5">AUTH-VT-{activeVault ? activeVault.id.toUpperCase().slice(0, 12) : "SECURE"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-md flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={onNavigateToPassport}
                    className="w-full py-3.5 px-6 bg-neo-yellow hover:bg-yellow-400 text-neo-dark border-4 border-neo-dark font-display font-black text-xs uppercase tracking-widest rounded shadow-[4px_4px_0px_#000] cursor-pointer hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-neo-dark stroke-[2.5]" />
                    <span>Configure Cryptographic Alias</span>
                  </button>
                  <p className="text-[10px] text-stone-400 font-mono text-center">Opens the immersive fullscreen compiler workspace to customize your Neobrutalist custom avatar and passport specs.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN (OWNER ONLY) ── */}
          {activeSettingsSubTab === "admin" && activeVault.myRole === "OWNER" && (
            <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-4 text-left">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark border-b-2 border-stone-200 pb-2 flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-rose-500" />
                Admin Vault Configuration
              </h3>

              <form onSubmit={handleUpdateVaultSettings} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Vault Nomenclature (Name)</label>
                  <input type="text" required value={editVaultName} onChange={(e) => setEditVaultName(e.target.value)} className="w-full text-xs font-sans font-black p-2 border-2 border-neo-dark bg-stone-50 rounded focus:outline-none focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Ledger Abstract (Description)</label>
                  <textarea value={editVaultDesc} onChange={(e) => setEditVaultDesc(e.target.value)} className="w-full text-xs font-mono p-2 border-2 border-neo-dark bg-stone-50 rounded focus:outline-none focus:bg-white h-24 resize-none leading-relaxed" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold font-mono text-stone-600 uppercase mb-1">Vessel Privacy Access</label>
                  <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                    <button type="button" onClick={() => setEditVaultPrivacy("PRIVATE")} className={`py-1.5 px-3 border border-neo-dark font-display font-bold text-[10px] rounded-xs cursor-pointer transition-all ${editVaultPrivacy === "PRIVATE" ? "bg-neo-yellow text-neo-dark font-black shadow-[1px_1.5px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"}`}>Private Bounds</button>
                    <button type="button" onClick={() => setEditVaultPrivacy("PUBLIC")} className={`py-1.5 px-3 border border-neo-dark font-display font-bold text-[10px] rounded-xs cursor-pointer transition-all ${editVaultPrivacy === "PUBLIC" ? "bg-neo-yellow text-neo-dark font-black shadow-[1px_1.5px_0px_#0A0A0A]" : "bg-stone-50 hover:bg-stone-100"}`}>Public Clearance</button>
                  </div>
                </div>
                <button type="submit" disabled={updatingVaultSettings} className="w-full py-2.5 bg-teal-400 hover:bg-teal-500 border-2 border-neo-dark text-neo-dark font-display font-black text-xs uppercase tracking-wider rounded shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  {updatingVaultSettings ? "Processing..." : "Commit Administrative Upgrades"}
                </button>
              </form>

              {/* Dismantle */}
              <div className="pt-4 border-t-2 border-dashed border-stone-200 mt-2">
                <h4 className="text-[10px] uppercase font-black text-rose-800 font-mono mb-1">Dismantle Node Bounds</h4>
                <p className="text-[10px] text-stone-400 font-sans mb-3 font-medium">Permanently wipe this vault's archives, annotations reference library, and chat records from the nodes index.</p>
                {!confirmDeleteVault ? (
                  <button type="button" onClick={() => setConfirmDeleteVault(true)} className="w-full py-2 bg-stone-100 hover:bg-rose-100 text-rose-700 border-2 border-rose-400 font-mono font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer text-center">
                    Dismantle Vault Ledger Node
                  </button>
                ) : (
                  <div className="p-3 bg-stone-50 border-2 border-rose-500 rounded space-y-2.5">
                    <p className="text-[10px] text-stone-800 font-bold leading-relaxed font-mono text-center uppercase">🚨 CONFIRM COMPLETE DISMANTLING? THIS CANNOT BE REVERTED.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleDeleteVault} className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white border-2 border-neo-dark text-[10px] font-mono font-black uppercase rounded shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 cursor-pointer">Yes, Melt Node</button>
                      <button type="button" onClick={() => setConfirmDeleteVault(false)} className="flex-1 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border-2 border-neo-dark text-[10px] font-mono font-bold uppercase rounded shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 cursor-pointer">Abandon</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
