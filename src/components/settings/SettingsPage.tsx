"use client";

import React from "react";
import { User } from "@/types";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";
import {
  Settings, ArrowLeft, User as UserIcon, Bell, Plus, Palette, Venus, Mars
} from "lucide-react";

interface SettingsPageProps {
  currentUser: User | null;
  activeSettingsTab: "profile" | "alerts";
  setActiveSettingsTab: (tab: "profile" | "alerts") => void;
  profileName: string;
  setProfileName: (name: string) => void;
  profileAvatarType: "presets" | "upload" | "vector";
  setProfileAvatarType: (type: "presets" | "upload" | "vector") => void;
  profilePresetAvatar: string;
  setProfilePresetAvatar: (v: string) => void;
  profileUploadedAvatar: string;
  setProfileUploadedAvatar: (v: string) => void;
  profileAvatarGender: string;
  setProfileAvatarGender: (v: string) => void;
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
  computedProfileAvatar: string | null;
  alertSettings: {
    chatMentions: boolean;
    securityIssues: boolean;
    sourceAdditions: boolean;
    systemUpdates: boolean;
  };
  setAlertSettings: React.Dispatch<React.SetStateAction<{
    chatMentions: boolean;
    securityIssues: boolean;
    sourceAdditions: boolean;
    systemUpdates: boolean;
  }>>;
  savingAlerts: boolean;
  setSavingAlerts: (v: boolean) => void;
  profileLoader: boolean;
  handleSaveProfile: (e: React.FormEvent) => void;
  handleUploadImageFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNavigateScreen: (screen: string) => void;
  setErrMessage: (msg: string) => void;
  setOkMessage: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  activeSettingsTab,
  setActiveSettingsTab,
  profileName,
  setProfileName,
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
  computedProfileAvatar,
  alertSettings,
  setAlertSettings,
  savingAlerts,
  setSavingAlerts,
  profileLoader,
  handleSaveProfile,
  handleUploadImageFile,
  handleNavigateScreen,
  setErrMessage,
  setOkMessage,
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded neo-border neo-shadow-sm space-y-6">
      <div className="border-b-4 border-neo-dark pb-3 flex justify-between items-center">
        <h2 className="font-display font-black text-xl flex items-center gap-2 text-neo-dark">
          <Settings className="w-6 h-6 text-neo-orange" />
          Researcher Configuration
        </h2>
        <button
          onClick={() => handleNavigateScreen("dashboard")}
          className="text-xs font-bold font-mono px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-neo-dark cursor-pointer flex items-center gap-1 active:translate-y-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-2 select-none">
          <button
            type="button"
            onClick={() => setActiveSettingsTab("profile")}
            className={`flex-1 md:flex-none text-left px-3 py-2 text-xs font-bold font-mono border-2 border-neo-dark uppercase transition-all rounded-xs shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 flex items-center justify-center md:justify-start gap-1.5 cursor-pointer ${
              activeSettingsTab === "profile" 
                ? "bg-neo-yellow text-neo-dark font-black" 
                : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab("alerts")}
            className={`flex-1 md:flex-none text-left px-3 py-2 text-xs font-bold font-mono border-2 border-neo-dark uppercase transition-all rounded-xs shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 flex items-center justify-center md:justify-start gap-1.5 cursor-pointer ${
              activeSettingsTab === "alerts" 
                ? "bg-neo-yellow text-neo-dark font-black" 
                : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
        </div>

        {/* Config Content */}
        <div className="flex-1 min-w-0 bg-stone-50 p-4 border-2 border-neo-dark rounded">
          {activeSettingsTab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold font-mono text-stone-600 uppercase mb-2">
                  Citadel Avatar Signet Builder
                </label>

                {/* Live Design Hub Preview with Drag-and-Drop */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (file.size > 1200000) {
                        setErrMessage("File exceeds 1.2MB limit for local memory index nodes.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setProfileUploadedAvatar(reader.result as string);
                        setProfileAvatarType("upload");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 mb-4 bg-white border-2 border-neo-dark rounded shadow-[2px_2px_0px_rgba(0,0,0,0.15)] animate-fadeIn relative group select-none"
                >
                  <div className="flex-shrink-0">
                    <RenderUserAvatar 
                      avatar={computedProfileAvatar} 
                      name={profileName || "Scholar"} 
                      size={110} 
                      squareBorder={profileAvatarType === "vector"} 
                    />
                  </div>
                  <div className="text-left space-y-1 sm:max-w-xs md:max-w-md flex-1">
                    <span className="text-[9px] font-mono font-black text-stone-400 block uppercase leading-none tracking-wide">SIGNET DEPLOYMENT PREVIEW</span>
                    <div className="font-display font-black text-xs text-neo-dark">
                      {profileAvatarType === 'vector' ? 'Cryptographic Custom Vector Archetype' : profileAvatarType === 'upload' ? 'Custom Upload Cryptographic Key' : computedProfileAvatar === '' ? 'Default Cryptographic Letter Signet' : 'Standard Scholar Preset'}
                    </div>
                    <p className="text-[10px] text-stone-400 font-mono leading-tight">
                      This signet represents your academic digital presence. Select elements from the unified roster below to instantly swap, or drag-and-drop a portrait photo here.
                    </p>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input 
                    id="fileUploadAvatarInput" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleUploadImageFile} 
                  />
                </div>

                {/* Integrated Unified Roster Interface */}
                <div className="space-y-3 mb-4 select-none">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase font-display font-black text-neo-dark tracking-wider">AVAILABLE CITADEL SIGNETS</span>
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-500 uppercase">UNIFIED ROSTER</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-9 gap-2.5 p-3 bg-white border-2 border-neo-dark rounded">
                    
                    {/* Letter Avatar */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatarType("presets");
                          setProfilePresetAvatar("");
                        }}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative flex items-center justify-center bg-neo-yellow text-neo-dark font-black text-xs shadow-[1.5px_1.5px_0px_#000] active:translate-y-px ${
                          profileAvatarType === "presets" && profilePresetAvatar === ""
                            ? "border-neo-orange ring-2 ring-neo-orange/50 scale-105"
                            : "border-neo-dark hover:scale-102"
                        }`}
                        title="Default Cryptographic Initial Letter"
                      >
                        <span>{profileName ? profileName.charAt(0).toUpperCase() : "S"}</span>
                        {profileAvatarType === "presets" && profilePresetAvatar === "" && (
                          <span className="absolute inset-0 bg-neo-orange/20 flex items-center justify-center text-neo-dark font-black text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                      <span className="text-[8px] font-mono font-black text-stone-400 uppercase text-center truncate w-full">Letter ({profileName ? profileName.charAt(0).toUpperCase() : "S"})</span>
                    </div>

                    {/* Presets */}
                    {[
                      { url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=SeerIjj", label: "Cyber" },
                      { url: "https://api.dicebear.com/7.x/bottts/svg?seed=Noodle", label: "Bot-12" },
                      { url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Quantum", label: "Sprite" },
                      { url: "https://api.dicebear.com/7.x/bottts/svg?seed=Spanner", label: "Spark" },
                    ].map((preset, idx) => {
                      const isSelected = profileAvatarType === "presets" && profilePresetAvatar === preset.url;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAvatarType("presets");
                              setProfilePresetAvatar(preset.url);
                            }}
                            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative bg-stone-50 shadow-[1.5px_1.5px_0px_#000] active:translate-y-px ${
                              isSelected ? "border-neo-orange ring-2 ring-neo-orange/50 scale-105" : "border-neo-dark hover:scale-102"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]" />
                            {isSelected && (
                              <span className="absolute inset-0 bg-neo-orange/20 flex items-center justify-center text-white text-[10px] font-black">
                                ✓
                              </span>
                            )}
                          </button>
                          <span className="text-[8px] font-mono font-black text-stone-400 uppercase text-center truncate w-full">{preset.label}</span>
                        </div>
                      );
                    })}

                    {/* Upload button wrapper */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => document.getElementById("fileUploadAvatarInput")?.click()}
                        className="w-10 h-10 rounded-full border-2 border-dashed border-stone-400 hover:border-neo-dark transition-all cursor-pointer bg-stone-50 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                        title="Upload portrait file (Drag&amp;Drop also active)"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                      </button>
                      <span className="text-[8px] font-mono font-black text-stone-400 uppercase text-center truncate w-full">Upload...</span>
                    </div>

                    {/* Custom Upload option */}
                    {profileUploadedAvatar && (
                      <div className="flex flex-col items-center gap-1 animate-fadeIn">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAvatarType("upload");
                            }}
                            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative bg-stone-100 shadow-[1.5px_1.5px_0px_#000] ${
                              profileAvatarType === "upload" ? "border-neo-orange ring-2 ring-neo-orange/50 scale-105" : "border-neo-dark hover:scale-102"
                            }`}
                          >
                            <img src={profileUploadedAvatar} alt="Uploaded" className="w-full h-full object-cover" />
                            {profileAvatarType === "upload" && (
                              <span className="absolute inset-0 bg-neo-orange/20 flex items-center justify-center text-white text-[10px] font-black">
                                ✓
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileUploadedAvatar("");
                              if (profileAvatarType === "upload") {
                                setProfileAvatarType("presets");
                                setProfilePresetAvatar("");
                              }
                            }}
                            className="absolute -top-1 -right-1 bg-rose-500 border border-neo-dark text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-black hover:bg-rose-600 transition shadow-[0.5px_0.5px_0px_#000]"
                            title="Clear Image"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-[8px] font-mono font-black text-rose-500 uppercase text-center truncate w-full">Custom</span>
                      </div>
                    )}

                    {/* Vector Avatar button */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatarType("vector");
                        }}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all cursor-pointer relative flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] active:translate-y-px ${
                          profileAvatarType === "vector"
                            ? "border-neo-orange ring-2 ring-neo-orange/50 scale-105 bg-amber-100 text-neo-dark"
                            : "border-neo-dark bg-stone-50 text-stone-700 hover:bg-stone-100"
                        }`}
                        title="Interactive Custom Vector Constructor"
                      >
                        <Palette className="w-4 h-4 shrink-0 transition-transform hover:scale-110" />
                        {profileAvatarType === "vector" && (
                          <span className="absolute inset-0 bg-neo-orange/20 flex items-center justify-center text-neo-dark font-black text-xs">
                            ✓
                          </span>
                        )}
                      </button>
                      <span className="text-[8px] font-mono font-black text-stone-400 uppercase text-center truncate w-full">Design</span>
                    </div>

                  </div>
                </div>

                {/* Custom Vector Builder specifications */}
                {profileAvatarType === "vector" && (
                  <div className="bg-white border-2 border-neo-dark p-4 rounded animate-fadeIn space-y-4 text-left select-none">
                    <div className="border-b border-stone-100 pb-2 flex justify-between items-center">
                      <span className="text-[10px] uppercase font-display font-black text-neo-dark tracking-wide">AVATAR SPECIFICATION COEFFICIENTS</span>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-500">VECTOR HUB</span>
                    </div>

                    {/* Gender Style Selector */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1">Gender / Core Style Preset</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileAvatarGender("femme");
                            setProfileAvatarHair("long-bob");
                          }}
                          className={`py-1.5 px-3 border-2 border-neo-dark rounded font-display font-black text-[9px] uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none ${
                            profileAvatarGender === "femme"
                              ? "bg-rose-100 text-rose-955 border-rose-300 shadow-[1.5px_1.5px_0px_rgba(244,63,94,0.3)]"
                              : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <Venus className="w-3.5 h-3.5 text-rose-600 shrink-0 stroke-[2.5]" />
                          <span>Femme Archetype</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileAvatarGender("masc");
                            setProfileAvatarHair("quiff");
                          }}
                          className={`py-1.5 px-3 border-2 border-neo-dark rounded font-display font-black text-[9px] uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-0.5 active:shadow-none ${
                            profileAvatarGender === "masc"
                              ? "bg-sky-100 text-sky-955 border-sky-300 shadow-[1.5px_1.5px_0px_rgba(14,165,233,0.3)]"
                              : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          <Mars className="w-3.5 h-3.5 text-sky-600 shrink-0 stroke-[2.5]" />
                          <span>Masc Archetype</span>
                        </button>
                      </div>
                    </div>

                    {/* Hair styles */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1.5">Hairdo / Helmet Cuts</label>
                      {profileAvatarGender === "femme" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: "long-bob", label: "Bob" },
                            { id: "ponytail", label: "Ponytail" },
                            { id: "curly-fem", label: "Curly" },
                          ].map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setProfileAvatarHair(h.id)}
                              className={`py-2 px-1.5 border-2 border-neo-dark rounded font-sans font-black text-[10px] cursor-pointer uppercase transition-all tracking-wide text-center truncate ${
                                profileAvatarHair === h.id
                                  ? "bg-neo-yellow text-neo-dark ring-2 ring-neo-dark border-neo-dark"
                                  : "bg-white text-stone-600 hover:bg-stone-50"
                              }`}
                            >
                              {h.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "quiff", label: "Quiff" },
                            { id: "fade-masc", label: "Fade" },
                            { id: "spiky-punk", label: "Spike" },
                            { id: "beanie", label: "Beanie" },
                          ].map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setProfileAvatarHair(h.id)}
                              className={`py-2 px-1.5 border-2 border-neo-dark rounded font-sans font-black text-[10px] cursor-pointer uppercase transition-all tracking-wide text-center truncate ${
                                profileAvatarHair === h.id
                                  ? "bg-neo-yellow text-neo-dark ring-2 ring-neo-dark border-neo-dark"
                                  : "bg-white text-stone-600 hover:bg-stone-50"
                              }`}
                            >
                              {h.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Background choice */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1.5">Pass Background Paint</label>
                      <div className="grid grid-cols-7 gap-2 max-w-xs sm:max-w-none">
                        {[
                          { hex: "#38BDF8", label: "Sky" },
                          { hex: "#F43F5E", label: "Rose" },
                          { hex: "#34D399", label: "Mint" },
                          { hex: "#FBBF24", label: "Amber" },
                          { hex: "#C084FC", label: "Violet" },
                          { hex: "#2DD4BF", label: "Teal" },
                          { hex: "#F3F4F6", label: "Silver" },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setProfileAvatarBg(c.hex)}
                            className={`w-8 h-8 rounded-full border-2 border-neo-dark shadow-[1.5px_1.5px_0px_#000] cursor-pointer relative mx-auto ${
                              profileAvatarBg === c.hex ? "ring-2 ring-emerald-500 scale-105" : "hover:scale-102"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.label}
                          >
                            {profileAvatarBg === c.hex && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black pointer-events-none text-neo-dark">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skin tone */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1.5">Skin Tone / Pigmentation</label>
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                        {[
                          { hex: "#FFF4F2", label: "Porcelain" },
                          { hex: "#FFE3D1", label: "Fair Peach" },
                          { hex: "#FCD0B4", label: "Warm Sand" },
                          { hex: "#EAC09E", label: "Honey Beige" },
                          { hex: "#D5A17A", label: "Golden Tan" },
                          { hex: "#B6825B", label: "Rich Bronze" },
                          { hex: "#8D5E3A", label: "Dark Amber" },
                          { hex: "#5B3A21", label: "Deep Espresso" },
                          { hex: "#2C1D13", label: "Obsidian Black" },
                        ].map((s) => (
                          <button
                            key={s.hex}
                            type="button"
                            onClick={() => setProfileAvatarSkin(s.hex)}
                            className={`w-7 h-7 rounded-md border-2 border-neo-dark shadow-[1.5px_1.5px_0px_#000] cursor-pointer relative mx-auto ${
                              profileAvatarSkin === s.hex ? "ring-2 ring-emerald-500 scale-105" : "hover:scale-102"
                            }`}
                            style={{ backgroundColor: s.hex }}
                            title={s.label}
                          >
                            {profileAvatarSkin === s.hex && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black pointer-events-none text-white invert animate-fadeIn">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hair dye */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1.5">Hair Dye / Highlight Pigment</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { hex: "#111111", label: "Deep Obsidian" },
                          { hex: "#3C2F2F", label: "Dark Espresso" },
                          { hex: "#7C5335", label: "Chestnut" },
                          { hex: "#A94A42", label: "Auburn Red" },
                          { hex: "#E07A5F", label: "Ginger Sunset" },
                          { hex: "#ECD5A1", label: "Golden Blonde" },
                          { hex: "#D1D5DB", label: "Platinum Gray" },
                          { hex: "#F9FAFB", label: "Snow White" },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setProfileAvatarColor(c.hex)}
                            className={`w-7 h-7 rounded-sm border-2 border-neo-dark shadow-[1.5px_1.5px_0px_#000] cursor-pointer relative mx-auto ${
                              profileAvatarColor === c.hex ? "ring-2 ring-emerald-500 scale-105" : "hover:scale-102"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.label}
                          >
                            {profileAvatarColor === c.hex && (
                              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black pointer-events-none text-white invert animate-fadeIn">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Eye accessories */}
                    <div>
                      <label className="block text-[8px] font-black font-mono text-stone-400 uppercase mb-1.5">Vision / Shaders Device</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { id: "sunglasses", label: "Shades" },
                          { id: "glasses", label: "Specs" },
                          { id: "cute", label: "Glint" },
                          { id: "focus", label: "HUD" },
                        ].map((e) => {
                          return (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => setProfileAvatarEye(e.id as any)}
                              className={`py-2 px-1.5 border-2 border-neo-dark rounded font-display font-black text-[10px] cursor-pointer uppercase transition-all flex items-center justify-center text-center shadow-[2px_2px_0px_#000] active:translate-y-px active:shadow-none ${
                                profileAvatarEye === e.id
                                  ? "bg-neo-yellow text-neo-dark border-neo-dark font-black"
                                  : "bg-white text-stone-700 hover:bg-stone-50"
                              }`}
                            >
                              {e.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-stone-600 uppercase mb-1">
                  Call Name Index
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full neo-input bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-mono text-stone-500 uppercase mb-1">
                  Secure Email Endpoint
                </label>
                <div className="w-full neo-input bg-stone-100 text-stone-500 font-mono select-none cursor-not-allowed border-2 border-dashed border-stone-300">
                  {currentUser?.email}
                </div>
                <span className="text-[9px] text-stone-400 font-mono mt-1 block">
                  Email updates disabled for cryptographic workspace security index alignment.
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t-2 border-neo-dark">
                <button
                  type="submit"
                  disabled={profileLoader}
                  className="neo-btn px-6 py-2.5 text-xs shadow-[2px_2px_0px_#0A0A0A]"
                >
                  {profileLoader ? "Updating parameters..." : "Inscribe Settings"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 text-left">
              <div className="border-b-2 border-neo-dark pb-2 select-none">
                <h3 className="font-display font-black text-sm uppercase text-neo-dark">
                  Email Alert Options
                </h3>
                <p className="text-[10px] text-stone-500 font-mono">
                  Configure automated digital dispatching parameters for peer collaboration
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000]">
                  <div className="space-y-0.5 pr-4">
                    <span className="block font-bold text-xs text-neo-dark">Scholar Colloquium Mentions</span>
                    <span className="block text-[10px] text-stone-500 font-mono leading-tight">
                      Receive emails when other researchers tag your workspace profile in discussion logs
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertSettings.chatMentions}
                    onChange={(e) => setAlertSettings({ ...alertSettings, chatMentions: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-neo-dark text-neo-orange focus:ring-0 cursor-pointer h-4 w-4 bg-white checked:bg-neo-dark"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000]">
                  <div className="space-y-0.5 pr-4">
                    <span className="block font-bold text-xs text-neo-dark">Immediate Cryptographic Audits</span>
                    <span className="block text-[10px] text-stone-500 font-mono leading-tight">
                      Notifications on key updates, vault export actions, and membership roll changes
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertSettings.securityIssues}
                    onChange={(e) => setAlertSettings({ ...alertSettings, securityIssues: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-neo-dark text-neo-orange focus:ring-0 cursor-pointer h-4 w-4 bg-white checked:bg-neo-dark"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000]">
                  <div className="space-y-0.5 pr-4">
                    <span className="block font-bold text-xs text-neo-dark">Resource Catalog Additions</span>
                    <span className="block text-[10px] text-stone-500 font-mono leading-tight">
                      Get updates when team members index new citation references or PDFs in your vaults
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertSettings.sourceAdditions}
                    onChange={(e) => setAlertSettings({ ...alertSettings, sourceAdditions: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-neo-dark text-neo-orange focus:ring-0 cursor-pointer h-4 w-4 bg-white checked:bg-neo-dark"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000]">
                  <div className="space-y-0.5 pr-4">
                    <span className="block font-bold text-xs text-neo-dark">System Upgrades and Compute Status</span>
                    <span className="block text-[10px] text-stone-500 font-mono leading-tight">
                      Receive occasional communications regarding sandbox limits and platform metrics
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertSettings.systemUpdates}
                    onChange={(e) => setAlertSettings({ ...alertSettings, systemUpdates: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-neo-dark text-neo-orange focus:ring-0 cursor-pointer h-4 w-4 bg-white checked:bg-neo-dark"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t-2 border-neo-dark">
                <button
                  type="button"
                  onClick={() => {
                    setSavingAlerts(true);
                    setTimeout(() => {
                      setSavingAlerts(false);
                      setOkMessage("Notification parameters inscribed in core ledger successfully.");
                    }, 500);
                  }}
                  disabled={savingAlerts}
                  className="neo-btn px-6 py-2.5 text-xs shadow-[1.5px_1.5px_0px_#0A0A0A] bg-neo-yellow cursor-pointer text-neo-dark font-bold font-display"
                >
                  {savingAlerts ? "Inscribing alerts..." : "Commit Alert Preferences"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
