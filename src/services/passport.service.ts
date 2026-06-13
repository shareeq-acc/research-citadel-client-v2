/**
 * Passport service — vault-scoped identity cards.
 */

import { get, put } from "@/lib/http-client";

export interface VaultPassport {
  id: string;
  barcode: string;
  vaultAlias: string | null;
  role: string | null;
  motto: string | null;
  displayAlias: string;
  displayMotto: string;
  agentName: string;
  memberRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  vaultId: string;
  vaultName: string;
  joinedAt: string;
  userAvatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PassportVerification extends VaultPassport {
  verified: boolean;
  verificationMessage: string;
  isActiveMember: boolean;
  vaultExists: boolean;
}

export interface UpdatePassportPayload {
  vaultAlias?: string;
  role?: string;
  motto?: string;
}

const passportService = {
  getPassport(vaultId: string) {
    return get<VaultPassport>(`/vault/${vaultId}/passport`);
  },

  updatePassport(vaultId: string, payload: UpdatePassportPayload) {
    return put<VaultPassport>(`/vault/${vaultId}/passport`, payload);
  },

  verifyByBarcode(barcode: string) {
    return get<PassportVerification>(`/passport/verify/${encodeURIComponent(barcode)}`);
  },
};

export default passportService;
