/**
 * User service — wraps /user endpoints.
 */

import { del, get, post, put } from "@/lib/http-client";
import type { User } from "@/types";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
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

  /** Update the current user's profile (name, avatar, etc.). */
  updateMe(payload: UpdateProfilePayload) {
    return put<User>("/user/me", payload);
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
    return post<User>("/user/upgrade", { plan });
  },
} as const;

export default userService;
