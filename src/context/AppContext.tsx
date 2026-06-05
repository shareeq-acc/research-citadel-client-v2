"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { User, Vault, Source, Annotation, AuditLog } from "@/types";
import { apiFetch } from "@/lib/api";

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
  auditLogsData: any;
  auditPage: number;
  setAuditPage: (p: number) => void;
  auditTypeFilter: string;
  setAuditTypeFilter: (v: string) => void;
  auditStartDate: string;
  setAuditStartDate: (v: string) => void;
  auditEndDate: string;
  setAuditEndDate: (v: string) => void;
  loadAuditLogs: (vid: string, pageOverride?: number, typeOverride?: string, startOverride?: string, endOverride?: string) => Promise<void>;

  // Vault search/filter
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
  setProfileAvatarEye: (v: "sunglasses" | "glasses" | "cute" | "focus") => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [activeVault, setActiveVault] = useState<Vault | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsData, setAuditLogsData] = useState<any>(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditTypeFilter, setAuditTypeFilter] = useState("ALL");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  const [vaultSearchQuery, setVaultSearchQuery] = useState("");
  const [mutedVaults, setMutedVaults] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("mutedVaults");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Profile avatar states
  const [profileAvatarType, setProfileAvatarType] = useState<"vector" | "presets" | "upload">("presets");
  const [profileAvatarGender, setProfileAvatarGender] = useState<"femme" | "masc">("femme");
  const [profileAvatarHair, setProfileAvatarHair] = useState("long-bob");
  const [profileAvatarBg, setProfileAvatarBg] = useState("#38BDF8");
  const [profileAvatarSkin, setProfileAvatarSkin] = useState("#FFF4F2");
  const [profileAvatarColor, setProfileAvatarColor] = useState("#FACC15");
  const [profileAvatarEye, setProfileAvatarEye] = useState<"sunglasses" | "glasses" | "cute" | "focus">("sunglasses");
  const [profilePresetAvatar, setProfilePresetAvatar] = useState("");
  const [profileUploadedAvatar, setProfileUploadedAvatar] = useState("");

  const computedProfileAvatar = useMemo(() => {
    if (profileAvatarType === "presets") {
      return profilePresetAvatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj";
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
  }, [profileAvatarType, profilePresetAvatar, profileUploadedAvatar, profileAvatarGender, profileAvatarBg, profileAvatarSkin, profileAvatarColor, profileAvatarHair, profileAvatarEye]);

  // Sync avatar from user on login
  useEffect(() => {
    if (currentUser) {
      const avatarStr = currentUser.avatar;
      if (avatarStr && avatarStr.startsWith("custom-avatar::")) {
        setProfileAvatarType("vector");
        try {
          const parsed = JSON.parse(avatarStr.slice("custom-avatar::".length));
          setProfileAvatarGender(parsed.gender || "femme");
          setProfileAvatarBg(parsed.bg || "#38BDF8");
          setProfileAvatarEye(parsed.eye || "sunglasses");
          setProfileAvatarHair(parsed.hair || "long-bob");
          setProfileAvatarColor(parsed.hairColor || "#FACC15");
          setProfileAvatarSkin(parsed.skinColor || "#FFF4F2");
        } catch { /* ignore */ }
      } else if (avatarStr && avatarStr.startsWith("data:image")) {
        setProfileAvatarType("upload");
        setProfileUploadedAvatar(avatarStr);
      } else if (avatarStr) {
        setProfileAvatarType("presets");
        setProfilePresetAvatar(avatarStr);
      } else {
        setProfileAvatarType("presets");
        setProfilePresetAvatar("https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj");
      }
    }
  }, [currentUser?.id]);

  // Initial auth check
  useEffect(() => {
    async function rehydrateUser() {
      try {
        const response = await apiFetch("/api/user/me");
        const res = await response.json();
        if (res.success && res.data) {
          setCurrentUser(res.data);
          localStorage.setItem("cid_uid_storage", res.data.id);
          loadVaultList();
        }
      } catch { /* not authenticated */ } finally {
        setCheckingAuth(false);
      }
    }
    rehydrateUser();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("cid_uid_storage");
      setCurrentUser(null);
      setVaults([]);
      setActiveVault(null);
      setActiveSource(null);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async (
    vid: string,
    pageOverride?: number,
    typeOverride?: string,
    startOverride?: string,
    endOverride?: string
  ) => {
    try {
      const page = pageOverride !== undefined ? pageOverride : auditPage;
      const type = typeOverride !== undefined ? typeOverride : auditTypeFilter;
      const start = startOverride !== undefined ? startOverride : auditStartDate;
      const end = endOverride !== undefined ? endOverride : auditEndDate;

      let url = `/api/vault/${vid}/audit?limit=20&offset=${page * 20}`;
      if (type && type !== "ALL") url += `&type=${encodeURIComponent(type)}`;
      if (start) url += `&startDate=${encodeURIComponent(start)}`;
      if (end) url += `&endDate=${encodeURIComponent(end)}`;

      const response = await apiFetch(url);
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data);
        setAuditLogsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadVaultList = async (idToActivate?: string) => {
    try {
      const response = await apiFetch("/api/vault");
      const data = await response.json();
      if (data.success) {
        setVaults(data.data);
        let targetId = idToActivate;
        if (!targetId && activeVault) targetId = activeVault.id;
        if (!targetId && data.data.length > 0) targetId = data.data[0].id;

        if (targetId) {
          const found = data.data.find((v: Vault) => v.id === targetId);
          if (found) {
            setActiveVault(found);
            const sourcesResponse = await apiFetch(`/api/vault/${targetId}/source`);
            const srcData = await sourcesResponse.json();
            if (srcData.success) setSources(srcData.data.sources);
            loadAuditLogs(targetId);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadVaultDetail = async (id: string) => {
    try {
      const response = await apiFetch(`/api/vault/${id}`);
      const data = await response.json();
      if (data.success) {
        setActiveVault(data.data);
        setSources([]);
        const sourcesResponse = await apiFetch(`/api/vault/${id}/source`);
        const srcData = await sourcesResponse.json();
        if (srcData.success) setSources(srcData.data.sources);
        loadAuditLogs(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMuteVaultToggle = (vaultId: string) => {
    setMutedVaults((prev) => {
      const updated = { ...prev, [vaultId]: !prev[vaultId] };
      try { localStorage.setItem("mutedVaults", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, checkingAuth, handleLogout,
      vaults, setVaults, activeVault, setActiveVault, loadVaultList, loadVaultDetail,
      sources, setSources, activeSource, setActiveSource,
      annotations, setAnnotations, activeAnnotation, setActiveAnnotation,
      auditLogs, setAuditLogs, auditLogsData, auditPage, setAuditPage,
      auditTypeFilter, setAuditTypeFilter, auditStartDate, setAuditStartDate,
      auditEndDate, setAuditEndDate, loadAuditLogs,
      vaultSearchQuery, setVaultSearchQuery, mutedVaults, handleMuteVaultToggle,
      computedProfileAvatar, profileAvatarType, setProfileAvatarType,
      profilePresetAvatar, setProfilePresetAvatar,
      profileUploadedAvatar, setProfileUploadedAvatar,
      profileAvatarGender, setProfileAvatarGender,
      profileAvatarHair, setProfileAvatarHair,
      profileAvatarBg, setProfileAvatarBg,
      profileAvatarSkin, setProfileAvatarSkin,
      profileAvatarColor, setProfileAvatarColor,
      profileAvatarEye, setProfileAvatarEye,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
