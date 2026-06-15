"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import NavLayout from "@/components/shared/NavLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser, activeVault, handleLogout, checkingAuth } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!checkingAuth && !currentUser) {
      router.replace("/auth");
    }
  }, [checkingAuth, currentUser]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neo-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-neo-yellow border-4 border-neo-dark flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000] animate-pulse">
            {/* <span className="text-2xl">🔐</span> */}
          </div>
          <p className="font-mono font-black text-xs uppercase tracking-widest text-neo-dark">Application Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <NavLayout
      user={currentUser}
      activeVault={activeVault}
      onNavigate={(path) => router.push(path)}
      onLogout={async () => {
        await handleLogout();
        router.push("/auth");
      }}
      onUserChange={(updatedUser) => setCurrentUser(updatedUser)}
    >
      {children}
    </NavLayout>
  );
}
