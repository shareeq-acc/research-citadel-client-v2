"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Library, Mail, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { authService } from "@/services";
import type { ApiError } from "@/lib/http-client";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return (err as ApiError).message || fallback;
  }
  return fallback;
}

// ── Main component ────────────────────────────────────────────────────────────

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setCurrentUser } = useApp();

  const [screen, setScreen] = useState<
    "login" | "register" | "verify-otp" | "forgot-password" | "reset-password"
  >((searchParams.get("screen") as any) ?? "login");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  // OTP – we keep track of the email that triggered the OTP so we can pass it
  // back to the verify-otp endpoint.
  const [otpEmail, setOtpEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Forgot / Reset password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errMessage, setErrMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser, router]);

  function clearMessages() {
    setErrMessage("");
    setOkMessage("");
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!loginEmail || !loginPass) return;
    setLoading(true);
    try {
      const res = await authService.login({ email: loginEmail, password: loginPass });
      if (res.success) {
        setCurrentUser(res.data.user);
        router.push("/dashboard");
      } else {
        setErrMessage(res.message ?? "Login failed.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Unable to reach the server. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!regName || !regEmail || !regPass) return;
    setLoading(true);
    try {
      const res = await authService.register({
        name: regName,
        email: regEmail,
        password: regPass,
      });
      if (res.success) {
        setCurrentUser(res.data.user);
        setOtpEmail(regEmail);
        // Request the email-verification OTP right away
        await authService.requestEmailVerification();
        setScreen("verify-otp");
        setOkMessage("Account created! A 6-digit code has been sent to your email.");
      } else {
        setErrMessage(res.message ?? "Registration failed.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Unable to reach the server. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!otpInput) return;
    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        email: otpEmail,
        otp: otpInput,
        type: "EMAIL_VERIFICATION",
        otpChannel: "EMAIL",
      });
      if (res.success) {
        setOkMessage("Email verified! Redirecting…");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setErrMessage(res.message ?? "Invalid OTP.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "OTP verification failed."));
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const res = await authService.forgotPassword({ email: forgotEmail });
      if (res.success) {
        setOtpEmail(forgotEmail);
        setScreen("verify-otp");
        setOkMessage("A password-reset code has been sent to your email.");
      } else {
        setErrMessage(res.message ?? "Failed to send reset code.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Unable to reach the server. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password (after OTP verified during forgot-password flow) ─────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!newPassword || !resetToken) return;
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        newPassword,
        resetToken,
      });
      if (res.success) {
        setOkMessage("Password reset! Please log in with your new password.");
        setTimeout(() => setScreen("login"), 1500);
      } else {
        setErrMessage(res.message ?? "Failed to reset password.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Unable to reach the server. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded neo-border neo-shadow-lg space-y-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-neo-yellow border-3 border-neo-dark rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-2">
            <Library className="w-7 h-7 text-neo-dark stroke-[2.5]" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-neo-dark mt-2 tracking-tight">
            Research Citadel
          </h1>
          <p className="text-xs text-stone-500 font-mono italic mt-1 font-bold">
            Encrypted scientific peer annotation ledger
          </p>
        </div>

        {/* Feedback banners */}
        {errMessage && (
          <div className="p-3 bg-rose-50 border-2 border-rose-500 text-xs font-mono font-bold text-rose-700 rounded-sm">
            ⚠️ {errMessage}
          </div>
        )}
        {okMessage && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-500 text-xs font-mono font-bold text-emerald-700 rounded-sm">
            🟢 {okMessage}
          </div>
        )}

        {/* ── LOGIN ── */}
        {screen === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Researcher Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full neo-input !pl-10 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Credential Password Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full neo-input !pl-10 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full neo-btn py-3.5 text-xs disabled:opacity-60"
            >
              {loading ? "Authenticating…" : "Unlock Secure Session"}
            </button>
            <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono pt-2">
              <button
                type="button"
                onClick={() => { clearMessages(); setScreen("forgot-password"); }}
                className="hover:underline hover:text-stone-900"
              >
                Forgot passcode?
              </button>
              <button
                type="button"
                onClick={() => { clearMessages(); setScreen("register"); }}
                className="hover:underline hover:text-stone-900 font-bold"
              >
                Allocate credentials
              </button>
            </div>
          </form>
        )}

        {/* ── REGISTER ── */}
        {screen === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Full Name / Call Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your Name"
                className="w-full neo-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full neo-input text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Passcode String
              </label>
              <input
                type="password"
                required
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                placeholder="Min 6 chars, uppercase, number, symbol"
                className="w-full neo-input text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full neo-btn py-3.5 text-xs disabled:opacity-60"
            >
              {loading ? "Registering…" : "Inscribe Account Credentials"}
            </button>
            <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
              <button
                type="button"
                onClick={() => { clearMessages(); setScreen("login"); }}
                className="hover:underline"
              >
                Have workspace references? Sign In
              </button>
            </div>
          </form>
        )}

        {/* ── VERIFY OTP ── */}
        {screen === "verify-otp" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 text-center leading-relaxed">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold font-mono">{otpEmail}</span>.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-xl font-mono p-3 border-3 border-neo-dark rounded focus:outline-none focus:bg-amber-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full neo-btn py-3 text-xs disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Authorize Secure Clearance"}
              </button>
              <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="hover:underline"
                >
                  Postpone verification
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {screen === "forgot-password" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Enter your email and we&apos;ll send a password-reset code.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full neo-input text-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full neo-btn py-3 text-xs disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Recovery Dispatch"}
              </button>
              <button
                type="button"
                onClick={() => { clearMessages(); setScreen("login"); }}
                className="w-full py-2 border-2 border-neo-dark shadow-[1px_1px_0px_#0A0A0A] font-bold text-xs"
              >
                Return to login
              </button>
            </form>
          </div>
        )}

        {/* ── RESET PASSWORD ── */}
        {screen === "reset-password" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Enter the reset token from your email and choose a new password.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Token from email"
                  className="w-full neo-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars, uppercase, number, symbol"
                  className="w-full neo-input text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full neo-btn py-3 text-xs disabled:opacity-60"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function AuthPage() {
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
      <AuthContent />
    </Suspense>
  );
}
