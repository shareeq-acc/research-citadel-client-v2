"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { User, Vault, Source, Annotation, AuditLog } from "@/types";
import { authService, userService, vaultService, sourceService } from "@/services";
import type { AuditLogsQuery } from "@/services/vault.service";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generates 84 heatmap cells (12 weeks × 7 days) from audit log timestamps.
 * Day 0 = today, working backwards.
 */
function buildHeatmap(
  logs: AuditLog[],
): Array<{ date: string; count: number }> {
  const CELLS = 84;
  const countByDate = new Map<string, number>();
  for (const log of logs) {
    const d = new Date(log.createdAt);
    const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  }

  const cells: Array<{ date: string; count: number }> = [];
  const today = new Date();
  for (let i = CELLS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: countByDate.get(key) ?? 0 });
  }
  return cells;
}

// ── Context interface ──────────────────────────────────────────────────────────

interface AppContextValue {
  // Auth
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  checkingAuth: boolean;
  handleLogout: () => Promise<void>;

  // Vaults
  vaults: Vault[];
  setVaults: React.Dispatch<React.SetStateAction<Vault[]>>;
  activeVault: Vault | null;
  setActiveVault: (v: Vault | null) => void;
  loadVaultList: (idToActivate?: string) => Promise<void>;
  loadVaultDetail: (id: string) => Promise<void>;

  // Sources
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  activeSource: Source | null;
  setActiveSource: (s: Source | null) => void;

  // Annotations
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  activeAnnotation: Annotation | null;
  setActiveAnnotation: (a: Annotation | null) => void;

  // Audit
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  auditLogsData: { total: number; graph: Array<{ date: string; count: number }> } | null;
  auditPage: number;
  setAuditPage: (p: number) => void;
  auditTypeFilter: string;
  setAuditTypeFilter: (v: string) => void;
  auditStartDate: string;
  setAuditStartDate: (v: string) => void;
  auditEndDate: string;
  setAuditEndDate: (v: string) => void;
  loadAuditLogs: (
    vid: string,
    pageOverride?: number,
    typeOverride?: string,
    startOverride?: string,
    endOverride?: string,
  ) => Promise<void>;

  // Vault search / filter
  vaultSearchQuery: string;
  setVaultSearchQuery: (v: string) => void;
  mutedVaults: Record<string, boolean>;
  handleMuteVaultToggle: (vaultId: string) => void;

  // Profile avatar
  computedProfileAvatar: string;
  profileAvatarType: "vector" | "presets" | "upload";
  setProfileAvatarType: (t: "vector" | "presets" | "upload") => void;
  profilePresetAvatar: string;
  setProfilePresetAvatar: (v: string) => void;
  profileUploadedAvatar: string;
  setProfileUploadedAvatar: (v: string) => void;
  profileAvatarGender: "femme" | "masc";
  setProfileAvatarGender: (v: "femme" | "masc") => void;
  profileAvatarHair: string;
  setProfileAvatarHair: (v: string) => void;
  profileAvatarBg: string;
  setProfileAvatarBg: (v: string) => void;
  profileAvatarSkin: string;
  setProfileAvatarSkin: (v: string) => void;
  profileAvatarColor: string;
  setProfileAvatarColor: (v: string) => void;
  profileAvatarEye: "sunglasses" | "glasses" | "cute" | "focus";
  setProfileAvatarEye: (
    v: "sunglasses" | "glasses" | "cute" | "focus",
  ) => void;
}

// ── Context creation ───────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Auth state ─────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ── Domain state ───────────────────────────────────────────────────────────
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [activeVault, setActiveVault] = useState<Vault | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  // ── Audit state ────────────────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsData, setAuditLogsData] = useState<{
    total: number;
    graph: Array<{ date: string; count: number }>;
  } | null>(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditTypeFilter, setAuditTypeFilter] = useState("ALL");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  // ── UI state ───────────────────────────────────────────────────────────────
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");
  const [mutedVaults, setMutedVaults] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("mutedVaults");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ── Avatar state ───────────────────────────────────────────────────────────
  const [profileAvatarType, setProfileAvatarType] = useState<"vector" | "presets" | "upload">("presets");
  const [profileAvatarGender, setProfileAvatarGender] = useState<"femme" | "masc">("femme");
  const [profileAvatarHair, setProfileAvatarHair] = useState("long-bob");
  const [profileAvatarBg, setProfileAvatarBg] = useState("#38BDF8");
  const [profileAvatarSkin, setProfileAvatarSkin] = useState("#FFF4F2");
  const [profileAvatarColor, setProfileAvatarColor] = useState("#FACC15");
  const [profileAvatarEye, setProfileAvatarEye] = useState<
    "sunglasses" | "glasses" | "cute" | "focus"
  >("sunglasses");
  const [profilePresetAvatar, setProfilePresetAvatar] = useState("");
  const [profileUploadedAvatar, setProfileUploadedAvatar] = useState("");

  const computedProfileAvatar = useMemo(() => {
    if (profileAvatarType === "presets") {
      return (
        profilePresetAvatar ||
        "https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj"
      );
    }
    if (profileAvatarType === "upload") {
      return profileUploadedAvatar || "";
    }
    const specs = {
      gender: profileAvatarGender,
      bg: profileAvatarBg,
      skinColor: profileAvatarSkin,
      hairColor: profileAvatarColor,
      hair: profileAvatarHair,
      eye: profileAvatarEye,
      accessory: "none",
    };
    return "custom-avatar::" + JSON.stringify(specs);
  }, [
    profileAvatarType,
    profilePresetAvatar,
    profileUploadedAvatar,
    profileAvatarGender,
    profileAvatarBg,
    profileAvatarSkin,
    profileAvatarColor,
    profileAvatarHair,
    profileAvatarEye,
  ]);

  // Sync avatar from user profile when user logs in
  useEffect(() => {
    if (!currentUser) return;
    const avatarStr = currentUser.avatar;
    if (avatarStr?.startsWith("custom-avatar::")) {
      setProfileAvatarType("vector");
      try {
        const parsed = JSON.parse(avatarStr.slice("custom-avatar::".length));
        setProfileAvatarGender(parsed.gender ?? "femme");
        setProfileAvatarBg(parsed.bg ?? "#38BDF8");
        setProfileAvatarEye(parsed.eye ?? "sunglasses");
        setProfileAvatarHair(parsed.hair ?? "long-bob");
        setProfileAvatarColor(parsed.hairColor ?? "#FACC15");
        setProfileAvatarSkin(parsed.skinColor ?? "#FFF4F2");
      } catch {
        /* ignore malformed avatar string */
      }
    } else if (avatarStr?.startsWith("data:image")) {
      setProfileAvatarType("upload");
      setProfileUploadedAvatar(avatarStr);
    } else if (avatarStr) {
      setProfileAvatarType("presets");
      setProfilePresetAvatar(avatarStr);
    } else {
      setProfileAvatarType("presets");
      setProfilePresetAvatar(
        "https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj",
      );
    }
  }, [currentUser?.id]);

  // ── Session rehydration ────────────────────────────────────────────────────

  useEffect(() => {
    async function rehydrateUser() {
      try {
        const res = await userService.getMe();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          loadVaultList();
        }
      } catch {
        // Not authenticated — silently ignore
      } finally {
        setCheckingAuth(false);
      }
    }
    rehydrateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server errors — always clear client state
    } finally {
      localStorage.removeItem("cid_uid_storage");
      setCurrentUser(null);
      setVaults([]);
      setActiveVault(null);
      setActiveSource(null);
      setSources([]);
      setAnnotations([]);
    }
  };

  // ── Vault actions ──────────────────────────────────────────────────────────

  const loadAuditLogs = async (
    vid: string,
    pageOverride?: number,
    typeOverride?: string,
    startOverride?: string,
    endOverride?: string,
  ) => {
    try {
      const category = typeOverride ?? auditTypeFilter;
      const startDate = startOverride ?? auditStartDate;
      const endDate   = endOverride   ?? auditEndDate;

      const query: AuditLogsQuery = {
        limit:  20,
        offset: (pageOverride ?? auditPage) * 20,
        // The dropdown values are category labels (VAULT, SOURCE, etc.)
        // Pass as `category`; server expands them to matching actions.
        // "ALL" means no filter.
        category: category !== "ALL" ? category : undefined,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      };

      const res = await vaultService.getAuditLogs(vid, query);
      if (res.success) {
        const logs = (res.data as unknown as AuditLog[]) ?? [];
        setAuditLogs(logs);
        setAuditLogsData({ total: logs.length, graph: buildHeatmap(logs) });
      }
    } catch (err) {
      console.error("[AppContext] loadAuditLogs failed", err);
    }
  };

  const loadVaultList = async (idToActivate?: string) => {
    try {
      const res = await vaultService.listVaults();
      if (!res.success) return;

      setVaults(res.data);

      const targetId =
        idToActivate ?? activeVault?.id ?? res.data[0]?.id;

      if (targetId) {
        const found = res.data.find((v: Vault) => v.id === targetId);
        if (found) {
          setActiveVault(found);
          const srcRes = await sourceService.listSources(targetId);
          if (srcRes.success) setSources(srcRes.data.sources);
          loadAuditLogs(targetId);
        }
      }
    } catch (err) {
      console.error("[AppContext] loadVaultList failed", err);
    }
  };

  const loadVaultDetail = async (id: string) => {
    try {
      const [vaultRes, srcRes] = await Promise.all([
        vaultService.getVault(id),
        sourceService.listSources(id),
      ]);

      if (vaultRes.success) setActiveVault(vaultRes.data);
      setSources([]);
      if (srcRes.success) setSources(srcRes.data.sources);

      loadAuditLogs(id);
    } catch (err) {
      console.error("[AppContext] loadVaultDetail failed", err);
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const handleMuteVaultToggle = (vaultId: string) => {
    setMutedVaults((prev) => {
      const updated = { ...prev, [vaultId]: !prev[vaultId] };
      try {
        localStorage.setItem("mutedVaults", JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  // ── Context value ──────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        checkingAuth,
        handleLogout,

        vaults,
        setVaults,
        activeVault,
        setActiveVault,
        loadVaultList,
        loadVaultDetail,

        sources,
        setSources,
        activeSource,
        setActiveSource,

        annotations,
        setAnnotations,
        activeAnnotation,
        setActiveAnnotation,

        auditLogs,
        setAuditLogs,
        auditLogsData,
        auditPage,
        setAuditPage,
        auditTypeFilter,
        setAuditTypeFilter,
        auditStartDate,
        setAuditStartDate,
        auditEndDate,
        setAuditEndDate,
        loadAuditLogs,

        vaultSearchQuery,
        setVaultSearchQuery,
        mutedVaults,
        handleMuteVaultToggle,

        computedProfileAvatar,
        profileAvatarType,
        setProfileAvatarType,
        profilePresetAvatar,
        setProfilePresetAvatar,
        profileUploadedAvatar,
        setProfileUploadedAvatar,
        profileAvatarGender,
        setProfileAvatarGender,
        profileAvatarHair,
        setProfileAvatarHair,
        profileAvatarBg,
        setProfileAvatarBg,
        profileAvatarSkin,
        setProfileAvatarSkin,
        profileAvatarColor,
        setProfileAvatarColor,
        profileAvatarEye,
        setProfileAvatarEye,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
