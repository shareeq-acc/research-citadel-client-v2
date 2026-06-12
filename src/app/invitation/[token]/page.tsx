"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Library, CheckCircle2, XCircle, Clock, Loader2, ShieldAlert } from "lucide-react";
import { invitationService } from "@/services";
import type { InvitationDetails } from "@/services/invitation.service";
import { useApp } from "@/context/AppContext";

// ── Role badge colour ──────────────────────────────────────────────────────────
function roleBadgeClass(role: string) {
  if (role === "CONTRIBUTOR") return "bg-emerald-100 text-emerald-800 border-emerald-400";
  if (role === "VIEWER")      return "bg-sky-100 text-sky-800 border-sky-400";
  return "bg-neo-yellow text-neo-dark border-neo-dark";
}

// ── Inner content (needs useSearchParams so wrapped in Suspense) ───────────────
function InvitationContent() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const router      = useRouter();
  const { currentUser } = useApp();

  const token  = params.token as string;
  const prefill = searchParams.get("action") as "ACCEPTED" | "REJECTED" | null;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [done,       setDone]       = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [error,      setError]      = useState("");

  // ── Load invitation details ────────────────────────────────────────────────
  useEffect(() => {
    invitationService.getByToken(token)
      .then((res) => { if (res.success) setInvitation(res.data); })
      .catch((err: any) => setError(err?.message || "Invitation not found or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Auto-act if action came from email link ───────────────────────────────
  useEffect(() => {
    if (!invitation || done || !prefill) return;
    if (invitation.status !== "PENDING") return;
    // Only auto-act if the current user is the invitee (or not logged in yet — they must log in first)
    if (!currentUser) return;
    if (currentUser.id !== invitation.invitedUser.id) return;
    handleRespond(prefill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation, currentUser]);

  const handleRespond = async (action: "ACCEPTED" | "REJECTED") => {
    if (!currentUser) {
      // Redirect to login, come back after
      router.push(`/auth?screen=login&redirect=/invitation/${token}?action=${action}`);
      return;
    }
    setActing(action);
    setError("");
    try {
      const res = await invitationService.respond(token, action);
      if (res.success) {
        setDone(action);
        if (action === "ACCEPTED") {
          setTimeout(() => router.push("/dashboard"), 2500);
        }
      } else {
        setError(res.message || "Failed to respond.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to respond. Please try again.");
    } finally {
      setActing(null);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="w-8 h-8 animate-spin text-neo-dark" />
        <p className="font-mono text-xs text-stone-500 uppercase tracking-widest">Loading invitation…</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="bg-rose-50 border-4 border-rose-500 p-6 rounded-sm shadow-[4px_4px_0px_#EF4444] space-y-3 text-center">
        <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="font-display font-black text-sm text-rose-700 uppercase">{error}</p>
        <button onClick={() => router.push("/")} className="neo-btn px-4 py-2 text-xs mt-2">
          Go Home
        </button>
      </div>
    );
  }

  if (!invitation) return null;

  const isExpired  = new Date(invitation.expiresAt) < new Date();
  const isPending  = invitation.status === "PENDING" && !isExpired;
  const isWrongUser = currentUser && currentUser.id !== invitation.invitedUser.id;

  return (
    <div className="bg-white border-4 border-neo-dark rounded-sm shadow-[6px_6px_0px_#000] overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-neo-yellow border-b-4 border-neo-dark px-8 py-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] font-black uppercase tracking-[3px] text-neo-dark">Research Citadel</span>
          <h1 className="font-display font-black text-2xl text-neo-dark uppercase mt-1 tracking-tight">
            Vault Invitation
          </h1>
        </div>
        <span className="bg-neo-dark text-neo-yellow font-mono text-[10px] font-black uppercase tracking-[2px] px-3 py-1.5">
          INVITE
        </span>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-8 space-y-6">

        {/* Done state */}
        {done && (
          <div className={`flex flex-col items-center gap-3 p-6 border-4 rounded-sm shadow-[4px_4px_0px_#000] text-center ${
            done === "ACCEPTED"
              ? "bg-emerald-50 border-emerald-500 shadow-[4px_4px_0px_#10B981]"
              : "bg-stone-50 border-neo-dark"
          }`}>
            {done === "ACCEPTED"
              ? <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              : <XCircle className="w-12 h-12 text-stone-500" />
            }
            <p className="font-display font-black text-lg uppercase text-neo-dark">
              {done === "ACCEPTED" ? "Invitation Accepted!" : "Invitation Declined"}
            </p>
            <p className="text-xs font-mono text-stone-500">
              {done === "ACCEPTED"
                ? `You've joined "${invitation.vaultName}". Redirecting to dashboard…`
                : "You've declined this invitation. You can close this page."}
            </p>
          </div>
        )}

        {/* Invitation details */}
        {!done && (
          <>
            <div className="space-y-1">
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">From</p>
              <p className="font-display font-black text-lg text-neo-dark">{invitation.senderName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Vault</p>
              <p className="font-mono font-black text-base text-neo-dark bg-stone-50 border-2 border-neo-dark px-3 py-1.5 inline-block shadow-[2px_2px_0px_#000]">
                {invitation.vaultName}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">Role</p>
              <span className={`inline-block text-[11px] font-mono font-black uppercase px-3 py-1 border-2 rounded-sm shadow-[1.5px_1.5px_0px_#000] ${roleBadgeClass(invitation.role)}`}>
                {invitation.role}
              </span>
            </div>

            {/* Status / expiry */}
            {isExpired && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border-2 border-amber-400 rounded-sm">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs font-mono font-bold text-amber-700">This invitation has expired.</p>
              </div>
            )}

            {invitation.status !== "PENDING" && !isExpired && (
              <div className="flex items-center gap-2 p-3 bg-stone-50 border-2 border-neo-dark rounded-sm">
                <ShieldAlert className="w-4 h-4 text-stone-500 shrink-0" />
                <p className="text-xs font-mono font-bold text-stone-600 capitalize">
                  This invitation has already been {invitation.status.toLowerCase()}.
                </p>
              </div>
            )}

            {isWrongUser && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border-2 border-rose-400 rounded-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <p className="text-xs font-mono font-bold text-rose-700">
                  This invitation was sent to <strong>{invitation.invitedUser.email}</strong>. Please log in with that account.
                </p>
              </div>
            )}

            {!currentUser && isPending && (
              <div className="p-4 bg-stone-50 border-2 border-neo-dark rounded-sm text-center space-y-3">
                <p className="text-xs font-mono text-stone-600">Sign in to accept or decline this invitation.</p>
                <button
                  onClick={() => router.push(`/auth?screen=login`)}
                  className="neo-btn px-6 py-2.5 text-xs"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Action buttons */}
            {isPending && currentUser && !isWrongUser && (
              <>
                {error && (
                  <p className="text-xs font-mono text-rose-700 bg-rose-50 border-2 border-rose-400 px-3 py-2 rounded-sm">
                    ⚠️ {error}
                  </p>
                )}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => handleRespond("ACCEPTED")}
                    disabled={!!acting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neo-dark text-neo-yellow font-display font-black text-sm uppercase tracking-wider border-2 border-neo-dark shadow-[4px_4px_0px_#FACC15] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#FACC15] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {acting === "ACCEPTED"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />
                    }
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond("REJECTED")}
                    disabled={!!acting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-neo-dark font-display font-black text-sm uppercase tracking-wider border-2 border-neo-dark shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {acting === "REJECTED"
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />
                    }
                    Decline
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function InvitationPage() {
  return (
    <div className="min-h-screen bg-neo-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-neo-yellow border-3 border-neo-dark shadow-[3px_3px_0px_#000] flex items-center justify-center">
            <Library className="w-5 h-5 text-neo-dark stroke-[2.5]" />
          </div>
          <span className="font-mono font-black text-xs text-neo-dark uppercase tracking-[3px]">Research Citadel</span>
        </div>

        <Suspense fallback={
          <div className="bg-white border-4 border-neo-dark p-10 flex justify-center rounded-sm shadow-[6px_6px_0px_#000]">
            <Loader2 className="w-8 h-8 animate-spin text-neo-dark" />
          </div>
        }>
          <InvitationContent />
        </Suspense>
      </div>
    </div>
  );
}
