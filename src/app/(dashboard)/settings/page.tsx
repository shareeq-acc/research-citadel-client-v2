"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { SkeletonSettingsPage } from "@/components/shared/Skeleton";

export default function SettingsRoute() {
  const router = useRouter();
  const {
    currentUser, setCurrentUser,
    computedProfileAvatar, profileAvatarType, setProfileAvatarType,
    profilePresetAvatar, setProfilePresetAvatar,
    profileUploadedAvatar, setProfileUploadedAvatar,
    profileAvatarGender, setProfileAvatarGender,
    profileAvatarHair, setProfileAvatarHair,
    profileAvatarBg, setProfileAvatarBg,
    profileAvatarSkin, setProfileAvatarSkin,
    profileAvatarColor, setProfileAvatarColor,
    profileAvatarEye, setProfileAvatarEye,
  } = useApp();

  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileLoader, setProfileLoader] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "alerts">("profile");
  const [alertSettings, setAlertSettings] = useState({
    chatMentions: true,
    securityIssues: true,
    sourceAdditions: false,
    systemUpdates: true,
  });
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
    }
  }, [currentUser?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !currentUser) return;
    setProfileLoader(true);
    try {
      const response = await apiFetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          avatar: computedProfileAvatar,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser({ ...currentUser, name: profileName, avatar: computedProfileAvatar });
        setOkMessage("Profile updated successfully.");
        setTimeout(() => setOkMessage(""), 3000);
      } else {
        setErrMessage(data.message || "Failed to update profile.");
      }
    } catch {
      setErrMessage("Connection error while updating profile.");
    } finally {
      setProfileLoader(false);
    }
  };

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1200000) {
      setErrMessage("File exceeds 1.2MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileUploadedAvatar(reader.result as string);
      setProfileAvatarType("upload");
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) return <SkeletonSettingsPage />;

  return (
    <SettingsPage
      currentUser={currentUser}
      activeSettingsTab={activeSettingsTab}
      setActiveSettingsTab={setActiveSettingsTab}
      profileName={profileName}
      setProfileName={setProfileName}
      profileAvatarType={profileAvatarType}
      setProfileAvatarType={setProfileAvatarType}
      profilePresetAvatar={profilePresetAvatar}
      setProfilePresetAvatar={setProfilePresetAvatar}
      profileUploadedAvatar={profileUploadedAvatar}
      setProfileUploadedAvatar={setProfileUploadedAvatar}
      profileAvatarGender={profileAvatarGender}
      setProfileAvatarGender={setProfileAvatarGender as (v: any) => void}
      profileAvatarHair={profileAvatarHair}
      setProfileAvatarHair={setProfileAvatarHair}
      profileAvatarBg={profileAvatarBg}
      setProfileAvatarBg={setProfileAvatarBg}
      profileAvatarSkin={profileAvatarSkin}
      setProfileAvatarSkin={setProfileAvatarSkin}
      profileAvatarColor={profileAvatarColor}
      setProfileAvatarColor={setProfileAvatarColor}
      profileAvatarEye={profileAvatarEye}
      setProfileAvatarEye={setProfileAvatarEye as (v: any) => void}
      computedProfileAvatar={computedProfileAvatar}
      alertSettings={alertSettings}
      setAlertSettings={setAlertSettings}
      savingAlerts={savingAlerts}
      setSavingAlerts={setSavingAlerts}
      profileLoader={profileLoader}
      handleSaveProfile={handleSaveProfile}
      handleUploadImageFile={handleUploadImageFile}
      handleNavigateScreen={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
      }}
      setErrMessage={setErrMessage}
      setOkMessage={setOkMessage}
    />
  );
}
