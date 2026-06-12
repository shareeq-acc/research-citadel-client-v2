/**
 * Notification service — wraps /notifications endpoints.
 */
import { get, patch } from "@/lib/http-client";
import type { Notification } from "@/types";

const notificationService = {
  list(params?: { limit?: number; unreadOnly?: boolean }) {
    const search = new URLSearchParams();
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.unreadOnly) search.set("unreadOnly", "true");
    const qs = search.toString();
    return get<Notification[]>(`/notifications${qs ? `?${qs}` : ""}`);
  },

  unreadCount() {
    return get<{ count: number }>("/notifications/unread-count");
  },

  markRead(id: string) {
    return patch<Notification>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return patch<{ updated: number }>("/notifications/read-all");
  },
};

export default notificationService;
