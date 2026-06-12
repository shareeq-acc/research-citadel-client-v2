"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Library, Mail, Lock, Eye, EyeOff, AtSign } from "lucide-react";
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
    "login" | "register" | "check-email" | "verify-otp" | "forgot-password" | "reset-password"
  >((searchParams.get("screen") as any) ?? "login");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);

  // Login show/hide password
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Password-reset OTP flow
  const [otpEmail, setOtpEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendingLink, setResendingLink] = useState(false);

  // Forgot / Reset password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errMessage, setErrMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated (except when waiting for email verification)
  useEffect(() => {
    if (currentUser && screen !== "check-email") router.replace("/dashboard");
  }, [currentUser, router, screen]);

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
    if (!regName || !regUsername || !regEmail || !regPass || !regConfirmPass) return;

    // Client-side username validation
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(regUsername)) {
      setErrMessage("Username must be 3–30 characters and contain only letters, numbers, or underscores.");
      return;
    }

    // Confirm password match
    if (regPass !== regConfirmPass) {
      setErrMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        name: regName,
        username: regUsername.toLowerCase(),
        email: regEmail,
        password: regPass,
      });
      if (res.success) {
        setPendingEmail(regEmail);
        setScreen("check-email");
        setCurrentUser(res.data.user);
        await authService.requestEmailVerification();
        setOkMessage("Account created! A verification link has been sent to your email.");
      } else {
        setErrMessage(res.message ?? "Registration failed.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Unable to reach the server. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification link ───────────────────────────────────────────────

  const handleResendVerificationLink = async () => {
    clearMessages();
    setResendingLink(true);
    try {
      const res = await authService.requestEmailVerification();
      if (res.success) {
        setOkMessage("Verification link resent. Check your inbox.");
      } else {
        setErrMessage(res.message ?? "Failed to resend verification email.");
      }
    } catch (err) {
      setErrMessage(extractMessage(err, "Failed to resend verification email."));
    } finally {
      setResendingLink(false);
    }
  };

  // ── Verify OTP (password reset only) ───────────────────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!otpInput) return;
    setLoading(true);
    try {
      const res = await authService.verifyOtp({
        email: otpEmail,
        otp: otpInput,
        type: "PASSWORD_RESET",
        otpChannel: "EMAIL",
      });
      if (res.success) {
        setResetToken(res.data?.token ?? "");
        setOkMessage("Code verified! Choose a new password.");
        setScreen("reset-password");
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
                  type={showLoginPass ? "text" : "password"}
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full neo-input !pl-10 !pr-10 text-xs"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowLoginPass((v) => !v)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
            {/* Full name */}
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Full Name
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

            {/* Username */}
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) =>
                    setRegUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())
                  }
                  placeholder="your_handle"
                  minLength={3}
                  maxLength={30}
                  className="w-full neo-input text-xs !pl-10"
                />
              </div>
              <p className="text-[9px] font-mono text-stone-400 mt-1">
                3–30 chars · letters, numbers, underscores · unique
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full neo-input text-xs !pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                <input
                  type={showRegPass ? "text" : "password"}
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Min 6 chars, uppercase, number, symbol"
                  className="w-full neo-input text-xs !pl-10 !pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegPass((v) => !v)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400 w-4 h-4 pointer-events-none" />
                <input
                  type={showRegConfirmPass ? "text" : "password"}
                  required
                  value={regConfirmPass}
                  onChange={(e) => setRegConfirmPass(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full neo-input text-xs !pl-10 !pr-10 ${
                    regConfirmPass && regPass !== regConfirmPass
                      ? "border-rose-500 bg-rose-50"
                      : regConfirmPass && regPass === regConfirmPass
                      ? "border-emerald-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegConfirmPass((v) => !v)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showRegConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Inline mismatch hint */}
              {regConfirmPass && regPass !== regConfirmPass && (
                <p className="text-[9px] font-mono text-rose-600 mt-1">Passwords do not match.</p>
              )}
              {regConfirmPass && regPass === regConfirmPass && (
                <p className="text-[9px] font-mono text-emerald-600 mt-1">✓ Passwords match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!regConfirmPass && regPass !== regConfirmPass)}
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

        {/* ── CHECK EMAIL (verification link sent) ── */}
        {screen === "check-email" && (
          <div className="space-y-5">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-neo-yellow border-4 border-neo-dark flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A]">
                <Mail className="w-8 h-8 text-neo-dark stroke-[2.5]" />
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-bold font-mono text-neo-dark">{pendingEmail}</span>.
                Click the link in your email to activate your account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResendVerificationLink}
              disabled={resendingLink}
              className="w-full neo-btn py-3 text-xs disabled:opacity-60"
            >
              {resendingLink ? "Sending…" : "Resend Verification Link"}
            </button>
            <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="hover:underline"
              >
                Continue to dashboard — verify later
              </button>
            </div>
          </div>
        )}

        {/* ── VERIFY OTP (password reset) ── */}
        {screen === "verify-otp" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 text-center leading-relaxed">
              Enter the 6-digit reset code sent to{" "}
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
                {loading ? "Verifying…" : "Verify Reset Code"}
              </button>
              <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
                <button
                  type="button"
                  onClick={() => { clearMessages(); setScreen("login"); }}
                  className="hover:underline"
                >
                  Return to login
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
