"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { chatService, userService } from "@/services";
import type { ChatMessage, ChatMember } from "@/services/chat.service";
import { Source, User as AppUser } from "@/types";
import {
  Send, Terminal, HelpCircle, Reply, CheckCheck, Users, Bot,
  X, Crown, Settings, Search, Radio, Trash2, UserPlus,
  Loader2, AlertCircle, CheckCircle2, Clock, ShieldCheck, BookOpen,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────

const WS_URL  = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8000";
const WS_NS   = "/collaboration";
const TYPING_DEBOUNCE_MS = 2500;

// ── Types ──────────────────────────────────────────────────────────────────────

interface TypingUser { userId: string; userName: string }

interface Props {
  vaultId: string;
  currentUser: AppUser;
  vaultOwnerId: string;
  vaultMembers: any[];   // from parent (vault detail members)
  sources: Source[];
}

// ── TerminalContent — renders bot output with proper light-on-dark styling ──────

function TerminalContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Header line: **TEXT**
        const headerMatch = line.match(/^\*\*(.+)\*\*$/);
        if (headerMatch) {
          return (
            <div key={i} className="flex items-center gap-2 mb-2 pb-1.5 border-b border-stone-700">
              <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300 font-black text-[12px] uppercase tracking-wider">
                {headerMatch[1]}
              </span>
            </div>
          );
        }

        // Numbered source line: N. **Title** | `TYPE` | [INDEXED] / [PENDING]
        const sourceMatch = line.match(/^(\d+)\.\s\*\*(.+)\*\*\s\|\s`([^`]+)`\s\|\s(\[.+\])$/);
        if (sourceMatch) {
          const [, num, title, type, status] = sourceMatch;
          const isIndexed = status === "[INDEXED]";
          return (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-stone-800">
              <span className="text-stone-500 font-mono text-[10px] w-4 shrink-0">{num}.</span>
              <BookOpen className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="text-stone-100 font-medium flex-1 truncate text-[11px]">{title}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-stone-700 text-stone-300 rounded">{type}</span>
              {isIndexed
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              }
            </div>
          );
        }

        // Member line: - **Name** [OWNER] / [YOU]
        const memberMatch = line.match(/^-\s\*\*(.+?)\*\*(.*)$/);
        if (memberMatch) {
          const [, name, tag] = memberMatch;
          const isOwnerTag = tag.includes("[OWNER]");
          const isYouTag   = tag.includes("[YOU]");
          return (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-stone-800">
              <Users className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="text-stone-100 font-medium text-[11px] flex-1">{name}</span>
              {isOwnerTag && (
                <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-600 rounded">
                  <Crown className="w-2.5 h-2.5" /> Owner
                </span>
              )}
              {isYouTag && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-700 rounded">
                  You
                </span>
              )}
            </div>
          );
        }

        // Access level line: **Access Level: `ROLE`**
        const accessMatch = line.match(/^\*\*Access Level:\s`([^`]+)`\*\*$/);
        if (accessMatch) {
          const role = accessMatch[1];
          return (
            <div key={i} className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-stone-200 font-medium text-[11px]">Access Level:</span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-neo-yellow text-neo-dark rounded border border-amber-400">
                {role}
              </span>
            </div>
          );
        }

        // Inline code: `text`
        const hasInlineCode = line.includes("`");
        if (hasInlineCode) {
          const parts = line.split(/(`[^`]+`)/g);
          return (
            <p key={i} className="text-stone-300 text-[11px] leading-relaxed">
              {parts.map((part, pi) =>
                part.startsWith("`") && part.endsWith("`")
                  ? <code key={pi} className="px-1.5 py-0.5 bg-stone-700 text-amber-300 rounded text-[10px] font-mono mx-0.5">{part.slice(1, -1)}</code>
                  : part.replace(/\*\*/g, "")
              )}
            </p>
          );
        }

        // Default: plain text (strip any remaining ** markers)
        return (
          <p key={i} className="text-stone-300 text-[11px] leading-relaxed">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export const ColloquiumChatTab: React.FC<Props> = ({
  vaultId, currentUser, vaultOwnerId, vaultMembers, sources,
}) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [chatMembers, setChatMembers] = useState<ChatMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [inputText,   setInputText]   = useState("");
  const [replyTo,     setReplyTo]     = useState<ChatMessage | null>(null);

  const [loadingMsgs,    setLoadingMsgs]    = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [sending,        setSending]        = useState(false);
  const [error,          setError]          = useState("");

  const [showManage,     setShowManage]     = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState<any[]>([]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const socketRef        = useRef<Socket | null>(null);
  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const typingTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef      = useRef(false);
  /** IDs of messages we sent ourselves — skip them when the socket echoes back. */
  const ownMessageIds    = useRef<Set<string>>(new Set());
  const isOwner = currentUser.id === vaultOwnerId;

  // ── Socket.IO setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(`${WS_URL}${WS_NS}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinVault", { vaultId });
    });

    // New message arrives — skip if we sent it (we already have it from the REST response)
    socket.on("chat:message", (msg: ChatMessage) => {
      if (ownMessageIds.current.has(msg.id)) {
        ownMessageIds.current.delete(msg.id); // clean up
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Message deleted
    socket.on("chat:message_deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, content: "[Message deleted]" } : m)
      );
    });

    // Typing indicator
    socket.on("chat:typing", ({ userId, userName, isTyping }: { userId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) =>
        isTyping
          ? prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, userName }]
          : prev.filter((u) => u.userId !== userId)
      );
    });

    // Chat membership changes
    socket.on("chat:member_added",   () => fetchChatMembers());
    socket.on("chat:member_removed", () => fetchChatMembers());

    return () => {
      socket.emit("leaveVault", { vaultId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultId]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ── Initial data fetch ────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getMessages(vaultId, { limit: 50 });
      if (res.success) setMessages(res.data);
    } catch { /* ignore */ } finally {
      setLoadingMsgs(false);
    }
  }, [vaultId]);

  const fetchChatMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await chatService.getChatMembers(vaultId);
      if (res.success) setChatMembers(res.data);
    } catch { /* ignore */ } finally {
      setLoadingMembers(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchMessages();
    fetchChatMembers();
  }, [fetchMessages, fetchChatMembers]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const emitTyping = (isTyping: boolean) => {
    socketRef.current?.emit("chat:typing", { vaultId, isTyping });
    isTypingRef.current = isTyping;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!isTypingRef.current) emitTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), TYPING_DEBOUNCE_MS);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    // ── Intercept terminal directives ────────────────────────────────────
    if (text.startsWith("/")) {
      setInputText("");
      if (typingTimer.current) clearTimeout(typingTimer.current);
      emitTyping(false);
      const response = executeCommand(text);
      if (response !== null) {
        // Inject a local bot-style message — never sent to the server
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          vaultId,
          senderId: "system",
          content: response,
          replyToId: null,
          replyToText: null,
          replyToUser: null,
          readBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sender: {
            id: "system",
            name: "System",
            email: "",
            avatar: null,
          },
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      return;
    }

    setSending(true);
    setError("");
    if (typingTimer.current) clearTimeout(typingTimer.current);
    emitTyping(false);

    const pendingReplyTo = replyTo;
    setInputText("");
    setReplyTo(null);

    try {
      const res = await chatService.sendMessage(vaultId, {
        content: text,
        replyToId: pendingReplyTo?.id,
      });
      if (res.success) {
        // Register the real id so the socket echo is ignored by other clients
        ownMessageIds.current.add(res.data.id);
        // Add confirmed message directly — no optimistic placeholder needed
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      } else {
        setError(res.message || "Failed to send message.");
        // Restore input so user can retry
        setInputText(text);
        setReplyTo(pendingReplyTo);
      }
    } catch (err: any) {
      setError(err?.message || "Network error.");
      setInputText(text);
      setReplyTo(pendingReplyTo);
    } finally {
      setSending(false);
    }
  };

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await chatService.deleteMessage(vaultId, msgId);
    } catch { /* socket event handles UI update */ }
  };

  // ── Manage members ────────────────────────────────────────────────────────
  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    try {
      const res = await userService.searchUsers(q, 1, 20);
      if (res.success) {
        const memberIds = new Set(chatMembers.map((m) => m.user.id));
        setSearchResults((res.data.users ?? []).filter((u: any) => !memberIds.has(u.id)));
      }
    } catch { /* ignore */ }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await chatService.addChatMember(vaultId, userId);
      setSearchQuery(""); setSearchResults([]);
    } catch (err: any) {
      setError(err?.message || "Failed to add member.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this researcher from the chat?")) return;
    try {
      await chatService.removeChatMember(vaultId, userId);
    } catch (err: any) {
      setError(err?.message || "Failed to remove member.");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const applyCommand = (cmd: string) => {
    setShowHelp(false);
    setInputText(cmd);
    // Execute immediately
    const response = executeCommand(cmd);
    if (response !== null) {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        vaultId,
        senderId: "system",
        content: response,
        replyToId: null,
        replyToText: null,
        replyToUser: null,
        readBy: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: { id: "system", name: "System", email: "", avatar: null },
      };
      setMessages((prev) => [...prev, botMsg]);
    }
    setInputText("");
  };
  const isMine = (msg: ChatMessage) => msg.senderId === currentUser.id;

  // ── Terminal directive handler ────────────────────────────────────────────
  const executeCommand = (cmd: string): string | null => {
    const normalized = cmd.trim().toLowerCase();

    if (normalized === "/help") {
      return [
        "**COLLOQUIUM DIRECTIVES**",
        "",
        "`/help` — Show this help panel",
        "`/sources` — List all sources indexed in this vault",
        "`/members` — List active chat members",
        "`/admin` — Display your access level in this channel",
        "`/clear` — Clear all messages from your view (local only)",
      ].join("\n");
    }

    if (normalized === "/sources") {
      if (sources.length === 0) return "**No sources found** in this vault. Add sources from the Sources tab.";
      const lines = sources.map((s, i) => {
        const status = s.chunksProcessed ? "[INDEXED]" : "[PENDING]";
        return `${i + 1}. **${s.title}** | \`${s.sourceType}\` | ${status}`;
      });
      return `**Sources in this vault (${sources.length})**\n\n${lines.join("\n")}`;
    }

    if (normalized === "/members") {
      if (chatMembers.length === 0) return "**No chat members** found. The owner is always present.";
      const lines = chatMembers.map((m) => {
        const tag = m.user.id === vaultOwnerId ? " [OWNER]" : m.user.id === currentUser.id ? " [YOU]" : "";
        return `- **${m.user.name}**${tag}`;
      });
      return `**Chat Members (${chatMembers.length})**\n\n${lines.join("\n")}`;
    }

    if (normalized === "/admin") {
      const role = isOwner ? "OWNER" : "MEMBER";
      const perms = isOwner
        ? "Full administrative access — manage members, delete any message, configure the channel."
        : "Standard member access — send messages, reply, and view the channel.";
      return `**Access Level: \`${role}\`**\n\n${perms}`;
    }

    if (normalized === "/clear") {
      setMessages([]);
      return null;
    }

    return `**Unknown directive:** \`${cmd}\`\n\nType \`/help\` to see available commands.`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-stone-50 rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_#000] flex flex-col h-[650px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b-4 border-neo-dark pb-3 bg-white px-3 py-2 -mx-4 -mt-4 rounded-t-xs gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2 bg-neo-yellow border-2 border-neo-dark rounded text-[10px] font-black font-mono select-none hidden sm:block">
            LIVE COMM
          </div>
          <Radio className="w-4 h-4 text-neo-dark sm:hidden animate-pulse" />
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-wide text-neo-dark leading-none">Chat</h3>
            <p className="text-[9px] text-stone-500 font-mono mt-1 flex items-center gap-1">
              <Crown className="w-3 h-3 text-neo-orange" />
              {chatMembers.length} member{chatMembers.length !== 1 ? "s" : ""} · {messages.length} messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => { setShowManage((v) => !v); setShowHelp(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 border-2 border-neo-dark text-neo-dark font-display font-black text-[10px] uppercase rounded-sm shadow-[1.5px_1.5px_0px_#000] hover:bg-amber-200 cursor-pointer transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Members
            </button>
          )}
          <button
            onClick={() => { setShowHelp((v) => !v); setShowManage(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-200 border-2 border-neo-dark text-neo-dark font-display font-black text-[10px] uppercase rounded-sm shadow-[1px_1px_0px_#000] hover:bg-sky-300 cursor-pointer transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directives</span>
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border-b-2 border-rose-400 text-rose-700 text-xs font-mono font-bold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button className="ml-auto" onClick={() => setError("")}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-0 pt-3">
        <div className="flex-1 flex flex-col bg-white border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] p-3 min-h-0">

          {/* ── Manage members overlay ── */}
          {showManage && (
            <div className="p-4 mb-3 bg-stone-50 border-2 border-neo-dark rounded-sm space-y-4 shadow-[2px_2px_0px_#000] relative max-h-96 overflow-y-auto">
              <button onClick={() => setShowManage(false)} className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-stone-200 cursor-pointer">
                <X className="w-4 h-4 text-stone-500" />
              </button>

              <div className="border-b-2 border-neo-dark pb-2">
                <h4 className="font-display font-black text-xs uppercase flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-emerald-600" /> Member Configuration
                </h4>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  Only vault members can be added. Owner is always present.
                </p>
              </div>

              {/* Add member search */}
              <div className="bg-white p-3 border-2 border-neo-dark rounded-xs space-y-2">
                <h5 className="font-bold text-[9px] font-mono text-stone-500 uppercase">➕ Add Member to Chat</h5>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-stone-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search vault members…"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full text-xs p-1.5 pl-8 border-2 border-neo-dark rounded focus:outline-none font-mono"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border-2 border-neo-dark rounded bg-stone-50 divide-y-2 divide-neo-dark max-h-32 overflow-y-auto">
                    {searchResults.map((u: any) => (
                      <div key={u.id} className="p-2 flex justify-between items-center bg-white hover:bg-amber-50">
                        <div className="font-mono text-[10px]">
                          <span className="font-black text-neo-dark block">{u.name}</span>
                          <span className="text-[9px] text-stone-400 break-all">{u.email}</span>
                        </div>
                        <button
                          onClick={() => handleAddMember(u.id)}
                          className="bg-neo-yellow border-2 border-neo-dark px-2 py-1 rounded-sm text-[9px] shadow-[1px_1px_0px_#000] font-bold font-mono cursor-pointer hover:bg-yellow-300"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current chat members */}
              <div className="space-y-2">
                <h5 className="font-bold text-[9px] font-mono text-stone-500 uppercase flex items-center gap-1">
                  <Users className="w-3 h-3" /> Chat Members ({chatMembers.length})
                  {loadingMembers && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </h5>
                <div className="bg-white border-2 border-neo-dark rounded divide-y divide-stone-100 max-h-52 overflow-y-auto">
                  {chatMembers.map((m) => {
                    const isSelf  = m.user.id === currentUser.id;
                    const isVaultOwner = m.user.id === vaultOwnerId;
                    return (
                      <div key={m.id} className="p-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={m.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(m.user.name)}`}
                            alt={m.user.name}
                            className="w-7 h-7 rounded-full border border-neo-dark bg-stone-50 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-neo-dark block truncate">{m.user.name}</span>
                            <span className="text-[9px] text-stone-400 font-mono">{isVaultOwner ? "Owner" : isSelf ? "You" : "Member"}</span>
                          </div>
                        </div>
                        {!isSelf && !isVaultOwner && (
                          <button
                            onClick={() => handleRemoveMember(m.user.id)}
                            className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-300 hover:border-neo-dark rounded px-2 py-0.5 text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Help overlay ── */}
          {showHelp && (
            <div className="p-3 mb-3 bg-stone-900 border-2 border-neo-dark rounded-sm text-amber-400 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto shadow-[2px_2px_0px_#000] relative">
              <button onClick={() => setShowHelp(false)} className="absolute top-2.5 right-2.5 text-stone-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-extrabold text-white flex items-center gap-1 border-b border-stone-700 pb-1">
                <HelpCircle className="w-4 h-4 text-sky-400" /> COLLOQUIUM DIRECTIVES
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  ["/help",    "Show this help panel"],
                  ["/sources", "List all sources in this vault"],
                  ["/members", "List active chat members"],
                  ["/admin",   "Display your access level"],
                  ["/clear",   "Clear messages from your view (local only)"],
                ].map(([cmd, desc]) => (
                  <button key={cmd} onClick={() => applyCommand(cmd)}
                    className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer">
                    <span><code>{cmd}</code> — {desc}</span>
                    <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Run</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages feed ── */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loadingMsgs ? (
              <div className="h-full flex flex-col justify-center items-center text-stone-400 font-mono text-[10px] gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading messages…
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center p-8 text-center text-stone-400 border border-dashed border-stone-200 bg-stone-50 rounded">
                <Users className="w-8 h-8 text-stone-300 mb-2" />
                <p className="font-semibold text-stone-600 font-display text-sm">No messages yet</p>
                <p className="text-[10px] text-stone-400 max-w-xs mt-1">Start the conversation — only chat members can see this channel.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const mine = isMine(msg);
                const isBot = msg.senderId === "system";
                const canDelete = (mine || isOwner) && !isBot;
                const readers = msg.readBy.filter((id) => id !== msg.senderId);

                // ── Bot / system message ──────────────────────────────────
                if (isBot) {
                  return (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="w-7 h-7 bg-stone-800 border-2 border-neo-dark rounded-sm flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-stone-400 font-mono mb-1 block">
                          System · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="bg-stone-900 border-2 border-stone-700 rounded-sm shadow-[2px_2px_0px_#000] overflow-hidden">
                          {/* Terminal title bar */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 border-b border-stone-700">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="ml-1 text-[9px] font-mono text-stone-400 uppercase tracking-widest">citadel terminal</span>
                          </div>
                          {/* Content */}
                          <div className="p-3 font-mono text-[11px] leading-relaxed space-y-1">
                            <TerminalContent content={msg.content} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 group ${mine ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <img
                      src={msg.sender.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(msg.sender.name)}`}
                      alt={msg.sender.name}
                      className="w-7 h-7 border border-neo-dark rounded-full object-cover shrink-0 shadow-[1px_1px_0px_#000]"
                    />

                    {/* Bubble */}
                    <div className={`max-w-[75%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] text-stone-500 font-mono mb-0.5 px-1">
                        {msg.sender.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>

                      {/* Reply snippet */}
                      {msg.replyToId && (
                        <div className="px-2 py-1 mb-1 bg-stone-100 border-l-2 border-neo-orange rounded-r text-[10px] text-stone-600 max-w-full truncate">
                          <span className="font-bold text-neo-dark block text-[9px] mb-0.5">↳ @{msg.replyToUser}</span>
                          "{msg.replyToText}"
                        </div>
                      )}

                      <div className={`p-2.5 rounded border border-neo-dark text-xs font-sans ${
                        mine
                          ? "bg-neo-yellow text-neo-dark shadow-[1.5px_1.5px_0px_#000]"
                          : "bg-stone-50 text-neo-dark shadow-[1.5px_1.5px_0px_#000]"
                      }`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Actions */}
                      <div className={`flex items-center gap-2 mt-1 px-1 text-[8px] font-mono text-stone-400 select-none opacity-0 group-hover:opacity-100 transition-opacity ${mine ? "flex-row-reverse" : ""}`}>
                        {mine && readers.length > 0 && (
                          <span className="flex items-center gap-0.5 text-stone-400">
                            <CheckCheck className="w-3 h-3 text-sky-500" />
                            Seen by {readers.length}
                          </span>
                        )}
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="flex items-center gap-0.5 text-stone-400 hover:text-neo-orange cursor-pointer font-bold"
                        >
                          <Reply className="w-2.5 h-2.5" /> Reply
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="flex items-center gap-0.5 text-stone-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 p-2 border-2 border-neo-dark rounded-sm bg-stone-100 max-w-xs animate-pulse">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-stone-600">
                  {typingUsers.map((u) => u.userName.split(" ")[0]).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input form ── */}
          <form onSubmit={handleSend} className="mt-3 border-t-2 border-neo-dark pt-3">
            {replyTo && (
              <div className="flex items-center justify-between p-1.5 px-2 mb-2 bg-orange-50 border border-neo-dark rounded-sm text-[10px] font-mono gap-2">
                <span className="flex items-center gap-1 min-w-0 flex-1 text-neo-dark">
                  <Reply className="w-3.5 h-3.5 shrink-0" />
                  Replying to <strong className="mx-0.5">@{replyTo.sender.name}:</strong>
                  <span className="italic text-stone-600 truncate max-w-[200px]">"{replyTo.content.slice(0, 80)}"</span>
                </span>
                <button type="button" onClick={() => setReplyTo(null)} className="p-0.5 border border-neo-dark rounded hover:bg-stone-100 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={replyTo ? "Write your reply…" : "Message the channel or type / for commands…"}
                className="flex-1 px-3 py-2 text-xs border-2 border-neo-dark rounded-sm focus:outline-none bg-stone-50 font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-3 sm:px-4 py-2 bg-neo-dark text-white font-display font-extrabold text-xs uppercase rounded-sm shadow-[2px_2px_0px_#FFA500] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
