/**
 * Chat service — wraps all /vault/:vaultId/chat endpoints.
 */
import { del, get, post } from "@/lib/http-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface ChatMember {
  id: string;
  vaultId: string;
  addedBy: string;
  createdAt: string;
  user: ChatUser;
}

export interface ChatMessage {
  id: string;
  vaultId: string;
  senderId: string;
  content: string;
  replyToId: string | null;
  replyToText: string | null;
  replyToUser: string | null;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  sender: ChatUser;
}

export interface SendMessagePayload {
  content: string;
  replyToId?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

const chatService = {
  // Members
  getChatMembers(vaultId: string) {
    return get<ChatMember[]>(`/vault/${vaultId}/chat/members`);
  },
  addChatMember(vaultId: string, userId: string) {
    return post<ChatMember>(`/vault/${vaultId}/chat/members`, { userId });
  },
  removeChatMember(vaultId: string, userId: string) {
    return del<{ removed: boolean }>(`/vault/${vaultId}/chat/members/${userId}`);
  },

  // Messages
  getMessages(vaultId: string, options: { limit?: number; before?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit)  params.set("limit",  String(options.limit));
    if (options.before) params.set("before", options.before);
    const qs = params.toString();
    return get<ChatMessage[]>(`/vault/${vaultId}/chat/messages${qs ? `?${qs}` : ""}`);
  },
  sendMessage(vaultId: string, payload: SendMessagePayload) {
    return post<ChatMessage>(`/vault/${vaultId}/chat/messages`, payload);
  },
  deleteMessage(vaultId: string, messageId: string) {
    return del<{ deleted: boolean }>(`/vault/${vaultId}/chat/messages/${messageId}`);
  },
} as const;

export default chatService;
