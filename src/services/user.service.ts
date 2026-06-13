/**
 * User service — wraps /user endpoints.
 */

import httpClient, { get, put } from "@/lib/http-client";
import type { AlertPreferences, User } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string | null;
  motto?: string;
}

export interface UpdateAlertPreferencesPayload {
  chatMentions?: boolean;
  securityAlerts?: boolean;
  systemUpdates?: boolean;
}

export interface UserSearchResult {
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  }>;
}

// ── Service ───────────────────────────────────────────────────────────────────

const userService = {
  /** Fetch the currently authenticated user's profile. */
  getMe() {
    return get<User>("/user/me");
  },

  /** Update the current user's profile (name, avatar, motto, etc.). */
  updateMe(payload: UpdateProfilePayload) {
    return put<User>("/user/me", payload);
  },

  /** Upload a profile avatar image (stored on Cloudinary). */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await httpClient.put<{ success: boolean; message: string; data: User }>(
      "/user/me/avatar",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  /**
   * Search for users by name or email (paginated).
   * @param query  - search term
   * @param page   - 0-based page index
   * @param limit  - results per page
   */
  searchUsers(query: string, page = 1, limit = 20) {
    return get<UserSearchResult>(
      `/user/all?q=${encodeURIComponent(query)}&page=${Math.max(1, page)}&limit=${limit}`,
    );
  },

  /** Upgrade the current user's subscription plan. */
  upgradePlan(plan: "FREE" | "PRO") {
    return put<User>("/user/upgrade", { plan });
  },

  /** Update the current user's alert/email notification toggles. */
  updateAlertPreferences(payload: UpdateAlertPreferencesPayload) {
    return put<AlertPreferences>("/user/me/alerts", payload);
  },
} as const;

export default userService;
