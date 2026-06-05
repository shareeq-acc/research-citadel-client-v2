"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { Vault } from "@/types";
import { PassportContent } from "@/components/passport/PassportContent";

export default function PassportPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, setActiveVault } = useApp();
  const vaultId = params.vaultId as string;

  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  // ID Card states
  const [idCardNickname, setIdCardNickname] = useState("");
  const [idCardSpecialization, setIdCardSpecialization] = useState("");
  const [idCardMotto, setIdCardMotto] = useState("");
  const [idCardAvatarGender, setIdCardAvatarGender] = useState<"femme" | "masc">("femme");
  const [idCardAvatarBg, setIdCardAvatarBg] = useState("#38BDF8");
  const [idCardAvatarEye, setIdCardAvatarEye] = useState<"sunglasses" | "glasses" | "cute" | "focus">("sunglasses");
  const [idCardAvatarHair, setIdCardAvatarHair] = useState("long-bob");
  const [idCardAvatarAccessory, setIdCardAvatarAccessory] = useState<"headset" | "scope" | "earring" | "none">("none");
  const [idCardAvatarColor, setIdCardAvatarColor] = useState("#FACC15");
  const [idCardAvatarSkin, setIdCardAvatarSkin] = useState("#FFF4F2");
  const [savedPassportState, setSavedPassportState] = useState<any>(null);

  useEffect(() => {
    async function loadVault() {
      try {
        const res = await apiFetch(`/api/vault/${vaultId}`);
        const data = await res.json();
        if (data.success) {
          setVault(data.data);
          setActiveVault(data.data);
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, [vaultId]);

  useEffect(() => {
    if (vault) {
      const stored = localStorage.getItem(`idcard_${vault.id}`);
      let payload = {
        nickname: currentUser?.name || "Seer Ijj",
        specialization: "Lead Investigator",
        motto: "Grounded analysis, zero assumptions.",
        avatarGender: "femme" as "femme" | "masc",
        avatarBg: "#38BDF8",
        avatarEye: "sunglasses" as "sunglasses" | "glasses" | "cute" | "focus",
        avatarHair: "long-bob",
        avatarAccessory: "none" as "headset" | "scope" | "earring" | "none",
        avatarColor: "#FACC15",
        avatarSkin: "#FFF4F2",
      };
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          payload = {
            nickname: parsed.nickname || payload.nickname,
            specialization: parsed.specialization || payload.specialization,
            motto: parsed.motto || payload.motto,
            avatarGender: parsed.avatarGender || payload.avatarGender,
            avatarBg: parsed.avatarBg || payload.avatarBg,
            avatarEye: parsed.avatarEye || payload.avatarEye,
            avatarHair: parsed.avatarHair || payload.avatarHair,
            avatarAccessory: parsed.avatarAccessory || payload.avatarAccessory,
            avatarColor: parsed.avatarColor || payload.avatarColor,
            avatarSkin: parsed.avatarSkin || payload.avatarSkin,
          };
        } catch { /* ignore */ }
      }
      setIdCardNickname(payload.nickname);
      setIdCardSpecialization(payload.specialization);
      setIdCardMotto(payload.motto);
      setIdCardAvatarGender(payload.avatarGender);
      setIdCardAvatarBg(payload.avatarBg);
      setIdCardAvatarEye(payload.avatarEye);
      setIdCardAvatarHair(payload.avatarHair);
      setIdCardAvatarAccessory(payload.avatarAccessory);
      setIdCardAvatarColor(payload.avatarColor);
      setIdCardAvatarSkin(payload.avatarSkin);
      setSavedPassportState(payload);
    }
  }, [vault?.id, currentUser?.name]);

  const handleSavePassportSetting = (config: any) => {
    if (!vault) return;
    try {
      localStorage.setItem(`idcard_${vault.id}`, JSON.stringify(config));
      setSavedPassportState(config);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-16 bg-neo-dark animate-pulse rounded" />
        <div className="h-96 bg-white border-4 border-neo-dark animate-pulse rounded" />
      </div>
    );
  }

  return (
    <PassportContent
      currentUser={currentUser}
      activeVault={vault}
      idCardNickname={idCardNickname}
      setIdCardNickname={setIdCardNickname}
      idCardSpecialization={idCardSpecialization}
      setIdCardSpecialization={setIdCardSpecialization}
      idCardMotto={idCardMotto}
      setIdCardMotto={setIdCardMotto}
      idCardAvatarGender={idCardAvatarGender}
      setIdCardAvatarGender={setIdCardAvatarGender}
      idCardAvatarBg={idCardAvatarBg}
      setIdCardAvatarBg={setIdCardAvatarBg}
      idCardAvatarEye={idCardAvatarEye}
      setIdCardAvatarEye={setIdCardAvatarEye}
      idCardAvatarHair={idCardAvatarHair}
      setIdCardAvatarHair={setIdCardAvatarHair}
      idCardAvatarAccessory={idCardAvatarAccessory}
      setIdCardAvatarAccessory={setIdCardAvatarAccessory}
      idCardAvatarColor={idCardAvatarColor}
      setIdCardAvatarColor={setIdCardAvatarColor}
      idCardAvatarSkin={idCardAvatarSkin}
      setIdCardAvatarSkin={setIdCardAvatarSkin}
      savedPassportState={savedPassportState}
      handleSavePassportSetting={handleSavePassportSetting}
      setIsCustomizingPassport={() => router.push("/dashboard")}
    />
  );
}
