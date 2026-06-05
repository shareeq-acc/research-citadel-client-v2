"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";
import { SkeletonSubscriptionPage } from "@/components/shared/Skeleton";

export default function SubscriptionRoute() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useApp();

  if (!currentUser) return <SkeletonSubscriptionPage />;

  return (
    <SubscriptionPage
      user={currentUser}
      onNavigate={(screen) => {
        if (screen === "dashboard") router.push("/dashboard");
        else router.push(`/${screen}`);
      }}
      onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
    />
  );
}
