"use client";

import LandingPage from "@/components/landing/LandingPage";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const { currentUser } = useApp();
  const router = useRouter();

  return (
    <LandingPage
      currentUser={currentUser}
      onNavigate={(path) => router.push(path)}
    />
  );
}
