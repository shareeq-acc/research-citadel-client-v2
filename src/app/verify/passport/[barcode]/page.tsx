"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Fingerprint,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { passportService } from "@/services";
import type { PassportVerification } from "@/services/passport.service";
import { PassportCard } from "@/components/passport/PassportCard";

export default function PassportVerifyPage() {
  const params = useParams();
  const barcode = decodeURIComponent(params.barcode as string);

  const [data, setData] = useState<PassportVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    passportService
      .verifyByBarcode(barcode)
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Passport not found.");
      })
      .catch((err: { message?: string }) => setError(err?.message || "Passport not found or invalid."))
      .finally(() => setLoading(false));
  }, [barcode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="w-10 h-10 animate-spin text-neo-dark" />
        <p className="text-sm font-mono font-bold text-stone-500 uppercase">Verifying passport...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-4 border-neo-dark p-8 shadow-[6px_6px_0px_#000] text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="font-display font-black text-lg uppercase text-neo-dark">Verification Failed</h1>
          <p className="text-sm text-stone-600">{error || "This passport could not be verified."}</p>
        </div>
      </div>
    );
  }

  const verified = data.verified;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-neo-dark text-stone-50 px-4 py-2 border-4 border-neo-dark shadow-[4px_4px_0px_#000]">
            <Fingerprint className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-black text-sm uppercase tracking-wide">
              Passport Verification
            </span>
          </div>
          <p className="text-xs font-mono text-stone-500">QR scan result for {data.barcode}</p>
        </div>

        <div
          className={`border-4 p-5 rounded-sm shadow-[4px_4px_0px_#000] flex items-start gap-4 ${
            verified
              ? "bg-emerald-50 border-emerald-600"
              : "bg-amber-50 border-amber-500"
          }`}
        >
          {verified ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
          )}
          <div className="space-y-2 text-left">
            <h2
              className={`font-display font-black text-base uppercase ${
                verified ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {verified ? "Authentic Passport" : "Verification Issue"}
            </h2>
            <p className="text-sm text-stone-700">{data.verificationMessage}</p>
            <ul className="text-xs font-mono space-y-1 text-stone-600">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vault exists: {data.vaultExists ? "Yes" : "No"}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active member: {data.isActiveMember ? "Yes" : "No"}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Role: {data.memberRole}
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white border-4 border-neo-dark p-6 shadow-[6px_6px_0px_#000]">
          <PassportCard passport={data} size="sm" verificationBaseUrl={typeof window !== "undefined" ? window.location.origin : ""} />
        </div>

        <p className="text-[10px] text-center text-stone-400 font-mono max-w-lg mx-auto">
          This page confirms that the scanned passport belongs to a registered vault member.
          Passports are issued per user per vault and cannot be transferred.
        </p>
      </div>
    </div>
  );
}
