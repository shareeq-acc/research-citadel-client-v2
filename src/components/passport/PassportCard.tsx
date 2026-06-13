"use client";

import React from "react";
import QRCode from "react-qr-code";
import { Fingerprint } from "lucide-react";
import { RenderUserAvatar } from "@/components/RenderUserAvatar";
import type { VaultPassport } from "@/services/passport.service";

function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatPassportId(id: string): string {
  return `NODE-VT-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function formatMemberRole(role: string): string {
  return `${role} LEVEL`;
}

export interface PassportCardProps {
  passport: VaultPassport;
  avatar?: string | null;
  avatarName?: string;
  size?: "sm" | "md";
  showScanOverlay?: boolean;
  verificationBaseUrl?: string;
}

export function PassportCard({
  passport,
  avatar,
  avatarName,
  size = "md",
  showScanOverlay = false,
  verificationBaseUrl,
}: PassportCardProps) {
  const avatarSize = size === "sm" ? 100 : 120;
  const baseUrl =
    verificationBaseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const verificationUrl = `${baseUrl}/verify/passport/${passport.barcode}`;

  const specialization = passport.role?.trim() || "Research Member";
  const displayName = avatarName ?? passport.displayAlias;

  return (
    <div
      id="vaultPassportCard"
      className="w-full bg-stone-50 border-2 sm:border-4 border-neo-dark rounded-xs sm:rounded-sm p-3 sm:p-4 md:p-6 shadow-[4px_4px_0px_#000] sm:shadow-[8px_8px_0px_#000] relative overflow-hidden transition-all duration-300"
    >
      <div className="border-b-4 border-neo-dark pb-3.5 mb-4 flex justify-between items-start flex-wrap gap-2">
        <div>
          <h5 className="font-display font-black text-xs md:text-sm text-neo-dark tracking-wide block uppercase leading-none">
            SECURE RESEARCH BOUNDS PASSPORT
          </h5>
          <span className="text-[8px] md:text-[9px] font-mono font-bold text-stone-500 uppercase block tracking-wider mt-1">
            COGNITIVE VAULT INTEL DIRECTORY APPARATUS
          </span>
        </div>
        <span className="text-[8px] font-mono font-black border border-neo-dark px-1.5 py-0.5 rounded bg-neo-yellow text-neo-dark uppercase shadow-[1.5px_1.5px_0px_#000]">
          V.SECURE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="col-span-1 md:col-span-4 flex flex-col items-center space-y-2">
          <RenderUserAvatar
            avatar={avatar ?? passport.userAvatar}
            name={displayName}
            size={avatarSize}
            squareBorder
          />
          <div className="text-center w-full">
            <span className="text-[8px] font-mono font-black uppercase text-stone-500 block leading-none mb-1">
              Pass Hologram
            </span>
            <div className="flex gap-1 justify-center">
              <div className="w-4 h-4 rounded-full bg-stone-200 border border-neo-dark flex items-center justify-center text-[7px] font-black tracking-tight select-none">
                ID
              </div>
              <div className="w-10 h-4 border border-neo-dark bg-stone-100 flex items-center justify-around px-0.5">
                {[3, 4, 2, 3, 2, 2, 4].map((h, i) => (
                  <div key={i} className="w-0.5 bg-neo-dark" style={{ height: `${h * 3}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-8 space-y-2.5 font-sans font-semibold text-stone-700 text-left relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="border-b-2 border-stone-100 pb-1 text-left">
              <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
                Member Name
              </span>
              <span className="text-xs font-display font-black text-neo-dark block uppercase truncate">
                {passport.agentName}
              </span>
            </div>
            <div className="border-b-2 border-stone-100 pb-1 text-left">
              <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
                Membership Role
              </span>
              <span className="text-xs font-display font-black text-emerald-600 block uppercase">
                {formatMemberRole(passport.memberRole)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="border-b-2 border-stone-100 pb-1 text-left">
              <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
                Vault Alias
              </span>
              <span className="text-xs font-display font-black text-neo-dark block uppercase truncate">
                {passport.displayAlias}
              </span>
            </div>
            <div className="border-b-2 border-stone-100 pb-1 text-left">
              <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
                Vault
              </span>
              <span className="text-[11px] font-display font-black text-indigo-700 block uppercase truncate">
                {passport.vaultName}
              </span>
            </div>
          </div>

          <div className="border-b-2 border-stone-100 pb-1 text-left">
            <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
              Specialization
            </span>
            <span className="text-[11px] font-sans font-black text-neo-dark block uppercase truncate">
              {specialization}
            </span>
          </div>

          <div className="border-b-2 border-stone-100 pb-1 text-left">
            <span className="text-[8px] font-mono font-black text-stone-400 uppercase tracking-widest block font-bold leading-none mb-0.5">
              Motto
            </span>
            <p className="text-[10px] font-sans font-bold leading-tight text-stone-500 italic block text-left">
              &ldquo;{passport.displayMotto}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1.5 border-t border-stone-100 text-left">
            <div className="grid grid-cols-2 gap-4 text-[9px] font-mono font-bold text-stone-400 uppercase flex-1">
              <div>
                <span className="block text-[7px] text-stone-400">Passport ID</span>
                <span className="text-neo-dark tracking-tighter">{formatPassportId(passport.id)}</span>
              </div>
              <div>
                <span className="block text-[7px] text-stone-400">Member Since</span>
                <span className="text-neo-dark">{formatMemberSince(passport.joinedAt)}</span>
              </div>
            </div>
            <div className="border-4 border-dashed border-rose-500/85 rounded-xs py-1 px-2.5 text-rose-500/85 text-[10px] font-display font-black tracking-widest uppercase select-none pointer-events-none shadow-[1.5px_1.5px_0px_rgba(239,68,68,0.2)] shrink-0">
              VERIFIED MEMBER
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t-2 border-dashed border-stone-300 text-stone-500 text-[10px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Fingerprint className="w-5 h-5 text-neo-dark stroke-[2] shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="text-[7.5px] font-mono font-bold text-stone-400 block uppercase">
                Verification Hash
              </span>
              <span className="font-mono text-[9px] text-neo-dark break-all block">
                SHA-256V://{passport.barcode}
              </span>
              <span className="text-[7px] font-mono font-bold text-stone-400 tracking-wider mt-0.5 block">
                {passport.barcode}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <span className="text-[6.5px] font-mono font-bold text-stone-400 uppercase tracking-wider leading-none">
              Scan to Verify
            </span>
            {baseUrl ? (
              <div className="bg-white border border-neo-dark rounded-sm p-1 shadow-[1.5px_1.5px_0px_#000]">
                <QRCode
                  value={verificationUrl}
                  size={size === "sm" ? 64 : 72}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0c0a09"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-stone-100 border border-dashed border-stone-300 rounded-sm flex items-center justify-center">
                <span className="text-[7px] font-mono font-bold text-stone-400 uppercase">QR</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showScanOverlay && (
        <>
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-400 opacity-95 shadow-[0_0_15px_#10B981,0_0_5px_#10B981] z-50 animate-scan-line" />
          <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none z-40 animate-pulse" />
        </>
      )}
    </div>
  );
}

export { formatMemberSince, formatPassportId, formatMemberRole };
