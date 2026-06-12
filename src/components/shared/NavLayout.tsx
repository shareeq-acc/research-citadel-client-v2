"use client";

import { User, Vault } from "@/types";
import { LogOut, Settings, User as UserIcon, ShieldAlert, CheckCircle, RefreshCw, Library, MessageSquare, Gauge, Bell } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { authService, userService, vaultService, chatService } from "@/services";
import { NeobrutalistAvatar } from "@/components/NeobrutalistAvatar";
import { getAiUsagePercents } from "@/lib/aiUsage";

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";
const WS_NS  = "/collaboration";

function parseCustomAvatar(avatarStr: string | null) {
  if (avatarStr && avatarStr.startsWith("custom-avatar::")) {
    try {
      return JSON.parse(avatarStr.slice("custom-avatar::".length));
    } catch (e) {
      return null;
    }
  }
  return null;
}

interface NavLayoutProps {
  user: User;
  activeVault: Vault | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onUserChange: (updatedUser: User) => void;
  onOpenVaultChat?: (vaultId: string) => void;
  children: React.ReactNode;
}

export default function NavLayout({
  user,
  activeVault,
  onNavigate,
  onLogout,
  onUserChange,
  onOpenVaultChat,
  children,
}: NavLayoutProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatDropdownOpen, setChatDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const notificationsContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (chatContainerRef.current && !chatContainerRef.current.contains(target)) {
        setChatDropdownOpen(false);
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(target)) {
        setNotificationsDropdownOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const [notifications, setNotifications] = useState([
    { id: "notif-1", title: "PDF Extraction Complete", description: "AI Grounding index generated successfully for 'Quantum Computing Foundations'.", time: "5m ago", read: false, type: "success" },
    { id: "notif-2", title: "Paragraph Synced", description: "@Dr. Aris Thorne updated Abstract section in Artificial Intelligence Foundations.", time: "42m ago", read: false, type: "sync" },
    { id: "notif-3", title: "Citadel Space Limit", description: "Your local laboratory sandbox is using 14.2 MB of 50 MB Free storage quota.", time: "2h ago", read: true, type: "info" },
    { id: "notif-4", title: "Co-Author Invitation", description: "Researcher @Lukas invited you to collaborate on 'Neural Network Robustness'.", time: "1d ago", read: true, type: "info" },
    { id: "notif-5", title: "Index Cache Refreshed", description: "Workspace semantic repository index synchronized with global scholar graph hashes.", time: "3d ago", read: true, type: "success" }
  ]);
  const [chats, setChats] = useState<any[]>([]);
  const [resending, setResending] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const { dailyPercent: dailyPct, weeklyPercent: weeklyPct } = getAiUsagePercents(user.aiUsage);

  // ── Live chat updates via Socket.IO ────────────────────────────────────────
  const socketRef    = useRef<Socket | null>(null);
  const vaultIdsRef  = useRef<string[]>([]);

  // Fetch all vault chats and compute unread counts
  const fetchChats = useCallback(async () => {
    try {
      const vaultsRes = await vaultService.listVaults();
      if (!vaultsRes.success) return;

      const vaultList = vaultsRes.data ?? [];
      vaultIdsRef.current = vaultList.map((v: any) => v.id);

      const results = await Promise.all(
        vaultList.map(async (v: any) => {
          try {
            const msgRes = await chatService.getMessages(v.id, { limit: 1 });
            const latest = msgRes.success && msgRes.data.length > 0 ? msgRes.data[msgRes.data.length - 1] : null;
            return {
              vaultId: v.id,
              vaultName: v.name,
              lastMessageText: latest?.content ?? "No messages yet.",
              lastMessageUser: latest?.sender?.name ?? null,
              lastMessageTime: latest?.createdAt ?? v.createdAt,
              unreadCount: 0, // server marks as read on fetch; badge shows live increments
            };
          } catch { return null; }
        })
      );

      setChats(results.filter(Boolean) as any[]);
    } catch { /* ignore */ }
  }, []);

  // Track per-vault unread counts driven by socket events
  const [unreadByVault, setUnreadByVault] = useState<Record<string, number>>({});
  const totalUnread = Object.values(unreadByVault).reduce((s, n) => s + n, 0);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Connect socket and join all vault rooms
  useEffect(() => {
    const socket = io(`${WS_URL}${WS_NS}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Join every vault room so we receive chat:message events
      vaultIdsRef.current.forEach((vaultId) => {
        socket.emit("joinVault", { vaultId });
      });
    });

    socket.on("chat:message", (msg: any) => {
      const vaultId = msg.vaultId;
      if (!vaultId) return;

      // Increment unread badge
      setUnreadByVault((prev) => ({ ...prev, [vaultId]: (prev[vaultId] ?? 0) + 1 }));

      // Update the last-message preview in the dropdown
      setChats((prev) =>
        prev.map((c) =>
          c.vaultId === vaultId
            ? {
                ...c,
                lastMessageText: msg.content,
                lastMessageUser: msg.sender?.name ?? null,
                lastMessageTime: msg.createdAt,
              }
            : c
        )
      );
    });

    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-join new vault rooms whenever vault list changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    vaultIdsRef.current.forEach((vaultId) => socket.emit("joinVault", { vaultId }));
  }, [chats.length]);

  const handleResendVerification = async () => {
    setResending(true);
    setBannerAlert(null);
    try {
      const res = await authService.requestEmailVerification();
      if (res.success) {
        setBannerAlert("🟢 Verification link sent. Check your inbox and click the link to verify.");
      } else {
        setBannerAlert(`⚠️ ${res.message || "Failed to resend."}`);
      }
    } catch (err: any) {
      setBannerAlert(`⚠️ ${err?.message || "Connection error resending verification."}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#0a0a0a] flex flex-col font-sans selection:bg-yellow-250">
      
      {/* VERIFICATION ALERTS BANNER */}
      {!user.isEmailVerified && (
        <div className="bg-rose-400 border-b-4 border-black p-3.5 text-black text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left select-none z-40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
            <span>
              <strong>Verification Required:</strong> Click the verification link in your email to activate collaborative editing. Unverified: <code className="bg-black text-white px-1.5 py-0.5 rounded-none text-[10px] font-mono">{user.email}</code>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {bannerAlert && (
              <span className="bg-white text-black border-2 border-black font-black font-mono px-2 py-0.5 text-[9px] shadow-[2.5px_2.5px_0px_#000]">
                {bannerAlert}
              </span>
            )}
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="bg-yellow-300 text-black hover:bg-yellow-400 border-2 border-black px-3.5 py-1.5 font-mono font-black text-[10px] uppercase shadow-[2.5px_2.5px_0px_#000] hover:shadow-[3.5px_3.5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              Resend Link
            </button>
          </div>
        </div>
      )}

      {/* Primary Toolbar Navbar Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50 px-4 md:px-8 py-3.5 shrink-0 shadow-[0_4px_0px_#000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full gap-4">
          
          {/* Branding Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => onNavigate("/dashboard")}>
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

          {/* Centered Active Vault Display */}
          <div className="flex-1 hidden md:flex justify-center items-center px-4">
            {activeVault ? (
              <div className="flex items-center gap-2 bg-[#e2fbf0] text-[#0f5132] border-2 border-black px-4 py-2 rounded-xs shadow-[2.5px_2.5px_0px_#000] max-w-xl">
                <span className="w-2 h-2 bg-[#10b981] border-2 border-black rounded-none animate-pulse shrink-0" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-black select-none truncate">
                  Vault: {activeVault.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-stone-50 text-stone-700 border-2 border-slate-350 px-4 py-2 rounded-xs select-none">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                  Workspace Root
                </span>
              </div>
            )}
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Chat Icon */}
            <div className="relative" ref={chatContainerRef}>
              <button
                onClick={() => { setChatDropdownOpen(!chatDropdownOpen); setNotificationsDropdownOpen(false); setDropdownOpen(false); }}
                className="relative flex items-center justify-center w-10 h-10 border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer text-black"
                title="Vault Chats Hub"
              >
                <MessageSquare className="w-5.5 h-5.5 text-black stroke-[3]" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#f43f5e] text-white border-2 border-black font-black font-mono text-[8.5px] w-5 h-5 rounded-none flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </button>

              {chatDropdownOpen && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-[72px] sm:top-auto sm:mt-3 sm:w-72 bg-white border-4 border-black p-2 rounded-none shadow-[6px_6px_0px_#000] space-y-1 text-xs select-none z-50">
                  <div className="p-2 border-b-2 border-black bg-stone-50 mb-1 rounded-none">
                    <div className="font-mono font-black text-xs uppercase text-black flex justify-between items-center">
                      <span>Vault Chats</span>
                      {totalUnread > 0 && (
                        <span className="bg-[#f43f5e] text-white border border-black px-1.5 py-0.5 rounded-none font-mono text-[8px] tracking-tight uppercase">
                          {totalUnread} unread
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[230px] overflow-y-auto divide-y divide-stone-200 custom-scrollbar">
                    {chats.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-stone-400 font-mono italic">No active chat groups found.</div>
                    ) : (
                      chats.map((c: any) => (
                        <div
                          key={c.vaultId}
                          onClick={() => {
                            setChatDropdownOpen(false);
                            // Clear unread badge for this vault
                            setUnreadByVault((prev) => { const n = { ...prev }; delete n[c.vaultId]; return n; });
                            if (onOpenVaultChat) onOpenVaultChat(c.vaultId);
                          }}
                          className="p-2 hover:bg-yellow-50 transition-colors cursor-pointer rounded-none text-left"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-mono font-black text-[11px] text-black line-clamp-1 leading-tight flex-1">{c.vaultName}</h4>
                            {(unreadByVault[c.vaultId] ?? 0) > 0 && (
                              <span className="shrink-0 leading-none bg-[#f43f5e] border border-black text-white font-mono font-black text-[8px] px-1 py-0.5 rounded-none">
                                {unreadByVault[c.vaultId]} NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-stone-500 mt-1 line-clamp-1">
                            {c.lastMessageUser
                              ? <><strong className="text-stone-700">@{c.lastMessageUser.split(" ")[0]}:</strong> {c.lastMessageText}</>
                              : c.lastMessageText}
                          </p>
                          <span className="text-[8px] text-stone-400 font-mono mt-0.5 block">
                            {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Icon */}
            <div className="relative" ref={notificationsContainerRef}>
              <button
                onClick={() => { setNotificationsDropdownOpen(!notificationsDropdownOpen); setChatDropdownOpen(false); setDropdownOpen(false); }}
                className="relative flex items-center justify-center w-10 h-10 border-2 border-black bg-white shadow-[2.5px_2.5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer text-black"
                title="Laboratory Notifications"
              >
                <Bell className="w-5.5 h-5.5 text-black stroke-[3]" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-300 text-black border-2 border-black font-black font-mono text-[8.5px] w-5 h-5 rounded-none flex items-center justify-center shadow-[1px_1px_0px_#000]">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-[72px] sm:top-auto sm:mt-3 sm:w-80 bg-white border-4 border-black p-2 rounded-none shadow-[6px_6px_0px_#000] space-y-1 text-xs select-none z-50">
                  <div className="p-2 border-b-2 border-black bg-stone-50 mb-1 rounded-none flex justify-between items-center">
                    <span className="font-mono font-black text-xs uppercase text-neo-dark">Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))} className="text-[9px] font-mono font-black bg-yellow-300 border border-black hover:bg-yellow-400 px-1.5 py-0.5 rounded-none cursor-pointer uppercase transition-colors">
                        Read All
                      </button>
                    )}
                  </div>
                  <div className="max-h-[230px] overflow-y-auto divide-y divide-stone-200 custom-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} onClick={() => setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif))} className={`p-2.5 transition-colors cursor-pointer rounded-none text-left flex gap-2.5 ${n.read ? "bg-white hover:bg-stone-50" : "bg-amber-50/50 hover:bg-amber-100/40"}`}>
                        <div className="mt-0.5 shrink-0">
                          {n.type === "success" ? <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-black inline-block rounded-none shrink-0" /> :
                           n.type === "sync" ? <span className="w-2.5 h-2.5 bg-[#ef4444] border-2 border-black inline-block rounded-none animate-pulse shrink-0" /> :
                           <span className="w-2.5 h-2.5 bg-amber-400 border-2 border-black inline-block rounded-none shrink-0" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className={`font-mono text-[10.5px] text-black ${!n.read ? "font-black" : "font-semibold"}`}>{n.title}</h4>
                            <span className="text-[8px] text-stone-400 font-mono shrink-0 whitespace-nowrap">{n.time}</span>
                          </div>
                          <p className="text-[10px] font-mono text-stone-600 mt-1 leading-normal">{n.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User profile dropdown */}
            <div className="relative" ref={profileContainerRef}>
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setChatDropdownOpen(false); setNotificationsDropdownOpen(false); }}
                className="flex items-center gap-2.5 cursor-pointer select-none group focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                  <span className="text-[9px] font-mono leading-none font-bold text-stone-500 uppercase tracking-wider">RESEARCHER</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-black font-mono text-black group-hover:text-amber-650 transition-colors">{user.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-black border-2 border-black rounded-none uppercase shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] tracking-wider ${user.plan === 'PRO' ? 'bg-yellow-300 text-black' : 'bg-stone-100 text-stone-800'}`}>
                      {user.plan || 'FREE'}
                    </span>
                  </div>
                </div>
                {(() => {
                  const custom = parseCustomAvatar(user.avatar);
                  if (custom) {
                    return (
                      <div className="w-10 h-10 rounded-full border-2 border-black bg-stone-100 overflow-hidden flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                        <NeobrutalistAvatar gender={custom.gender || "femme"} bg={custom.bg || "#38BDF8"} eye={custom.eye || "sunglasses"} hair={custom.hair || "long-bob"} accessory={custom.accessory || "none"} hairColor={custom.hairColor || "#FACC15"} skinColor={custom.skinColor || "#FFF4F2"} size={36} shape="circle" noBorder={true} />
                      </div>
                    );
                  }
                  if (user.avatar) {
                    return <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-black bg-stone-100 object-cover shrink-0 shadow-[2px_2px_0px_#000]" referrerPolicy="no-referrer" />;
                  }
                  return (
                    <div className="w-10 h-10 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center font-bold text-xs uppercase text-black shrink-0 shadow-[2px_2px_0px_#000]">
                      {user.name.charAt(0)}
                    </div>
                  );
                })()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border-4 border-neo-dark p-2 rounded-sm shadow-[6px_6px_0px_#0A0A0A] space-y-1 text-xs select-none">
                  <div className="p-2 border-b-2 border-neo-dark bg-stone-50 mb-1 rounded-sm">
                    <div className="font-bold text-neo-dark line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5 break-all">{user.email}</div>
                    {user.isEmailVerified ? (
                      <span className="text-[8.5px] font-mono font-black uppercase bg-emerald-100/90 text-emerald-950 border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_#000] mt-1.5 inline-flex items-center gap-1 select-none">
                        <CheckCircle className="w-3 h-3 text-emerald-800 stroke-[2.5]" />
                        Verified Profile
                      </span>
                    ) : (
                      <span className="text-[8.5px] font-mono font-black uppercase bg-rose-100/90 text-rose-950 border-2 border-neo-dark px-2 py-0.5 rounded-sm shadow-[1.5px_1.5px_0px_#000] mt-1.5 inline-flex items-center gap-1 select-none">
                        ⚠️ Unverified
                      </span>
                    )}
                  </div>

                  {/* AI POWER GRID */}
                  <div className="p-2 border-b-2 border-neo-dark bg-yellow-50/50 rounded-xs mb-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-stone-600 uppercase">
                      <span>AI Power Grid</span>
                      <span className={`px-1.5 py-0.5 text-[8.5px] font-mono font-black border shadow-[1px_1px_0px_#0A0A0A] ${user.plan === 'PRO' ? 'bg-neo-yellow text-neo-dark border-neo-dark' : 'bg-stone-100 text-stone-700 border-stone-300'}`}>
                        {user.plan || 'FREE'}
                      </span>
                    </div>
                    <div className="mt-1.5 space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[8px] font-mono leading-none">
                          <span>Daily AI Rate:</span>
                          <span className="font-bold">{dailyPct}% Used</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 border border-neo-dark rounded-full overflow-hidden mt-0.5">
                          <div className={`${dailyPct < 30 ? "bg-blue-500" : dailyPct <= 60 ? "bg-yellow-400" : dailyPct <= 85 ? "bg-purple-500" : "bg-red-500"} h-full transition-all duration-300`} style={{ width: `${dailyPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] font-mono leading-none">
                          <span>Weekly AI Rate:</span>
                          <span className="font-bold">{weeklyPct}% Used</span>
                        </div>
                        <div className="w-full bg-stone-200 h-1.5 border border-neo-dark rounded-full overflow-hidden mt-0.5">
                          <div className={`${weeklyPct < 30 ? "bg-blue-500" : weeklyPct <= 60 ? "bg-yellow-400" : weeklyPct <= 85 ? "bg-purple-500" : "bg-red-500"} h-full transition-all duration-300`} style={{ width: `${weeklyPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => { setDropdownOpen(false); onNavigate("/subscription"); }} className="w-full text-left p-2 hover:bg-yellow-50 border border-transparent hover:border-neo-dark font-display font-bold text-neo-dark rounded flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-stone-500" />
                    Usage
                  </button>
                  <button onClick={() => { setDropdownOpen(false); onNavigate("/settings"); }} className="w-full text-left p-2 hover:bg-amber-50 border border-transparent hover:border-neo-dark font-display font-bold rounded flex items-center gap-2">
                    <Settings className="w-4 h-4 text-stone-500" />
                    Settings
                  </button>
                  <button onClick={() => { setDropdownOpen(false); onLogout(); }} className="w-full text-left p-2 hover:bg-red-50 border border-transparent hover:border-neo-dark hover:text-red-600 font-display font-bold rounded flex items-center gap-2 text-stone-700">
                    <LogOut className="w-4 h-4 text-stone-500 group-hover:text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Screen Outlet */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-neo-dark bg-white p-4 text-center text-[11px] font-mono font-bold text-stone-500 select-none">
        &copy; {new Date().getFullYear()} Research Citadel Workspace Core — Dedicated Secure Sandbox Encryption Module
      </footer>
    </div>
  );
}
