/**
 * Invitation service — vault member invitations.
 */
import { get, post } from "@/lib/http-client";

export interface InvitationDetails {
  id: string;
  vaultName: string;
  senderName: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedUser: { id: string; name: string; email: string };
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
}

const invitationService = {
  /** Search users by username (partial, min 2 chars). */
  searchByUsername(q: string) {
    return get<UserSearchResult[]>(`/user/search?q=${encodeURIComponent(q)}`);
  },

  /** Send a vault invitation to a user (owner only). */
  sendInvitation(vaultId: string, invitedUserId: string, role: "CONTRIBUTOR" | "VIEWER" = "CONTRIBUTOR") {
    return post<{ invitationId: string }>(`/vault/${vaultId}/invite`, { invitedUserId, role });
  },

  /** Get invitation details by token (public). */
  getByToken(token: string) {
    return get<InvitationDetails>(`/invitation/token/${encodeURIComponent(token)}`);
  },

  /** Accept or reject an invitation. */
  respond(token: string, action: "ACCEPTED" | "REJECTED") {
    return post<{ status: string }>("/invitation/respond", { token, action });
  },

  /** Get my pending invitations. */
  getMyInvitations() {
    return get<any[]>("/invitation/mine");
  },
} as const;

export default invitationService;
