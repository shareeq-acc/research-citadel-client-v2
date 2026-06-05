"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { 
  Send, 
  Terminal, 
  HelpCircle, 
  Reply, 
  CheckCheck, 
  Users, 
  Bot, 
  Paperclip, 
  X,
  FileText,
  BadgeAlert,
  Crown,
  Settings,
  Search,
  Radio
} from "lucide-react";
import { ChatMessage, TypingStatus, User as AppUser, Source } from "@/types";

interface ChatTabProps {
  vaultId: string;
  currentUser: AppUser;
  vaultOwnerId: string;
  vaultMembers: any[];
  sources: Source[];
}

export const ColloquiumChatTab: React.FC<ChatTabProps> = ({
  vaultId,
  currentUser,
  vaultOwnerId,
  vaultMembers,
  sources
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommandsHelp, setShowCommandsHelp] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Members Management states
  const [localMembers, setLocalMembers] = useState<any[]>(vaultMembers);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [chatSearchResults, setChatSearchResults] = useState<any[]>([]);

  // Sync internal members list when parent updates
  useEffect(() => {
    setLocalMembers(vaultMembers);
  }, [vaultMembers]);

  // References
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingStateRef = useRef(false);

  // Find vault owner name
  const ownerMember = localMembers.find(m => m.user.id === vaultOwnerId);
  const vaultOwnerName = ownerMember ? ownerMember.user.name : "Senior Researcher";

  // Check if current user is admin of this vault
  const isAdmin = currentUser.id === vaultOwnerId || localMembers.some(m => m.user.id === currentUser.id && m.role === "OWNER");

  // Fetch vault members list
  const fetchVaultMembers = async () => {
    try {
      const res = await apiFetch(`/api/vault/${vaultId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocalMembers(json.data.members || []);
        }
      }
    } catch (e) {
      console.error("Failed to load vault members in chat panel", e);
    }
  };

  // Scholar management handlers
  const handleSearchScholars = async (query: string) => {
    setMemberSearchQuery(query);
    if (query.trim().length < 2) {
      setChatSearchResults([]);
      return;
    }
    try {
      const res = await apiFetch(`/api/user/all?q=${query}`);
      const data = await res.json();
      if (data.success) {
        // Filter out those who are already members
        const currentIds = localMembers.map(m => m.user.id);
        const filtered = (data.data.users || []).filter((u: any) => !currentIds.includes(u.id));
        setChatSearchResults(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddScholar = async (targetUserId: string) => {
    try {
      const res = await apiFetch(`/api/vault/${vaultId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, role: "CONTRIBUTOR" })
      });
      const data = await res.json();
      if (data.success) {
        setMemberSearchQuery("");
        setChatSearchResults([]);
        fetchVaultMembers();
      } else {
        alert(data.message || "Failed to authorize collaborator.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveScholar = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to remove this researcher from the vault and colloquium log?")) return;
    try {
      const res = await apiFetch(`/api/vault/${vaultId}/members/${targetUserId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchVaultMembers();
      } else {
        alert(data.message || "Failed to remove scholar.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch messages and typing users
  const fetchChatState = async () => {
    try {
      const res = await apiFetch(`/api/vault/${vaultId}/chat`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMessages(json.data.messages || []);
          setTypingUsers(json.data.typingUsers || []);
        }
      }
    } catch (e) {
      console.error("Failed to fetch Colloquium chat logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for messages and typing statuses
  useEffect(() => {
    fetchChatState();
    const interval = setInterval(fetchChatState, 2000);
    return () => clearInterval(interval);
  }, [vaultId]);

  // Scroll to bottom when fresh messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Handle typing notification
  const notifyTyping = async (isTyping: boolean) => {
    try {
      await apiFetch(`/api/vault/${vaultId}/chat/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping })
      });
      isTypingStateRef.current = isTyping;
    } catch (err) {
      console.warn("Failed to dispatch typing heartbeat", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Typing activity lifecycle
    if (!isTypingStateRef.current) {
      notifyTyping(true);
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      notifyTyping(false);
    }, 3000);
  };

  // Submit new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const contentToSend = inputText;
    setInputText("");

    // Clear typing indicator and timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    await notifyTyping(false);

    try {
      const res = await apiFetch(`/api/vault/${vaultId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSend,
          replyToId: replyTo?.id || undefined
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setReplyTo(null);
          // Instantly refresh state
          fetchChatState();
        }
      }
    } catch (err) {
      console.error("Failed to send Colloquium message", err);
    } finally {
      setIsSending(false);
    }
  };

  // Click on quick command to pre-fill input
  const applyQuickCommand = (cmd: string) => {
    setInputText(cmd);
    setShowCommandsHelp(false);
  };

  return (
    <div id="colloquium-workspace" className="bg-stone-50 rounded-sm border-4 border-neo-dark p-4 shadow-[4px_4px_0px_#000] flex flex-col h-[650px]">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row border-b-4 border-neo-dark pb-3 items-start sm:items-center justify-between bg-white px-3 py-2 -mx-4 -mt-4 border-t-0 border-l-0 border-r-0 rounded-t-xs gap-3">
        <div className="flex items-center gap-2">
          {/* Desktop LIVE COMM Badge */}
          <div className="hidden sm:block p-1 px-2 bg-neo-yellow border-2 border-neo-dark rounded text-[10px] font-black font-mono select-none">
            LIVE COMM
          </div>
          {/* Mobile Live Indicator Icon */}
          <div className="block sm:hidden p-1 bg-neo-yellow border-2 border-neo-dark rounded shadow-[1px_1px_0px_#000] select-none animate-pulse flex items-center justify-center" title="Live Connection Active">
            <Radio className="w-4 h-4 text-neo-dark" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-wide text-neo-dark flex items-center gap-1.5 leading-none">
              Chat
            </h3>
            <p className="text-[9px] text-stone-500 font-mono mt-1 flex items-center gap-1">
              <Crown className="w-3 h-3 text-neo-orange" />
              Vault Assembly Admin: <span className="underline font-bold text-stone-700">{vaultOwnerName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={() => {
                setShowManageMembers(prev => !prev);
                setShowCommandsHelp(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-amber-100 border-2 border-neo-dark text-neo-dark font-display font-black text-[10px] uppercase rounded-sm shadow-[1.5px_1.5px_0px_#000] hover:bg-amber-200 transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage </span>Members
            </button>
          )}
          {/* Help / Commands Toggle */}
          <button
            onClick={() => {
              setShowCommandsHelp(prev => !prev);
              setShowManageMembers(false);
            }}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-sky-200 border-2 border-neo-dark text-neo-dark font-display font-black text-[10px] uppercase rounded-sm shadow-[1px_1px_0px_#000] hover:bg-sky-300 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal </span>Directives
          </button>
        </div>
      </div>

      {/* Main Chat Interface Grid */}
      <div className="flex-1 flex flex-col min-h-0 pt-3">
        
        {/* Messages feed viewport */}
        <div className="flex-1 flex flex-col bg-white border-2 border-neo-dark rounded shadow-[2px_2px_0px_#000] p-3 min-h-0">
          
          {/* MEMBERS MANAGEMENT OVERLAY CONSOLE */}
          {showManageMembers && (
            <div className="p-4 mb-3 bg-stone-50 border-2 border-neo-dark rounded-sm text-neo-dark font-sans text-xs space-y-4 shadow-[2px_2px_0px_#000] relative max-h-96 overflow-y-auto">
              <button 
                type="button"
                onClick={() => setShowManageMembers(false)}
                className="absolute top-2.5 right-2.5 text-stone-500 hover:text-neo-dark cursor-pointer p-1 rounded hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="border-b-2 border-neo-dark pb-2">
                <h4 className="font-display font-black text-xs uppercase text-neo-dark flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                  MEMBER CONFIGURATION
                </h4>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                  Inscribe credentials for team researchers or expunge access levels.
                </p>
              </div>

              {/* Add Member inline form */}
              <div className="bg-white p-3 border-2 border-neo-dark rounded-xs space-y-2">
                <h5 className="font-bold text-[9px] font-mono text-stone-500 uppercase flex items-center gap-1">
                  <span>➕ Authorize New Collaborator</span>
                </h5>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-stone-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search query name (e.g. Adrian)..."
                    value={memberSearchQuery}
                    onChange={(e) => handleSearchScholars(e.target.value)}
                    className="w-full text-xs p-1.5 pl-8 border-2 border-neo-dark rounded focus:outline-none font-mono"
                  />
                </div>

                {/* Search Results */}
                {chatSearchResults.length > 0 && (
                  <div className="border-2 border-neo-dark rounded bg-stone-50 divide-y-2 divide-neo-dark overflow-hidden max-h-[140px] overflow-y-auto mt-2">
                    {chatSearchResults.map((usr) => (
                      <div key={usr.id} className="p-2 flex justify-between items-center bg-white hover:bg-amber-50">
                        <div className="font-mono text-[10px]">
                          <span className="font-black text-neo-dark block">{usr.name}</span>
                          <span className="text-[9px] text-stone-400 block break-all">{usr.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddScholar(usr.id)}
                          className="bg-neo-yellow border-2 border-neo-dark px-2 py-1 rounded-sm text-[9px] shadow-[1px_1px_0px_#000] hover:bg-yellow-400 font-bold font-mono cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Personnel list with removal options */}
              <div className="space-y-2">
                <h5 className="font-bold text-[9px] font-mono text-stone-500 uppercase">Active Workspace Collaborators</h5>
                <div className="bg-white border-2 border-neo-dark rounded divide-y divide-stone-100 max-h-[220px] overflow-y-auto">
                  {localMembers.map((m: any) => {
                    const isSelf = m.user.id === currentUser.id;
                    const isOwner = m.user.id === vaultOwnerId;
                    return (
                      <div key={m.id} className="p-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={m.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${m.user.name}`}
                            alt={m.user.name}
                            className="w-7 h-7 rounded-full border border-neo-dark bg-stone-50 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-neo-dark block uppercase truncate leading-tight">{m.user.name}</span>
                            <span className="text-[9px] text-stone-400 font-mono block leading-none">{m.role}</span>
                          </div>
                        </div>

                        {!isSelf && !isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveScholar(m.user.id)}
                            className="text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-300 hover:border-neo-dark rounded px-2 py-0.5 text-[9px] font-mono font-bold transition-all whitespace-nowrap"
                          >
                            Expunge
                          </button>
                        ) : (
                          <span className="text-[9px] text-stone-400 italic font-mono shrink-0">
                            {isOwner ? "Owner" : "You"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* HELP OVERLAY CONSOLE */}
          {showCommandsHelp && (
            <div className="p-3 mb-3 bg-stone-900 border-2 border-neo-dark rounded-sm text-amber-400 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto shadow-[2px_2px_0px_#000] relative">
              <button 
                onClick={() => setShowCommandsHelp(false)}
                className="absolute top-2.5 right-2.5 text-stone-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-extrabold text-white flex items-center gap-1 border-b border-stone-700 pb-1">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                SCHOLAR COLLOQUIUM SYSTEM DIRECTIVES
              </h4>
              <p className="text-stone-300">Type or click these inside the prompt utility to coordinate existing vault indexing:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <button 
                  onClick={() => applyQuickCommand("/help")}
                  className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer"
                >
                  <span><code>/help</code> - Show commands support card</span>
                  <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Use</span>
                </button>
                <button 
                  onClick={() => applyQuickCommand("/sources")}
                  className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer"
                >
                  <span><code>/sources</code> - List citations inventory indexed in this vault</span>
                  <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Use</span>
                </button>
                <button 
                  onClick={() => applyQuickCommand("/refer s-1")}
                  className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer"
                >
                  <span><code>/refer [id]</code> - Embed high-resolution citation reference attachment link</span>
                  <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Use</span>
                </button>
                <button 
                  onClick={() => applyQuickCommand("/admin")}
                  className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer"
                >
                  <span><code>/admin</code> - Disclaim administrator credentials context</span>
                  <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Use</span>
                </button>
                <button 
                  onClick={() => applyQuickCommand("/stats")}
                  className="text-left py-1 px-1.5 bg-stone-800 hover:bg-stone-700 rounded text-[9px] flex justify-between items-center group cursor-pointer"
                >
                  <span><code>/stats</code> - Display quantitative database & member indicators</span>
                  <span className="text-stone-500 group-hover:text-amber-400 font-bold">&gt;&gt; Use</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages scroll content */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {isLoading ? (
              <div className="h-full flex flex-col justify-center items-center text-stone-400 font-mono text-[10px]">
                <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mb-2" />
                Loading colloq archives...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center p-8 text-center text-stone-400 font-sans text-xs border border-dashed border-stone-200 bg-stone-50 rounded">
                <Users className="w-8 h-8 text-stone-300 mb-2" />
                <p className="font-semibold text-stone-600 font-display">No Colloquium history recorded</p>
                <p className="text-[10px] text-stone-400 max-w-xs mt-1">
                  Start the dialogue! Only active scholars authorized in this vault can review this communications ledger.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.userId === currentUser.id;
                const isBot = msg.userId === "u-bot";
                const isSystemSimMsg = msg.id.startsWith("msg-sim");
                
                // Get read lists
                const otherReaders = msg.readBy.filter(id => id !== msg.userId);
                const readerNames = otherReaders.map(id => {
                  if (id === currentUser.id) return "You";
                  const m = localMembers.find(v => v.user.id === id);
                  return m ? m.user.name.split(" ")[0] : "Scholar";
                });

                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 group ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* User Avatar */}
                    <div className="shrink-0 relative">
                      {isBot ? (
                        <div className="w-7 h-7 bg-stone-800 text-sky-300 border border-neo-dark rounded-full flex items-center justify-center shadow-[1px_1px_0px_#000]">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      ) : msg.userAvatar ? (
                        <img 
                          src={msg.userAvatar} 
                          alt={msg.userName} 
                          className="w-7 h-7 border border-neo-dark rounded-full object-cover shadow-[1px_1px_0px_#000]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-stone-200 text-stone-700 border border-neo-dark rounded-full font-bold font-mono text-xs flex items-center justify-center shadow-[1px_1px_0px_#000]">
                          {msg.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Chat Bubble Container */}
                    <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                      
                      {/* Meta context info */}
                      <span className="text-[9px] text-stone-500 font-mono mb-0.5 select-none px-1">
                        {msg.userName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Thread Replies snippet */}
                      {msg.replyToId && (
                        <div className="px-2 py-1 mb-1 bg-stone-100 border-l-2 border-neo-orange rounded-r font-sans text-[10px] text-stone-600 max-w-full truncate shadow-xs">
                          <span className="font-bold text-neo-dark block text-[9px] leading-none mb-0.5">
                            ↳ Replying to @{msg.replyToUser || "Scholar"}
                          </span>
                          "{msg.replyToText}"
                        </div>
                      )}

                      {/* Bubble content */}
                      <div className={`p-2.5 rounded border border-neo-dark ${
                        isBot 
                          ? "bg-amber-50 text-stone-800 font-sans text-[11px] prose shadow-[1px_1px_0px_#000] leading-relaxed"
                          : isCurrentUser
                            ? "bg-neo-yellow text-neo-dark font-sans text-xs font-medium shadow-[1.5px_1.5px_0px_#000]"
                            : isSystemSimMsg
                              ? "bg-emerald-50 text-stone-800 font-sans text-xs border-emerald-500 shadow-[1.5px_1.5px_0px_#10B981]"
                              : "bg-stone-50 text-neo-dark font-sans text-xs shadow-[1.5px_1.5px_0px_#000]"
                      }`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Read Receipts & Reply Action Bar */}
                      <div className="flex items-center gap-2 mt-1 px-1 text-[8px] font-mono text-stone-400 select-none">
                        {isCurrentUser && readerNames.length > 0 && (
                          <span className="flex items-center gap-0.5 text-stone-400">
                            <CheckCheck className="w-3 h-3 text-sky-500 inline-block" /> 
                            Seen by: {readerNames.join(", ")}
                          </span>
                        )}

                        {isCurrentUser && readerNames.length === 0 && (
                          <span className="text-stone-300">Sent (Unread)</span>
                        )}

                        {!isBot && (
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="text-stone-400 hover:text-neo-orange font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                          >
                            <Reply className="w-2.5 h-2.5 inline-block" /> Reply
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })
            )}

            {/* Bouncing Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 bg-stone-100 p-2 border-2 border-neo-dark rounded-sm max-w-xs animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] font-mono text-stone-600">
                  {typingUsers.map(u => u.userName.split(" ")[0]).join(", ")} {typingUsers.length === 1 ? 'is formulating' : 'are formulating'}...
                </span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat text input and triggers form */}
          <form onSubmit={handleSendMessage} className="mt-3 border-t-2 border-neo-dark pt-3">
            {/* Thread Replies active indicator bar */}
            {replyTo && (
              <div className="flex items-center justify-between p-1.5 px-2 mb-2 bg-[#FF7F50]/15 border border-neo-dark rounded-sm text-[10px] font-mono gap-2 w-full min-w-0">
                <span className="text-neo-dark flex items-center gap-1 min-w-0 flex-1">
                  <Reply className="w-3.5 h-3.5 text-neo-dark shrink-0" />
                  <span className="shrink-0">Replying to <strong className="text-stone-800">@{replyTo.userName}</strong>:</span>
                  <span className="text-stone-600 italic truncate ml-1 flex-1 min-w-0 max-w-[120px] sm:max-w-[400px]">
                    "{replyTo.content}"
                  </span>
                </span>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)}
                  className="p-0.5 bg-white border border-neo-dark rounded hover:bg-stone-100 shrink-0"
                >
                  <X className="w-3 h-3 text-neo-dark" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={replyTo ? "Formulate a reply thread..." : "Formulate chat message or run direct command (e.g., /sources)..."}
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 text-xs border-2 border-neo-dark rounded-sm focus:outline-none focus:ring-2 focus:ring-neo-yellow bg-stone-50 font-sans"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-2.5 sm:px-4 py-2 bg-neo-dark text-white font-display font-extrabold text-xs uppercase rounded-sm shadow-[2px_2px_0px_#FFA500] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none disabled:translate-none transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dispatch</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};
