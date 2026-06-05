"use client";

import React, { useState } from "react";
import { Fingerprint, ArrowLeft, Award, Sparkles, X } from "lucide-react";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";

interface PassportContentProps {
  currentUser: any;
  activeVault: any;
  idCardNickname: string;
  setIdCardNickname: (val: string) => void;
  idCardSpecialization: string;
  setIdCardSpecialization: (val: string) => void;
  idCardMotto: string;
  setIdCardMotto: (val: string) => void;
  idCardAvatarGender: string;
  setIdCardAvatarGender: (val: any) => void;
  idCardAvatarBg: string;
  setIdCardAvatarBg: (val: any) => void;
  idCardAvatarEye: string;
  setIdCardAvatarEye: (val: any) => void;
  idCardAvatarHair: string;
  setIdCardAvatarHair: (val: any) => void;
  idCardAvatarAccessory: string;
  setIdCardAvatarAccessory: (val: any) => void;
  idCardAvatarColor: string;
  setIdCardAvatarColor: (val: any) => void;
  idCardAvatarSkin: string;
  setIdCardAvatarSkin: (val: any) => void;
  savedPassportState: any;
  handleSavePassportSetting: (config: any) => void;
  setIsCustomizingPassport: (val: any) => void;
}

export const PassportContent: React.FC<PassportContentProps> = ({
  currentUser, activeVault,
  idCardNickname, setIdCardNickname,
  idCardSpecialization, setIdCardSpecialization,
  idCardMotto, setIdCardMotto,
  idCardAvatarGender, setIdCardAvatarGender,
  idCardAvatarBg, setIdCardAvatarBg,
  idCardAvatarEye, setIdCardAvatarEye,
  idCardAvatarHair, setIdCardAvatarHair,
  idCardAvatarAccessory, setIdCardAvatarAccessory,
  idCardAvatarColor, setIdCardAvatarColor,
  idCardAvatarSkin, setIdCardAvatarSkin,
  savedPassportState, handleSavePassportSetting, setIsCustomizingPassport,
}) => {
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
  const [settingsErrorMsg, setSettingsErrorMsg] = useState("");
  const [isPassportScanning, setIsPassportScanning] = useState(false);

  const hasPassportChanges =
    idCardNickname !== (savedPassportState?.nickname || "") ||
    idCardSpecialization !== (savedPassportState?.specialization || "") ||
    idCardMotto !== (savedPassportState?.motto || "") ||
    idCardAvatarGender !== (savedPassportState?.avatarGender || "femme") ||
    idCardAvatarBg !== (savedPassportState?.avatarBg || "#38BDF8") ||
    idCardAvatarEye !== (savedPassportState?.avatarEye || "sunglasses") ||
    idCardAvatarHair !== (savedPassportState?.avatarHair || "long-bob") ||
    idCardAvatarAccessory !== (savedPassportState?.avatarAccessory || "none") ||
    idCardAvatarColor !== (savedPassportState?.avatarColor || "#FACC15") ||
    idCardAvatarSkin !== (savedPassportState?.avatarSkin || "#FFF4F2");

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 text-left pb-16">
      {/* Header Banner */}
      <div className="bg-neo-dark text-stone-50 border-4 border-neo-dark p-4 md:p-5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
            <h2 className="font-display font-black text-sm md:text-base tracking-tight uppercase">Identity Credentials Compiler Hub</h2>
          </div>
          <p className="text-[11px] text-stone-300 font-sans font-medium">
            Deep structural sector customization for Node: <span className="font-mono text-neo-yellow">NODE-VT-{activeVault ? activeVault.id.substring(0, 8).toUpperCase() : "SECURE"}</span>
          </p>
        </div>
        <button type="button" onClick={() => setIsCustomizingPassport(false)}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-neo-dark border-2 border-neo-dark font-display font-black text-xs uppercase tracking-wider rounded shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>Save & Close</span>
        </button>
      </div>

      {settingsSuccessMsg && (
        <div className="bg-emerald-100 border-4 border-emerald-600 text-emerald-950 p-4 rounded-sm text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_rgba(16,185,129,0.3)]">
          ✓ [SUCCESS]: {settingsSuccessMsg}
        </div>
      )}
      {settingsErrorMsg && (
        <div className="bg-rose-100 border-4 border-rose-600 text-rose-950 p-4 rounded-sm text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_rgba(239,68,68,0.3)]">
          ⚠️ [ERROR]: {settingsErrorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: Parameter panel */}
        <div className="lg:col-span-5 bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="border-b-2 border-dashed border-stone-200 pb-2">
            <h4 className="font-display font-black text-[11px] uppercase tracking-wide text-neo-dark flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-600" />
              Identity Coordinates Compiler Controls
            </h4>
          </div>
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">Vault Pseudonym / Alias</label>
              <input type="text" placeholder="e.g. Seer Ijj" maxLength={24} value={idCardNickname} onChange={(e) => setIdCardNickname(e.target.value)} className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">Research Sector Specialization</label>
              <input type="text" placeholder="e.g. Lead Metaphysics Operator" maxLength={30} value={idCardSpecialization} onChange={(e) => setIdCardSpecialization(e.target.value)} className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">Mission Motto / Signature Key</label>
              <input type="text" placeholder="e.g. Rigorous focus, zero assumptions." maxLength={45} value={idCardMotto} onChange={(e) => setIdCardMotto(e.target.value)} className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview + Actions */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
          <div className="w-full border-0 sm:border-4 border-dashed border-stone-300 p-0 sm:p-4 rounded-md flex flex-col items-center justify-center relative">
            <div className="text-[9px] font-mono text-stone-500 font-bold mb-2 uppercase tracking-tight hidden sm:block">Active Preview Passport Scan Stage</div>

            <div id="vaultIdCardPassportElement" className="w-full bg-stone-50 border-2 sm:border-4 border-neo-dark rounded-xs sm:rounded-sm p-3 sm:p-4 md:p-6 shadow-[4px_4px_0px_#000] sm:shadow-[8px_8px_0px_#000] relative overflow-hidden transition-all duration-300">
              {/* Passport Header */}
              <div className="border-b-4 border-neo-dark pb-3.5 mb-4 flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h5 className="font-display font-black text-xs md:text-sm text-neo-dark tracking-wide block uppercase leading-none">SECURE RESEARCH BOUNDS PASSPORT</h5>
                  <span className="text-[8px] md:text-[9px] font-mono font-bold text-stone-500 uppercase block tracking-wider mt-1">COGNITIVE VAULT INTEL DIRECTORY APPARATUS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono font-black border border-neo-dark px-1.5 py-0.5 rounded bg-neo-yellow text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000]">V.SECURE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Avatar */}
                <div className="col-span-1 md:col-span-4 flex flex-col items-center space-y-2">
                  <RenderUserAvatar avatar={currentUser ? currentUser.avatar : null} name={idCardNickname || (currentUser ? currentUser.name : "Scholar")} size={120} squareBorder={true} />
                  <div className="text-center w-full">
                    <span className="text-[8px] font-mono font-black uppercase text-stone-500 block leading-none mb-1">Pass Hologram</span>
                    <div className="flex gap-1 justify-center">
                      <div className="w-4 h-4 rounded-full bg-stone-200 border border-neo-dark flex items-center justify-center text-[7px] font-black tracking-tight select-none">ID</div>
                      <div className="w-10 h-4 border border-neo-dark bg-stone-100 flex items-center justify-around px-0.5">
                        <div className="w-0.5 h-3 bg-neo-dark" /><div className="w-1 h-3 bg-neo-dark" /><div className="w-0.5 h-3 bg-neo-dark" />
                        <div className="w-[1.5px] h-3 bg-neo-dark" /><div className="w-0.5 h-3 bg-neo-dark" /><div className="w-0.5 h-2 bg-neo-dark" /><div className="w-1 h-3 bg-neo-dark" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="col-span-1 md:col-span-8 space-y-2.5 font-sans font-semibold text-stone-700 text-left relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="border-b-2 border-stone-100 pb-1 text-left">
                      <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">AGENT ALIAS</span>
                      <span className="text-xs font-display font-black text-neo-dark block uppercase truncate">{idCardNickname || (currentUser ? currentUser.name : "Anonymous Agent")}</span>
                    </div>
                    <div className="border-b-2 border-stone-100 pb-1 text-left">
                      <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">BOUND STATUS</span>
                      <span className="text-xs font-display font-black text-emerald-600 block uppercase">{activeVault ? activeVault.myRole : "OWNER"} LEVEL</span>
                    </div>
                  </div>
                  <div className="border-b-2 border-stone-100 pb-1 text-left">
                    <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">AUTHORIZED VAULT INDEX</span>
                    <span className="text-[11px] font-display font-black text-indigo-700 block uppercase truncate text-left">{activeVault ? activeVault.name : "GLOBAL SYSTEM CORE VAULT"}</span>
                  </div>
                  <div className="border-b-2 border-stone-100 pb-1 text-left">
                    <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">SPECIALIZATION BRANCH</span>
                    <span className="text-[11px] font-sans font-black text-neo-dark block uppercase truncate text-left">{idCardSpecialization || "Advanced System Architect"}</span>
                  </div>
                  <div className="border-b-2 border-stone-100 pb-1 text-left">
                    <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">PERSONAL DIRECTIVE MOTTO</span>
                    <p className="text-[10px] font-sans font-bold leading-tight text-stone-500 italic block text-left">"{idCardMotto || "Data verification is the supreme virtue."}"</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1.5 border-t border-stone-100 text-left">
                    <div className="grid grid-cols-2 gap-4 text-[9px] font-mono font-bold text-stone-400 uppercase flex-1">
                      <div>
                        <span className="block text-[7px] text-stone-400">PASSPORT NODE INDEX</span>
                        <span className="text-neo-dark tracking-tighter">NODE-VT-{activeVault ? activeVault.id.slice(0, 8).toUpperCase() : "SECURE"}</span>
                      </div>
                      <div>
                        <span className="block text-[7px] text-stone-400">SECTOR CALENDER MATRIX</span>
                        <span className="text-neo-dark">02.06.2026</span>
                      </div>
                    </div>
                    <div className="border-4 border-dashed border-rose-500/85 rounded-xs py-1 px-2.5 text-rose-500/85 text-[10px] font-display font-black tracking-widest uppercase select-none pointer-events-none shadow-[1.5px_1.5px_0px_rgba(239,68,68,0.2)] shrink-0">APPROVED SECTOR</div>
                  </div>
                </div>
              </div>

              {/* Barcode */}
              <div className="mt-4 pt-3.5 border-t-2 border-dashed border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[10px]">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-neo-dark stroke-[2]" />
                  <div className="text-left leading-none">
                    <span className="text-[7.5px] font-mono font-bold text-stone-400 block uppercase">SECURE ENCRYPTION SEQUENCE</span>
                    <span className="font-mono text-[9px] text-neo-dark whitespace-nowrap">SHA-256V://COGNIT_SEC_VERIFY</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="h-6 w-32 bg-stone-50 border border-stone-300 rounded-sm opacity-85" style={{ background: "repeating-linear-gradient(90deg,transparent,transparent 2px,#000 2px,#000 5px,transparent 5px,transparent 6px,#000 6px,#000 7px,transparent 7px,transparent 9px,#000 9px,#000 12px)" }} />
                  <span className="text-[7px] font-mono font-bold text-stone-400 tracking-wider mt-0.5">AUTH-VT-{activeVault ? activeVault.id.toUpperCase().slice(0, 12) : "SECURE"}</span>
                </div>
              </div>

              {/* Scan line overlay */}
              {isPassportScanning && (
                <>
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-400 opacity-95 shadow-[0_0_15px_#10B981,0_0_5px_#10B981] z-50 animate-scan-line" />
                  <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none z-40 animate-pulse" />
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button type="button"
              disabled={isPassportScanning || !hasPassportChanges}
              onClick={() => {
                setIsPassportScanning(true);
                setSettingsSuccessMsg("");
                setSettingsErrorMsg("");
                setTimeout(() => {
                  setIsPassportScanning(false);
                  try {
                    const payload = {
                      nickname: idCardNickname || (currentUser ? currentUser.name : "Seer Ijj"),
                      specialization: idCardSpecialization || "Lead Investigator",
                      motto: idCardMotto || "Grounded analysis, zero assumptions.",
                      avatarGender: idCardAvatarGender,
                      avatarBg: idCardAvatarBg,
                      avatarEye: idCardAvatarEye,
                      avatarHair: idCardAvatarHair,
                      avatarAccessory: idCardAvatarAccessory,
                      avatarColor: idCardAvatarColor,
                      avatarSkin: idCardAvatarSkin,
                    };
                    handleSavePassportSetting(payload);
                    setSettingsSuccessMsg("PASSPORT ACCESS CREDENTIALS RE-COMPILED, ENCRYPTED & EMBEDDED IN VAULT SECURE STRATUM!");
                  } catch {
                    setSettingsErrorMsg("Cryptographical link failed during save action.");
                  }
                }, 1000);
              }}
              className="py-3 px-8 bg-emerald-400 hover:bg-emerald-300 disabled:bg-stone-300 disabled:text-stone-500 text-neo-dark border-4 border-neo-dark font-display font-black text-xs uppercase tracking-widest rounded shadow-[4px_4px_0px_#000] cursor-pointer hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] disabled:translate-y-0 disabled:shadow-none transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-neo-dark" />
              <span>{isPassportScanning ? "Compiling Cryptography..." : "ENCRYPT & SIGN PASSPORT"}</span>
            </button>
            <button type="button" onClick={() => setIsCustomizingPassport(false)}
              className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-neo-dark border-4 border-neo-dark font-display font-black text-xs uppercase tracking-widest rounded shadow-[4px_4px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2">
              <X className="w-4 h-4 text-neo-dark" strokeWidth={3} />
              <span>Close Compiler</span>
            </button>
          </div>

          <p className="text-[10px] text-stone-400 font-mono text-center max-w-sm">
            * Signing re-compiles and encrypts passport configurations, writing aliases instantly to internal sector RAM.
          </p>
        </div>
      </div>
    </div>
  );
};
