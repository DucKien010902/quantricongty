"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import ProfileView from "./components/ProfileView";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, departments, handleUpdateCurrentUser } = useApp();

  return (
    <ProfileView
      currentUser={currentUser}
      departments={departments}
      onUpdateUser={handleUpdateCurrentUser}
      onGoToTab={(tab: string) => {
        if (tab === "dashboard") router.push("/");
        else router.push(`/${tab}`);
      }}
    />
  );
}
