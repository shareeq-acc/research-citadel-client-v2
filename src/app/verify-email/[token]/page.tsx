"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Library, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authService } from "@/services";
import { useApp } from "@/context/AppContext";
import type { ApiError } from "@/lib/http-client";

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return (err as ApiError).message || fallback;
  }
  return fallback;
}

function VerifyEmailContent() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useApp();

  const token = params.token as string;
  const currentUserIdRef = useRef(currentUser?.id);
  currentUserIdRef.current = currentUser?.id;
  const verifyStartedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    if (verifyStartedRef.current) return;
    verifyStartedRef.current = true;

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    authService
      .confirmEmailVerification(token)
      .then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Email verified successfully!");
          if (res.data?.user && currentUserIdRef.current === res.data.user.id) {
            setCurrentUser(res.data.user);
          }
          redirectTimer = setTimeout(() => router.push("/dashboard"), 2500);
        } else {
          setStatus("error");
          setMessage(res.message || "Verification failed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(extractMessage(err, "Invalid or expired verification link."));
      });

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [token, setCurrentUser, router]);

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded neo-border neo-shadow-lg space-y-6 text-center">

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-neo-yellow border-3 border-neo-dark rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-2">
            <Library className="w-7 h-7 text-neo-dark stroke-[2.5]" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-neo-dark mt-2 tracking-tight">
            Email Verification
          </h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-10 h-10 text-neo-dark animate-spin" />
            <p className="text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">
              Confirming your email address…
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-600 flex items-center justify-center shadow-[4px_4px_0px_#059669]">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 stroke-[2.5]" />
            </div>
            <p className="text-sm font-mono font-bold text-emerald-700">{message}</p>
            <p className="text-[10px] font-mono text-stone-500">
              Redirecting to your dashboard…
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 bg-rose-100 border-4 border-rose-600 flex items-center justify-center shadow-[4px_4px_0px_#dc2626]">
              <XCircle className="w-8 h-8 text-rose-700 stroke-[2.5]" />
            </div>
            <p className="text-sm font-mono font-bold text-rose-700">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={() => router.push("/auth?screen=login")}
                className="flex-1 neo-btn py-3 text-xs"
              >
                Return to Sign In
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-3 border-3 border-neo-dark font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neo-bg flex items-center justify-center">
          <div className="w-14 h-14 bg-neo-yellow border-4 border-neo-dark flex items-center justify-center animate-pulse shadow-[3px_3px_0px_#000]">
            <Library className="w-7 h-7 text-neo-dark" />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
