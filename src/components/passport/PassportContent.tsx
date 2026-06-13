"use client";

import React, { useState } from "react";
import { Fingerprint, ArrowLeft, Award, Sparkles, X } from "lucide-react";
import { PassportCard, formatPassportId } from "@/components/passport/PassportCard";
import type { VaultPassport } from "@/services/passport.service";

interface PassportContentProps {
  passport: VaultPassport;
  currentUser: { name: string; avatar: string | null; motto?: string | null } | null;
  vaultAlias: string;
  setVaultAlias: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  motto: string;
  setMotto: (val: string) => void;
  savedState: { vaultAlias: string; role: string; motto: string } | null;
  onSave: (payload: { vaultAlias: string; role: string; motto: string }) => Promise<void>;
  onClose: () => void;
}

export const PassportContent: React.FC<PassportContentProps> = ({
  passport,
  currentUser,
  vaultAlias,
  setVaultAlias,
  role,
  setRole,
  motto,
  setMotto,
  savedState,
  onSave,
  onClose,
}) => {
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
  const [settingsErrorMsg, setSettingsErrorMsg] = useState("");
  const [isPassportScanning, setIsPassportScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasPassportChanges =
    vaultAlias !== (savedState?.vaultAlias ?? "") ||
    role !== (savedState?.role ?? "") ||
    motto !== (savedState?.motto ?? "");

  const previewPassport: VaultPassport = {
    ...passport,
    vaultAlias: vaultAlias || null,
    role: role || null,
    motto: motto || null,
    displayAlias: vaultAlias.trim() || passport.agentName,
    displayMotto:
      motto.trim() ||
      passport.motto?.trim() ||
      currentUser?.motto?.trim() ||
      passport.displayMotto,
  };

  const handleSave = async () => {
    setIsPassportScanning(true);
    setSettingsSuccessMsg("");
    setSettingsErrorMsg("");
    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await onSave({
        vaultAlias: vaultAlias.trim(),
        role: role.trim(),
        motto: motto.trim(),
      });
      setSettingsSuccessMsg("Passport saved and signed successfully.");
    } catch {
      setSettingsErrorMsg("Failed to save passport. Please try again.");
    } finally {
      setIsPassportScanning(false);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 text-left pb-16">
      <div className="bg-neo-dark text-stone-50 border-4 border-neo-dark p-4 md:p-5 rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
            <h2 className="font-display font-black text-sm md:text-base tracking-tight uppercase">
              Edit Vault Passport
            </h2>
          </div>
          <p className="text-[11px] text-stone-300 font-sans font-medium">
            Customize your identity for this vault. Passport ID:{" "}
            <span className="font-mono text-neo-yellow">{formatPassportId(passport.id)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-neo-dark border-2 border-neo-dark font-display font-black text-xs uppercase tracking-wider rounded shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>Save & Close</span>
        </button>
      </div>

      {settingsSuccessMsg && (
        <div className="bg-emerald-100 border-4 border-emerald-600 text-emerald-950 p-4 rounded-sm text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_rgba(16,185,129,0.3)]">
          ✓ {settingsSuccessMsg}
        </div>
      )}
      {settingsErrorMsg && (
        <div className="bg-rose-100 border-4 border-rose-600 text-rose-950 p-4 rounded-sm text-xs font-mono font-bold uppercase shadow-[3px_3px_0px_rgba(239,68,68,0.3)]">
          ⚠️ {settingsErrorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="border-b-2 border-dashed border-stone-200 pb-2">
            <h4 className="font-display font-black text-[11px] uppercase tracking-wide text-neo-dark flex items-center gap-1">
              <Award className="w-4 h-4 text-emerald-600" />
              Editable Fields
            </h4>
          </div>
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                Vault Alias
              </label>
              <input
                type="text"
                placeholder={currentUser?.name || "Your display name in this vault"}
                maxLength={48}
                value={vaultAlias}
                onChange={(e) => setVaultAlias(e.target.value)}
                className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all"
              />
              <p className="text-[9px] text-stone-400 mt-1">How you appear in this vault. Defaults to your account name.</p>
            </div>
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                Specialization / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Investigator"
                maxLength={64}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold font-mono text-stone-500 uppercase mb-1">
                Motto
              </label>
              <input
                type="text"
                placeholder="Your vault-specific motto"
                maxLength={120}
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full p-2 bg-stone-50 hover:bg-stone-100 focus:bg-amber-50/50 border-2 border-neo-dark rounded font-sans text-xs font-bold text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000] focus:outline-none transition-all"
              />
              <p className="text-[9px] text-stone-400 mt-1">Leave blank to use your profile motto until you set one here.</p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-stone-200 pt-3 space-y-2">
            <p className="text-[9px] font-mono font-bold text-stone-400 uppercase">Read-only</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-stone-50 border border-stone-200 p-2 rounded">
                <span className="block text-[8px] text-stone-400 uppercase">Member Name</span>
                <span className="font-bold text-neo-dark">{passport.agentName}</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2 rounded">
                <span className="block text-[8px] text-stone-400 uppercase">Membership Role</span>
                <span className="font-bold text-emerald-700">{passport.memberRole}</span>
              </div>
              <div className="bg-stone-50 border border-stone-200 p-2 rounded col-span-2">
                <span className="block text-[8px] text-stone-400 uppercase">Vault</span>
                <span className="font-bold text-indigo-700">{passport.vaultName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
          <div className="w-full border-0 sm:border-4 border-dashed border-stone-300 p-0 sm:p-4 rounded-md flex flex-col items-center justify-center relative">
            <div className="text-[9px] font-mono text-stone-500 font-bold mb-2 uppercase tracking-tight hidden sm:block">
              Live Preview
            </div>
            <PassportCard
              passport={previewPassport}
              avatar={currentUser?.avatar}
              showScanOverlay={isPassportScanning}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button
              type="button"
              disabled={isPassportScanning || saving || !hasPassportChanges}
              onClick={handleSave}
              className="py-3 px-8 bg-emerald-400 hover:bg-emerald-300 disabled:bg-stone-300 disabled:text-stone-500 text-neo-dark border-4 border-neo-dark font-display font-black text-xs uppercase tracking-widest rounded shadow-[4px_4px_0px_#000] cursor-pointer hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] disabled:translate-y-0 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-neo-dark" />
              <span>{isPassportScanning || saving ? "Saving..." : "Save Passport"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-neo-dark border-4 border-neo-dark font-display font-black text-xs uppercase tracking-widest rounded shadow-[4px_4px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4 text-neo-dark" strokeWidth={3} />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
