"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { userService } from "@/services";
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
  const [profileMotto, setProfileMotto] = useState(currentUser?.motto || "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
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
  const uploadPreviewUrlRef = useRef<string | null>(null);

  const revokeUploadPreview = () => {
    if (uploadPreviewUrlRef.current) {
      URL.revokeObjectURL(uploadPreviewUrlRef.current);
      uploadPreviewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokeUploadPreview();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileMotto(currentUser.motto || "");
      setPendingAvatarFile(null);
    }
  }, [currentUser?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !currentUser) return;
    setProfileLoader(true);
    setErrMessage("");
    try {
      let avatarValue: string | null = null;

      if (profileAvatarType === "upload") {
        if (pendingAvatarFile) {
          const uploadRes = await userService.uploadAvatar(pendingAvatarFile);
          if (!uploadRes.success || !uploadRes.data) {
            setErrMessage(uploadRes.message || "Failed to upload avatar.");
            return;
          }
          avatarValue = uploadRes.data.avatar;
          setProfileUploadedAvatar(avatarValue || "");
          setPendingAvatarFile(null);
          revokeUploadPreview();
        } else if (profileUploadedAvatar) {
          avatarValue = profileUploadedAvatar;
        }
      } else if (profileAvatarType === "vector") {
        avatarValue = computedProfileAvatar;
      } else {
        avatarValue = profilePresetAvatar || null;
      }

      const res = await userService.updateMe({
        name: profileName,
        motto: profileMotto,
        avatar: avatarValue,
      });

      if (res.success) {
        const updatedUser = res.data
          ? { ...currentUser, ...res.data, name: profileName, motto: profileMotto, avatar: avatarValue }
          : { ...currentUser, name: profileName, motto: profileMotto, avatar: avatarValue };
        setCurrentUser(updatedUser);
        setOkMessage("Profile updated successfully.");
        setTimeout(() => setOkMessage(""), 3000);
      } else {
        setErrMessage(res.message || "Failed to update profile.");
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Connection error while updating profile.";
      setErrMessage(message);
    } finally {
      setProfileLoader(false);
    }
  };

  const handleUploadImageFile = (file: File) => {
    if (file.size > 5_000_000) {
      setErrMessage("File exceeds 5MB limit.");
      return;
    }
    revokeUploadPreview();
    const previewUrl = URL.createObjectURL(file);
    uploadPreviewUrlRef.current = previewUrl;
    setPendingAvatarFile(file);
    setProfileUploadedAvatar(previewUrl);
    setProfileAvatarType("upload");
    setErrMessage("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadImageFile(file);
    e.target.value = "";
  };

  if (!currentUser) return <SkeletonSettingsPage />;

  return (
    <SettingsPage
      currentUser={currentUser}
      activeSettingsTab={activeSettingsTab}
      setActiveSettingsTab={setActiveSettingsTab}
      profileName={profileName}
      setProfileName={setProfileName}
      profileMotto={profileMotto}
      setProfileMotto={setProfileMotto}
      profileAvatarType={profileAvatarType}
      setProfileAvatarType={setProfileAvatarType}
      profilePresetAvatar={profilePresetAvatar}
      setProfilePresetAvatar={setProfilePresetAvatar}
      profileUploadedAvatar={profileUploadedAvatar}
      setProfileUploadedAvatar={setProfileUploadedAvatar}
      onClearUploadedAvatar={() => {
        setPendingAvatarFile(null);
        revokeUploadPreview();
        setProfileUploadedAvatar("");
        if (profileAvatarType === "upload") {
          setProfileAvatarType("presets");
          setProfilePresetAvatar("");
        }
      }}
      profileAvatarGender={profileAvatarGender}
      setProfileAvatarGender={setProfileAvatarGender as (v: string) => void}
      profileAvatarHair={profileAvatarHair}
      setProfileAvatarHair={setProfileAvatarHair}
      profileAvatarBg={profileAvatarBg}
      setProfileAvatarBg={setProfileAvatarBg}
      profileAvatarSkin={profileAvatarSkin}
      setProfileAvatarSkin={setProfileAvatarSkin}
      profileAvatarColor={profileAvatarColor}
      setProfileAvatarColor={setProfileAvatarColor}
      profileAvatarEye={profileAvatarEye}
      setProfileAvatarEye={setProfileAvatarEye as (v: "sunglasses" | "glasses" | "cute" | "focus") => void}
      computedProfileAvatar={computedProfileAvatar}
      alertSettings={alertSettings}
      setAlertSettings={setAlertSettings}
      savingAlerts={savingAlerts}
      setSavingAlerts={setSavingAlerts}
      profileLoader={profileLoader}
      handleSaveProfile={handleSaveProfile}
      handleUploadImageFile={handleFileInputChange}
      onDropAvatarFile={handleUploadImageFile}
      handleNavigateScreen={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
      }}
      errMessage={errMessage}
      okMessage={okMessage}
      setErrMessage={setErrMessage}
      setOkMessage={setOkMessage}
    />
  );
}
