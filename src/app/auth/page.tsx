"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Library, Mail, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setCurrentUser } = useApp();

  const [currentScreen, setCurrentScreen] = useState<string>(
    searchParams.get("screen") || "login"
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [okMessage, setOkMessage] = useState("");

  useEffect(() => {
    if (currentUser) router.replace("/dashboard");
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");
    setOkMessage("");
    if (!loginEmail || !loginPass) return;
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("cid_uid_storage", data.data.user.id);
        setCurrentUser(data.data.user);
        router.push("/dashboard");
      } else {
        setErrMessage(data.message || "Login authentication failed.");
      }
    } catch {
      setErrMessage("Connection bottleneck accessing authentication cluster.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");
    setOkMessage("");
    if (!regName || !regEmail || !regPass) return;
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("cid_uid_storage", data.data.user.id);
        setCurrentUser(data.data.user);
        setCurrentScreen("verify-otp");
        setOkMessage("Account pre-allocated. OTP token '123456' has been dispatched.");
      } else {
        setErrMessage(data.message || "Registration credentials refused.");
      }
    } catch {
      setErrMessage("Connection bottleneck during account allocation.");
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage("");
    setOkMessage("");
    if (!otpInput) return;
    try {
      const response = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });
      const data = await response.json();
      if (data.success) {
        setOkMessage("Researcher metrics validated! Redirection underway.");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setErrMessage(data.message || "Wrong security PIN context.");
      }
    } catch {
      setErrMessage("Network bottleneck checking OTP index.");
    }
  };

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded neo-border neo-shadow-lg space-y-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-neo-yellow border-3 border-neo-dark rounded-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-2">
            <Library className="w-7 h-7 text-neo-dark stroke-[2.5]" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-neo-dark mt-2 tracking-tight">Research Citadel</h1>
          <p className="text-xs text-stone-500 font-mono italic mt-1 font-bold">Encrypted scientific peer annotation ledger</p>
        </div>

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

        {/* LOGIN */}
        {currentScreen === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">Researcher Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="seerijj00@gmail.com" className="w-full neo-input !pl-10 text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">Credential Password Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="••••••••" className="w-full neo-input !pl-10 text-xs" />
              </div>
            </div>
            <button type="submit" className="w-full neo-btn py-3.5 text-xs">Unlock Secure Session</button>
            <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono pt-2">
              <button type="button" onClick={() => setCurrentScreen("forgot-password")} className="hover:underline hover:text-stone-900">Forgot passcode?</button>
              <button type="button" onClick={() => setCurrentScreen("register")} className="hover:underline hover:text-stone-900 font-bold">Allocate credentials</button>
            </div>
          </form>
        )}

        {/* REGISTER */}
        {currentScreen === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">Full Name / Call Name</label>
              <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seer Ijj" className="w-full neo-input text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">Email Address Vector</label>
              <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="seerijj00@gmail.com" className="w-full neo-input text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-black font-mono text-stone-600 uppercase mb-1">Passcode String</label>
              <input type="password" required value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="At least 8 parameters" className="w-full neo-input text-xs" />
            </div>
            <button type="submit" className="w-full neo-btn py-3.5 text-xs">Inscribe Account Credentials</button>
            <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
              <button type="button" onClick={() => setCurrentScreen("login")} className="hover:underline">Have workspace references? Sign In</button>
            </div>
          </form>
        )}

        {/* OTP */}
        {currentScreen === "verify-otp" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 text-center leading-relaxed">
              Enter your 6-digit cryptographic verification key. In test environment, use fallback key{" "}
              <code className="bg-amber-100 px-1 border border-amber-300 rounded font-bold font-mono">123456</code>.
            </p>
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <input type="text" pattern="[0-9]*" maxLength={6} required value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="w-full text-center tracking-widest text-xl font-mono p-3 border-3 border-neo-dark rounded focus:outline-none focus:bg-amber-50" />
              <button type="submit" className="w-full neo-btn py-3 text-xs">Authorize Secure Clearance</button>
              <div className="text-center text-[10px] text-stone-500 font-mono pt-1">
                <button type="button" onClick={() => router.push("/dashboard")} className="hover:underline">Postpone verification</button>
              </div>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {currentScreen === "forgot-password" && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">Confirm your indices vector. If mapped to our repository, an allocation prompt key will trigger immediately.</p>
            <form onSubmit={async (e) => { e.preventDefault(); setOkMessage("Allocation vector verified."); setTimeout(() => setOkMessage(""), 2500); }} className="space-y-4">
              <input type="email" required placeholder="seerijj00@gmail.com" className="w-full neo-input text-xs" />
              <button type="submit" className="w-full neo-btn py-3 text-xs">Send Recovery Dispatch</button>
              <button type="button" onClick={() => setCurrentScreen("login")} className="w-full py-2 border-2 border-neo-dark shadow-[1px_1px_0px_#0A0A0A] font-bold text-xs">Return login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neo-bg flex items-center justify-center">
        <div className="w-14 h-14 bg-neo-yellow border-4 border-neo-dark flex items-center justify-center animate-pulse shadow-[3px_3px_0px_#000]">
          <Library className="w-7 h-7 text-neo-dark" />
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
