"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { passportService } from "@/services";
import type { VaultPassport } from "@/services/passport.service";
import { PassportContent } from "@/components/passport/PassportContent";

export default function PassportPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useApp();
  const vaultId = params.vaultId as string;

  const [passport, setPassport] = useState<VaultPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultAlias, setVaultAlias] = useState("");
  const [role, setRole] = useState("");
  const [motto, setMotto] = useState("");
  const [savedState, setSavedState] = useState<{ vaultAlias: string; role: string; motto: string } | null>(null);

  const applyPassportToForm = useCallback((data: VaultPassport) => {
    setPassport(data);
    setVaultAlias(data.vaultAlias ?? "");
    setRole(data.role ?? "");
    setMotto(data.motto ?? "");
    setSavedState({
      vaultAlias: data.vaultAlias ?? "",
      role: data.role ?? "",
      motto: data.motto ?? "",
    });
  }, []);

  useEffect(() => {
    async function loadPassport() {
      try {
        const res = await passportService.getPassport(vaultId);
        if (res.success) {
          applyPassportToForm(res.data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [vaultId, applyPassportToForm]);

  const handleSave = async (payload: { vaultAlias: string; role: string; motto: string }) => {
    const res = await passportService.updatePassport(vaultId, {
      vaultAlias: payload.vaultAlias,
      role: payload.role,
      motto: payload.motto,
    });
    if (res.success) {
      applyPassportToForm(res.data);
    } else {
      throw new Error(res.message);
    }
  };

  if (loading || !passport) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-16 bg-neo-dark animate-pulse rounded" />
        <div className="h-96 bg-white border-4 border-neo-dark animate-pulse rounded" />
      </div>
    );
  }

  return (
    <PassportContent
      passport={passport}
      currentUser={currentUser}
      vaultAlias={vaultAlias}
      setVaultAlias={setVaultAlias}
      role={role}
      setRole={setRole}
      motto={motto}
      setMotto={setMotto}
      savedState={savedState}
      onSave={handleSave}
      onClose={() => router.push("/dashboard")}
    />
  );
}
